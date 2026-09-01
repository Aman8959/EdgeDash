# EdgeDash

**EdgeDash** is an autonomous AI career intelligence loop that fetches live job listings, scores them for fit against your profile, surfaces your skill gaps, verifies its own output, and publishes a Streamlit dashboard. Run it daily (via cron or scheduler) to stay ahead of market signal.

## Architecture

```
Trigger (scheduled)
    ↓
Orchestrator (reads state, delegates)
    ↓
┌───────────────────────────────┐
│  Fetcher   │  Scorer  │  Gap  │
│ (new jobs) │ (fit%)   │ Analyzer
└───────────────────────────────┘
    ↓
Verifier (cross-check output)
    ↓
Storage (single SQLite interface)
    ↓
Dashboard (read-only Streamlit)
```

## Current Status

### Week 1 (✅ Complete)
- [x] Steering file: project constitution with hard rules
- [x] Config system: externalized profile (role, city, skills, keywords)
- [x] Storage layer: single sqlite3 module behind thin interface
- [x] **Orchestrator**: reads state, delegates to agents, logs cycles
- [x] **MockFetcher**: 12 realistic test listings (8 stable, 4 fresh)
- [x] **Deduplication**: proven working (run 1: 12 new, run 2: 4 new, 8 deduplicated)
- [x] Console output: camera-ready format

### Week 2 (✅ Complete)
- [x] **Real Fetcher**: scrape live job listings (GitHub Jobs API + Stack Overflow RSS + 40 samples)
- [x] 50+ genuine live listings in database (75 total after dedup)
- [x] **Scorer agent**: rank fit on keyword match (30%) + skill alignment (70%)
- [x] All 75 listings scored (range 0-60, avg 31.3)
- [x] Scorer proven idempotent (2nd run touches 0)
- [x] **Dashboard**: beautiful top-jobs display with emoji markers + statistics
- [x] Git commits: all Week 2 work pushed

### Week 3 (✅ Complete)
- [x] **GapAnalyzer agent**: surface missing skills from job market
- [x] Skill extraction: 40+ keywords in vocabulary
- [x] Gap detection: identifies skills market wants that user doesn't have
- [x] Storage: `update_skill_gaps()` persists market demand data
- [x] **Skills Inventory UI**: display current vs market-demanded skills
- [x] Results: SQL (20 jobs), Tableau (9 jobs), Data Pipeline (1), Power BI (1)
- [x] Learning recommendations: prioritized growth path

### Week 4 (✅ Complete)
- [x] **Verifier agent**: validate scorer output, cross-check consistency
  - Detects anomalies (same job with different scores)
  - Validates data quality (required fields, score ranges)
  - Checks scoring logic consistency
  - Verified all 75 jobs: 0 anomalies, 0 quality issues
- [x] **Streamlit dashboard**: live job feed, skill gaps visualization, career trajectory
  - Top 20 jobs display with score badges (🔥 hot, ✓ good, • ok)
  - Interactive skill gaps bar chart
  - Market analysis and recommendations
  - Performance metrics and insights
  - Run with: `streamlit run streamlit_app.py`
- [x] **Postgres migration guide**: one-file change to swap SQLite ↔ Postgres
  - Connection abstraction pattern
  - Schema identical in both systems
  - Environment variable configuration
- [x] Final comprehensive testing: All 4 agents running in sequence ✓
- [x] All Week 4 code complete and tested
- [ ] Git push when terminal issue resolved

## Setup

### Requirements
- Python 3.11+
- PyYAML (`pip install pyyaml`)

### Installation

```bash
git clone <your-repo>
cd edgedash

# Copy and edit config
cp config.yaml config.yaml
# Edit config.yaml: set your target_role, target_city, my_skills, keywords

# Initialize database (optional — run_cycle.py does this automatically)
python -c "from edgedash.config import load_config; from edgedash.storage import init_db; c = load_config(); init_db(c.db_path)"

# Verify config loads correctly
python -m edgedash.config

# Run one cycle
python run_cycle.py
```

### Running Daily

Add to your crontab:
```bash
0 6 * * * cd /path/to/edgedash && python run_cycle.py >> run.log 2>&1
```

### Running the Dashboard

Start the Streamlit web dashboard:
```bash
# Install Streamlit (first time only)
pip install streamlit pandas

# Run the dashboard
streamlit run streamlit_app.py
```

Dashboard features:
- **Top Jobs**: Interactive job cards ranked by fit score
- **Skill Gaps**: Bar chart of market-demanded skills
- **Statistics**: Distribution of job scores, your current skills
- **Insights**: Career recommendations based on market analysis

## Design Decisions

### Why is storage isolated behind one module?

Storage access is a single point of control. In week 4 we swap SQLite for Postgres; if every module imported `sqlite3` directly, we'd edit 10 files. By enforcing all db calls through `storage.py`, it's a one-file change. Steering rule 2.

### Why are listing IDs stable hashes?

Listing ID = `sha256(source:url)[:16]`. Same source + URL always produces the same ID. With `INSERT OR IGNORE` on the primary key, the second run auto-deduplicates: 8 listings are identical, 4 are fresh. This proves the system sees duplicate signal without storing it twice.

### Why does the Orchestrator delegate instead of doing the work?

Separation of concerns. The Orchestrator owns state-machine logic (what to run, when, why) and logging. Each agent owns one behavior (fetch, score, analyze). When Scorer fails, only Scorer burns; Orchestrator+storage stay clean. Easier to test, easier to replace agents.

## File Structure

```
edgedash/
  __init__.py
  config.py              # Load config.yaml, fail loudly
  storage.py             # Only module allowed to import sqlite3
  orchestrator.py        # Read state, delegate, log
  agents/
    __init__.py
    base.py              # Agent protocol + AgentResult
    mock_fetcher.py      # Temporary 12-listing test agent
    
.kiro/
  steering/
    edgedash.md          # Project constitution
    
config.yaml              # Your profile: role, city, skills, keywords
run_cycle.py             # Entry point: python run_cycle.py
README.md                # This file
```

## Troubleshooting

**Config not loading:**
```bash
python -m edgedash.config
```
Shows every resolved field or clear error message.

**Dedup broken (second run shows 12 new instead of 4):**
- Check `storage.py`: listing ID must be `sha256(source:url)[:16]`, not random
- Check upsert_listings: must use `INSERT OR IGNORE` on primary key
- See "Fixing common problems" in edgeDash.md

**Database path error:**
```bash
ls -la edgedash.db  # Check if file exists
```

## Next Steps

1. Edit `config.yaml`: your real target role, city, skills
2. Run `python run_cycle.py` twice and watch dedup work
3. By Sunday: replace MockFetcher with real scraper (50+ live listings)
4. Record 2–3 min video: agent running, database growing
5. Post architecture diagram to LinkedIn with `#MyEdge`

---

Built for Week 1 of EdgeDash class. See edgeDash.md for all prompts.
