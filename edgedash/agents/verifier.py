"""Verifier agent: validate Scorer output and data quality."""

from edgedash.agents.base import Agent, AgentResult
from edgedash.config import Config
from edgedash import storage


class Verifier(Agent):
    """Validate scorer output and detect anomalies."""

    @property
    def name(self) -> str:
        return "verifier"

    def run(self, config: Config, storage_module) -> AgentResult:
        """Verify scorer output and data quality."""
        try:
            jobs = storage_module.get_listings(config.db_path, limit=999999)
            
            if not jobs:
                return AgentResult(
                    agent=self.name,
                    status="ok",
                    records_touched=0,
                    notes="No jobs to verify",
                )
            
            # Run validation checks
            anomalies = self._check_anomalies(jobs)
            quality_issues = self._check_data_quality(jobs)
            consistency_issues = self._check_consistency(jobs, config)
            
            total_issues = len(anomalies) + len(quality_issues) + len(consistency_issues)
            
            notes_parts = []
            if anomalies:
                notes_parts.append(f"{len(anomalies)} anomalies")
            if quality_issues:
                notes_parts.append(f"{len(quality_issues)} quality issues")
            if consistency_issues:
                notes_parts.append(f"{len(consistency_issues)} consistency issues")
            
            if total_issues == 0:
                notes = f"All {len(jobs)} jobs verified ✓"
            else:
                notes = f"Verified {len(jobs)} jobs, found: {', '.join(notes_parts)}"
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=total_issues,
                notes=notes,
            )
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )

    def _check_anomalies(self, jobs: list) -> list:
        """Detect anomalies like same job with different scores."""
        anomalies = []
        seen_titles = {}
        
        for job in jobs:
            title_company = f"{job['title']}|{job['company']}".lower()
            
            if title_company in seen_titles:
                prev_job = seen_titles[title_company]
                
                # Same job title+company but different score
                if job['fit_score'] != prev_job['fit_score']:
                    anomalies.append({
                        'type': 'score_mismatch',
                        'job': title_company,
                        'scores': [prev_job['fit_score'], job['fit_score']]
                    })
            else:
                seen_titles[title_company] = job
        
        return anomalies

    def _check_data_quality(self, jobs: list) -> list:
        """Validate job descriptions and required fields."""
        issues = []
        
        for job in jobs:
            # Check required fields
            if not job.get('title') or not job['title'].strip():
                issues.append(('missing_title', job['id']))
            
            if not job.get('description') or not job['description'].strip():
                issues.append(('missing_description', job['id']))
            
            if job.get('fit_score') is None:
                issues.append(('unscored', job['id']))
            
            # Check value ranges
            if job.get('fit_score') is not None:
                if not (0 <= job['fit_score'] <= 100):
                    issues.append(('score_out_of_range', job['id']))
            
            # Check description length (should be meaningful)
            if job.get('description'):
                if len(job['description']) < 20:
                    issues.append(('too_short_desc', job['id']))
        
        return issues

    def _check_consistency(self, jobs: list, config: Config) -> list:
        """Verify scoring logic consistency."""
        issues = []
        
        # Sample jobs from different score ranges for manual checks
        low_score_jobs = [j for j in jobs if j.get('fit_score', 0) < 20]
        mid_score_jobs = [j for j in jobs if 20 <= j.get('fit_score', 0) < 50]
        high_score_jobs = [j for j in jobs if j.get('fit_score', 0) >= 50]
        
        # Check: high-score jobs should have keywords+skills
        user_keywords = set(k.lower() for k in config.keywords)
        user_skills = set(s.lower() for s in config.my_skills)
        
        for job in high_score_jobs[:3]:  # Check first 3
            desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
            
            keyword_match = sum(1 for kw in user_keywords if kw in desc)
            skill_match = sum(1 for sk in user_skills if sk in desc)
            
            # High score jobs should have substantial matches
            if keyword_match == 0 and skill_match == 0:
                issues.append({
                    'type': 'unexpected_high_score',
                    'job_id': job['id'],
                    'score': job['fit_score']
                })
        
        return issues
