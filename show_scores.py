"""Quick script to display top scored jobs."""
from edgedash.config import load_config
from edgedash.storage import get_listings

config = load_config()
listings = get_listings(config.db_path, limit=15)

print("\nTOP 15 SCORED JOBS BY FIT:")
print("=" * 110)
print(f"{'#':<2} {'Job Title':<40} {'Company':<25} {'Score':>6} {'Reason':<30}")
print("-" * 110)

for i, job in enumerate(listings, 1):
    score = job.get('fit_score', 'N/A')
    reason = job.get('fit_reason', 'Not scored')[:28]
    title = job['title'][:39]
    company = job['company'][:23]
    print(f"{i:<2} {title:<40} {company:<25} {score:>6} {reason:<30}")

print("-" * 110)
print(f"\nTotal scored: {len(listings)}")
