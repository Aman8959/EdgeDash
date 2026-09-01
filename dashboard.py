"""Dashboard: Show top-scored job recommendations."""
import sqlite3
from pathlib import Path


def show_top_jobs(db_path: str, limit: int = 10, min_score: int = 30) -> None:
    """Display top-scored jobs matching user profile."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        """
        SELECT id, title, company, location, fit_score, fit_reason
        FROM listings
        WHERE fit_score IS NOT NULL AND fit_score >= ?
        ORDER BY fit_score DESC
        LIMIT ?
        """,
        (min_score, limit)
    )
    
    results = cursor.fetchall()
    conn.close()
    
    if not results:
        print(f"\n❌ No jobs found with score >= {min_score}")
        return
    
    print("\n" + "=" * 110)
    print("🎯 TOP RECOMMENDED JOBS FOR YOUR PROFILE")
    print("=" * 110)
    print(f"{'Rank':<6} {'Job Title':<35} {'Company':<20} {'Fit Score':<12} {'Match':<25}")
    print("-" * 110)
    
    for i, job in enumerate(results, 1):
        score = job["fit_score"]
        reason = job["fit_reason"][:20] if job["fit_reason"] else "N/A"
        
        # Color code based on score
        if score >= 50:
            marker = "🔥"
        elif score >= 40:
            marker = "✓"
        else:
            marker = "•"
        
        print(
            f"{i:<6} {job['title'][:34]:<35} {job['company'][:19]:<20} "
            f"{marker} {score:>3}/100{' '*7} {reason:<25}"
        )
    
    print("-" * 110)
    
    # Show statistics
    cursor_stat = sqlite3.connect(db_path).cursor()
    cursor_stat.execute(
        f"""
        SELECT COUNT(*), AVG(fit_score), MIN(fit_score), MAX(fit_score)
        FROM listings
        WHERE fit_score IS NOT NULL
        """
    )
    total, avg, min_s, max_s = cursor_stat.fetchone()
    cursor_stat.close()
    
    print(f"\n📊 STATISTICS:")
    print(f"   Total Listings:   {total}")
    print(f"   Average Score:    {avg:.1f}/100")
    print(f"   Score Range:      {min_s} - {max_s}")
    print(f"   Score >= 50:      {sum(1 for r in results if r['fit_score'] >= 50)} (High fit)")
    print(f"   Score >= 30:      {sum(1 for r in results if r['fit_score'] >= 30)} (Medium fit)")
    print("\n" + "=" * 110)


if __name__ == "__main__":
    db_path = "edgedash.db"
    if not Path(db_path).exists():
        print("❌ Database not found. Run 'python run_cycle.py' first.")
        exit(1)
    
    show_top_jobs(db_path, limit=15, min_score=20)
