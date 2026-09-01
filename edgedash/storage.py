import sqlite3
import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import NamedTuple, Optional

# Phase 5 model imports
from edgedash.models.candidate import CandidateProfile, CandidateSkill, CandidateExperience, CandidateEducation, CandidateCertification, CandidateProject
from edgedash.models.job import JobRequirement
from edgedash.models.resume import ResumeVersion, ResumeAnalysis


class Listing(NamedTuple):
    id: str
    title: str
    company: str
    location: str
    url: str
    description: str
    source: str
    posted_at: str
    fetched_at: str


def _make_listing_id(source: str, url: str) -> str:
    """Generate stable hash ID from source + URL."""
    combined = f"{source}:{url}".encode()
    return hashlib.sha256(combined).hexdigest()[:16]


def init_db(db_path: str) -> None:
    """Initialize database with three tables if they don't exist."""
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            source TEXT NOT NULL,
            posted_at TEXT,
            fetched_at TEXT NOT NULL,
            fit_score INTEGER,
            fit_reason TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skill_gaps (
            skill TEXT PRIMARY KEY,
            frequency INTEGER DEFAULT 0,
            last_seen TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cycle_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent TEXT NOT NULL,
            started_at TEXT NOT NULL,
            finished_at TEXT NOT NULL,
            records_touched INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            notes TEXT
        )
    """)
    
    # === PHASE 5: Resume Intelligence Tables ===
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            location TEXT,
            summary TEXT,
            target_roles TEXT,
            github_url TEXT,
            linkedin_url TEXT,
            portfolio_url TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            proficiency TEXT,
            years_of_experience INTEGER DEFAULT 0,
            category TEXT DEFAULT 'Technical',
            endorsements INTEGER DEFAULT 0,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id),
            UNIQUE(profile_id, skill_name)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            target_roles TEXT,
            skills_used TEXT,
            keywords TEXT,
            priority INTEGER DEFAULT 5,
            url TEXT,
            github_url TEXT,
            metrics TEXT,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            company TEXT NOT NULL,
            job_title TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            description TEXT,
            responsibilities TEXT,
            skills_demonstrated TEXT,
            location TEXT,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            institution TEXT NOT NULL,
            degree TEXT NOT NULL,
            field_of_study TEXT NOT NULL,
            graduation_year INTEGER,
            gpa TEXT,
            relevant_coursework TEXT,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            issuer TEXT NOT NULL,
            issue_date TEXT,
            expiry_date TEXT,
            credential_url TEXT,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_requirements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id TEXT NOT NULL,
            job_title TEXT,
            seniority TEXT,
            required_skills TEXT,
            preferred_skills TEXT,
            technical_keywords TEXT,
            responsibilities TEXT,
            experience_requirement TEXT,
            education_requirement TEXT,
            tools TEXT,
            frameworks TEXT,
            domain TEXT,
            location TEXT,
            company TEXT,
            description TEXT,
            extracted_at TEXT,
            FOREIGN KEY (listing_id) REFERENCES listings(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resume_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version_id TEXT NOT NULL UNIQUE,
            profile_id INTEGER NOT NULL,
            job_id TEXT,
            target_role TEXT NOT NULL,
            full_name TEXT,
            contact_info TEXT,
            professional_summary TEXT,
            skills_section TEXT,
            experience_section TEXT,
            projects_section TEXT,
            education_section TEXT,
            certifications_section TEXT,
            achievements_section TEXT,
            used_skills TEXT,
            used_projects TEXT,
            used_experience_ids TEXT,
            content_text TEXT,
            created_at TEXT,
            match_score REAL DEFAULT 0.0,
            ats_score REAL DEFAULT 0.0,
            validation_status TEXT DEFAULT 'PENDING',
            validation_errors TEXT,
            FOREIGN KEY (profile_id) REFERENCES candidate_profile(id),
            FOREIGN KEY (job_id) REFERENCES listings(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resume_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            overall_match REAL DEFAULT 0.0,
            skill_match REAL DEFAULT 0.0,
            project_match REAL DEFAULT 0.0,
            experience_match REAL DEFAULT 0.0,
            keyword_match REAL DEFAULT 0.0,
            education_match REAL DEFAULT 0.0,
            matched_skills TEXT,
            related_skills TEXT,
            missing_skills TEXT,
            matched_keywords TEXT,
            missing_keywords TEXT,
            recommendations TEXT,
            ats_score REAL DEFAULT 0.0,
            ats_warnings TEXT,
            analyzed_at TEXT,
            FOREIGN KEY (version_id) REFERENCES resume_versions(version_id),
            FOREIGN KEY (job_id) REFERENCES listings(id)
        )
    """)
    
    # Create indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_candidate_email ON candidate_profile(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_resume_job ON resume_versions(job_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_resume_version ON resume_versions(version_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_job_requirements_listing ON job_requirements(listing_id)")
    
    conn.commit()
    conn.close()


def upsert_listings(db_path: str, rows: list[Listing]) -> int:
    """
    Insert new listings, deduplicating on (source, url).
    Returns count of genuinely NEW rows inserted.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_count = 0
    for row in rows:
        listing_id = _make_listing_id(row.source, row.url)
        cursor.execute(
            """
            INSERT OR IGNORE INTO listings
            (id, title, company, location, url, description, source, posted_at, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                listing_id, row.title, row.company, row.location, row.url,
                row.description, row.source, row.posted_at, row.fetched_at
            )
        )
        if cursor.rowcount > 0:
            new_count += 1
    
    conn.commit()
    conn.close()
    return new_count


def count_unscored(db_path: str) -> int:
    """Count listings without a fit_score."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM listings WHERE fit_score IS NULL")
    count = cursor.fetchone()[0]
    conn.close()
    return count


def last_fetch_time(db_path: str) -> str | None:
    """Return fetched_at of most recent listing, or None if empty."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(fetched_at) FROM listings")
    result = cursor.fetchone()[0]
    conn.close()
    return result


def log_cycle(
    db_path: str,
    agent: str,
    started_at: str,
    finished_at: str,
    records_touched: int,
    status: str,
    notes: str = ""
) -> None:
    """Log a single agent run to cycle_log."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO cycle_log
        (agent, started_at, finished_at, records_touched, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (agent, started_at, finished_at, records_touched, status, notes)
    )
    conn.commit()
    conn.close()


def get_listings(
    db_path: str,
    limit: int = 100,
    min_score: int | None = None
) -> list[dict]:
    """Retrieve listings, optionally filtered by min_score."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if min_score is not None:
        cursor.execute(
            """
            SELECT * FROM listings
            WHERE fit_score IS NOT NULL AND fit_score >= ?
            ORDER BY fit_score DESC
            LIMIT ?
            """,
            (min_score, limit)
        )
    else:
        cursor.execute(
            "SELECT * FROM listings ORDER BY fetched_at DESC LIMIT ?",
            (limit,)
        )
    
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def get_unscored_listings(db_path: str) -> list[dict]:
    """Get all listings that have NOT been scored yet (fit_score IS NULL)."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM listings WHERE fit_score IS NULL ORDER BY fetched_at DESC"
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def update_listing_score(
    db_path: str,
    listing_id: str,
    fit_score: int,
    fit_reason: str = ""
) -> None:
    """Update fit_score and fit_reason for a single listing."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE listings
        SET fit_score = ?, fit_reason = ?
        WHERE id = ?
        """,
        (fit_score, fit_reason, listing_id)
    )
    conn.commit()
    conn.close()


def update_skill_gaps(db_path: str, gaps: list[tuple[str, int]]) -> int:
    """Update skill_gaps table with market demand data.
    
    Args:
        db_path: Path to database
        gaps: List of (skill_name, frequency) tuples
    
    Returns:
        Count of gaps inserted/updated
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    count = 0
    
    for skill, frequency in gaps:
        cursor.execute(
            """
            INSERT OR REPLACE INTO skill_gaps
            (skill, frequency, last_seen)
            VALUES (?, ?, ?)
            """,
            (skill, frequency, now)
        )
        if cursor.rowcount > 0:
            count += 1
    
    conn.commit()
    conn.close()
    return count


# === PHASE 5: Resume Intelligence CRUD Functions ===

def save_candidate_profile(db_path: str, profile: CandidateProfile) -> int:
    """Save complete candidate profile to database.
    
    Args:
        db_path: Path to database
        profile: CandidateProfile object
    
    Returns:
        Profile ID (primary key)
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    try:
        # Insert candidate_profile
        cursor.execute(
            """
            INSERT OR REPLACE INTO candidate_profile
            (full_name, email, phone, location, summary, target_roles, github_url, linkedin_url, portfolio_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                profile.full_name,
                profile.email,
                profile.phone,
                profile.location,
                profile.summary,
                json.dumps(profile.target_roles) if profile.target_roles else None,
                profile.github_url,
                profile.linkedin_url,
                profile.portfolio_url,
                now,
                now
            )
        )
        
        # Get profile ID
        cursor.execute("SELECT id FROM candidate_profile WHERE email = ?", (profile.email,))
        profile_id = cursor.fetchone()[0]
        
        # Delete existing related records (for update scenario)
        cursor.execute("DELETE FROM candidate_skills WHERE profile_id = ?", (profile_id,))
        cursor.execute("DELETE FROM candidate_projects WHERE profile_id = ?", (profile_id,))
        cursor.execute("DELETE FROM candidate_experience WHERE profile_id = ?", (profile_id,))
        cursor.execute("DELETE FROM candidate_education WHERE profile_id = ?", (profile_id,))
        cursor.execute("DELETE FROM candidate_certifications WHERE profile_id = ?", (profile_id,))
        
        # Insert skills
        for skill in profile.skills:
            cursor.execute(
                """
                INSERT INTO candidate_skills
                (profile_id, skill_name, proficiency, years_of_experience, category, endorsements)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (profile_id, skill.skill_name, skill.proficiency, skill.years_of_experience, skill.category, skill.endorsements)
            )
        
        # Insert projects
        for project in profile.projects:
            cursor.execute(
                """
                INSERT INTO candidate_projects
                (profile_id, name, description, category, target_roles, skills_used, keywords, priority, url, github_url, metrics)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile_id, project.name, project.description, project.category,
                    json.dumps(project.target_roles) if project.target_roles else None,
                    json.dumps(project.skills_used) if project.skills_used else None,
                    json.dumps(project.keywords) if project.keywords else None,
                    project.priority, project.url, project.github_url, project.metrics
                )
            )
        
        # Insert experience
        for exp in profile.experience:
            cursor.execute(
                """
                INSERT INTO candidate_experience
                (profile_id, company, job_title, start_date, end_date, description, responsibilities, skills_demonstrated, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile_id, exp.company, exp.job_title, exp.start_date, exp.end_date, exp.description,
                    json.dumps(exp.responsibilities) if exp.responsibilities else None,
                    json.dumps(exp.skills_demonstrated) if exp.skills_demonstrated else None,
                    exp.location
                )
            )
        
        # Insert education
        for edu in profile.education:
            cursor.execute(
                """
                INSERT INTO candidate_education
                (profile_id, institution, degree, field_of_study, graduation_year, gpa, relevant_coursework)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile_id, edu.institution, edu.degree, edu.field_of_study, edu.graduation_year,
                    edu.gpa, json.dumps(edu.relevant_coursework) if edu.relevant_coursework else None
                )
            )
        
        # Insert certifications
        for cert in profile.certifications:
            cursor.execute(
                """
                INSERT INTO candidate_certifications
                (profile_id, name, issuer, issue_date, expiry_date, credential_url)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (profile_id, cert.name, cert.issuer, cert.issue_date, cert.expiry_date, cert.credential_url)
            )
        
        conn.commit()
        conn.close()
        return profile_id
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to save candidate profile: {str(e)}")


def load_candidate_profile(db_path: str, email: str) -> Optional[CandidateProfile]:
    """Load complete candidate profile from database.
    
    Args:
        db_path: Path to database
        email: Candidate email
    
    Returns:
        CandidateProfile or None if not found
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # Load candidate_profile
        cursor.execute("SELECT * FROM candidate_profile WHERE email = ?", (email,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return None
        
        profile_id = row['id']
        
        # Load skills
        cursor.execute("SELECT * FROM candidate_skills WHERE profile_id = ?", (profile_id,))
        skills = [
            CandidateSkill(
                skill_name=r['skill_name'],
                proficiency=r['proficiency'],
                years_of_experience=r['years_of_experience'],
                category=r['category'],
                endorsements=r['endorsements']
            )
            for r in cursor.fetchall()
        ]
        
        # Load projects
        cursor.execute("SELECT * FROM candidate_projects WHERE profile_id = ?", (profile_id,))
        projects = [
            CandidateProject(
                name=r['name'],
                description=r['description'],
                category=r['category'],
                target_roles=json.loads(r['target_roles']) if r['target_roles'] else [],
                skills_used=json.loads(r['skills_used']) if r['skills_used'] else [],
                keywords=json.loads(r['keywords']) if r['keywords'] else [],
                priority=r['priority'],
                url=r['url'],
                github_url=r['github_url'],
                metrics=r['metrics']
            )
            for r in cursor.fetchall()
        ]
        
        # Load experience
        cursor.execute("SELECT * FROM candidate_experience WHERE profile_id = ?", (profile_id,))
        experience = [
            CandidateExperience(
                company=r['company'],
                job_title=r['job_title'],
                start_date=r['start_date'],
                end_date=r['end_date'],
                description=r['description'],
                responsibilities=json.loads(r['responsibilities']) if r['responsibilities'] else [],
                skills_demonstrated=json.loads(r['skills_demonstrated']) if r['skills_demonstrated'] else [],
                location=r['location']
            )
            for r in cursor.fetchall()
        ]
        
        # Load education
        cursor.execute("SELECT * FROM candidate_education WHERE profile_id = ?", (profile_id,))
        education = [
            CandidateEducation(
                institution=r['institution'],
                degree=r['degree'],
                field_of_study=r['field_of_study'],
                graduation_year=r['graduation_year'],
                gpa=r['gpa'],
                relevant_coursework=json.loads(r['relevant_coursework']) if r['relevant_coursework'] else []
            )
            for r in cursor.fetchall()
        ]
        
        # Load certifications
        cursor.execute("SELECT * FROM candidate_certifications WHERE profile_id = ?", (profile_id,))
        certifications = [
            CandidateCertification(
                name=r['name'],
                issuer=r['issuer'],
                issue_date=r['issue_date'],
                expiry_date=r['expiry_date'],
                credential_url=r['credential_url']
            )
            for r in cursor.fetchall()
        ]
        
        conn.close()
        
        # Reconstruct CandidateProfile
        return CandidateProfile(
            full_name=row['full_name'],
            email=row['email'],
            phone=row['phone'],
            location=row['location'],
            summary=row['summary'],
            target_roles=json.loads(row['target_roles']) if row['target_roles'] else [],
            skills=skills,
            experience=experience,
            education=education,
            certifications=certifications,
            projects=projects,
            achievements=[],
            github_url=row['github_url'],
            linkedin_url=row['linkedin_url'],
            portfolio_url=row['portfolio_url']
        )
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to load candidate profile: {str(e)}")


def save_job_requirements(db_path: str, listing_id: str, req: JobRequirement) -> None:
    """Save job requirements (extracted from JD) to database.
    
    Args:
        db_path: Path to database
        listing_id: Listing ID from listings table
        req: JobRequirement object
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    try:
        cursor.execute(
            """
            INSERT OR REPLACE INTO job_requirements
            (listing_id, job_title, seniority, required_skills, preferred_skills, technical_keywords,
             responsibilities, experience_requirement, education_requirement, tools, frameworks,
             domain, location, company, description, extracted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                listing_id,
                req.job_title,
                req.seniority,
                json.dumps(req.required_skills) if req.required_skills else None,
                json.dumps(req.preferred_skills) if req.preferred_skills else None,
                json.dumps(req.technical_keywords) if req.technical_keywords else None,
                json.dumps(req.responsibilities) if req.responsibilities else None,
                req.experience_requirement,
                req.education_requirement,
                json.dumps(req.tools) if req.tools else None,
                json.dumps(req.frameworks) if req.frameworks else None,
                req.domain,
                req.location,
                req.company,
                req.description,
                now
            )
        )
        conn.commit()
        conn.close()
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to save job requirements: {str(e)}")


def get_job_requirements(db_path: str, listing_id: str) -> Optional[JobRequirement]:
    """Load job requirements from database.
    
    Args:
        db_path: Path to database
        listing_id: Listing ID
    
    Returns:
        JobRequirement or None if not found
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM job_requirements WHERE listing_id = ?", (listing_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return JobRequirement(
            job_id=row['listing_id'],
            job_title=row['job_title'],
            seniority=row['seniority'],
            required_skills=json.loads(row['required_skills']) if row['required_skills'] else [],
            preferred_skills=json.loads(row['preferred_skills']) if row['preferred_skills'] else [],
            technical_keywords=json.loads(row['technical_keywords']) if row['technical_keywords'] else [],
            responsibilities=json.loads(row['responsibilities']) if row['responsibilities'] else [],
            experience_requirement=row['experience_requirement'],
            education_requirement=row['education_requirement'],
            tools=json.loads(row['tools']) if row['tools'] else [],
            frameworks=json.loads(row['frameworks']) if row['frameworks'] else [],
            domain=row['domain'],
            location=row['location'],
            company=row['company'],
            description=row['description']
        )
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to load job requirements: {str(e)}")


def save_resume_version(db_path: str, resume: ResumeVersion) -> str:
    """Save generated resume version to database.
    
    Args:
        db_path: Path to database
        resume: ResumeVersion object
    
    Returns:
        version_id (UUID)
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            INSERT INTO resume_versions
            (version_id, profile_id, job_id, target_role, full_name, contact_info, professional_summary,
             skills_section, experience_section, projects_section, education_section, certifications_section,
             achievements_section, used_skills, used_projects, used_experience_ids, content_text, created_at,
             match_score, ats_score, validation_status, validation_errors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                resume.version_id,
                resume.profile_id,  # Use profile_id from resume object
                resume.job_id,
                resume.target_role,
                resume.full_name,
                resume.contact_info,
                resume.professional_summary,
                json.dumps(resume.skills_section) if resume.skills_section else None,
                json.dumps(resume.experience_section) if resume.experience_section else None,
                json.dumps(resume.projects_section) if resume.projects_section else None,
                json.dumps(resume.education_section) if resume.education_section else None,
                json.dumps(resume.certifications_section) if resume.certifications_section else None,
                json.dumps(resume.achievements_section) if resume.achievements_section else None,
                json.dumps(resume.used_skills) if resume.used_skills else None,
                json.dumps(resume.used_projects) if resume.used_projects else None,
                json.dumps(resume.used_experience_ids) if resume.used_experience_ids else None,
                resume.content_text,
                resume.created_at,
                resume.match_score,
                resume.ats_score,
                resume.validation_status,
                json.dumps(resume.validation_errors) if resume.validation_errors else None
            )
        )
        conn.commit()
        conn.close()
        return resume.version_id
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to save resume version: {str(e)}")


def save_resume_analysis(db_path: str, analysis: ResumeAnalysis) -> None:
    """Save resume analysis (match score) to database.
    
    Args:
        db_path: Path to database
        analysis: ResumeAnalysis object
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    try:
        cursor.execute(
            """
            INSERT OR REPLACE INTO resume_analyses
            (version_id, job_id, overall_match, skill_match, project_match, experience_match,
             keyword_match, education_match, matched_skills, related_skills, missing_skills,
             matched_keywords, missing_keywords, recommendations, ats_score, ats_warnings, analyzed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis.version_id,
                analysis.job_id,
                analysis.overall_match,
                analysis.skill_match,
                analysis.project_match,
                analysis.experience_match,
                analysis.keyword_match,
                analysis.education_match,
                json.dumps(analysis.matched_skills) if analysis.matched_skills else None,
                json.dumps(analysis.related_skills) if analysis.related_skills else None,
                json.dumps(analysis.missing_skills) if analysis.missing_skills else None,
                json.dumps(analysis.matched_keywords) if analysis.matched_keywords else None,
                json.dumps(analysis.missing_keywords) if analysis.missing_keywords else None,
                json.dumps(analysis.recommendations) if analysis.recommendations else None,
                analysis.ats_score,
                json.dumps(analysis.ats_warnings) if analysis.ats_warnings else None,
                now
            )
        )
        conn.commit()
        conn.close()
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to save resume analysis: {str(e)}")


def get_resume_versions_for_job(db_path: str, job_id: str) -> list[ResumeVersion]:
    """Get all resume versions for a specific job.
    
    Args:
        db_path: Path to database
        job_id: Job listing ID
    
    Returns:
        List of ResumeVersion objects
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM resume_versions WHERE job_id = ? ORDER BY created_at DESC", (job_id,))
        rows = cursor.fetchall()
        conn.close()
        
        resumes = []
        for row in rows:
            resume = ResumeVersion(
                version_id=row['version_id'],
                target_role=row['target_role'],
                job_id=row['job_id'],
                full_name=row['full_name'],
                contact_info=row['contact_info'],
                professional_summary=row['professional_summary'],
                skills_section=json.loads(row['skills_section']) if row['skills_section'] else [],
                experience_section=json.loads(row['experience_section']) if row['experience_section'] else [],
                projects_section=json.loads(row['projects_section']) if row['projects_section'] else [],
                education_section=json.loads(row['education_section']) if row['education_section'] else [],
                certifications_section=json.loads(row['certifications_section']) if row['certifications_section'] else [],
                achievements_section=json.loads(row['achievements_section']) if row['achievements_section'] else [],
                used_skills=json.loads(row['used_skills']) if row['used_skills'] else {},
                used_projects=json.loads(row['used_projects']) if row['used_projects'] else [],
                used_experience_ids=json.loads(row['used_experience_ids']) if row['used_experience_ids'] else [],
                created_at=row['created_at'],
                match_score=row['match_score'],
                ats_score=row['ats_score'],
                validation_status=row['validation_status'],
                validation_errors=json.loads(row['validation_errors']) if row['validation_errors'] else [],
                content_text=row['content_text']
            )
            resumes.append(resume)
        
        return resumes
    
    except Exception as e:
        conn.close()
        raise ValueError(f"Failed to get resume versions: {str(e)}")
