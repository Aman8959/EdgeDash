"""Job requirement models."""

from dataclasses import dataclass, field
from typing import Optional
import re


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

    def __init__(
        self,
        job_id: str,
        job_title: Optional[str] = None,
        seniority: str = "Not Specified",
        required_skills: Optional[list[str]] = None,
        preferred_skills: Optional[list[str]] = None,
        technical_keywords: Optional[list[str]] = None,
        responsibilities: Optional[list[str]] = None,
        experience_requirement: str = "",
        education_requirement: str = "",
        tools: Optional[list[str]] = None,
        frameworks: Optional[list[str]] = None,
        domain: str = "",
        location: str = "",
        company: str = "",
        description: str = "",
        *,
        title: Optional[str] = None,
        seniority_level: Optional[str] = None,
        required_experience_years: Optional[int] = None,
        required_experience: Optional[int] = None,
    ):
        """Support both current and legacy JobRequirement field names."""
        if job_title is None:
            job_title = title
        if job_title is None:
            raise ValueError("job_title or title is required")

        if seniority_level is not None:
            seniority = seniority_level

        if required_experience_years is not None:
            experience_requirement = f"{required_experience_years}+ years"
        elif required_experience is not None:
            experience_requirement = f"{required_experience}+ years"

        self.job_id = job_id
        self.job_title = job_title
        self.seniority = seniority
        self.required_skills = required_skills or []
        self.preferred_skills = preferred_skills or []
        self.technical_keywords = technical_keywords or []
        self.responsibilities = responsibilities or []
        self.experience_requirement = experience_requirement
        self.education_requirement = education_requirement
        self.tools = tools or []
        self.frameworks = frameworks or []
        self.domain = domain
        self.location = location
        self.company = company
        self.description = description

    @property
    def title(self) -> str:
        """Backward-compatible alias for job_title."""
        return self.job_title

    @title.setter
    def title(self, value: str) -> None:
        self.job_title = value

    @property
    def seniority_level(self) -> str:
        """Backward-compatible alias for seniority."""
        return self.seniority

    @seniority_level.setter
    def seniority_level(self, value: str) -> None:
        self.seniority = value

    @property
    def required_experience_years(self) -> int:
        """Parse experience_requirement into a numeric value where possible."""
        if not self.experience_requirement:
            return 0
        nums = re.findall(r"\d+", self.experience_requirement)
        if not nums:
            return 0
        return int(nums[0])

    @required_experience_years.setter
    def required_experience_years(self, value: int) -> None:
        self.experience_requirement = f"{value}+ years"

    def all_required_tech(self) -> list[str]:
        """Get all technical requirements (skills + tools + frameworks)."""
        return list(set(self.required_skills + self.tools + self.frameworks))
