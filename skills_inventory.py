"""Skills inventory: show gaps and growth recommendations."""
import sqlite3
from pathlib import Path


def show_skills_inventory(db_path: str) -> None:
    """Display user's skills vs market demand."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get skill gaps from database
    cursor.execute(
        "SELECT skill, frequency FROM skill_gaps ORDER BY frequency DESC LIMIT 10"
    )
    gaps = cursor.fetchall()
    
    conn.close()
    
    print("\n" + "=" * 100)
    print("📚 SKILLS INVENTORY - GROWTH RECOMMENDATIONS")
    print("=" * 100)
    
    # Read user config to show current skills
    from edgedash.config import load_config
    config = load_config()
    
    print(f"\n✅ YOUR CURRENT SKILLS ({len(config.my_skills)}):")
    print("-" * 100)
    for i, skill in enumerate(config.my_skills, 1):
        print(f"  {i}. {skill}")
    
    if gaps:
        print(f"\n\n🎯 TOP SKILL GAPS TO LEARN ({len(gaps)}):")
        print("-" * 100)
        print(f"{'Rank':<6} {'Skill':<30} {'Market Demand':>15} {'Why Important':<45}")
        print("-" * 100)
        
        skill_reasons = {
            "machine learning": "Core for AI/ML roles; highly sought after",
            "deep learning": "Growing demand for neural networks & AI",
            "spark": "Essential for big data processing at scale",
            "aws": "Top cloud platform; competitive advantage",
            "sql": "Data foundation; required in all data roles",
            "docker": "Modern DevOps essential; deployment standard",
            "kubernetes": "Container orchestration; scalability",
            "gcp": "Google Cloud expertise; emerging opportunity",
            "tableau": "Top visualization tool; business insight",
            "nlp": "Natural Language Processing; AI frontier",
        }
        
        for i, gap in enumerate(gaps, 1):
            skill = gap["skill"]
            freq = gap["frequency"]
            reason = skill_reasons.get(skill.lower(), "High demand in job market")
            
            marker = "🔥" if freq >= 10 else "📈" if freq >= 5 else "•"
            
            print(
                f"  {i:<5} {skill:<30} {marker} {freq:>2} jobs{' '*8} {reason:<45}"
            )
    else:
        print("\n❌ No skill gaps found (run `python run_cycle.py` first)")
    
    print("\n" + "=" * 100)
    
    # Show learning path
    print("\n💡 LEARNING PATH RECOMMENDATIONS:")
    print("-" * 100)
    
    priority_skills = {
        "High Priority": [
            ("SQL", "Foundation for data work", 2),
            ("Machine Learning", "Job market gold standard", 3),
            ("Spark", "Scale your data processing", 2),
        ],
        "Medium Priority": [
            ("Cloud (AWS/GCP)", "Future-proof your career", 4),
            ("Docker/Kubernetes", "Deployment automation", 3),
        ],
        "Emerging": [
            ("Deep Learning", "AI frontier, high demand", 4),
            ("NLP", "Cutting-edge AI applications", 3),
        ]
    }
    
    for category, skills in priority_skills.items():
        print(f"\n{category}:")
        for skill, why, weeks in skills:
            print(f"  • {skill:25s} - {why:35s} (~{weeks} weeks)")
    
    print("\n" + "=" * 100 + "\n")


if __name__ == "__main__":
    db_path = "edgedash.db"
    if not Path(db_path).exists():
        print("❌ Database not found. Run 'python run_cycle.py' first.")
        exit(1)
    
    show_skills_inventory(db_path)
