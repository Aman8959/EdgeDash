"""Resume Matcher Agent - Match candidate skills against job requirements."""

from typing import Optional
from edgedash.models.candidate import CandidateProfile
from edgedash.models.job import JobRequirement
from edgedash.models.resume import ResumeAnalysis


class ResumeMatcher:
    """Match candidate profile against job requirements."""
    
    @staticmethod
    def calculate_skill_match(candidate_skills: list[str], job_requirements: JobRequirement) -> tuple[float, list[str], list[str], list[str]]:
        """Calculate skill match percentage.
        
        Args:
            candidate_skills: List of candidate skill names
            job_requirements: Job requirements
        
        Returns:
            Tuple of (match_percentage, matched_skills, related_skills, missing_skills)
        """
        candidate_skills_lower = [s.lower() for s in candidate_skills]
        job_required_lower = [s.lower() for s in job_requirements.required_skills]
        job_preferred_lower = [s.lower() for s in job_requirements.preferred_skills]
        
        matched = []
        related = []
        missing_required = []
        missing_preferred = []
        
        # Check required skills
        for job_skill in job_requirements.required_skills:
            job_skill_lower = job_skill.lower()
            
            # Exact match
            if job_skill_lower in candidate_skills_lower:
                matched.append(job_skill)
            # Partial match (e.g., "Python" matches "Python 3.11")
            elif any(job_skill_lower in cs for cs in candidate_skills_lower):
                matched.append(job_skill)
            # Related skill (e.g., "Data Science" for ML candidate)
            elif ResumeMatcher._is_related_skill(job_skill_lower, candidate_skills_lower):
                related.append(job_skill)
            else:
                missing_required.append(job_skill)
        
        # Check preferred skills
        for job_skill in job_requirements.preferred_skills:
            job_skill_lower = job_skill.lower()
            if job_skill_lower not in [s.lower() for s in matched + related]:
                missing_preferred.append(job_skill)
        
        # Calculate match percentage
        # Required skills: 70% weight, Preferred skills: 30% weight
        total_required = len(job_requirements.required_skills)
        total_preferred = len(job_requirements.preferred_skills)
        
        if total_required == 0:
            required_match = 0
        else:
            required_match = (len(matched) + len(related) * 0.5) / total_required * 100
        
        if total_preferred == 0:
            preferred_match = 100  # No preferred skills = perfect
        else:
            preferred_match = (total_preferred - len(missing_preferred)) / total_preferred * 100
        
        overall_match = (required_match * 0.7 + preferred_match * 0.3)
        overall_match = min(100, max(0, overall_match))  # Clamp to 0-100
        
        return overall_match, matched, related, missing_required + missing_preferred
    
    @staticmethod
    def _is_related_skill(job_skill: str, candidate_skills: list[str]) -> bool:
        """Check if candidate has related skills to job requirement.
        
        Examples:
        - "Machine Learning" is related to "Data Science"
        - "Python" is related to "Pandas"
        - "SQL" is related to "Database"
        """
        # Skill relationship mapping
        relationships = {
            "machine learning": ["data science", "python", "tensorflow", "scikit-learn", "deep learning"],
            "data science": ["machine learning", "python", "sql", "pandas", "statistics", "analytics"],
            "python": ["machine learning", "data science", "backend", "flask", "django"],
            "sql": ["database", "data analysis", "data science", "postgresql", "mysql"],
            "react": ["frontend", "javascript", "typescript", "vue", "angular"],
            "angular": ["frontend", "typescript", "javascript", "react", "vue"],
            "docker": ["kubernetes", "devops", "ci/cd", "cloud"],
            "kubernetes": ["docker", "devops", "cloud", "aws"],
        }
        
        if job_skill in relationships:
            related_skills = relationships[job_skill]
            return any(related in candidate_skills for related in related_skills)
        
        return False
    
    @staticmethod
    def calculate_project_match(candidate_projects: list[str], job_keywords: list[str]) -> tuple[float, int]:
        """Calculate how many candidate projects are relevant to the job.
        
        Args:
            candidate_projects: List of candidate project names/descriptions
            job_keywords: List of job technical keywords
        
        Returns:
            Tuple of (match_percentage, relevant_project_count)
        """
        if not candidate_projects or not job_keywords:
            return 0.0, 0
        
        job_keywords_lower = [kw.lower() for kw in job_keywords]
        relevant_count = 0
        
        for project in candidate_projects:
            project_lower = project.lower()
            # Check if any job keyword appears in project
            if any(kw in project_lower for kw in job_keywords_lower):
                relevant_count += 1
        
        match_pct = (relevant_count / len(candidate_projects)) * 100
        return match_pct, relevant_count
    
    @staticmethod
    def calculate_experience_match(candidate_years: float, job_requirement: str) -> float:
        """Calculate experience match.
        
        Args:
            candidate_years: Candidate's years of experience
            job_requirement: Job's experience requirement string (e.g., "3-5 years")
        
        Returns:
            Match percentage (0-100)
        """
        if not job_requirement:
            return 50.0  # Neutral if not specified
        
        import re
        
        # Extract numbers from requirement
        numbers = re.findall(r'\d+', job_requirement)
        
        if not numbers:
            return 50.0
        
        if len(numbers) == 1:
            min_years = int(numbers[0])
            max_years = int(numbers[0]) + 3  # Assume 3 years range
        else:
            min_years = int(numbers[0])
            max_years = int(numbers[1])
        
        # Calculate match
        if candidate_years < min_years:
            # Candidate has less experience than required
            match = (candidate_years / min_years) * 50
        elif candidate_years > max_years:
            # Candidate exceeds max (still good, but not perfect)
            match = min(100, 80 + (10 if candidate_years <= max_years + 5 else 0))
        else:
            # Perfect match
            match = 100
        
        return min(100, max(0, match))
    
    @staticmethod
    def calculate_education_match(candidate_education: list[str], job_education: str) -> float:
        """Calculate education match.
        
        Args:
            candidate_education: List of candidate degrees
            job_education: Job education requirement
        
        Returns:
            Match percentage (0-100)
        """
        if not job_education:
            return 50.0
        
        job_education_lower = job_education.lower()
        candidate_education_lower = [e.lower() for e in candidate_education]
        
        # Check for direct matches
        if any(edu in job_education_lower for edu in candidate_education_lower):
            return 100.0
        
        # Check for related degrees
        degree_hierarchy = {
            "phd": ["master", "bachelor"],
            "master": ["bachelor"],
            "bachelor": [],
            "diploma": []
        }
        
        for degree, covers in degree_hierarchy.items():
            if degree in job_education_lower:
                # Job requires this degree or higher
                for cand_edu in candidate_education_lower:
                    if degree in cand_edu or any(c in cand_edu for c in covers):
                        return 90.0  # Good match
                return 50.0  # No matching degree
        
        return 50.0
    
    @staticmethod
    def calculate_keyword_match(job_keywords: list[str], candidate_skills: list[str]) -> tuple[float, list[str], list[str]]:
        """Calculate match between job keywords and candidate skills.
        
        Args:
            job_keywords: Technical keywords from job
            candidate_skills: Candidate's skills
        
        Returns:
            Tuple of (match_percentage, matched_keywords, missing_keywords)
        """
        if not job_keywords:
            return 50.0, [], []
        
        candidate_skills_lower = [s.lower() for s in candidate_skills]
        matched = []
        missing = []
        
        for keyword in job_keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in candidate_skills_lower or any(keyword_lower in cs for cs in candidate_skills_lower):
                matched.append(keyword)
            else:
                missing.append(keyword)
        
        match_pct = (len(matched) / len(job_keywords)) * 100 if job_keywords else 0
        return match_pct, matched, missing
    
    @classmethod
    def match_candidate_to_job(cls, candidate: CandidateProfile, job_req: JobRequirement) -> ResumeAnalysis:
        """Create comprehensive match analysis between candidate and job.
        
        Args:
            candidate: Candidate profile
            job_req: Job requirements
        
        Returns:
            ResumeAnalysis with detailed scores
        """
        candidate_skills = candidate.get_skill_names()
        candidate_years = candidate.get_experience_years()
        candidate_education = [f"{e.degree} in {e.field_of_study}" for e in candidate.education]
        project_names = [p.name for p in candidate.projects]
        
        # Calculate all match scores
        skill_match, matched_skills, related_skills, missing_skills = cls.calculate_skill_match(
            candidate_skills, job_req
        )
        
        project_match, _ = cls.calculate_project_match(
            project_names, job_req.technical_keywords
        )
        
        experience_match = cls.calculate_experience_match(
            candidate_years, job_req.experience_requirement
        )
        
        education_match = cls.calculate_education_match(
            candidate_education, job_req.education_requirement
        )
        
        keyword_match, matched_keywords, missing_keywords = cls.calculate_keyword_match(
            job_req.technical_keywords, candidate_skills
        )
        
        # Calculate overall match using weighted formula
        overall_match = (
            skill_match * 0.35 +
            keyword_match * 0.25 +
            project_match * 0.20 +
            experience_match * 0.15 +
            education_match * 0.05
        )
        
        # Create analysis
        analysis = ResumeAnalysis(
            version_id="",  # Will be set by caller
            job_id=job_req.job_id,
            overall_match=round(overall_match, 1),
            skill_match=round(skill_match, 1),
            project_match=round(project_match, 1),
            experience_match=round(experience_match, 1),
            keyword_match=round(keyword_match, 1),
            education_match=round(education_match, 1),
            matched_skills=matched_skills,
            related_skills=related_skills,
            missing_skills=missing_skills,
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            recommendations=cls._generate_recommendations(
                missing_skills, missing_keywords, candidate_years, job_req.experience_requirement
            )
        )
        
        return analysis
    
    @staticmethod
    def _generate_recommendations(missing_skills: list[str], missing_keywords: list[str], 
                                   candidate_years: float, job_exp_req: str) -> list[str]:
        """Generate recommendations for improving resume match.
        
        Args:
            missing_skills: Skills candidate doesn't have
            missing_keywords: Keywords not covered
            candidate_years: Candidate's experience
            job_exp_req: Job's experience requirement
        
        Returns:
            List of recommendations
        """
        recommendations = []
        
        if missing_skills:
            top_missing = missing_skills[:3]
            recommendations.append(f"Highlight any experience with: {', '.join(top_missing)}")
        
        if missing_keywords:
            top_missing = missing_keywords[:2]
            recommendations.append(f"Emphasize knowledge of: {', '.join(top_missing)}")
        
        if "senior" in job_exp_req.lower() and candidate_years < 5:
            recommendations.append("Emphasize leadership and mentoring experience to match seniority level")
        
        if not recommendations:
            recommendations.append("Strong match! Tailor professional summary to emphasize most relevant achievements.")
        
        return recommendations
