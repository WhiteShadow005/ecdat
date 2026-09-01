"""
ECDAT — CSV Exporter (Enhanced)
Exports scan inventory as a flat CSV file for spreadsheet analysis.

Improvements over stub:
  - Metadata header rows (scan ID, timestamp, summary counts)
  - Extra columns: Source Scanner, Exposure Context
  - Clean line-break handling in snippet / notes

Owner: Ojasya Rajput
"""

import csv
import io
from datetime import datetime, timezone
from typing import List, Optional
from fastapi.responses import StreamingResponse
from ..models import CryptoAsset, ScanResult


CSV_HEADERS = [
    "Asset ID",
    "Algorithm",
    "Type",
    "Primitive",
    "Key Size (bits)",
    "Quantum Status",
    "QARS Score",
    "Criticality",
    "Mosca Status",
    "Language",
    "Library Used",
    "Source Scanner",
    "Exposure Context",
    "File Path",
    "Line Number",
    "Code Snippet",
    "Recommended Replacement",
    "Migration Notes",
]


def build_csv_string(
    assets: List[CryptoAsset],
    scan_id: str = "",
    result: Optional[ScanResult] = None,
) -> str:
    """
    Build CSV content from a list of CryptoAssets.
    Prepends metadata rows (scan ID, timestamp, summary) before the data.
    Returns raw CSV string.
    """
    output = io.StringIO()

    # ─── Metadata header (human-readable prefix rows) ─────────────────────────
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %Human:%M UTC").replace("Human:", "")
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    output.write(f"# ECDAT — Cryptographic Asset Inventory Export\n")
    output.write(f"# Scan ID: {scan_id}\n")
    output.write(f"# Generated: {timestamp}\n")
    output.write(f"# Tool: ECDAT v1.0.0 | NTRO SIH26164\n")
    output.write(f"# Standard: NIST FIPS 203/204/205 (August 2024)\n")
    if result:
        output.write(f"# Target: {result.target_name}\n")
        output.write(f"# Total Assets: {result.summary.total_assets}\n")
        output.write(f"# Critical: {result.summary.critical} | High: {result.summary.high} | "
                     f"Medium: {result.summary.medium} | Safe: {result.summary.safe}\n")
        output.write(f"# Quantum Readiness: {result.summary.quantum_readiness_pct}%\n")
        if result.mosca:
            output.write(f"# Mosca Status: {result.mosca.status} — {result.mosca.message}\n")
    output.write("#\n")

    # ─── Data rows ────────────────────────────────────────────────────────────
    writer = csv.DictWriter(output, fieldnames=CSV_HEADERS, extrasaction="ignore")
    writer.writeheader()

    for a in assets:
        writer.writerow({
            "Asset ID":               a.id,
            "Algorithm":              a.algorithm,
            "Type":                   a.type,
            "Primitive":              a.primitive or "N/A",
            "Key Size (bits)":        a.key_size or "N/A",
            "Quantum Status":         a.quantum_status,
            "QARS Score":             a.qars_score,
            "Criticality":            a.criticality,
            "Mosca Status":           a.mosca_status or "N/A",
            "Language":               a.language or "N/A",
            "Library Used":           a.library_used or "N/A",
            "Source Scanner":         a.source_scanner or "N/A",
            "Exposure Context":       a.exposure_context or "N/A",
            "File Path":              a.file_path or "N/A",
            "Line Number":            a.line_number or "N/A",
            "Code Snippet":           (a.code_snippet or "").replace("\n", " ").replace("\r", "")[:150],
            "Recommended Replacement":a.recommended_replacement or "N/A",
            "Migration Notes":        (a.notes or "").replace("\n", " ").replace("\r", "")[:250],
        })

    return output.getvalue()


def export_to_csv(scan_id: str) -> StreamingResponse:
    """Export a stored scan as a downloadable CSV file."""
    from .. import cache as scan_cache
    from fastapi import HTTPException

    result = scan_cache.get(scan_id)
    assets = result.assets if result else []

    # Fallback to legacy remediator cache
    if not assets:
        try:
            from ..ai.code_remediator import _scan_cache as _legacy
            assets = _legacy.get(scan_id, [])
        except Exception:
            pass

    if not assets:
        raise HTTPException(
            status_code=404,
            detail=f"No scan found with ID: {scan_id}. Run /api/scan first."
        )

    csv_content = build_csv_string(assets, scan_id=scan_id, result=result)
    filename = f"ecdat_scan_{scan_id}.csv"

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
