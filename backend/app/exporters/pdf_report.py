"""
ECDAT — PDF Report Exporter (Enhanced)
Renders the Jinja2 report.html template with full scan data and converts to PDF.

Improvements over stub:
  - Reads full ScanResult from shared cache (includes Mosca, summary counts)
  - Passes migration recommendations table data to template
  - Graceful fallback if WeasyPrint not installed (returns HTML with warning)

Owner: Aujasya Rajput
"""

import io
import os
import sys
from pathlib import Path
from typing import List, Optional
from ..models import CryptoAsset, ScanResult, ScanSummary

# On macOS, ensure brew installed libraries (pango, cairo, gobject) are found by WeasyPrint
if sys.platform == "darwin":
    for p in ["/opt/homebrew/lib", "/usr/local/lib"]:
        if os.path.exists(p) and p not in os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", ""):
            cur = os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", "")
            os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = f"{p}:{cur}".rstrip(":")


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

    def _fmt_timestamp(ts: str) -> str:
        if not ts:
            return "N/A"
        try:
            from datetime import datetime
            clean_ts = ts.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_ts)
            return dt.strftime("%d %b %Y, %H:%M UTC")
        except Exception:
            return str(ts)

    env.filters["format_timestamp"] = _fmt_timestamp

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


def _build_reportlab_pdf(result: ScanResult) -> bytes:
    """Robust fallback PDF generator using ReportLab when WeasyPrint native libs fail."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=16
    )
    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=8
    )
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )

    # Document Header
    story.append(Paragraph("ECDAT — Quantum Cryptographic Audit Report", title_style))
    story.append(Paragraph(f"Smart India Hackathon 2026 | NTRO (National Technical Research Organisation)<br/>Scan ID: <b>{result.scan_id}</b> | Target: <b>{result.target_name}</b> | Generated: {result.timestamp}", subtitle_style))
    story.append(Spacer(1, 8))

    # Executive Summary Box
    story.append(Paragraph("Executive Summary", h2_style))
    sum_data = [
        [Paragraph("Metric", table_header), Paragraph("Value", table_header)],
        [Paragraph("Total Cryptographic Assets Discovered", table_text), Paragraph(str(result.summary.total_assets), table_text)],
        [Paragraph("Critical Quantum Vulnerabilities (Shor's Threat)", table_text), Paragraph(str(result.summary.critical), table_text)],
        [Paragraph("Weakened Primitives (Grover's Threat)", table_text), Paragraph(str(result.summary.medium + result.summary.high), table_text)],
        [Paragraph("Quantum-Safe Primitives", table_text), Paragraph(str(result.summary.safe), table_text)],
        [Paragraph("Overall Quantum Readiness Score", table_text), Paragraph(f"{result.summary.quantum_readiness_pct}%", table_text)],
    ]
    t_sum = Table(sum_data, colWidths=[300, 240])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(t_sum)
    story.append(Spacer(1, 12))

    # Cryptographic Findings Table
    story.append(Paragraph("Cryptographic Asset Inventory & Migration Roadmap", h2_style))
    asset_rows = [
        [Paragraph("Asset", table_header), Paragraph("Status", table_header), Paragraph("QARS", table_header), Paragraph("NIST Replacement", table_header), Paragraph("Location", table_header)]
    ]
    for a in result.assets[:50]:
        status_color = colors.HexColor('#dc2626') if a.quantum_status == 'BROKEN' else (colors.HexColor('#d97706') if a.quantum_status == 'WEAKENED' else colors.HexColor('#16a34a'))
        asset_rows.append([
            Paragraph(f"<b>{a.algorithm}</b><br/>{a.type}", table_text),
            Paragraph(f"<b>{a.quantum_status}</b>", ParagraphStyle('Status', parent=table_text, textColor=status_color)),
            Paragraph(str(a.qars_score), table_text),
            Paragraph(f"{a.replacement}<br/><i>{a.nist_standard}</i>", table_text),
            Paragraph(f"{a.file}:{a.line}", table_text),
        ])
    t_assets = Table(asset_rows, colWidths=[90, 65, 40, 185, 160])
    t_assets.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_assets)

    doc.build(story)
    return buf.getvalue()


def build_pdf_bytes(result: ScanResult) -> bytes:
    """Render scan result to PDF bytes. Primary: WeasyPrint (HTML/CSS), Secondary: ReportLab."""
    # 1. Primary: WeasyPrint (full Jinja2 HTML template with dark cover page and styling)
    try:
        import weasyprint
        html_content = _render_html(result)
        doc = weasyprint.HTML(string=html_content)
        pdf = doc.write_pdf()
        if pdf and pdf[:4] == b"%PDF":
            return pdf
    except Exception:
        pass

    # 2. Secondary: ReportLab (generates genuine binary PDF)
    try:
        pdf = _build_reportlab_pdf(result)
        if pdf and pdf[:4] == b"%PDF":
            return pdf
    except Exception:
        pass

    # 3. Emergency fallback: HTML bytes (will be served as text/html with .html extension)
    return _render_html(result).encode("utf-8")


def export_to_pdf(scan_id: str):
    """Export a stored scan as a downloadable PDF audit report."""
    from .. import cache as scan_cache
    from fastapi import HTTPException
    from fastapi.responses import Response

    # Try the shared cache first (has full ScanResult including Mosca)
    result = scan_cache.get(scan_id)

    # Fallback: full ScanResult from SQLite persistence (survives restarts)
    if not result:
        try:
            from ..db import get_scan
            result = get_scan(scan_id)
        except Exception:
            result = None

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
        is_pdf = (pdf_bytes[:4] == b"%PDF")
        media = "application/pdf" if is_pdf else "text/html; charset=utf-8"
        filename = f"{scan_id}_audit_report.pdf" if is_pdf else f"{scan_id}_audit_report.html"
        return Response(
            content=pdf_bytes,
            media_type=media,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
