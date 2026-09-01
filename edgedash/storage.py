import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
from typing import NamedTuple


class Listing(NamedTuple):
    id: str
    title: str
    company: str
    location: str
    url: str
    description: str
    source: str
    posted_at: str
    fetched_at: str


def _make_listing_id(source: str, url: str) -> str:
    """Generate stable hash ID from source + URL."""
    combined = f"{source}:{url}".encode()
    return hashlib.sha256(combined).hexdigest()[:16]


def init_db(db_path: str) -> None:
    """Initialize database with three tables if they don't exist."""
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            source TEXT NOT NULL,
            posted_at TEXT,
            fetched_at TEXT NOT NULL,
            fit_score INTEGER,
            fit_reason TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skill_gaps (
            skill TEXT PRIMARY KEY,
            frequency INTEGER DEFAULT 0,
            last_seen TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cycle_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent TEXT NOT NULL,
            started_at TEXT NOT NULL,
            finished_at TEXT NOT NULL,
            records_touched INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            notes TEXT
        )
    """)
    
    conn.commit()
    conn.close()


def upsert_listings(db_path: str, rows: list[Listing]) -> int:
    """
    Insert new listings, deduplicating on (source, url).
    Returns count of genuinely NEW rows inserted.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_count = 0
    for row in rows:
        listing_id = _make_listing_id(row.source, row.url)
        cursor.execute(
            """
            INSERT OR IGNORE INTO listings
            (id, title, company, location, url, description, source, posted_at, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                listing_id, row.title, row.company, row.location, row.url,
                row.description, row.source, row.posted_at, row.fetched_at
            )
        )
        if cursor.rowcount > 0:
            new_count += 1
    
    conn.commit()
    conn.close()
    return new_count


def count_unscored(db_path: str) -> int:
    """Count listings without a fit_score."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM listings WHERE fit_score IS NULL")
    count = cursor.fetchone()[0]
    conn.close()
    return count


def last_fetch_time(db_path: str) -> str | None:
    """Return fetched_at of most recent listing, or None if empty."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(fetched_at) FROM listings")
    result = cursor.fetchone()[0]
    conn.close()
    return result


def log_cycle(
    db_path: str,
    agent: str,
    started_at: str,
    finished_at: str,
    records_touched: int,
    status: str,
    notes: str = ""
) -> None:
    """Log a single agent run to cycle_log."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO cycle_log
        (agent, started_at, finished_at, records_touched, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (agent, started_at, finished_at, records_touched, status, notes)
    )
    conn.commit()
    conn.close()


def get_listings(
    db_path: str,
    limit: int = 100,
    min_score: int | None = None
) -> list[dict]:
    """Retrieve listings, optionally filtered by min_score."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if min_score is not None:
        cursor.execute(
            """
            SELECT * FROM listings
            WHERE fit_score IS NOT NULL AND fit_score >= ?
            ORDER BY fit_score DESC
            LIMIT ?
            """,
            (min_score, limit)
        )
    else:
        cursor.execute(
            "SELECT * FROM listings ORDER BY fetched_at DESC LIMIT ?",
            (limit,)
        )
    
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def get_unscored_listings(db_path: str) -> list[dict]:
    """Get all listings that have NOT been scored yet (fit_score IS NULL)."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM listings WHERE fit_score IS NULL ORDER BY fetched_at DESC"
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def update_listing_score(
    db_path: str,
    listing_id: str,
    fit_score: int,
    fit_reason: str = ""
) -> None:
    """Update fit_score and fit_reason for a single listing."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE listings
        SET fit_score = ?, fit_reason = ?
        WHERE id = ?
        """,
        (fit_score, fit_reason, listing_id)
    )
    conn.commit()
    conn.close()


def update_skill_gaps(db_path: str, gaps: list[tuple[str, int]]) -> int:
    """Update skill_gaps table with market demand data.
    
    Args:
        db_path: Path to database
        gaps: List of (skill_name, frequency) tuples
    
    Returns:
        Count of gaps inserted/updated
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    count = 0
    
    for skill, frequency in gaps:
        cursor.execute(
            """
            INSERT OR REPLACE INTO skill_gaps
            (skill, frequency, last_seen)
            VALUES (?, ?, ?)
            """,
            (skill, frequency, now)
        )
        if cursor.rowcount > 0:
            count += 1
    
    conn.commit()
    conn.close()
    return count
