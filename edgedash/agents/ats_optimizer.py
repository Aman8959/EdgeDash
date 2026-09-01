"""ATS Optimizer Agent - Optimize resume for ATS systems."""

from edgedash.models.resume import ResumeVersion, ResumeAnalysis


class ATSOptimizer:
    """Optimize resume for Applicant Tracking System (ATS) parsing."""
    
    # Common ATS keywords and their importance
    ATS_KEYWORDS = {
        "skills": ["python", "java", "javascript", "sql", "c++", "machine learning", "data analysis"],
        "tools": ["tableau", "power bi", "excel", "salesforce", "jira", "github", "aws"],
        "soft_skills": ["leadership", "communication", "teamwork", "project management", "problem solving"],
        "certifications": ["certified", "certification", "aws", "pmp", "scrum"],
        "education": ["bachelor", "master", "phd", "degree", "university"],
    }
    
    @staticmethod
    def calculate_keyword_density(content: str, keywords: list[str]) -> dict:
        """Calculate keyword density in resume content.
        
        Args:
            content: Resume content text
            keywords: List of keywords to search for
        
        Returns:
            Dict with keyword densities
        """
        content_lower = content.lower()
        total_words = len(content.split())
        
        keyword_counts = {}
        for keyword in keywords:
            keyword_lower = keyword.lower()
            # Count occurrences (simple word boundary matching)
            count = content_lower.count(keyword_lower)
            if count > 0:
                density = (count / total_words) * 100
                keyword_counts[keyword] = {
                    "count": count,
                    "density": round(density, 2)
                }
        
        return keyword_counts
    
    @staticmethod
    def check_ats_formatting(resume: ResumeVersion) -> tuple[float, list[str]]:
        """Check if resume formatting is ATS-friendly.
        
        ATS systems prefer:
        - Simple formatting (no tables, columns, graphics)
        - Standard fonts
        - Clear section headers
        - Standard file format (PDF, DOCX)
        - No headers/footers
        
        Args:
            resume: Resume version
        
        Returns:
            Tuple of (ATS_score, issues)
        """
        issues = []
        score = 100
        
        content = resume.content_text
        
        # Check for problematic formatting
        problematic_patterns = {
            r"\|+": {"issue": "Multiple pipe characters (|) - ATS may have trouble parsing", "penalty": 5},
            r"────": {"issue": "Decorative lines (─) - ATS may misinterpret", "penalty": 5},
            r"✓|✗|→|•": {"issue": "Special symbols/bullets - use standard bullets instead", "penalty": 3},
            r"\[.*\]": {"issue": "Bracketed content - ATS may skip", "penalty": 2},
        }
        
        import re
        for pattern, details in problematic_patterns.items():
            if re.search(pattern, content):
                issues.append(details["issue"])
                score -= details["penalty"]
        
        # Check for minimal section headers (ATS key feature)
        standard_headers = [
            "PROFESSIONAL SUMMARY", "SKILLS", "WORK EXPERIENCE",
            "EDUCATION", "CERTIFICATIONS", "PROJECTS", "ACHIEVEMENTS"
        ]
        
        headers_found = sum(1 for header in standard_headers if header in content)
        if headers_found < 4:
            issues.append(f"Only {headers_found} standard section headers found - add more structure")
            score -= 10
        
        # Check for adequate section spacing
        if "\n\n" not in content:
            issues.append("Insufficient spacing between sections - add blank lines")
            score -= 5
        
        # Check content length (ATS prefer 1-2 pages, roughly 400-1000 words)
        word_count = len(content.split())
        if word_count < 200:
            issues.append(f"Resume too short ({word_count} words) - add more details")
            score -= 5
        elif word_count > 1500:
            issues.append(f"Resume too long ({word_count} words) - trim to 1-2 pages")
            score -= 10
        
        return max(0, score), issues
    
    @staticmethod
    def optimize_keyword_placement(resume: ResumeVersion, job_keywords: list[str]) -> tuple[list[str], list[str]]:
        """Identify how to better place job keywords in resume.
        
        Args:
            resume: Resume version
            job_keywords: Keywords from job description
        
        Returns:
            Tuple of (found_keywords, missing_keywords_recommendations)
        """
        content_lower = resume.content_text.lower()
        found = []
        missing = []
        
        for keyword in job_keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in content_lower:
                found.append(keyword)
            else:
                missing.append(keyword)
        
        # Recommendations for missing keywords
        recommendations = []
        for keyword in missing[:5]:  # Top 5 missing
            recommendations.append(
                f"Consider adding '{keyword}' - appears in job description but not in resume"
            )
        
        return found, recommendations
    
    @staticmethod
    def check_contact_info(resume: ResumeVersion) -> tuple[float, list[str]]:
        """Verify contact information is ATS-parseable.
        
        Args:
            resume: Resume version
        
        Returns:
            Tuple of (contact_score, issues)
        """
        issues = []
        score = 100
        
        contact = resume.contact_info
        content = resume.content_text
        
        import re
        
        # Check for email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        if not re.search(email_pattern, content):
            issues.append("Email address not found - ATS needs email")
            score -= 20
        
        # Check for phone (optional but good)
        phone_pattern = r'\b\d{1,3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\+\d{1,3}\s?\d{1,14}'
        if not re.search(phone_pattern, content):
            issues.append("Phone number not found - consider adding for completeness")
            score -= 5
        
        # Check for location
        if not any(term in content.lower() for term in ["san francisco", "new york", "location", "based", "ca", "ny"]):
            issues.append("Location not clearly stated - ATS benefits from location info")
            score -= 5
        
        return max(0, score), issues
    
    @staticmethod
    def check_section_consistency(resume: ResumeVersion) -> tuple[float, list[str]]:
        """Check if resume sections are consistent and complete.
        
        Args:
            resume: Resume version
        
        Returns:
            Tuple of (consistency_score, issues)
        """
        issues = []
        score = 100
        
        # Check for empty sections
        if not resume.skills_section:
            issues.append("Skills section is empty - ATS needs skills")
            score -= 15
        elif len(resume.skills_section) < 5:
            issues.append("Skills section too sparse - add at least 5-10 skills")
            score -= 5
        
        if not resume.experience_section:
            issues.append("Experience section is empty - add work history")
            score -= 20
        
        if not resume.education_section:
            issues.append("Education section is empty - add educational background")
            score -= 10
        
        # Check for proper date formatting
        content = resume.content_text
        date_pattern = r'\b\d{4}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{4}\b'
        if not __import__('re').search(date_pattern, content):
            issues.append("Date format not standardized - use YYYY-MM or MM/DD/YYYY")
            score -= 5
        
        return max(0, score), issues
    
    @classmethod
    def optimize_resume(cls, resume: ResumeVersion, job_keywords: list[str] = None) -> dict:
        """Comprehensive ATS optimization analysis.
        
        Args:
            resume: Resume version
            job_keywords: Keywords from target job (optional)
        
        Returns:
            Dict with optimization recommendations
        """
        if job_keywords is None:
            job_keywords = []
        
        # Run all checks
        formatting_score, formatting_issues = cls.check_ats_formatting(resume)
        contact_score, contact_issues = cls.check_contact_info(resume)
        consistency_score, consistency_issues = cls.check_section_consistency(resume)
        
        # Calculate keyword metrics
        all_keywords = (job_keywords if job_keywords else 
                       [w for sublist in cls.ATS_KEYWORDS.values() for w in sublist])
        keyword_density = cls.calculate_keyword_density(resume.content_text, all_keywords[:20])
        
        found_keywords = []
        recommendations = []
        if job_keywords:
            found_keywords, recommendations = cls.optimize_keyword_placement(resume, job_keywords)
        
        # Calculate overall ATS score (weighted average)
        overall_ats_score = (
            formatting_score * 0.4 +
            contact_score * 0.2 +
            consistency_score * 0.4
        )
        
        # Adjust based on keyword match
        if job_keywords:
            keyword_match = (len(found_keywords) / len(job_keywords)) * 100 if job_keywords else 50
            overall_ats_score = overall_ats_score * 0.7 + keyword_match * 0.3
        
        return {
            "overall_ats_score": round(overall_ats_score, 1),
            "score_breakdown": {
                "formatting": round(formatting_score, 1),
                "contact_info": round(contact_score, 1),
                "section_consistency": round(consistency_score, 1),
            },
            "issues": {
                "formatting": formatting_issues,
                "contact_info": contact_issues,
                "section_consistency": consistency_issues,
            },
            "keyword_analysis": {
                "found": len(found_keywords),
                "total": len(job_keywords) if job_keywords else len(all_keywords),
                "keyword_details": keyword_density,
                "recommendations": recommendations
            },
            "priority_fixes": cls._rank_issues(
                formatting_issues + contact_issues + consistency_issues
            )
        }
    
    @staticmethod
    def _rank_issues(all_issues: list[str]) -> list[str]:
        """Rank issues by severity.
        
        Args:
            all_issues: All collected issues
        
        Returns:
            Sorted list of issues by priority
        """
        # Priority keywords
        critical_keywords = ["empty", "missing", "not found", "need"]
        warning_keywords = ["too", "sparse", "incomplete", "consider"]
        info_keywords = ["may", "could"]
        
        critical = []
        warning = []
        info = []
        
        for issue in all_issues:
            if any(kw in issue.lower() for kw in critical_keywords):
                critical.append(issue)
            elif any(kw in issue.lower() for kw in warning_keywords):
                warning.append(issue)
            else:
                info.append(issue)
        
        return critical + warning + info
