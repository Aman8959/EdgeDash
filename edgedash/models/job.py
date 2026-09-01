"""Job requirement models."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class JobRequirement:
    """Structured job description analysis."""
    job_id: str
    job_title: str
    seniority: str = "Not Specified"  # Entry, Mid, Senior, Lead, Executive
    
    required_skills: list[str] = field(default_factory=list)
    preferred_skills: list[str] = field(default_factory=list)
    
    technical_keywords: list[str] = field(default_factory=list)
    responsibilities: list[str] = field(default_factory=list)
    
    experience_requirement: str = ""  # e.g., "3-5 years"
    education_requirement: str = ""  # e.g., "Bachelor's in CS"
    
    tools: list[str] = field(default_factory=list)  # Python, SQL, Docker, etc.
    frameworks: list[str] = field(default_factory=list)  # FastAPI, Django, etc.
    
    domain: str = ""  # Data Science, Backend, Frontend, DevOps, etc.
    location: str = ""
    company: str = ""
    
    description: str = ""  # Original JD text
    
    def all_required_tech(self) -> list[str]:
        """Get all technical requirements (skills + tools + frameworks)."""
        return list(set(self.required_skills + self.tools + self.frameworks))
