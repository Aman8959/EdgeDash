"""Profile loader - loads candidate profile from YAML and saves to database."""

import yaml
from pathlib import Path
from typing import Optional
from datetime import datetime

from edgedash.models.candidate import (
    CandidateProfile, CandidateSkill, CandidateExperience,
    CandidateEducation, CandidateCertification, CandidateProject
)
from edgedash.storage import save_candidate_profile


def load_profile_from_yaml(yaml_path: str) -> Optional[CandidateProfile]:
    """Load candidate profile from YAML file.
    
    Args:
        yaml_path: Path to profile.yaml
    
    Returns:
        CandidateProfile or None if validation fails
    
    Raises:
        ValueError: If YAML is invalid or required fields are missing
    """
    path = Path(yaml_path)
    
    if not path.exists():
        raise FileNotFoundError(f"Profile file not found: {yaml_path}")
    
    try:
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        
        if not data:
            raise ValueError("Profile YAML is empty")
        
        # Parse basic_info
        basic_info = data.get('basic_info', {})
        if not basic_info.get('full_name') or not basic_info.get('email'):
            raise ValueError("Missing required fields: full_name and email in basic_info")
        
        # Parse skills
        skills = []
        for skill_data in data.get('skills', []):
            skill = CandidateSkill(
                skill_name=skill_data.get('skill_name', ''),
                proficiency=skill_data.get('proficiency', 'Intermediate'),
                years_of_experience=skill_data.get('years_of_experience', 0),
                category=skill_data.get('category', 'Technical'),
                endorsements=skill_data.get('endorsements', 0)
            )
            skills.append(skill)
        
        # Parse experience
        experience = []
        for exp_data in data.get('experience', []):
            exp = CandidateExperience(
                company=exp_data.get('company', ''),
                job_title=exp_data.get('job_title', ''),
                start_date=exp_data.get('start_date', ''),
                end_date=exp_data.get('end_date'),
                description=exp_data.get('description', ''),
                responsibilities=exp_data.get('responsibilities', []),
                skills_demonstrated=exp_data.get('skills_demonstrated', []),
                location=exp_data.get('location', '')
            )
            experience.append(exp)
        
        # Parse education
        education = []
        for edu_data in data.get('education', []):
            edu = CandidateEducation(
                institution=edu_data.get('institution', ''),
                degree=edu_data.get('degree', ''),
                field_of_study=edu_data.get('field_of_study', ''),
                graduation_year=edu_data.get('graduation_year', 0),
                gpa=edu_data.get('gpa'),
                relevant_coursework=edu_data.get('relevant_coursework', [])
            )
            education.append(edu)
        
        # Parse certifications
        certifications = []
        for cert_data in data.get('certifications', []):
            cert = CandidateCertification(
                name=cert_data.get('name', ''),
                issuer=cert_data.get('issuer', ''),
                issue_date=cert_data.get('issue_date', ''),
                expiry_date=cert_data.get('expiry_date'),
                credential_url=cert_data.get('credential_url')
            )
            certifications.append(cert)
        
        # Parse projects
        projects = []
        for proj_data in data.get('projects', []):
            proj = CandidateProject(
                name=proj_data.get('name', ''),
                description=proj_data.get('description', ''),
                category=proj_data.get('category', ''),
                target_roles=proj_data.get('target_roles', []),
                skills_used=proj_data.get('skills_used', []),
                keywords=proj_data.get('keywords', []),
                priority=proj_data.get('priority', 5),
                url=proj_data.get('url'),
                github_url=proj_data.get('github_url'),
                metrics=proj_data.get('metrics')
            )
            projects.append(proj)
        
        # Create CandidateProfile
        profile = CandidateProfile(
            full_name=basic_info.get('full_name', ''),
            email=basic_info.get('email', ''),
            phone=basic_info.get('phone'),
            location=basic_info.get('location', ''),
            summary=basic_info.get('summary', ''),
            target_roles=basic_info.get('target_roles', []),
            skills=skills,
            experience=experience,
            education=education,
            certifications=certifications,
            projects=projects,
            achievements=data.get('achievements', []),
            github_url=basic_info.get('github_url'),
            linkedin_url=basic_info.get('linkedin_url'),
            portfolio_url=basic_info.get('portfolio_url')
        )
        
        return profile
    
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML format: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to parse profile YAML: {str(e)}")


def validate_profile(profile: CandidateProfile) -> tuple[bool, list[str]]:
    """Validate profile completeness and quality.
    
    Args:
        profile: CandidateProfile to validate
    
    Returns:
        Tuple of (is_valid, list of warnings/errors)
    """
    issues = []
    
    # Check basic info
    if not profile.full_name or len(profile.full_name.strip()) < 2:
        issues.append("Full name is required and must be at least 2 characters")
    
    if not profile.email or '@' not in profile.email:
        issues.append("Valid email is required")
    
    # Check skills
    if len(profile.skills) == 0:
        issues.append("At least one skill is required")
    elif len(profile.skills) < 5:
        issues.append(f"WARNING: Only {len(profile.skills)} skills provided (recommend 5+)")
    
    # Check experience
    if len(profile.experience) == 0:
        issues.append("At least one work experience entry is required")
    
    # Check education
    if len(profile.education) == 0:
        issues.append("At least one education entry is required")
    
    # Check projects
    if len(profile.projects) < 2:
        issues.append(f"WARNING: Only {len(profile.projects)} projects provided (recommend 2+)")
    
    # Check target roles
    if len(profile.target_roles) == 0:
        issues.append("At least one target role is required")
    
    is_valid = len([i for i in issues if i.startswith("At least")]) == 0
    
    return is_valid, issues


def load_and_save_profile(yaml_path: str, db_path: str) -> dict:
    """Load profile from YAML and save to database.
    
    Args:
        yaml_path: Path to profile.yaml
        db_path: Path to edgedash.db
    
    Returns:
        Dictionary with status, profile_id, and messages
    """
    try:
        print(f"Loading profile from {yaml_path}...")
        profile = load_profile_from_yaml(yaml_path)
        
        print("Validating profile...")
        is_valid, issues = validate_profile(profile)
        
        if issues:
            for issue in issues:
                print(f"  - {issue}")
        
        if not is_valid:
            return {
                'status': 'FAILED',
                'profile_id': None,
                'message': 'Profile validation failed. Please fix the issues above.',
                'issues': issues
            }
        
        print("Saving profile to database...")
        profile_id = save_candidate_profile(db_path, profile)
        
        return {
            'status': 'SUCCESS',
            'profile_id': profile_id,
            'message': f'Profile saved successfully (ID: {profile_id})',
            'profile': profile,
            'warnings': [i for i in issues if i.startswith("WARNING")]
        }
    
    except Exception as e:
        return {
            'status': 'FAILED',
            'profile_id': None,
            'message': f'Error: {str(e)}',
            'issues': [str(e)]
        }
