"""Mock Fetcher agent for testing deduplication."""

from datetime import datetime
from edgedash.agents.base import Agent, AgentResult
from edgedash.storage import Listing
from edgedash import storage


class MockFetcher:
    """Returns 12 realistic fake job listings for testing.
    
    8 listings are stable (same source+url every run) to test deduplication.
    4 listings are new each run to provide fresh signal.
    """
    
    @property
    def name(self) -> str:
        return "MockFetcher"
    
    def run(self, config, storage) -> AgentResult:
        """Fetch mock listings and store them via storage.upsert_listings."""
        now = datetime.now().isoformat()
        timestamp = str(int(datetime.now().timestamp()))  # For fresh listing URLs
        
        # 8 stable listings (same ID every run) for dedup testing
        stable_listings = [
            Listing(
                id="",  # Will be hashed from source+url
                title="Senior Data Analyst",
                company="TechCorp India",
                location=config.target_city,
                url="https://techcorp.com/jobs/senior-data-analyst-001",
                source="TechCorp",
                description="5+ years in data analysis. Python, SQL, Tableau. Work with large datasets.",
                posted_at="2026-08-28",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Analytics Engineer",
                company="DataStream Solutions",
                location=config.target_city,
                url="https://datastream.com/jobs/analytics-engineer-202",
                source="DataStream",
                description="Build data pipelines. SQL, Python, dbt. Fast-moving startup.",
                posted_at="2026-08-27",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Business Analyst",
                company="CloudWorks Ltd",
                location=config.target_city,
                url="https://cloudworks.com/jobs/ba-analytics-101",
                source="CloudWorks",
                description="Analysis for product team. Excel, SQL, Tableau, Pandas.",
                posted_at="2026-08-29",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Data Analyst (Entry Level)",
                company="StartupXYZ",
                location=config.target_city,
                url="https://startup.com/jobs/data-analyst-entry-003",
                source="StartupXYZ",
                description="Fresh talent welcome. Learn SQL, Python, analytics on the job.",
                posted_at="2026-08-26",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Reporting Specialist",
                company="EnterpriseCore",
                location=config.target_city,
                url="https://enterprise.com/jobs/reporting-specialist-404",
                source="EnterpriseCore",
                description="Tableau, SQL, Python. Build executive dashboards. 3+ years required.",
                posted_at="2026-08-25",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Data Scientist (Analytics focus)",
                company="ResearchHub",
                location=config.target_city,
                url="https://researchhub.com/jobs/ds-analytics-050",
                source="ResearchHub",
                description="Python, SQL, statistical analysis. Research-driven role.",
                posted_at="2026-08-24",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="BI Developer",
                company="InfoSystems Inc",
                location=config.target_city,
                url="https://infosys.com/jobs/bi-dev-505",
                source="InfoSystems",
                description="Power BI, SQL Server, Python scripting for dashboards.",
                posted_at="2026-08-23",
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Product Analytics Manager",
                company="FinTech Innovations",
                location=config.target_city,
                url="https://fintech.com/jobs/product-analytics-mgr-606",
                source="FinTech",
                description="Lead analytics team. SQL, Python, communication skills. 5+ years.",
                posted_at="2026-08-22",
                fetched_at=now,
            ),
        ]
        
        # 4 fresh listings (new each run for signal)
        fresh_listings = [
            Listing(
                id="",
                title="Junior Analytics Role",
                company="GrowthCo",
                location=config.target_city,
                url=f"https://growthco.com/jobs/junior-analytics-{timestamp}",
                source="GrowthCo",
                description="Entry-level. Learn SQL and Tableau. 1-2 years experience.",
                posted_at=now,
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Data Analysis Consultant",
                company="ConsultPlus",
                location=config.target_city,
                url=f"https://consultplus.com/jobs/consultant-{timestamp}",
                source="ConsultPlus",
                description="Consulting projects. Python, SQL, client communication.",
                posted_at=now,
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Analytics Coordinator",
                company="MarketingPro",
                location=config.target_city,
                url=f"https://marketingpro.com/jobs/analytics-coord-{timestamp}",
                source="MarketingPro",
                description="Support marketing analytics. Excel, SQL, data visualization.",
                posted_at=now,
                fetched_at=now,
            ),
            Listing(
                id="",
                title="Senior BI Analyst",
                company="RetailChain Corp",
                location=config.target_city,
                url=f"https://retailchain.com/jobs/bi-analyst-{timestamp}",
                source="RetailChain",
                description="Large retail company. SQL, Tableau, Python. 6+ years.",
                posted_at=now,
                fetched_at=now,
            ),
        ]
        
        all_listings = stable_listings + fresh_listings
        
        # Upsert and count new rows
        new_count = storage.upsert_listings(config.db_path, all_listings)
        
        return AgentResult(
            agent=self.name,
            status="ok",
            records_touched=len(all_listings),
            notes=f"Fetched {len(all_listings)} listings, {new_count} were new",
        )
