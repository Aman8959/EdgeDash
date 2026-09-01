"""Resume Validator Agent - Verify resume claims trace to master profile."""

from edgedash.models.candidate import CandidateProfile
from edgedash.models.resume import ResumeVersion, ResumeAnalysis


class ResumeValidator:
    """Validate resume against master profile to prevent hallucinations."""
    
    @staticmethod
    def validate_skills_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that all skills in resume exist in candidate profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_skill_names = {s.skill_name.lower() for s in candidate_profile.skills}
        
        for skill_line in resume.skills_section:
            # Extract skill name from line (format: "Skill Name (Level, years)")
            skill_name = skill_line.split('(')[0].strip()
            skill_name_lower = skill_name.lower()
            
            if skill_name_lower not in candidate_skill_names:
                issues.append(f"HALLUCINATION: Skill '{skill_name}' not found in master profile")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_experience_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that all work experience in resume exists in candidate profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_companies = {exp.company.lower() for exp in candidate_profile.experience}
        candidate_jobs = {exp.job_title.lower() for exp in candidate_profile.experience}
        
        # Parse experience lines from resume
        for i, exp_line in enumerate(resume.experience_section):
            if '|' in exp_line and 'Company' not in exp_line:  # Header line with company
                # Format: "Job Title | Company, Location | Dates"
                parts = exp_line.split('|')
                if len(parts) >= 2:
                    company_part = parts[1].strip()
                    company = company_part.split(',')[0].strip().lower()
                    job_title = parts[0].strip().lower()
                    
                    if company not in candidate_companies:
                        issues.append(f"HALLUCINATION: Company '{parts[1].split(',')[0].strip()}' not found in master profile")
                    if job_title not in candidate_jobs:
                        issues.append(f"HALLUCINATION: Job title '{parts[0].strip()}' not found in master profile")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_projects_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that all projects in resume exist in candidate profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_project_names = {p.name.lower() for p in candidate_profile.projects}
        
        for project_name in resume.used_projects:
            if project_name.lower() not in candidate_project_names:
                issues.append(f"HALLUCINATION: Project '{project_name}' not found in master profile")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_education_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that all education in resume exists in candidate profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_institutions = {edu.institution.lower() for edu in candidate_profile.education}
        candidate_degrees = {edu.degree.lower() for edu in candidate_profile.education}
        
        for edu_line in resume.education_section:
            edu_lower = edu_line.lower()
            
            # Check if institution is mentioned
            found_institution = False
            for institution in candidate_institutions:
                if institution in edu_lower:
                    found_institution = True
                    break
            
            if not found_institution:
                # Try to extract institution name
                if ' from ' in edu_lower:
                    inst = edu_lower.split(' from ')[-1].split('(')[0].strip()
                    issues.append(f"HALLUCINATION: Institution '{inst}' not found in master profile")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_certifications_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that all certifications in resume exist in candidate profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_cert_names = {c.name.lower() for c in candidate_profile.certifications}
        
        for cert_line in resume.certifications_section:
            cert_name = cert_line.split('|')[0].strip()
            if cert_name.lower() not in candidate_cert_names:
                issues.append(f"HALLUCINATION: Certification '{cert_name}' not found in master profile")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_achievements_section(resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, list[str]]:
        """Validate that achievements are from master profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        candidate_achievements_lower = [a.lower() for a in candidate_profile.achievements]
        
        for achievement in resume.achievements_section:
            achievement_lower = achievement.lower()
            
            # Check if this achievement (or similar) is in profile
            found = False
            for profile_achievement in candidate_achievements_lower:
                # Allow fuzzy match - check if achievement is substring of profile or vice versa
                if (achievement_lower in profile_achievement or 
                    profile_achievement in achievement_lower or
                    len(achievement_lower) > 0 and any(word in profile_achievement for word in achievement_lower.split())):
                    found = True
                    break
            
            if not found and len(achievement) > 10:  # Skip trivial items
                issues.append(f"HALLUCINATION: Achievement not verified: '{achievement}'")
        
        return len(issues) == 0, issues
    
    @classmethod
    def validate_resume(cls, resume: ResumeVersion, candidate_profile: CandidateProfile) -> tuple[bool, dict]:
        """Comprehensive resume validation.
        
        Verifies that all resume claims trace back to master profile.
        
        Args:
            resume: Generated resume
            candidate_profile: Master candidate profile
        
        Returns:
            Tuple of (is_valid, validation_report)
        """
        validation_report = {
            "overall_valid": True,
            "sections": {},
            "total_issues": 0,
            "all_issues": []
        }
        
        # Validate each section
        sections = [
            ("Skills", cls.validate_skills_section),
            ("Experience", cls.validate_experience_section),
            ("Projects", cls.validate_projects_section),
            ("Education", cls.validate_education_section),
            ("Certifications", cls.validate_certifications_section),
            ("Achievements", cls.validate_achievements_section),
        ]
        
        for section_name, validation_func in sections:
            is_valid, issues = validation_func(resume, candidate_profile)
            validation_report["sections"][section_name] = {
                "valid": is_valid,
                "issues": issues
            }
            
            if not is_valid:
                validation_report["overall_valid"] = False
                validation_report["all_issues"].extend(issues)
                validation_report["total_issues"] += len(issues)
        
        # Additional content check
        if resume.content_text:
            # Check for suspicious patterns that might indicate hallucination
            suspicious_phrases = [
                "might", "could have", "possibly", "allegedly", "claimed to",
                "it is believed", "reportedly", "supposedly"
            ]
            
            suspicious_found = []
            content_lower = resume.content_text.lower()
            for phrase in suspicious_phrases:
                if phrase in content_lower:
                    suspicious_found.append(phrase)
            
            if suspicious_found:
                validation_report["warnings"] = f"Suspicious language found: {', '.join(suspicious_found)}"
        
        return validation_report["overall_valid"], validation_report
