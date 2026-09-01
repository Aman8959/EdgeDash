"""Resume version and analysis models."""

from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class ResumeMeta:
    """Metadata for a resume version."""
    version_id: str
    target_role: str
    job_id: Optional[str] = None
    match_score: float = 0.0
    ats_score: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    validation_status: str = "PENDING"  # PENDING, PASS, FAIL
    validation_errors: list[str] = field(default_factory=list)


@dataclass
class ResumeVersion:
    """A generated resume for a specific job/role."""
    version_id: str
    target_role: str
    job_id: Optional[str] = None
    profile_id: int = 1  # Default to candidate profile ID 1
    
    # Resume sections
    full_name: str = ""
    contact_info: str = ""
    professional_summary: str = ""
    
    skills_section: list[str] = field(default_factory=list)  # Ordered list of skills
    experience_section: list[str] = field(default_factory=list)  # Bullet points
    projects_section: list[str] = field(default_factory=list)  # Bullet points
    education_section: list[str] = field(default_factory=list)
    certifications_section: list[str] = field(default_factory=list)
    achievements_section: list[str] = field(default_factory=list)
    
    # Traceability: which candidate data was used
    used_skills: dict[str, str] = field(default_factory=dict)  # skill_name -> source
    used_projects: list[str] = field(default_factory=list)  # project names
    used_experience_ids: list[int] = field(default_factory=list)  # experience record IDs
    
    # Metadata
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    match_score: float = 0.0
    ats_score: float = 0.0
    validation_status: str = "PENDING"
    validation_errors: list[str] = field(default_factory=list)
    
    # Content format
    content_text: str = ""  # Plain text version


@dataclass
class ResumeAnalysis:
    """Analysis of resume vs JD."""
    version_id: str
    job_id: str
    
    # Scores
    overall_match: float = 0.0  # 0-100%
    skill_match: float = 0.0
    project_match: float = 0.0
    experience_match: float = 0.0
    keyword_match: float = 0.0
    education_match: float = 0.0
    
    # Matched skills
    matched_skills: list[str] = field(default_factory=list)
    related_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    
    # Matched keywords
    matched_keywords: list[str] = field(default_factory=list)
    missing_keywords: list[str] = field(default_factory=list)
    
    # Recommendations
    recommendations: list[str] = field(default_factory=list)
    
    # ATS specific
    ats_score: float = 0.0
    ats_warnings: list[str] = field(default_factory=list)
    
    def calculate_overall_match(self) -> float:
        """Calculate overall match from component scores."""
        weights = {
            'skill_match': 0.35,
            'keyword_match': 0.25,
            'project_match': 0.20,
            'experience_match': 0.15,
            'education_match': 0.05,
        }
        
        overall = (
            self.skill_match * weights['skill_match'] +
            self.keyword_match * weights['keyword_match'] +
            self.project_match * weights['project_match'] +
            self.experience_match * weights['experience_match'] +
            self.education_match * weights['education_match']
        )
        
        return round(overall, 1)
