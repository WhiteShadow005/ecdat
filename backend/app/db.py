"""
ECDAT — SQLite Database Persistence
Stores scan history and results for dashboard review and persistent exports.
Owner: Shaurya Pratap Singh
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Optional
from .models import ScanResult, ScanSummary, MoscaResult, CryptoAsset
from .config import BASE_DIR

DB_PATH = Path(BASE_DIR) / "ecdat.db"


def get_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the scans table if it doesn't already exist."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scans (
                scan_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                target_name TEXT NOT NULL,
                total_assets INTEGER NOT NULL,
                critical_count INTEGER NOT NULL,
                high_count INTEGER NOT NULL,
                medium_count INTEGER NOT NULL,
                low_count INTEGER NOT NULL,
                safe_count INTEGER NOT NULL,
                readiness_pct REAL NOT NULL,
                mosca_status TEXT,
                data_category TEXT,
                exposure_context TEXT,
                raw_json TEXT NOT NULL
            )
            """
        )
        conn.commit()


def save_scan(scan: ScanResult, data_category: str = "financial", exposure_context: str = "internal") -> bool:
    """Save a ScanResult into the SQLite database."""
    init_db()
    raw_json_str = scan.model_dump_json()

    with get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO scans (
                scan_id, timestamp, target_name, total_assets,
                critical_count, high_count, medium_count, low_count, safe_count,
                readiness_pct, mosca_status, data_category, exposure_context, raw_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                scan.scan_id,
                scan.timestamp,
                scan.target_name,
                scan.summary.total_assets,
                scan.summary.critical,
                scan.summary.high,
                scan.summary.medium,
                scan.summary.low,
                scan.summary.safe,
                scan.summary.quantum_readiness_pct,
                scan.mosca.status if scan.mosca else "UNKNOWN",
                data_category,
                exposure_context,
                raw_json_str,
            ),
        )
        conn.commit()
    return True


def list_scans(limit: int = 50) -> List[dict]:
    """Retrieve metadata for the most recent scans."""
    init_db()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            SELECT scan_id, timestamp, target_name, total_assets,
                   critical_count, high_count, readiness_pct, mosca_status,
                   data_category, exposure_context
            FROM scans
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_scan(scan_id: str) -> Optional[ScanResult]:
    """Retrieve full ScanResult from database by scan_id."""
    init_db()
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT raw_json FROM scans WHERE scan_id = ?",
            (scan_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        data = json.loads(row["raw_json"])
        return ScanResult(**data)


def delete_scan(scan_id: str) -> bool:
    """Delete a scan record by scan_id."""
    init_db()
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
        conn.commit()
        return cursor.rowcount > 0
