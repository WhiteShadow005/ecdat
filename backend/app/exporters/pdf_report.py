"""
ECDAT — PDF Report Exporter (Enhanced)
Renders the Jinja2 report.html template with full scan data and converts to PDF.

Improvements over stub:
  - Reads full ScanResult from shared cache (includes Mosca, summary counts)
  - Passes migration recommendations table data to template
  - Graceful fallback if WeasyPrint not installed (returns HTML with warning)

Owner: Ojasya Rajput
"""

import io
from pathlib import Path
from typing import List, Optional
from ..models import CryptoAsset, ScanResult, ScanSummary


TEMPLATE_PATH = Path(__file__).parent.parent / "templates" / "report.html"


# ─── Per-algorithm migration guidance for the Recommendations section ─────────
MIGRATION_TABLE = [
    {
        "algorithm": "RSA (any key size)",
        "status": "BROKEN",
        "replacement": "ML-KEM-768 (key exchange) + ML-DSA-65 (signatures)",
        "fips": "FIPS 203 / 204",
        "urgency": "Immediate",
    },
    {
        "algorithm": "ECDSA / ECDH",
        "status": "BROKEN",
        "replacement": "ML-DSA-65 for signatures; ML-KEM-768 for key agreement",
        "fips": "FIPS 203 / 204",
        "urgency": "Immediate",
    },
    {
        "algorithm": "Diffie-Hellman / DSA",
        "status": "BROKEN",
        "replacement": "ML-KEM-768 (FIPS 203) for key agreement",
        "fips": "FIPS 203",
        "urgency": "Immediate",
    },
    {
        "algorithm": "MD5",
        "status": "BROKEN",
        "replacement": "SHA-256 (hashlib — drop-in replacement)",
        "fips": "FIPS 180-4",
        "urgency": "Immediate",
    },
    {
        "algorithm": "SHA-1",
        "status": "BROKEN",
        "replacement": "SHA-256 or SHA-3-256",
        "fips": "FIPS 180-4 / 202",
        "urgency": "Immediate",
    },
    {
        "algorithm": "DES / 3DES",
        "status": "BROKEN",
        "replacement": "AES-256-GCM (universally supported)",
        "fips": "FIPS 197",
        "urgency": "Immediate",
    },
    {
        "algorithm": "RC4",
        "status": "BROKEN",
        "replacement": "ChaCha20-Poly1305 or AES-256-GCM",
        "fips": "RFC 8439",
        "urgency": "Immediate",
    },
    {
        "algorithm": "AES-128",
        "status": "WEAKENED",
        "replacement": "AES-256-GCM (same library, double the key length)",
        "fips": "FIPS 197",
        "urgency": "Near-term (< 2 years)",
    },
    {
        "algorithm": "TLS 1.0 / 1.1",
        "status": "BROKEN",
        "replacement": "TLS 1.3 with X25519 + ML-KEM-768 hybrid key exchange",
        "fips": "NIST SP 800-52 Rev2",
        "urgency": "Immediate",
    },
    {
        "algorithm": "TLS 1.2 weak ciphers",
        "status": "WEAKENED",
        "replacement": "TLS 1.3 (mandatory AEAD — AES-256-GCM or ChaCha20-Poly1305)",
        "fips": "NIST SP 800-52 Rev2",
        "urgency": "Near-term (< 2 years)",
    },
]


def _render_html(result: ScanResult) -> str:
    """Render Jinja2 report template with full scan data."""
    try:
        from jinja2 import Environment, FileSystemLoader, select_autoescape
    except ImportError:
        return _simple_html_fallback(result)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_PATH.parent)),
        autoescape=select_autoescape(["html"]),
    )

    # Custom filters
    env.filters["truncate_path"] = lambda s, n=45: (("…" + s[-(n-1):]) if len(s) > n else s)
    env.filters["status_class"] = lambda s: {
        "BROKEN": "badge-broken", "WEAKENED": "badge-weakened",
        "SAFE": "badge-safe",
    }.get(s, "badge-unknown")

    template = env.get_template(TEMPLATE_PATH.name)

    return template.render(
        scan_id=result.scan_id,
        target_name=result.target_name,
        timestamp=result.timestamp,
        summary=result.summary,
        mosca=result.mosca,
        assets=result.assets,
        migration_table=MIGRATION_TABLE,
    )


def _simple_html_fallback(result: ScanResult) -> str:
    """Minimal HTML without Jinja2 — emergency fallback only."""
    rows = ""
    for a in result.assets:
        rows += (
            f"<tr><td>{a.id}</td><td>{a.algorithm}</td>"
            f"<td>{a.quantum_status}</td><td>{a.qars_score}</td>"
            f"<td>{a.file_path or 'N/A'}</td></tr>"
        )

    return f"""<!DOCTYPE html><html><body>
<h1>ECDAT Scan Report</h1>
<p><strong>Note:</strong> Jinja2 not installed — simplified report.</p>
<h2>Scan ID: {result.scan_id}</h2>
<p>Target: {result.target_name} | Time: {result.timestamp}</p>
<h3>Summary</h3>
<ul>
  <li>Total: {result.summary.total_assets}</li>
  <li>Critical: {result.summary.critical}</li>
  <li>Quantum Readiness: {result.summary.quantum_readiness_pct}%</li>
</ul>
<h3>Assets</h3>
<table border="1">
<tr><th>ID</th><th>Algorithm</th><th>Status</th><th>QARS</th><th>File</th></tr>
{rows}
</table>
</body></html>"""


def build_pdf_bytes(result: ScanResult) -> bytes:
    """Render scan result to PDF bytes. Falls back to HTML bytes if WeasyPrint absent."""
    html_content = _render_html(result)

    try:
        import weasyprint
        doc = weasyprint.HTML(string=html_content)
        return doc.write_pdf()
    except ImportError:
        # Return HTML with a visible banner so the caller knows it's not a PDF
        banner = (
            "<div style='background:#fee2e2;border:2px solid red;padding:12px;font-family:sans-serif;'>"
            "<strong>⚠ WeasyPrint not installed.</strong> This is an HTML preview. "
            "Install with: <code>pip install weasyprint</code></div>"
        )
        return (banner + html_content).encode("utf-8")


def export_to_pdf(scan_id: str):
    """Export a stored scan as a downloadable PDF audit report."""
    from .. import cache as scan_cache
    from fastapi import HTTPException
    from fastapi.responses import Response

    # Try the shared cache first (has full ScanResult including Mosca)
    result = scan_cache.get(scan_id)

    # Fallback: reconstruct minimal ScanResult from legacy asset cache
    if not result:
        try:
            from ..ai.code_remediator import _scan_cache as _legacy
            assets = _legacy.get(scan_id, [])
        except Exception:
            assets = []

        if assets:
            total = len(assets)
            safe  = sum(1 for a in assets if a.quantum_status == "SAFE")
            crit  = sum(1 for a in assets if a.criticality == "critical")
            high  = sum(1 for a in assets if a.criticality == "high")
            med   = sum(1 for a in assets if a.criticality == "medium")

            result = ScanResult(
                scan_id=scan_id,
                target_name=scan_id,
                summary=ScanSummary(
                    total_assets=total,
                    safe=safe,
                    critical=crit,
                    high=high,
                    medium=med,
                    quantum_readiness_pct=round(safe / total * 100, 1) if total else 0.0,
                ),
                assets=assets,
            )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No scan found with ID: {scan_id}. Run /api/scan first."
        )

    try:
        pdf_bytes = build_pdf_bytes(result)
        media = "application/pdf" if pdf_bytes[:4] == b"%PDF" else "text/html"
        filename = f"ecdat_{scan_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type=media,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
