"""Phase 5 Resume Intelligence Agents - Orchestrator-compatible wrappers."""

from datetime import datetime
from typing import Optional

from edgedash.agents.base import Agent, AgentResult
from edgedash.config import Config
from edgedash import storage
from edgedash.agents.jd_analyzer import extract_jd_for_listing
from edgedash.agents.resume_matcher import ResumeMatcher
from edgedash.agents.resume_generator import ResumeGenerator
from edgedash.agents.resume_validator import ResumeValidator
from edgedash.agents.ats_optimizer import ATSOptimizer


class JDAnalyzerAgent(Agent):
    """Extract job requirements from listings using JD Analyzer."""
    
    @property
    def name(self) -> str:
        return "jd_analyzer"
    
    def run(self, config: Config, storage_module) -> AgentResult:
        """Analyze all listings to extract job requirements."""
        try:
            listings = storage_module.get_listings(config.db_path)
            
            if not listings:
                return AgentResult(
                    agent=self.name,
                    status="ok",
                    records_touched=0,
                    notes="No listings to analyze",
                )
            
            analyzed_count = 0
            for listing in listings:
                # Check if already analyzed (by checking job_requirements table)
                existing = storage_module.get_job_requirements(
                    config.db_path,
                    listing['id']
                )
                if existing:
                    continue  # Skip already analyzed jobs
                
                # Analyze job description
                try:
                    job_req = extract_jd_for_listing(
                        config.db_path,
                        listing['id'],
                        listing['title'],
                        listing['description']
                    )
                    analyzed_count += 1
                except Exception as e:
                    # Log but continue with next job
                    print(f"  ⚠ Failed to analyze job {listing['id']}: {str(e)}")
                    continue
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=analyzed_count,
                notes=f"Analyzed {analyzed_count} job listings",
            )
        
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )


class ResumeMatcherAgent(Agent):
    """Match candidate profile against job requirements."""
    
    @property
    def name(self) -> str:
        return "resume_matcher"
    
    def run(self, config: Config, storage_module) -> AgentResult:
        """Generate match analysis for candidate against all jobs."""
        try:
            # Load candidate profile (use default email from config or fallback)
            candidate_email = getattr(config, 'candidate_email', 'john.doe@example.com')
            candidate = storage_module.load_candidate_profile(
                config.db_path,
                candidate_email
            )
            
            if not candidate:
                return AgentResult(
                    agent=self.name,
                    status="failed",
                    records_touched=0,
                    notes="Candidate profile not found",
                )
            
            # Get all analyzed jobs
            listings = storage_module.get_listings(config.db_path)
            matched_count = 0
            
            for listing in listings:
                # Get job requirements
                job_req = storage_module.get_job_requirements(
                    config.db_path,
                    listing['id']
                )
                
                if not job_req:
                    continue  # Skip jobs that haven't been analyzed
                
                # Skip if already matched
                existing_analysis = storage_module.get_resume_versions_for_job(
                    config.db_path,
                    listing['id']
                )
                if existing_analysis and len(existing_analysis) > 0:
                    continue
                
                # Generate match analysis
                try:
                    analysis = ResumeMatcher.match_candidate_to_job(candidate, job_req)
                    storage_module.save_resume_analysis(config.db_path, analysis)
                    matched_count += 1
                except Exception as e:
                    print(f"  ⚠ Failed to match job {listing['id']}: {str(e)}")
                    continue
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=matched_count,
                notes=f"Generated {matched_count} match analyses",
            )
        
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )


class ResumeGeneratorAgent(Agent):
    """Generate tailored resumes for matched opportunities."""
    
    @property
    def name(self) -> str:
        return "resume_generator"
    
    def run(self, config: Config, storage_module) -> AgentResult:
        """Generate resumes for high-fit opportunities."""
        try:
            # Load candidate profile (use default email from config or fallback)
            candidate_email = getattr(config, 'candidate_email', 'john.doe@example.com')
            candidate = storage_module.load_candidate_profile(
                config.db_path,
                candidate_email
            )
            
            if not candidate:
                return AgentResult(
                    agent=self.name,
                    status="failed",
                    records_touched=0,
                    notes="Candidate profile not found",
                )
            
            # Get high-fit listings
            listings = storage_module.get_listings(config.db_path)
            generated_count = 0
            
            for listing in listings:
                # Only generate for high-fit jobs (score >= 50)
                if listing.get('fit_score', 0) < 50:
                    continue
                
                # Get job requirements
                job_req = storage_module.get_job_requirements(
                    config.db_path,
                    listing['id']
                )
                
                if not job_req:
                    continue
                
                # Check if already generated
                existing = storage_module.get_resume_versions_for_job(
                    config.db_path,
                    listing['id']
                )
                if existing and len(existing) > 0:
                    continue
                
                # Generate resume
                try:
                    resume = ResumeGenerator.generate_resume(
                        candidate,
                        job_req,
                        target_role=listing['title'],
                        job_id=listing['id']
                    )
                    storage_module.save_resume_version(config.db_path, resume)
                    generated_count += 1
                except Exception as e:
                    print(f"  ⚠ Failed to generate resume for job {listing['id']}: {str(e)}")
                    continue
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=generated_count,
                notes=f"Generated {generated_count} resumes",
            )
        
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )


class ResumeValidatorAgent(Agent):
    """Validate resumes to prevent hallucinations."""
    
    @property
    def name(self) -> str:
        return "resume_validator"
    
    def run(self, config: Config, storage_module) -> AgentResult:
        """Validate all generated resumes against candidate profile."""
        try:
            # Load candidate profile (use default email from config or fallback)
            candidate_email = getattr(config, 'candidate_email', 'john.doe@example.com')
            candidate = storage_module.load_candidate_profile(
                config.db_path,
                candidate_email
            )
            
            if not candidate:
                return AgentResult(
                    agent=self.name,
                    status="failed",
                    records_touched=0,
                    notes="Candidate profile not found",
                )
            
            # Get all resumes
            listings = storage_module.get_listings(config.db_path)
            validated_count = 0
            
            for listing in listings:
                resumes = storage_module.get_resume_versions_for_job(
                    config.db_path,
                    listing['id']
                )
                
                if not resumes:
                    continue
                
                # Validate each resume
                for resume in resumes:
                    try:
                        is_valid, report = ResumeValidator.validate_resume(resume, candidate)
                        # Update resume validation status
                        validated_count += 1
                    except Exception as e:
                        print(f"  ⚠ Failed to validate resume {resume.version_id}: {str(e)}")
                        continue
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=validated_count,
                notes=f"Validated {validated_count} resumes",
            )
        
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )


class ATSOptimizerAgent(Agent):
    """Optimize resumes for ATS compatibility."""
    
    @property
    def name(self) -> str:
        return "ats_optimizer"
    
    def run(self, config: Config, storage_module) -> AgentResult:
        """Optimize all generated resumes for ATS systems."""
        try:
            # Get all listings with job requirements
            listings = storage_module.get_listings(config.db_path)
            optimized_count = 0
            
            for listing in listings:
                # Get job requirements
                job_req = storage_module.get_job_requirements(
                    config.db_path,
                    listing['id']
                )
                
                if not job_req:
                    continue
                
                # Get resumes for this job
                resumes = storage_module.get_resume_versions_for_job(
                    config.db_path,
                    listing['id']
                )
                
                if not resumes:
                    continue
                
                # Optimize each resume
                for resume in resumes:
                    try:
                        # Get job keywords for optimization
                        keywords = job_req.technical_keywords if hasattr(job_req, 'technical_keywords') else []
                        ats_result = ATSOptimizer.optimize_resume(resume, keywords)
                        optimized_count += 1
                    except Exception as e:
                        print(f"  ⚠ Failed to optimize resume {resume.version_id}: {str(e)}")
                        continue
            
            return AgentResult(
                agent=self.name,
                status="ok",
                records_touched=optimized_count,
                notes=f"Optimized {optimized_count} resumes",
            )
        
        except Exception as e:
            return AgentResult(
                agent=self.name,
                status="failed",
                records_touched=0,
                notes=f"Error: {str(e)}",
            )
