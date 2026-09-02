"""
ECDAT — CSV Exporter
Exports scan inventory as a flat CSV file for spreadsheet analysis.
Owner: Ojasya Rajput
"""

import csv
import io
from typing import List
from fastapi.responses import StreamingResponse
from ..models import CryptoAsset


CSV_HEADERS = [
    "Asset ID", "Algorithm", "Type", "Quantum Status", "QARS Score",
    "Criticality", "Mosca Status", "Key Size (bits)", "Language",
    "Library Used", "File Path", "Line Number", "Code Snippet",
    "Recommended Replacement", "Notes"
]


def build_csv_string(assets: List[CryptoAsset]) -> str:
    """Build CSV content from a list of CryptoAssets. Returns raw CSV string."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_HEADERS, extrasaction="ignore")
    writer.writeheader()

    for a in assets:
        writer.writerow({
            "Asset ID": a.id,
            "Algorithm": a.algorithm,
            "Type": a.type,
            "Quantum Status": a.quantum_status,
            "QARS Score": a.qars_score,
            "Criticality": a.criticality,
            "Mosca Status": a.mosca_status or "N/A",
            "Key Size (bits)": a.key_size or "N/A",
            "Language": a.language or "N/A",
            "Library Used": a.library_used or "N/A",
            "File Path": a.file_path or "N/A",
            "Line Number": a.line_number or "N/A",
            "Code Snippet": (a.code_snippet or "").replace("\n", " ")[:120],
            "Recommended Replacement": a.recommended_replacement or "N/A",
            "Notes": (a.notes or "").replace("\n", " ")[:200],
        })

    return output.getvalue()


def export_to_csv(scan_id: str) -> StreamingResponse:
    """Export a stored scan as CSV file download."""
    from ..ai.code_remediator import _scan_cache
    assets = _scan_cache.get(scan_id, [])
    if not assets:
        try:
            from ..db import get_scan
            scan_rec = get_scan(scan_id)
            if scan_rec:
                assets = scan_rec.assets
        except Exception:
            pass

    if not assets:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"No scan found with ID: {scan_id}")

    csv_content = build_csv_string(assets)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ecdat_scan_{scan_id}.csv"}
    )
