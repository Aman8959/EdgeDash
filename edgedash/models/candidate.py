"""Candidate profile models."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CandidateSkill:
    """A skill in candidate's profile."""
    skill_name: str
    proficiency: str = "Intermediate"  # Beginner, Intermediate, Advanced, Expert
    years_of_experience: int = 0
    category: str = "Technical"  # Technical, Soft, Domain
    endorsements: int = 0


@dataclass
class CandidateProject:
    """A project in candidate's portfolio."""
    name: str
    description: str
    category: str  # Data Science, Backend, Frontend, ML, etc.
    target_roles: list[str] = field(default_factory=list)
    skills_used: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    priority: int = 5  # 1-10, higher = more important
    url: Optional[str] = None
    github_url: Optional[str] = None
    metrics: Optional[str] = None  # e.g., "Improved accuracy by 15%"


@dataclass
class CandidateExperience:
    """A work experience entry."""
    company: str
    job_title: str
    start_date: str  # YYYY-MM
    end_date: Optional[str] = None  # YYYY-MM or None if current
    description: str = ""
    responsibilities: list[str] = field(default_factory=list)
    skills_demonstrated: list[str] = field(default_factory=list)
    location: str = ""


@dataclass
class CandidateEducation:
    """An education entry."""
    institution: str
    degree: str  # Bachelor, Master, PhD, Diploma, Certificate
    field_of_study: str
    graduation_year: int
    gpa: Optional[str] = None
    relevant_coursework: list[str] = field(default_factory=list)


@dataclass
class CandidateCertification:
    """A certification or credential."""
    name: str
    issuer: str
    issue_date: str  # YYYY-MM
    expiry_date: Optional[str] = None
    credential_url: Optional[str] = None


@dataclass
class CandidateProfile:
    """Master candidate profile combining all elements."""
    full_name: str
    email: str
    phone: Optional[str] = None
    location: str = ""
    summary: str = ""
    target_roles: list[str] = field(default_factory=list)
    
    skills: list[CandidateSkill] = field(default_factory=list)
    experience: list[CandidateExperience] = field(default_factory=list)
    education: list[CandidateEducation] = field(default_factory=list)
    certifications: list[CandidateCertification] = field(default_factory=list)
    projects: list[CandidateProject] = field(default_factory=list)
    
    achievements: list[str] = field(default_factory=list)
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    
    def get_skill_names(self) -> list[str]:
        """Get list of all skill names."""
        return [s.skill_name for s in self.skills]
    
    def get_experience_years(self) -> float:
        """Calculate total years of experience."""
        from datetime import datetime
        
        total_months = 0
        for exp in self.experience:
            start = datetime.strptime(exp.start_date, "%Y-%m")
            if exp.end_date:
                end = datetime.strptime(exp.end_date, "%Y-%m")
            else:
                end = datetime.now()
            
            months = (end.year - start.year) * 12 + (end.month - start.month)
            total_months += months
        
        return round(total_months / 12, 1)
