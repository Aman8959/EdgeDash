"""Orchestrator: reads state, delegates to agents, logs results."""

from datetime import datetime
from edgedash.config import Config
from edgedash import storage
from edgedash.agents.base import Agent, AgentResult
from edgedash.agents.indeed_fetcher import IndeedFetcher
from edgedash.agents.scorer import Scorer
from edgedash.agents.gap_analyzer import GapAnalyzer
from edgedash.agents.verifier import Verifier
from edgedash.agents.phase5_agents import (
    JDAnalyzerAgent,
    ResumeMatcherAgent,
    ResumeGeneratorAgent,
    ResumeValidatorAgent,
    ATSOptimizerAgent,
)


# Agent registry — add new agents here, comment out to disable
AGENT_REGISTRY = {
    # Week 1-4 Agents
    "fetcher": IndeedFetcher(),
    "scorer": Scorer(),
    "gap_analyzer": GapAnalyzer(),  # Week 3 ✓
    "verifier": Verifier(),         # Week 4 ✓
    
    # Phase 5 Resume Intelligence Agents
    "jd_analyzer": JDAnalyzerAgent(),         # Extract job requirements
    "resume_matcher": ResumeMatcherAgent(),   # Match candidate to jobs
    "resume_generator": ResumeGeneratorAgent(), # Generate tailored resumes
    "resume_validator": ResumeValidatorAgent(), # Validate resumes (anti-hallucination)
    "ats_optimizer": ATSOptimizerAgent(),     # Optimize for ATS systems
}


def run_cycle(config: Config) -> None:
    """Run one full EdgeDash cycle.
    
    Reads state, plans, runs agents, logs results, prints summary.
    """
    
    # === INIT & READ STATE ===
    storage.init_db(config.db_path)
    
    last_fetch = storage.last_fetch_time(config.db_path)
    unscored = storage.count_unscored(config.db_path)
    total_listings = len(storage.get_listings(config.db_path, limit=999999))
    
    cycle_start = datetime.now()
    
    print("\n" + "=" * 70)
    print("EDGEDASH CYCLE")
    print("=" * 70)
    
    # === PRINT STATE READ ===
    print(f"\nSTATE READ:")
    print(f"  Total listings in DB:        {total_listings}")
    print(f"  Unscored listings:           {unscored}")
    print(f"  Last fetch time:             {last_fetch or 'Never'}")
    
    # === PRINT PLAN & WHY ===
    print(f"\nPLAN:")
    print(f"  1. Run Fetcher               (always — get fresh listings)")
    print(f"  2. Run Scorer                (always — rate all unscored jobs)")
    print(f"  3. Run GapAnalyzer           (always — identify skill gaps)")
    print(f"  4. Run Verifier              (always — validate quality)")
    print(f"  5. Run JD Analyzer           (Phase 5 — extract job requirements)")
    print(f"  6. Run Resume Matcher        (Phase 5 — match candidate to jobs)")
    print(f"  7. Run Resume Generator      (Phase 5 — generate tailored resumes)")
    print(f"  8. Run Resume Validator      (Phase 5 — validate resumes)")
    print(f"  9. Run ATS Optimizer         (Phase 5 — optimize for ATS)")
    
    # === RUN AGENTS ===
    print(f"\nRUNNING AGENTS:")
    results: list[AgentResult] = []
    
    for agent_key, agent in AGENT_REGISTRY.items():
        agent_start = datetime.now()
        try:
            result = agent.run(config, storage)
            results.append(result)
            agent_elapsed = (datetime.now() - agent_start).total_seconds()
            status_mark = "✓" if result.status == "ok" else "✗"
            print(
                f"  {status_mark} {result.agent:20s} "
                f"touched={result.records_touched:3d} "
                f"time={agent_elapsed:.2f}s"
            )
            if result.notes:
                print(f"    → {result.notes}")
            
            # Log to cycle_log
            storage.log_cycle(
                config.db_path,
                agent=result.agent,
                started_at=agent_start.isoformat(),
                finished_at=datetime.now().isoformat(),
                records_touched=result.records_touched,
                status=result.status,
                notes=result.notes,
            )
        except Exception as e:
            print(f"  ✗ {agent_key:20s} FAILED: {e}")
            storage.log_cycle(
                config.db_path,
                agent=agent_key,
                started_at=agent_start.isoformat(),
                finished_at=datetime.now().isoformat(),
                records_touched=0,
                status="failed",
                notes=str(e),
            )
    
    # === CYCLE SUMMARY ===
    cycle_elapsed = (datetime.now() - cycle_start).total_seconds()
    total_touched = sum(r.records_touched for r in results)
    
    print(f"\nCYCLE SUMMARY:")
    print(f"  Total time:                  {cycle_elapsed:.2f}s")
    print(f"  Agents run:                  {len(results)}/{len(AGENT_REGISTRY)}")
    print(f"  Total records touched:       {total_touched}")
    
    # Re-read after changes
    new_total = len(storage.get_listings(config.db_path, limit=999999))
    print(f"  Listings before cycle:       {total_listings}")
    print(f"  Listings after cycle:        {new_total}")
    print(f"  New listings added:          {new_total - total_listings}")
    
    print("\n" + "=" * 70 + "\n")
