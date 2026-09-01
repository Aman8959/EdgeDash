"""Streamlit dashboard for EdgeDash."""
import streamlit as st
import sqlite3
import pandas as pd
from pathlib import Path
from edgedash.config import load_config
from edgedash import storage

# Page config
st.set_page_config(
    page_title="EdgeDash Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load config
config = load_config()
db_path = config.db_path

# Check if database exists
if not Path(db_path).exists():
    st.error("Database not found. Run `python run_cycle.py` first.")
    st.stop()

# Title
st.markdown("# 📊 EdgeDash Career Intelligence Dashboard")
st.markdown(
    f"**Profile:** {config.target_role} in {config.target_city} | "
    f"**Experience:** {config.experience_years} years | "
    f"**Min Fit Score:** {config.min_fit_score}"
)

# Sidebar
st.sidebar.markdown("## ⚙️ Controls")
show_stats = st.sidebar.checkbox("Show Statistics", value=True)
show_gaps = st.sidebar.checkbox("Show Skill Gaps", value=True)
show_all_jobs = st.sidebar.checkbox("Show All Jobs", value=False)

min_score_filter = st.sidebar.slider("Filter by Fit Score", 0, 100, config.min_fit_score)

# Load data
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# Get jobs
cursor = conn.cursor()
cursor.execute(
    "SELECT * FROM listings WHERE fit_score >= ? ORDER BY fit_score DESC",
    (min_score_filter,)
)
jobs = [dict(row) for row in cursor.fetchall()]

# Get skill gaps
cursor.execute(
    "SELECT skill, frequency FROM skill_gaps ORDER BY frequency DESC"
)
gaps = [dict(row) for row in cursor.fetchall()]

# Get summary stats
cursor.execute("SELECT COUNT(*) as total FROM listings")
total_jobs = cursor.fetchone()['total']

cursor.execute("SELECT COUNT(*) as scored FROM listings WHERE fit_score IS NOT NULL")
scored_jobs = cursor.fetchone()['scored']

cursor.execute("SELECT AVG(fit_score) as avg_score FROM listings WHERE fit_score IS NOT NULL")
avg_score = cursor.fetchone()['avg_score'] or 0

cursor.execute("SELECT COUNT(*) as high_fit FROM listings WHERE fit_score >= 50")
high_fit = cursor.fetchone()['high_fit']

conn.close()

# Main tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs(["📋 Top Jobs", "🎯 Skill Gaps", "📈 Statistics", "💡 Insights", "📄 Resume Intelligence"])

# TAB 1: Top Jobs
with tab1:
    st.markdown("## Top Job Matches")
    
    if jobs:
        # Display jobs
        for idx, job in enumerate(jobs[:20], 1):
            score = job['fit_score'] or 0
            
            # Score badge
            if score >= 50:
                badge = "🔥 HOT"
                color = "🟢"
            elif score >= 40:
                badge = "✓ GOOD"
                color = "🟡"
            else:
                badge = "• OK"
                color = "🔵"
            
            # Job card
            with st.container(border=True):
                col1, col2, col3 = st.columns([3, 1, 1])
                
                with col1:
                    st.markdown(
                        f"**{idx}. {job['title']}**  \n"
                        f"{job['company']} · {job['location']}"
                    )
                
                with col2:
                    st.metric("Fit Score", f"{score}/100")
                
                with col3:
                    st.markdown(f"**{badge}**")
                
                # Details
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.caption(f"📅 Posted: {job.get('posted_at', 'N/A')[:10]}")
                with col2:
                    st.caption(f"📍 Source: {job['source']}")
                with col3:
                    st.caption(f"🔗 {job['url'][:30]}...")
                
                st.caption(f"**Why:** {job.get('fit_reason', 'No reason provided')}")
                
                # Full description (collapsible)
                with st.expander("View full description"):
                    st.text(job.get('description', 'No description'))
    else:
        st.info(f"No jobs found with fit score >= {min_score_filter}")

# TAB 2: Skill Gaps
with tab2:
    st.markdown("## Market Skill Gaps")
    st.markdown("*Skills the market wants that you don't currently have*")
    
    if gaps:
        # Prepare data for chart
        gap_df = pd.DataFrame(gaps)
        
        # Bar chart
        st.bar_chart(
            gap_df.set_index('skill')['frequency'],
            use_container_width=True
        )
        
        # Table
        st.markdown("### Top Gaps to Learn")
        gap_table_data = []
        for idx, gap in enumerate(gaps[:10], 1):
            skill = gap['skill']
            freq = gap['frequency']
            importance = "🔥 Critical" if freq >= 15 else "📈 High" if freq >= 5 else "•Low"
            
            gap_table_data.append({
                "Rank": idx,
                "Skill": skill.title(),
                "Demand": f"{freq} jobs",
                "Priority": importance
            })
        
        gap_table_df = pd.DataFrame(gap_table_data)
        st.dataframe(gap_table_df, use_container_width=True, hide_index=True)
    else:
        st.info("No skill gaps identified yet. Run the cycle to analyze gaps.")

# TAB 3: Statistics
with tab3:
    st.markdown("## Dashboard Statistics")
    
    if show_stats:
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Listings", total_jobs)
        
        with col2:
            st.metric("Scored", f"{scored_jobs}/{total_jobs}")
        
        with col3:
            st.metric("Avg Fit Score", f"{avg_score:.1f}")
        
        with col4:
            st.metric("High-Fit Jobs", f"{high_fit} (50+)")
    
    # Score distribution
    st.markdown("### Score Distribution")
    
    score_ranges = {
        "🔥 High (50-100)": len([j for j in jobs if j['fit_score'] >= 50]),
        "✓ Medium (40-49)": len([j for j in jobs if 40 <= j['fit_score'] < 50]),
        "• Low (0-39)": len([j for j in jobs if j['fit_score'] < 40]),
    }
    
    score_df = pd.DataFrame(
        list(score_ranges.values()),
        index=list(score_ranges.keys()),
        columns=["Count"]
    )
    
    st.bar_chart(score_df, use_container_width=True)
    
    # Your skills
    st.markdown("### Your Current Skills")
    skill_cols = st.columns(4)
    for idx, skill in enumerate(config.my_skills):
        with skill_cols[idx % 4]:
            st.markdown(f"✓ {skill}")

# TAB 4: Insights
with tab4:
    st.markdown("## Career Intelligence")
    
    st.markdown("### 📊 Market Analysis")
    
    if gaps:
        st.markdown(f"**Top Skill Gap:** {gaps[0]['skill'].title()} ({gaps[0]['frequency']} jobs)")
        st.markdown(
            f"The job market shows highest demand for {gaps[0]['skill'].upper()}. "
            f"This skill appears in {gaps[0]['frequency']} job postings, making it a critical priority for growth."
        )
    
    st.markdown("### 🎯 Recommendations")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**High Priority Learning:**")
        st.markdown("- SQL (Foundation for data roles)")
        st.markdown("- Tableau (Top visualization tool)")
        st.markdown("- Cloud Platform (AWS/GCP/Azure)")
    
    with col2:
        st.markdown("**Career Next Steps:**")
        st.markdown("1. Focus on high-fit jobs (50+ score)")
        st.markdown("2. Learn top market gaps (SQL, Tableau)")
        st.markdown("3. Strengthen weak areas with projects")
        st.markdown("4. Build visible portfolio on GitHub")
    
    st.markdown("### 📈 Performance Metrics")
    
    if high_fit > 0:
        fit_percentage = (high_fit / total_jobs) * 100
        st.success(
            f"✓ {fit_percentage:.1f}% of opportunities are high-fit (50+). "
            f"You're well-positioned for {high_fit} roles!"
        )
    else:
        st.warning("⚠ No high-fit opportunities yet. Focus on skill gaps above.")

# TAB 5: Resume Intelligence
with tab5:
    # Import the resume intelligence module
    try:
        from edgedash.streamlit_tabs.resume_intelligence import render_resume_intelligence_tab
        render_resume_intelligence_tab()
    except ImportError as e:
        st.error(f"Resume Intelligence module not available: {str(e)}")
    except Exception as e:
        st.error(f"Error loading Resume Intelligence: {str(e)}")
        import traceback
        st.write(traceback.format_exc())

# Footer
st.markdown("---")
st.markdown(
    "EdgeDash v1.0 | Autonomous Career Intelligence Loop | "
    "[View on GitHub](https://github.com)"
)
