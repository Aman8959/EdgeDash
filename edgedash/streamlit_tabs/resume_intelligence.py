"""Streamlit Resume Intelligence Tab - Interactive Resume Generation UI."""

import streamlit as st
from pathlib import Path
import tempfile
from datetime import datetime

from edgedash.config import Config, load_config
from edgedash.storage import (
    get_listings, 
    load_candidate_profile,
    save_resume_version,
    get_resume_versions_for_job
)
from edgedash.agents.jd_analyzer import extract_jd_for_listing
from edgedash.agents.resume_matcher import ResumeMatcher
from edgedash.agents.resume_generator import ResumeGenerator
from edgedash.agents.resume_validator import ResumeValidator
from edgedash.agents.ats_optimizer import ATSOptimizer
from edgedash.agents.exporters import PlainTextExporter, HTMLExporter


def render_resume_intelligence_tab():
    """Render the Resume Intelligence tab in Streamlit."""
    
    st.markdown("## 📄 Resume Intelligence")
    st.markdown("Generate tailored resumes optimized for specific job listings with AI-powered analysis.")
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # SECTION 1: Load Profile
    # ═══════════════════════════════════════════════════════════════════════════════
    
    st.markdown("### 1️⃣ Load Your Profile")
    
    config = load_config()
    candidate = load_candidate_profile(config.db_path, "john.doe@example.com")
    
    if not candidate:
        st.error("❌ Profile not found. Please run `python load_profile.py` first.")
        return
    
    # Display profile summary
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Name", candidate.full_name)
    with col2:
        st.metric("Experience", f"{candidate.get_experience_years()} years")
    with col3:
        st.metric("Skills", len(candidate.skills))
    
    # Show profile details
    with st.expander("📋 View Full Profile"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.write(f"**Email:** {candidate.email}")
            st.write(f"**Location:** {candidate.location}")
            st.write(f"**Summary:** {candidate.summary}")
            
            st.write("**Target Roles:**")
            for role in candidate.target_roles:
                st.write(f"  • {role}")
        
        with col2:
            st.write("**Skills:**")
            for skill in candidate.skills[:10]:
                proficiency = skill.get('proficiency', 'Intermediate')
                years = skill.get('years_experience', 0)
                st.write(f"  • {skill['name']} ({proficiency}, {years}y)")
        
        st.write("**Experience:**")
        for exp in candidate.experience:
            st.write(f"  • **{exp['job_title']}** @ {exp['company']} ({exp['years']}y)")
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # SECTION 2: Select Job
    # ═══════════════════════════════════════════════════════════════════════════════
    
    st.markdown("---")
    st.markdown("### 2️⃣ Select Target Job")
    
    listings = get_listings(config.db_path)
    
    if not listings:
        st.error("❌ No job listings found. Please run `python run_cycle.py` first.")
        return
    
    # Create job selection options
    job_options = [
        f"{job['title']} @ {job['company']} (Score: {job['fit_score']}%)"
        for job in listings
    ]
    
    selected_idx = st.selectbox("Select a job listing:", range(len(listings)), format_func=lambda i: job_options[i])
    listing = listings[selected_idx]
    
    # Show job summary
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Fit Score", f"{listing['fit_score']}%")
    with col2:
        st.metric("Location", listing.get('location', 'Not specified'))
    with col3:
        st.metric("Company", listing['company'][:20])
    
    # Show job description
    with st.expander("📖 View Full Job Description"):
        st.write(listing['description'][:1000] + "..." if len(listing['description']) > 1000 else listing['description'])
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # SECTION 3: Generate Resume
    # ═══════════════════════════════════════════════════════════════════════════════
    
    st.markdown("---")
    st.markdown("### 3️⃣ Generate Tailored Resume")
    
    if st.button("🚀 Generate Resume", use_container_width=True):
        with st.spinner("⏳ Generating resume..."):
            try:
                # Step 1: Analyze job
                job_req = extract_jd_for_listing(
                    config.db_path,
                    listing['id'],
                    listing['title'],
                    listing['description']
                )
                
                # Step 2: Generate resume
                resume = ResumeGenerator.generate_resume(
                    candidate,
                    job_req,
                    target_role=listing['title'],
                    job_id=listing['id']
                )
                
                # Store in session state
                st.session_state.generated_resume = resume
                st.session_state.job_requirements = job_req
                st.session_state.listing = listing
                st.session_state.candidate = candidate
                
                st.success(f"✅ Resume generated successfully! (ID: {resume.version_id})")
            
            except Exception as e:
                st.error(f"❌ Error generating resume: {str(e)}")
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # SECTION 4: Display Generated Resume
    # ═══════════════════════════════════════════════════════════════════════════════
    
    if hasattr(st.session_state, 'generated_resume'):
        resume = st.session_state.generated_resume
        job_req = st.session_state.job_requirements
        candidate = st.session_state.candidate
        
        st.markdown("---")
        st.markdown("### 4️⃣ Resume Preview & Analysis")
        
        # Tabs for different analyses
        tab1, tab2, tab3, tab4 = st.tabs(["📄 Resume", "🎯 Match Analysis", "✅ Validation", "📊 ATS Score"])
        
        # ─────────────────────────────────────────────────────────────────────────────
        # TAB 1: Resume Preview
        # ─────────────────────────────────────────────────────────────────────────────
        with tab1:
            st.markdown("#### Tailored Resume")
            
            # Professional Summary
            col1, col2 = st.columns([3, 1])
            with col1:
                st.write(f"**{resume.full_name}**")
                st.write(resume.contact_info)
            
            # Summary
            if resume.professional_summary:
                st.markdown("**PROFESSIONAL SUMMARY**")
                st.write(resume.professional_summary)
            
            # Skills
            if resume.skills_section:
                st.markdown("**SKILLS**")
                skill_cols = st.columns(3)
                for idx, skill in enumerate(resume.skills_section):
                    with skill_cols[idx % 3]:
                        st.write(f"• {skill}")
            
            # Experience
            if resume.experience_section:
                st.markdown("**WORK EXPERIENCE**")
                for line in resume.experience_section:
                    if '|' in line:
                        st.markdown(f"**{line.strip()}**")
                    elif line.startswith('  •'):
                        st.write(line.strip())
                    elif line.strip():
                        st.write(line.strip())
            
            # Projects
            if resume.projects_section:
                st.markdown("**PROJECTS**")
                for line in resume.projects_section:
                    if line.strip():
                        st.write(line.strip())
            
            # Education
            if resume.education_section:
                st.markdown("**EDUCATION**")
                for edu in resume.education_section:
                    st.write(edu)
            
            # Certifications
            if resume.certifications_section:
                st.markdown("**CERTIFICATIONS**")
                for cert in resume.certifications_section:
                    st.write(cert)
            
            # Full text view
            if st.checkbox("View Full Text"):
                st.text_area("Full Resume Text", resume.content_text, height=400)
        
        # ─────────────────────────────────────────────────────────────────────────────
        # TAB 2: Match Analysis
        # ─────────────────────────────────────────────────────────────────────────────
        with tab2:
            analysis = ResumeMatcher.match_candidate_to_job(candidate, job_req)
            
            st.markdown("#### Match Analysis")
            
            # Overall match
            col1, col2 = st.columns([1, 2])
            with col1:
                st.metric("Overall Match", f"{analysis.overall_match}%")
            with col2:
                st.progress(analysis.overall_match / 100)
            
            # Component scores
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Skill Match", f"{analysis.skill_match}%")
            with col2:
                st.metric("Keyword Match", f"{analysis.keyword_match}%")
            with col3:
                st.metric("Experience Match", f"{analysis.experience_match}%")
            
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Project Match", f"{analysis.project_match}%")
            with col2:
                st.metric("Education Match", f"{analysis.education_match}%")
            
            # Matched skills
            if analysis.matched_skills:
                st.markdown("**Matched Skills:**")
                for skill in analysis.matched_skills[:10]:
                    st.write(f"  ✓ {skill}")
            
            # Missing skills
            if analysis.missing_skills:
                st.markdown("**Missing Skills (Opportunities to Build):**")
                for skill in analysis.missing_skills[:5]:
                    st.write(f"  ○ {skill}")
            
            # Recommendations
            if analysis.recommendations:
                st.markdown("**Recommendations:**")
                for rec in analysis.recommendations[:5]:
                    st.write(f"  💡 {rec}")
        
        # ─────────────────────────────────────────────────────────────────────────────
        # TAB 3: Validation
        # ─────────────────────────────────────────────────────────────────────────────
        with tab3:
            is_valid, report = ResumeValidator.validate_resume(resume, candidate)
            
            st.markdown("#### Resume Validation")
            
            if is_valid:
                st.success(f"✅ Resume is valid - 0 hallucinations detected")
            else:
                st.error(f"⚠️ Validation issues found: {report['total_issues']}")
            
            # Validation by section
            for section, result in report.get('sections', {}).items():
                if result['is_valid']:
                    st.write(f"✅ {section.replace('_', ' ').title()}")
                else:
                    st.write(f"⚠️ {section.replace('_', ' ').title()}")
                    for issue in result.get('issues', []):
                        st.write(f"   - {issue}")
            
            # Warnings
            if report.get('warnings'):
                st.warning("⚠️ Warnings:")
                for warning in report['warnings']:
                    st.write(f"  - {warning}")
        
        # ─────────────────────────────────────────────────────────────────────────────
        # TAB 4: ATS Optimization
        # ─────────────────────────────────────────────────────────────────────────────
        with tab4:
            ats_result = ATSOptimizer.optimize_resume(resume, job_req.technical_keywords)
            
            st.markdown("#### ATS Compatibility Score")
            
            # Overall ATS score
            ats_score = ats_result['overall_ats_score']
            col1, col2 = st.columns([1, 2])
            with col1:
                st.metric("ATS Score", f"{ats_score}/100")
            with col2:
                st.progress(ats_score / 100)
            
            if ats_score >= 90:
                st.success("🎉 Excellent ATS compatibility")
            elif ats_score >= 75:
                st.info("✓ Good ATS compatibility")
            else:
                st.warning("⚠️ Needs improvement for ATS")
            
            # Component scores
            st.markdown("**Component Scores:**")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Formatting", ats_result['score_breakdown']['formatting'])
            with col2:
                st.metric("Contact Info", ats_result['score_breakdown']['contact_info'])
            with col3:
                st.metric("Consistency", ats_result['score_breakdown']['section_consistency'])
            
            # Keyword analysis
            st.markdown("**Keyword Analysis:**")
            keywords = ats_result['keyword_analysis']
            st.write(f"Found {keywords['found_count']}/{keywords['total_count']} job keywords")
            
            # Issues
            if ats_result['priority_fixes']:
                st.markdown("**Priority Fixes:**")
                for issue in ats_result['priority_fixes'][:5]:
                    st.write(f"  • {issue}")
        
        # ═══════════════════════════════════════════════════════════════════════════════
        # SECTION 5: Export Options
        # ═══════════════════════════════════════════════════════════════════════════════
        
        st.markdown("---")
        st.markdown("### 5️⃣ Download Resume")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            # Export to TXT
            try:
                txt_buffer = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
                PlainTextExporter.export_to_txt(resume, txt_buffer.name)
                with open(txt_buffer.name, 'r') as f:
                    txt_content = f.read()
                
                st.download_button(
                    label="📄 Download as TXT",
                    data=txt_content,
                    file_name=f"{candidate.full_name}_{resume.version_id}.txt",
                    mime="text/plain"
                )
            except Exception as e:
                st.error(f"Error exporting TXT: {str(e)}")
        
        with col2:
            # Export to HTML
            try:
                html_buffer = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False)
                HTMLExporter.export_to_html(resume, html_buffer.name)
                with open(html_buffer.name, 'r') as f:
                    html_content = f.read()
                
                st.download_button(
                    label="🌐 Download as HTML",
                    data=html_content,
                    file_name=f"{candidate.full_name}_{resume.version_id}.html",
                    mime="text/html"
                )
            except Exception as e:
                st.error(f"Error exporting HTML: {str(e)}")
        
        with col3:
            # Export to DOCX (if python-docx available)
            try:
                from edgedash.agents.exporters import DocxExporter
                docx_buffer = tempfile.NamedTemporaryFile(suffix='.docx', delete=False)
                DocxExporter.export_to_docx(resume, docx_buffer.name)
                with open(docx_buffer.name, 'rb') as f:
                    docx_content = f.read()
                
                st.download_button(
                    label="📝 Download as DOCX",
                    data=docx_content,
                    file_name=f"{candidate.full_name}_{resume.version_id}.docx",
                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
            except ImportError:
                st.info("💡 Install python-docx: `pip install python-docx` to enable DOCX export")
            except Exception as e:
                st.error(f"Error exporting DOCX: {str(e)}")
