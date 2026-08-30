# EdgeDash Steering File

## PROJECT

**EdgeDash** — an autonomous AI career intelligence agent. A scheduled loop that fetches live job listings, scores them for fit against my profile, surfaces my skill gaps, verifies its own output, and publishes a Streamlit dashboard.

## ARCHITECTURE (do not deviate without telling me)

```
Trigger (scheduled)
  ↓
Orchestrator
  ↓
sub-agents (Fetcher, Scorer, GapAnalyzer)
  ↓
Verifier
  ↓
Storage
  ↓
Dashboard (read-only)
```

**Key principles:**
- The Orchestrator reads state and delegates; it never fetches or scores directly.
- Each sub-agent has one goal and one stop condition.

## HARD RULES

1. **Python 3.11+**. Standard library first. Add a dependency only when it genuinely saves real work, and tell me why before you add it.

2. **ALL storage access goes through a single storage module with a thin interface.** No other module may import sqlite3 directly. We will swap SQLite for hosted Postgres in week 4 and it must be a one-file change.

3. **Never hardcode my role, city, keywords, or skills profile.** Everything user-specific lives in config.

4. **No secrets in code.** Environment variables only, loaded in one place.

5. **Every agent run writes a row to a cycle_log table:** what ran, when, how many records touched, pass/fail, and any retry reason.

6. **Fail loudly.** No bare `except: pass`. If something is wrong I want to see it.

7. **Type hints on every function signature.** Docstrings only where the intent is not obvious from the name.

8. **Keep files under ~150 lines.** Split before that becomes a problem.

## STYLE

- Small, testable functions.
- Plain readable Python over clever Python.
- When asked for one module, build one module — do not scaffold the whole app.
- Console output must be readable on camera (aligned text, clear sections).
