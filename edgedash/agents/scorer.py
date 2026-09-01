"""Scorer agent: rates job fit based on keyword and skill alignment."""

from datetime import datetime
from edgedash.agents.base import Agent, AgentResult
from edgedash.config import Config
from edgedash import storage


class Scorer(Agent):
    """Score job listings based on keyword match + skill alignment."""

    @property
    def name(self) -> str:
        return "scorer"

    def run(self, config: Config, storage_module) -> AgentResult:
        """Score all unscored listings and update database."""
        try:
            # Get all unscored listings
            unscored = storage_module.get_unscored_listings(config.db_path)
            
            if not unscored:
                return AgentResult(
                    agent=self.name,
                    status="ok",
                    records_touched=0,
                    notes="No unscored listings to process",
                )
            
            # Score each listing
            scored_count = 0
            for listing in unscored:
                score, reason = self._calculate_fit(listing, config)
                storage_module.update_listing_score(
                    config.db_path,
                    listing["id"],
                    score,
                    reason
                )
                scored_count += 1
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=scored_count,
                notes=f"Scored {scored_count} listings",
            )
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )

    def _calculate_fit(self, listing: dict, config: Config) -> tuple[int, str]:
        """
        Calculate fit score (0-100) and reason.
        
        Score = (keyword_matches * 30%) + (skill_matches * 70%)
        
        Args:
            listing: Job listing dict from DB
            config: User config with keywords and skills
        
        Returns:
            (fit_score, reason_string)
        """
        # Get job text (title + description)
        job_text = f"{listing.get('title', '')} {listing.get('description', '')}".lower()
        
        # Normalize user keywords and skills
        keywords_lower = [kw.lower() for kw in config.keywords]
        skills_lower = [sk.lower() for sk in config.my_skills]
        
        # Count keyword matches
        keyword_matches = 0
        for keyword in keywords_lower:
            if keyword in job_text:
                keyword_matches += 1
        
        keyword_ratio = keyword_matches / len(keywords_lower) if keywords_lower else 0
        
        # Count skill matches
        skill_matches = 0
        for skill in skills_lower:
            if skill in job_text:
                skill_matches += 1
        
        skill_ratio = skill_matches / len(skills_lower) if skills_lower else 0
        
        # Calculate weighted score
        # 30% weight on keywords, 70% weight on skills
        score_float = (keyword_ratio * 30) + (skill_ratio * 70)
        score = min(100, max(0, int(score_float)))  # Clamp to 0-100
        
        # Build reason
        reason = (
            f"Keywords: {keyword_matches}/{len(keywords_lower)} | "
            f"Skills: {skill_matches}/{len(skills_lower)}"
        )
        
        return score, reason
