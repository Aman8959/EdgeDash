"""Resume Generator Agent - Generate tailored resume from master profile."""

import uuid
from datetime import datetime
from typing import Optional

from edgedash.models.candidate import CandidateProfile, CandidateProject, CandidateExperience
from edgedash.models.job import JobRequirement
from edgedash.models.resume import ResumeVersion


class ResumeGenerator:
    """Generate tailored resumes from candidate profile."""
    
    @staticmethod
    def generate_version_id() -> str:
        """Generate unique resume version ID."""
        return str(uuid.uuid4())[:8]
    
    @staticmethod
    def select_relevant_skills(candidate_profile: CandidateProfile, job_req: JobRequirement, max_skills: int = 10) -> list[str]:
        """Select most relevant skills for the job.
        
        All skills returned must exist in candidate profile (NO HALLUCINATION).
        
        Args:
            candidate_profile: Candidate profile
            job_req: Job requirements
            max_skills: Maximum skills to include
        
        Returns:
            List of selected skill names (in priority order)
        """
        candidate_skills = {s.skill_name: s for s in candidate_profile.skills}
        job_required = set(s.lower() for s in job_req.required_skills)
        job_preferred = set(s.lower() for s in job_req.preferred_skills)
        job_keywords = set(s.lower() for s in job_req.technical_keywords)
        
        # Score each candidate skill
        scored_skills = []
        for skill_name, skill_obj in candidate_skills.items():
            score = 0
            skill_lower = skill_name.lower()
            
            # Required skills get highest priority
            if skill_lower in job_required:
                score += 100
            # Preferred skills get medium priority
            elif skill_lower in job_preferred:
                score += 50
            # Keywords get low priority
            elif skill_lower in job_keywords:
                score += 25
            
            # Higher proficiency = higher score
            proficiency_scores = {"Expert": 30, "Advanced": 20, "Intermediate": 10, "Beginner": 5}
            score += proficiency_scores.get(skill_obj.proficiency, 0)
            
            # More years of experience = higher score
            score += skill_obj.years_of_experience * 2
            
            if score > 0:
                scored_skills.append((skill_name, score))
        
        # Sort by score and return top N
        scored_skills.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored_skills[:max_skills]]
    
    @staticmethod
    def select_relevant_projects(candidate_profile: CandidateProfile, job_req: JobRequirement, max_projects: int = 3) -> list[CandidateProject]:
        """Select most relevant projects for the job.
        
        Returns only projects from candidate profile (NO HALLUCINATION).
        
        Args:
            candidate_profile: Candidate profile
            job_req: Job requirements
            max_projects: Maximum projects to include
        
        Returns:
            List of selected CandidateProject objects
        """
        job_keywords = set(s.lower() for s in job_req.technical_keywords)
        job_domain = job_req.domain.lower()
        
        # Score each project
        scored_projects = []
        for project in candidate_profile.projects:
            score = 0
            
            # Projects targeting this role get high priority
            if any(role.lower() in job_domain for role in project.target_roles):
                score += 100
            
            # Projects with matching skills
            project_skills_lower = [s.lower() for s in project.skills_used]
            matching_skills = sum(1 for skill in project_skills_lower if skill in job_keywords)
            score += matching_skills * 20
            
            # Projects with matching keywords
            project_keywords_lower = [k.lower() for k in project.keywords]
            matching_keywords = sum(1 for kw in project_keywords_lower if kw in job_keywords)
            score += matching_keywords * 10
            
            # Priority field
            score += project.priority * 5
            
            if score > 0:
                scored_projects.append((project, score))
        
        # Sort by score and return top N
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        return [p[0] for p in scored_projects[:max_projects]]
    
    @staticmethod
    def select_relevant_experience(candidate_profile: CandidateProfile, job_req: JobRequirement, max_entries: int = 3) -> list[CandidateExperience]:
        """Select most relevant work experience entries.
        
        Returns only entries from candidate profile (NO HALLUCINATION).
        
        Args:
            candidate_profile: Candidate profile
            job_req: Job requirements
            max_entries: Maximum entries to include
        
        Returns:
            List of selected CandidateExperience objects
        """
        job_domain = job_req.domain.lower()
        job_title = job_req.job_title.lower()
        job_keywords = set(s.lower() for s in job_req.technical_keywords)
        
        # Score each experience
        scored_exp = []
        for exp in candidate_profile.experience:
            score = 0
            
            # Similar job title gets high priority
            if job_title in exp.job_title.lower():
                score += 100
            elif any(word in exp.job_title.lower() for word in job_title.split()):
                score += 50
            
            # Most recent experience gets priority
            # (assume later entries in list are more recent)
            score += 50
            
            # Experience with matching skills
            exp_skills_lower = [s.lower() for s in exp.skills_demonstrated]
            matching_skills = sum(1 for skill in exp_skills_lower if skill in job_keywords)
            score += matching_skills * 15
            
            if score > 0:
                scored_exp.append((exp, score))
        
        # Sort by score (reversed to prioritize recent) and return top N
        scored_exp.sort(key=lambda x: x[1], reverse=True)
        return [e[0] for e in scored_exp[:max_entries]]
    
    @staticmethod
    def generate_professional_summary(candidate_profile: CandidateProfile, job_req: JobRequirement, selected_skills: list[str]) -> str:
        """Generate tailored professional summary.
        
        Args:
            candidate_profile: Candidate profile
            job_req: Job requirements
            selected_skills: Key skills for this role
        
        Returns:
            Professional summary text
        """
        target_role = job_req.job_title
        years = int(candidate_profile.get_experience_years())
        domain = job_req.domain
        
        # Build summary components
        experience_part = f"{years}+ years of experience" if years > 0 else "Experienced"
        domain_part = f"in {domain}" if domain != "Software Engineering" else "in software development"
        
        # Key strengths
        top_skills = selected_skills[:3] if selected_skills else []
        skills_part = f"with expertise in {', '.join(top_skills)}" if top_skills else ""
        
        # Objective
        summary = f"{experience_part} {domain_part} as a {target_role}. {skills_part}".strip()
        
        if candidate_profile.summary:
            # Blend with original summary if available
            summary = f"{candidate_profile.summary}\n\nKey strengths: {', '.join(top_skills)}" if top_skills else candidate_profile.summary
        
        return summary
    
    @staticmethod
    def format_skills_section(selected_skills: list[str], candidate_profile: CandidateProfile) -> list[str]:
        """Format skills section for resume.
        
        Args:
            selected_skills: List of selected skill names
            candidate_profile: Candidate profile with skill details
        
        Returns:
            List of formatted skill strings
        """
        skills_dict = {s.skill_name: s for s in candidate_profile.skills}
        formatted = []
        
        for skill_name in selected_skills:
            skill = skills_dict.get(skill_name)
            if skill:
                # Format: "Python (Expert, 5 years)"
                years_str = f", {skill.years_of_experience} years" if skill.years_of_experience > 0 else ""
                formatted_skill = f"{skill_name} ({skill.proficiency}{years_str})"
                formatted.append(formatted_skill)
            else:
                formatted.append(skill_name)
        
        return formatted
    
    @staticmethod
    def format_experience_section(selected_experience: list[CandidateExperience]) -> list[str]:
        """Format work experience section for resume.
        
        Args:
            selected_experience: List of selected experience entries
        
        Returns:
            List of formatted experience strings
        """
        formatted = []
        
        for exp in selected_experience:
            # Header: Job Title | Company, Location | Dates
            dates = f"{exp.start_date}"
            if exp.end_date:
                dates += f" – {exp.end_date}"
            else:
                dates += " – Present"
            
            header = f"{exp.job_title} | {exp.company}, {exp.location} | {dates}"
            formatted.append(header)
            
            # Description
            if exp.description:
                formatted.append(f"  {exp.description}")
            
            # Responsibilities (bullet points)
            for resp in exp.responsibilities[:4]:  # Top 4 responsibilities
                formatted.append(f"  • {resp}")
            
            formatted.append("")  # Blank line between entries
        
        return formatted
    
    @staticmethod
    def format_projects_section(selected_projects: list[CandidateProject]) -> list[str]:
        """Format projects section for resume.
        
        Args:
            selected_projects: List of selected projects
        
        Returns:
            List of formatted project strings
        """
        formatted = []
        
        for project in selected_projects:
            # Header: Project Name | Key Metrics
            header = project.name
            if project.metrics:
                header += f" | {project.metrics}"
            formatted.append(header)
            
            # Description
            if project.description:
                formatted.append(f"  {project.description}")
            
            # Skills and keywords
            all_tags = project.skills_used + project.keywords
            if all_tags:
                formatted.append(f"  Tech: {', '.join(all_tags[:5])}")
            
            # Link
            if project.url or project.github_url:
                link = project.github_url or project.url
                formatted.append(f"  Link: {link}")
            
            formatted.append("")  # Blank line between projects
        
        return formatted
    
    @classmethod
    def generate_resume(cls, candidate_profile: CandidateProfile, job_req: JobRequirement, 
                       target_role: str = "", job_id: Optional[str] = None) -> ResumeVersion:
        """Generate tailored resume version.
        
        All content is derived from candidate profile (NO HALLUCINATION).
        
        Args:
            candidate_profile: Master candidate profile
            job_req: Job requirements
            target_role: Target role name (optional, uses job title if not provided)
            job_id: Job listing ID (optional)
        
        Returns:
            ResumeVersion object
        """
        if not target_role:
            target_role = job_req.job_title
        
        # Select relevant content
        selected_skills = cls.select_relevant_skills(candidate_profile, job_req)
        selected_projects = cls.select_relevant_projects(candidate_profile, job_req)
        selected_experience = cls.select_relevant_experience(candidate_profile, job_req)
        
        # Generate sections
        professional_summary = cls.generate_professional_summary(candidate_profile, job_req, selected_skills)
        skills_section = cls.format_skills_section(selected_skills, candidate_profile)
        experience_section = cls.format_experience_section(selected_experience)
        projects_section = cls.format_projects_section(selected_projects)
        
        # Education section
        education_section = []
        for edu in candidate_profile.education[:2]:  # Top 2 degrees
            edu_str = f"{edu.degree} in {edu.field_of_study} from {edu.institution} ({edu.graduation_year})"
            if edu.gpa:
                edu_str += f" – GPA: {edu.gpa}"
            education_section.append(edu_str)
        
        # Certifications section
        certifications_section = []
        for cert in candidate_profile.certifications[:3]:  # Top 3 certifications
            cert_str = f"{cert.name} | {cert.issuer} ({cert.issue_date})"
            certifications_section.append(cert_str)
        
        # Achievements section
        achievements_section = candidate_profile.achievements[:5]  # Top 5 achievements
        
        # Build plain text version
        content_lines = [
            f"{candidate_profile.full_name.upper()}",
            candidate_profile.location,
            f"📧 {candidate_profile.email}" + (f" | 📱 {candidate_profile.phone}" if candidate_profile.phone else ""),
            "",
            "PROFESSIONAL SUMMARY",
            professional_summary,
            "",
            "KEY SKILLS",
            "",
        ]
        content_lines.extend(skills_section)
        content_lines.extend(["", "WORK EXPERIENCE", ""])
        content_lines.extend(experience_section)
        
        if projects_section:
            content_lines.extend(["PROJECTS", ""])
            content_lines.extend(projects_section)
        
        content_lines.extend(["EDUCATION", ""])
        content_lines.extend(education_section)
        
        if certifications_section:
            content_lines.extend(["", "CERTIFICATIONS", ""])
            content_lines.extend(certifications_section)
        
        if achievements_section:
            content_lines.extend(["", "ACHIEVEMENTS", ""])
            for achievement in achievements_section:
                content_lines.append(f"• {achievement}")
        
        content_text = "\n".join(content_lines)
        
        # Create ResumeVersion
        version_id = cls.generate_version_id()
        
        resume = ResumeVersion(
            version_id=version_id,
            target_role=target_role,
            job_id=job_id,
            full_name=candidate_profile.full_name,
            contact_info=f"{candidate_profile.email}" + (f" | {candidate_profile.phone}" if candidate_profile.phone else ""),
            professional_summary=professional_summary,
            skills_section=skills_section,
            experience_section=experience_section,
            projects_section=projects_section,
            education_section=education_section,
            certifications_section=certifications_section,
            achievements_section=achievements_section,
            used_skills={skill: "Candidate Profile" for skill in selected_skills},
            used_projects=[p.name for p in selected_projects],
            used_experience_ids=[i for i, exp in enumerate(candidate_profile.experience) if any(exp.job_title == e.job_title for e in selected_experience)],
            created_at=datetime.now().isoformat(),
            content_text=content_text,
            validation_status="PENDING"
        )
        
        return resume
