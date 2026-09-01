"""JD Analyzer Agent - Extract structured job requirements from job descriptions."""

import re
from typing import Optional
from edgedash.models.job import JobRequirement
from edgedash.storage import get_job_requirements, save_job_requirements


# Skill/keyword patterns for extraction
TECHNICAL_KEYWORDS = {
    "Programming Languages": ["python", "java", "javascript", "c++", "c#", "go", "rust", "scala", "kotlin", "typescript", "ruby", "php", "swift", "objective-c"],
    "Data & ML": ["machine learning", "ml", "deep learning", "nlp", "natural language processing", "computer vision", "tensorflow", "pytorch", "scikit-learn", "keras", "xgboost"],
    "Data Science": ["data science", "data scientist", "data analysis", "analytics", "sql", "tableau", "power bi", "looker", "eda", "exploratory data analysis"],
    "Databases": ["sql", "mysql", "postgresql", "mongodb", "cassandra", "redis", "dynamodb", "elasticsearch", "oracle", "mssql"],
    "Cloud": ["aws", "azure", "gcp", "google cloud", "cloud computing", "lambda", "ec2", "s3", "cloud storage"],
    "DevOps": ["docker", "kubernetes", "jenkins", "cicd", "ci/cd", "terraform", "ansible", "linux", "unix", "bash"],
    "Frontend": ["react", "vue", "angular", "html", "css", "javascript", "typescript", "webpack", "babel"],
    "Backend": ["rest", "api", "microservices", "nodejs", "express", "fastapi", "django", "spring boot", "flask"],
    "Soft Skills": ["communication", "leadership", "problem-solving", "collaboration", "teamwork", "analytical", "critical thinking"],
}

SENIORITY_KEYWORDS = {
    "Entry": ["entry level", "junior", "recent graduate", "0-2 years", "1-2 years"],
    "Mid": ["mid level", "intermediate", "3-5 years", "mid-level"],
    "Senior": ["senior", "5-8 years", "8-10 years", "experienced"],
    "Lead": ["lead", "principal", "staff", "10+ years", "10+ yrs"],
    "Executive": ["director", "vp", "head of", "chief", "executive"],
}


class JDAnalyzer:
    """Extract structured job requirements from job descriptions."""
    
    @staticmethod
    def extract_seniority(description: str) -> str:
        """Extract seniority level from job description."""
        description_lower = description.lower()
        
        for level, keywords in SENIORITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return level
        
        return "Not Specified"
    
    @staticmethod
    def extract_skills(description: str) -> tuple[list[str], list[str]]:
        """Extract required and preferred skills from description.
        
        Returns:
            Tuple of (required_skills, preferred_skills)
        """
        description_lower = description.lower()
        all_skills = set()
        required_skills = set()
        preferred_skills = set()
        
        # Collect all found skills
        for category, skills in TECHNICAL_KEYWORDS.items():
            for skill in skills:
                if skill in description_lower:
                    all_skills.add(skill)
        
        # Determine required vs preferred
        for skill in all_skills:
            # Patterns that indicate "must have" vs "nice to have"
            must_patterns = [f"required {skill}", f"must have {skill}", f"must {skill}"]
            nice_patterns = [f"preferred {skill}", f"nice to have {skill}", f"knowledge of {skill}"]
            
            is_required = any(pattern in description_lower for pattern in must_patterns)
            is_preferred = any(pattern in description_lower for pattern in nice_patterns)
            
            # If not explicitly marked, categorize by frequency and context
            if is_required:
                required_skills.add(skill.title())
            elif is_preferred:
                preferred_skills.add(skill.title())
            else:
                # Default: if mentioned, it's probably required unless explicitly optional
                if "optional" not in description_lower.split(skill)[0][-50:]:
                    required_skills.add(skill.title())
                else:
                    preferred_skills.add(skill.title())
        
        return sorted(list(required_skills)), sorted(list(preferred_skills))
    
    @staticmethod
    def extract_tools_frameworks(description: str) -> tuple[list[str], list[str]]:
        """Extract tools and frameworks from description.
        
        Returns:
            Tuple of (tools, frameworks)
        """
        tools_patterns = {
            "Docker": r"\bdocker\b",
            "Kubernetes": r"\bk8s\b|\bkubernetes\b",
            "Jenkins": r"\bjenkins\b",
            "Terraform": r"\bterraform\b",
            "Git": r"\bgit\b",
            "Linux": r"\blinux\b",
            "AWS": r"\baws\b",
            "Azure": r"\bazure\b",
            "GCP": r"\bgcp\b",
        }
        
        frameworks_patterns = {
            "Django": r"\bdjango\b",
            "FastAPI": r"\bfastapi\b",
            "Flask": r"\bflask\b",
            "Spring Boot": r"\bspring boot\b",
            "React": r"\breact\b|\breact\.js\b",
            "Vue": r"\bvue\b|\bvue\.js\b",
            "Angular": r"\bangular\b",
            "Express": r"\bexpress\b",
            "Node.js": r"\bnode\.js\b|\bnodejs\b",
            "TensorFlow": r"\btensorflow\b",
            "PyTorch": r"\bpytorch\b",
        }
        
        description_lower = description.lower()
        tools = []
        frameworks = []
        
        for tool, pattern in tools_patterns.items():
            if re.search(pattern, description_lower, re.IGNORECASE):
                tools.append(tool)
        
        for framework, pattern in frameworks_patterns.items():
            if re.search(pattern, description_lower, re.IGNORECASE):
                frameworks.append(framework)
        
        return sorted(tools), sorted(frameworks)
    
    @staticmethod
    def extract_experience_requirement(description: str) -> str:
        """Extract years of experience requirement."""
        # Patterns: "3-5 years", "5+ years", "at least 3 years", etc.
        patterns = [
            r"(\d+)\s*\-\s*(\d+)\s+years?",
            r"(\d+)\+\s+years?",
            r"at least (\d+)\s+years?",
            r"(\d+)\s+years?\s+of",
        ]
        
        description_lower = description.lower()
        for pattern in patterns:
            match = re.search(pattern, description_lower)
            if match:
                return match.group(0)
        
        return ""
    
    @staticmethod
    def extract_education_requirement(description: str) -> str:
        """Extract education requirement."""
        # Patterns: "Bachelor's in CS", "Master's degree", etc.
        patterns = [
            r"(?:bachelor'?s?|master'?s?|phd|doctorate)\s+(?:degree\s+)?(?:in|of)\s+([^,.]+)",
            r"degree\s+in\s+([^,.]+)",
            r"(?:bachelor'?s?|master'?s?|phd)",
        ]
        
        description_lower = description.lower()
        for pattern in patterns:
            match = re.search(pattern, description_lower)
            if match:
                return match.group(0)
        
        return ""
    
    @staticmethod
    def extract_responsibilities(description: str) -> list[str]:
        """Extract key responsibilities from description."""
        # Look for bullet points or numbered items
        responsibilities = []
        
        lines = description.split('\n')
        for line in lines:
            line = line.strip()
            # Lines starting with bullet points, dashes, or numbers
            if re.match(r'^([-•*]|\d+\.|\d+\))', line):
                # Clean up the line
                clean_line = re.sub(r'^([-•*]|\d+\.|\d+\))\s*', '', line).strip()
                if len(clean_line) > 10:  # Filter out very short lines
                    responsibilities.append(clean_line)
        
        # If no bullet points found, try to extract from key phrases
        if not responsibilities:
            key_phrases = [
                "develop", "design", "build", "implement", "create", "maintain",
                "analyze", "optimize", "improve", "manage", "lead", "oversee",
                "collaborate", "communicate", "document", "test"
            ]
            
            for line in lines:
                line_lower = line.lower()
                if any(phrase in line_lower for phrase in key_phrases):
                    clean_line = line.strip()
                    if 10 < len(clean_line) < 200:
                        responsibilities.append(clean_line)
        
        return responsibilities[:10]  # Return top 10 responsibilities
    
    @staticmethod
    def extract_domain(description: str, job_title: str = "") -> str:
        """Infer job domain/category from description and title."""
        text = (description + " " + job_title).lower()
        
        domains = {
            "Data Science": ["data scientist", "data science", "analytics", "ml engineer"],
            "Backend": ["backend", "server", "api", "database", "rest"],
            "Frontend": ["frontend", "ui", "ux", "react", "angular"],
            "DevOps": ["devops", "infrastructure", "cloud", "deployment", "k8s"],
            "Full Stack": ["full stack", "fullstack"],
            "ML/AI": ["machine learning", "ai", "deep learning", "nlp"],
        }
        
        for domain, keywords in domains.items():
            if any(kw in text for kw in keywords):
                return domain
        
        return "Software Engineering"
    
    @classmethod
    def analyze_job(cls, listing_id: str, job_title: str, job_description: str) -> JobRequirement:
        """Analyze a job listing and extract requirements.
        
        Args:
            listing_id: Listing ID from listings table
            job_title: Job title
            job_description: Full job description text
        
        Returns:
            JobRequirement dataclass
        """
        # Extract all components
        seniority = cls.extract_seniority(job_description)
        required_skills, preferred_skills = cls.extract_skills(job_description)
        tools, frameworks = cls.extract_tools_frameworks(job_description)
        experience_req = cls.extract_experience_requirement(job_description)
        education_req = cls.extract_education_requirement(job_description)
        responsibilities = cls.extract_responsibilities(job_description)
        domain = cls.extract_domain(job_description, job_title)
        
        # Combine all technical keywords
        technical_keywords = sorted(list(set(required_skills + preferred_skills + tools + frameworks)))
        
        return JobRequirement(
            job_id=listing_id,
            job_title=job_title,
            seniority=seniority,
            required_skills=required_skills,
            preferred_skills=preferred_skills,
            technical_keywords=technical_keywords,
            responsibilities=responsibilities,
            experience_requirement=experience_req,
            education_requirement=education_req,
            tools=tools,
            frameworks=frameworks,
            domain=domain,
            description=job_description[:1000]  # Store first 1000 chars
        )


def extract_jd_for_listing(db_path: str, listing_id: str, job_title: str, job_description: str) -> Optional[JobRequirement]:
    """Extract and cache job requirements for a listing.
    
    Args:
        db_path: Path to database
        listing_id: Listing ID
        job_title: Job title
        job_description: Job description
    
    Returns:
        JobRequirement or None if extraction fails
    """
    try:
        # Check if already extracted
        existing = get_job_requirements(db_path, listing_id)
        if existing:
            return existing
        
        # Extract new requirements
        analyzer = JDAnalyzer()
        job_req = analyzer.analyze_job(listing_id, job_title, job_description)
        
        # Save to database
        save_job_requirements(db_path, listing_id, job_req)
        
        return job_req
    
    except Exception as e:
        raise ValueError(f"Failed to extract JD for {listing_id}: {str(e)}")
