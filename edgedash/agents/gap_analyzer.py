"""GapAnalyzer agent: identify top skill gaps from job market."""

from collections import Counter
from datetime import datetime
from edgedash.agents.base import Agent, AgentResult
from edgedash.config import Config
from edgedash import storage


class GapAnalyzer(Agent):
    """Analyze job market and identify skill gaps."""

    @property
    def name(self) -> str:
        return "gap_analyzer"

    def run(self, config: Config, storage_module) -> AgentResult:
        """Analyze job listings and identify skill gaps."""
        try:
            # Get all jobs (analyze full market)
            jobs = storage_module.get_listings(config.db_path, limit=999999)
            
            if not jobs:
                return AgentResult(
                    agent=self.name,
                    status="ok",
                    records_touched=0,
                    notes="No high-fit jobs to analyze",
                )
            
            # Extract skills from jobs
            market_skills = self._extract_market_skills(jobs, config)
            
            # Find gaps (skills market wants, user doesn't have)
            user_skills = set(s.lower() for s in config.my_skills)
            skill_gaps = self._calculate_gaps(market_skills, user_skills, config)
            
            # Store in database
            count = storage_module.update_skill_gaps(config.db_path, skill_gaps)
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=count,
                notes=f"Analyzed {len(jobs)} jobs, found {count} skill gaps",
            )
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )

    def _extract_market_skills(self, jobs: list, config: Config) -> Counter:
        """Extract all skills mentioned in job descriptions."""
        all_skills = Counter()
        
        # Define extended skill vocabulary
        skill_keywords = {
            # Programming languages
            "python": ["python", "py"],
            "sql": ["sql", "postgres", "mysql", "sqlite", "t-sql"],
            "r": ["r programming", "r language", " r "],
            "java": ["java"],
            "scala": ["scala"],
            "javascript": ["javascript", "js", "node.js", "typescript"],
            
            # ML/AI (differentiated)
            "machine learning": ["machine learning", "ml"],
            "deep learning": ["deep learning", "neural network", "cnn", "rnn", "lstm"],
            "nlp": ["nlp", "natural language", "bert", "gpt"],
            "computer vision": ["computer vision", "cv", "image processing", "opencv"],
            
            # Big Data
            "spark": ["spark", "pyspark", "apache spark"],
            "hadoop": ["hadoop"],
            "hive": ["hive"],
            "kafka": ["kafka"],
            "flink": ["flink"],
            
            # Cloud platforms
            "aws": ["aws", "amazon web services", "ec2", "s3", "sagemaker"],
            "gcp": ["gcp", "google cloud", "bigquery"],
            "azure": ["azure", "microsoft azure"],
            
            # DevOps/Tools
            "docker": ["docker", "container"],
            "kubernetes": ["kubernetes", "k8s", "orchestration"],
            "git": ["git", "github", "gitlab"],
            "jenkins": ["jenkins", "ci/cd"],
            "terraform": ["terraform", "infrastructure"],
            
            # Data Tools
            "tableau": ["tableau"],
            "powerbi": ["powerbi", "power bi", "power bi"],
            "looker": ["looker"],
            "qlik": ["qlik"],
            
            # Data Engineering
            "data engineering": ["data engineer"],
            "etl": ["etl", "elt"],
            "data pipeline": ["data pipeline", "pipeline"],
            "data warehouse": ["data warehouse", "dwh", "snowflake", "redshift"],
            "airflow": ["airflow", "dag", "orchestrat"],
            
            # Analytics & Modeling
            "a/b testing": ["a/b test", "ab test"],
            "statistics": ["statistics", "statistical"],
            "regression": ["regression"],
            "classification": ["classification"],
        }
        
        for job in jobs:
            desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
            
            for skill_name, keywords in skill_keywords.items():
                for keyword in keywords:
                    if keyword in desc:
                        all_skills[skill_name] += 1
                        break  # Count each skill once per job
        
        return all_skills

    def _calculate_gaps(
        self,
        market_skills: Counter,
        user_skills: set,
        config: Config
    ) -> list[tuple[str, int]]:
        """Calculate skill gaps: market wants - user has."""
        gaps = []
        
        for skill, frequency in market_skills.most_common(20):
            # If user doesn't have this skill, it's a gap
            if skill.lower() not in user_skills:
                gaps.append((skill, frequency))
        
        return gaps[:10]  # Top 10 gaps
