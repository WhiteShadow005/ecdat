"""
ECDAT — PDF Report Exporter
Renders the Jinja2 report.html template with scan data and converts to PDF using WeasyPrint.
Owner: Ojasya Rajput
"""

import io
from pathlib import Path
from typing import List
from ..models import CryptoAsset, ScanResult


TEMPLATE_PATH = Path(__file__).parent.parent / "templates" / "report.html"


def _render_html(result: ScanResult) -> str:
    """Render Jinja2 template with scan data."""
    try:
        from jinja2 import Environment, FileSystemLoader
    except ImportError:
        # Fallback if jinja2 not installed
        return _simple_html_fallback(result)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_PATH.parent))
    )
    env.filters["truncate"] = lambda s, n: (s[:n] + "...") if len(s) > n else s

    template = env.get_template(TEMPLATE_PATH.name)
    return template.render(
        scan_id=result.scan_id,
        target_name=result.target_name,
        timestamp=result.timestamp,
        summary=result.summary,
        mosca=result.mosca,
        assets=result.assets,
    )


def _simple_html_fallback(result: ScanResult) -> str:
    """Simple HTML without Jinja2 if template engine unavailable."""
    rows = ""
    for a in result.assets:
        rows += f"<tr><td>{a.id}</td><td>{a.algorithm}</td><td>{a.quantum_status}</td><td>{a.qars_score}</td><td>{a.file_path or 'N/A'}</td></tr>"

    return f"""<html><body>
<h1>ECDAT Scan Report</h1>
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
    """Render scan result to PDF bytes."""
    html_content = _render_html(result)

    try:
        import weasyprint
        doc = weasyprint.HTML(string=html_content)
        return doc.write_pdf()
    except ImportError:
        # Return HTML as bytes if WeasyPrint not installed
        return html_content.encode("utf-8")


def export_to_pdf(scan_id: str):
    """Export a stored scan as PDF file download."""
    from ..ai.code_remediator import _scan_cache
    from fastapi import HTTPException
    from fastapi.responses import Response

    assets = _scan_cache.get(scan_id, [])
    if not assets:
        raise HTTPException(status_code=404, detail=f"No scan found with ID: {scan_id}")

    # We need a ScanResult — build minimal one from cached assets
    from ..models import ScanResult, ScanSummary
    total = len(assets)
    safe = sum(1 for a in assets if a.quantum_status == "SAFE")
    result = ScanResult(
        scan_id=scan_id,
        target_name=scan_id,
        summary=ScanSummary(
            total_assets=total,
            safe=safe,
            quantum_readiness_pct=round(safe/total*100, 1) if total else 0
        ),
        assets=assets,
    )

    try:
        pdf_bytes = build_pdf_bytes(result)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ecdat_{scan_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
