"""Postgres migration example (Week 4 enhancement).

To use Postgres instead of SQLite:

1. Install psycopg2:
   pip install psycopg2-binary

2. Set environment variable:
   export POSTGRES_URL="postgresql://user:password@host:5432/edgedash"
   
3. Change storage.py imports from sqlite3 to psycopg2

4. Example connection in storage.py:
   
   import os
   import psycopg2
   from psycopg2.extras import RealDictCursor
   
   def get_db_connection():
       url = os.getenv('POSTGRES_URL', 'sqlite:///edgedash.db')
       if url.startswith('postgresql://'):
           return psycopg2.connect(url)
       else:
           # Fallback to SQLite
           return sqlite3.connect(url.replace('sqlite:///', ''))

The schema is identical in both systems:
- listings (id, title, company, location, url, description, source, posted_at, fetched_at, fit_score, fit_reason)
- skill_gaps (skill, frequency, last_seen)
- cycle_log (id, agent, started_at, finished_at, records_touched, status, notes)

This allows zero-code-change switching between SQLite and Postgres!
"""

# Migration checklist:
"""
[ ] Install psycopg2: pip install psycopg2-binary
[ ] Create Postgres database: createdb edgedash
[ ] Export connection string: export POSTGRES_URL=postgresql://user:pass@localhost/edgedash
[ ] Migrate data: python migrate_to_postgres.py
[ ] Run cycle: python run_cycle.py (should work with Postgres transparently)
"""
