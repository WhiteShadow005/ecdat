"""
ECDAT — FastAPI Application
All API routes for the Enterprise Cryptographic Discovery & Analysis Tool.
Owner: Shaurya Pratap Singh
"""

import os
import shutil
import zipfile
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import (
    ScanResult, ScanSummary, HealthResponse,
    TLSProbeResult, RemediationRequest, RemediationResult,
)
from .config import APP_VERSION, TEMP_DIR

# Scanner imports
from .scanners.python_scanner import scan_python_directory
from .scanners.cert_parser import scan_certs_in_directory
from .scanners.config_parser import scan_configs_in_directory
from .scanners.tls_probe import probe_tls

# Engine imports
from .engines.inventory import build_inventory
from .engines.risk_classifier import classify_inventory, assign_criticality
from .engines.qars import score_inventory
from .engines.mosca import evaluate_mosca, apply_mosca_to_assets
from .engines.recommender import enrich_with_recommendations

app = FastAPI(
    title="ECDAT Backend",
    description="Enterprise Cryptographic Discovery & Analysis Tool — NTRO SIH26164",
    version=APP_VERSION,
)

# Allow frontend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ──────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse, tags=["Meta"])
def health_check():
    """Quick health check. Returns 200 if the backend is running."""
    return HealthResponse()


from enum import Enum


class DataCategory(str, Enum):
    defense = "defense"
    financial = "financial"
    health = "health"
    pii = "pii"
    infrastructure = "infrastructure"
    session = "session"


class ExposureContext(str, Enum):
    public_api = "public_api"
    internal = "internal"
    local = "local"


def _parse_optional_float(val) -> Optional[float]:
    """Parse float from form input, treating '', 0, or None as None to let category defaults apply."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val) if float(val) > 0 else None
    s = str(val).strip()
    if not s or s == "string":
        return None
    try:
        f = float(s)
        return f if f > 0 else None
    except ValueError:
        return None


# ─── Main Scan Endpoint ────────────────────────────────────────────────────────

@app.post("/api/scan", response_model=ScanResult, tags=["Scan"])
async def scan_upload(
    file: UploadFile = File(..., description="ZIP archive of the target codebase/repo"),
    x_years: Optional[str] = Form(None, description="Data shelf life (years). Leave empty to use data_category preset."),
    y_years: Optional[str] = Form(None, description="Migration time estimate (years). Leave empty for default."),
    z_years: Optional[str] = Form("7", description="Q-Day estimate (years, default=7)"),
    data_category: Optional[DataCategory] = Form(DataCategory.financial, description="Preset category for data retention & sensitivity"),
    exposure_context: ExposureContext = Form(ExposureContext.internal, description="Network exposure level of the asset"),
):
    """
    Main scan endpoint. Upload a ZIP file containing source code, certificates,
    and/or config files. Returns a complete ScanResult with all crypto assets,
    QARS scores, and Mosca analysis.
    """
    parsed_x = _parse_optional_float(x_years)
    parsed_y = _parse_optional_float(y_years)
    parsed_z = _parse_optional_float(z_years) or 7.0

    # ─── 1. Save uploaded ZIP ──────────────────────────────────────────────────
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    tmp_dir = Path(tempfile.mkdtemp(dir=TEMP_DIR))
    zip_path = tmp_dir / "upload.zip"

    try:
        contents = await file.read()
        with open(zip_path, "wb") as f:
            f.write(contents)

        # ─── 2. Extract ZIP ────────────────────────────────────────────────────
        extract_dir = tmp_dir / "extracted"
        extract_dir.mkdir()
        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extract_dir)
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid or corrupted ZIP file")

        # ─── 3. Run All Scanners ───────────────────────────────────────────────
        raw_assets = []

        # Python AST scanner
        py_assets = scan_python_directory(str(extract_dir))
        raw_assets.extend(py_assets)

        # X.509 Certificate parser
        cert_assets = scan_certs_in_directory(str(extract_dir))
        raw_assets.extend(cert_assets)

        # Config file scanner
        config_assets = scan_configs_in_directory(str(extract_dir))
        raw_assets.extend(config_assets)

        # ─── 4. Build Unified Inventory ────────────────────────────────────────
        inventory = build_inventory(raw_assets)

        # ─── 5. Classify (BROKEN/WEAKENED/SAFE) ───────────────────────────────
        inventory = classify_inventory(inventory)

        # ─── 6. Mosca Theorem Evaluation ──────────────────────────────────────
        cat_str = data_category.value if isinstance(data_category, DataCategory) else (data_category or "financial")
        exp_str = exposure_context.value if isinstance(exposure_context, ExposureContext) else (exposure_context or "internal")

        mosca = evaluate_mosca(
            x_years=parsed_x,
            y_years=parsed_y,
            z_years=parsed_z,
            data_category=cat_str,
        )

        # ─── 7. QARS Scoring ──────────────────────────────────────────────────
        inventory = score_inventory(
            inventory,
            mosca=mosca,
            data_category=cat_str,
            exposure_context=exp_str,
        )

        # ─── 8. Assign Criticality Tiers ──────────────────────────────────────
        for asset in inventory:
            assign_criticality(asset)

        # ─── 9. Apply Mosca to Assets ─────────────────────────────────────────
        inventory = apply_mosca_to_assets(inventory, mosca)

        # ─── 10. Enrich with Migration Recommendations ─────────────────────────
        inventory = enrich_with_recommendations(inventory)

        # ─── 11. Compute Summary ──────────────────────────────────────────────
        total = len(inventory)
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "safe": 0}
        for a in inventory:
            counts[a.criticality] = counts.get(a.criticality, 0) + 1

        safe_count = sum(1 for a in inventory if a.quantum_status == "SAFE")
        readiness_pct = round((safe_count / total * 100), 1) if total > 0 else 0.0

        languages = list(set(a.language for a in inventory if a.language))
        py_files = sum(1 for _ in extract_dir.rglob("*.py"))
        cert_files = sum(1 for _ in extract_dir.rglob("*.pem")) + sum(1 for _ in extract_dir.rglob("*.crt"))
        conf_files = sum(1 for _ in extract_dir.rglob("*.conf"))

        summary = ScanSummary(
            total_assets=total,
            critical=counts["critical"],
            high=counts["high"],
            medium=counts["medium"],
            low=counts.get("low", 0),
            safe=counts["safe"],
            quantum_readiness_pct=readiness_pct,
            languages_scanned=languages,
            files_scanned=py_files + cert_files + conf_files,
        )

        # ─── 12. Build Final Result ────────────────────────────────────────────
        result = ScanResult(
            target_name=file.filename,
            summary=summary,
            mosca=mosca,
            assets=inventory,
        )

        # Register in scan cache for exports and AI remediation
        try:
            from .ai.code_remediator import register_scan
            register_scan(result.scan_id, result.assets)
        except Exception:
            pass

        return result

    finally:
        # Clean up temp files
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ─── TLS Probe Endpoint ────────────────────────────────────────────────────────

@app.get("/api/probe", response_model=TLSProbeResult, tags=["Scan"])
def tls_probe(
    url: str = Query(..., description="Hostname or URL to probe (e.g., example.com)"),
    port: int = Query(443, description="Port to probe (default: 443)"),
):
    """
    Live TLS probe. Connects to url:port, extracts TLS version, cipher suite,
    and certificate algorithm. Returns a TLSProbeResult with quantum risk assessment.
    """
    # Strip protocol prefixes
    host = url.replace("https://", "").replace("http://", "").split("/")[0]
    return probe_tls(host=host, port=port)


# ─── AI Remediation Endpoint ───────────────────────────────────────────────────

@app.post("/api/remediate", tags=["AI"])
def remediate_asset(request: RemediationRequest):
    """
    AI Code Remediator (USP 2).
    Given an asset_id from a previous scan, generate a Git diff patch
    that replaces the vulnerable algorithm with the NIST PQC equivalent.
    Requires GEMINI_API_KEY to be set in .env
    """
    try:
        from .ai.code_remediator import generate_remediation
        result = generate_remediation(request.asset_id, request.scan_id)
        return result
    except ImportError:
        raise HTTPException(status_code=503, detail="AI module not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── PQC Live Proof Endpoint ───────────────────────────────────────────────────

@app.get("/api/demo/pqc", tags=["Demo"])
def pqc_proof():
    """
    Live PQC demonstration using liboqs-python.
    Runs ML-KEM-768 key encapsulation and ML-DSA-65 signing to prove PQC works.
    """
    try:
        from .ai.pqc_proof import run_pqc_demo
        return run_pqc_demo()
    except ImportError:
        return {
            "message": "liboqs-python not installed. Run: pip install liboqs-python",
            "note": "PQC demo requires the Open Quantum Safe liboqs C library + Python bindings"
        }
    except Exception as e:
        return {"error": str(e), "message": "PQC demo failed — is liboqs installed?"}


# ─── Export Endpoints (stub — Ojasya implements these) ────────────────────────

@app.get("/api/export/cbom", tags=["Export"])
def export_cbom(scan_id: str = Query(...)):
    """Export scan results as CycloneDX 1.6 CBOM JSON. (Owner: Ojasya)"""
    try:
        from .exporters.cbom_exporter import export_to_cbom
        return export_to_cbom(scan_id)
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"CBOM exporter: {e}")


@app.get("/api/export/csv", tags=["Export"])
def export_csv(scan_id: str = Query(...)):
    """Export scan results as CSV. (Owner: Ojasya)"""
    try:
        from .exporters.csv_exporter import export_to_csv
        return export_to_csv(scan_id)
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"CSV exporter: {e}")


@app.get("/api/export/pdf", tags=["Export"])
def export_pdf(scan_id: str = Query(...)):
    """Export scan results as PDF audit report. (Owner: Ojasya)"""
    try:
        from .exporters.pdf_report import export_to_pdf
        return export_to_pdf(scan_id)
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"PDF exporter: {e}")
