"""
ECDAT — FastAPI Application
All API routes for the Enterprise Cryptographic Discovery & Analysis Tool.
Owner: Shaurya Pratap Singh
"""

import logging
import os
import shutil
import zipfile
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import cache as scan_cache
from .models import (
    ScanResult, ScanSummary, HealthResponse,
    TLSProbeResult, RemediationRequest, RemediationResult,
)
from .config import APP_VERSION, TEMP_DIR, MAX_UPLOAD_BYTES, CORS_ORIGINS

logger = logging.getLogger("ecdat")

# Scanner imports
from .scanners.python_scanner import scan_python_directory
from .scanners.java_scanner import scan_java_directory
from .scanners.cert_parser import scan_certs_in_directory
from .scanners.config_parser import scan_configs_in_directory
from .scanners.tls_probe import probe_tls

# Engine imports
from .engines.inventory import build_inventory
from .engines.risk_classifier import classify_inventory, assign_criticality
from .engines.qars import score_inventory
from .engines.mosca import evaluate_mosca, apply_mosca_to_assets
from .engines.recommender import enrich_with_recommendations

# Database persistence
from .db import init_db, save_scan, list_scans, get_scan, delete_scan

app = FastAPI(
    title="ECDAT Backend",
    description="Enterprise Cryptographic Discovery & Analysis Tool — NTRO SIH26164",
    version=APP_VERSION,
)

# Initialize SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Allow the Next.js frontend on localhost:3000. Explicit origins only —
# "*" combined with allow_credentials=True is rejected by browsers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe_extract_zip(zf: zipfile.ZipFile, dest_dir: Path) -> None:
    """
    Extract a ZIP archive without allowing zip-slip path traversal.

    Rejects any entry whose normalized path is absolute or contains "..",
    or that would resolve outside the extraction directory.
    """
    if not zf.namelist():
        raise HTTPException(status_code=400, detail="ZIP archive contains no files")

    dest_root = dest_dir.resolve()
    for name in zf.namelist():
        # Normalize Windows-style separators; reject absolute / parent paths
        norm = name.replace("\\", "/")
        drive_prefix = len(norm) >= 2 and norm[1] == ":" and norm[0].isalpha()
        if norm.startswith("/") or ".." in norm.split("/") or drive_prefix:
            raise HTTPException(
                status_code=400,
                detail=f"ZIP entry '{name}' is unsafe (path traversal)",
            )
        target = (dest_root / norm).resolve()
        if not str(target).startswith(str(dest_root) + os.sep):
            raise HTTPException(
                status_code=400,
                detail=f"ZIP entry '{name}' escapes the extraction directory",
            )
    zf.extractall(dest_dir)


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
    x_years: Optional[float] = Form(None, description="Data shelf life (years). Leave empty to use data_category preset."),
    y_years: Optional[float] = Form(None, description="Migration time estimate (years). Leave empty for default."),
    z_years: float = Form(7.0, description="Q-Day estimate (years, default=7)"),
    data_category: Optional[DataCategory] = Form(DataCategory.financial, description="Preset category for data retention & sensitivity"),
    exposure_context: ExposureContext = Form(ExposureContext.internal, description="Network exposure level of the asset"),
    deep_ai_scan: bool = Form(False, description="Run Gemini-backed AI deep scan (USP 1); offline heuristics run regardless"),
):
    """
    Main scan endpoint. Upload a ZIP file containing source code, certificates,
    and/or config files. Returns a complete ScanResult with all crypto assets,
    QARS scores, and Mosca analysis.
    """
    # Treat 0.0 as "not provided" — let data_category preset handle it
    parsed_x = x_years if (x_years and x_years > 0) else None
    parsed_y = y_years if (y_years and y_years > 0) else None
    parsed_z = z_years if z_years > 0 else 7.0

    # ─── 1. Validate & stream the upload to disk ───────────────────────────────
    if not file.filename or Path(file.filename).suffix.lower() != ".zip":
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    tmp_dir = Path(tempfile.mkdtemp(dir=TEMP_DIR))
    zip_path = tmp_dir / "upload.zip"
    extract_dir = tmp_dir / "extracted"

    try:
        # Stream in 1 MB chunks with a hard size cap so oversized uploads are
        # rejected early instead of being buffered entirely into memory.
        received = 0
        with open(zip_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                received += len(chunk)
                if received > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Upload exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit",
                    )
                f.write(chunk)

        if received == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # ─── 2. Validate & safely extract ZIP (zip-slip protected) ─────────────
        extract_dir.mkdir()
        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                _safe_extract_zip(zf, extract_dir)
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid or corrupted ZIP file")

        # ─── 3. Run All Scanners ───────────────────────────────────────────────
        raw_assets = []

        # Python AST scanner
        py_assets = scan_python_directory(str(extract_dir))
        raw_assets.extend(py_assets)

        # Java Cryptography scanner
        java_assets = scan_java_directory(str(extract_dir))
        raw_assets.extend(java_assets)

        # AI Semantic Analyzer (USP 1) — catches crypto hidden in wrapper
        # classes / dynamic code that the static AST scanner misses.
        # Offline heuristics always run; Gemini deep analysis is opt-in via
        # deep_ai_scan (and still falls back to heuristics when keyless).
        try:
            from .ai.semantic_analyzer import run_semantic_analysis, crypto_family
            static_keys = {
                f"{crypto_family(a.algorithm)}|{a.file_path or ''}"
                for a in py_assets
            }
            ai_assets = run_semantic_analysis(
                str(extract_dir),
                skip_keys=static_keys,
                use_gemini=deep_ai_scan,
            )
            if ai_assets:
                logger.info("AI semantic analyzer found %d additional asset(s)", len(ai_assets))
                raw_assets.extend(ai_assets)
        except Exception as exc:  # semantic analysis must never break the core scan
            logger.warning("AI semantic analysis skipped: %s", exc)

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

        # ─── 10b. Sync frontend alias fields after all engines have run ────────
        # Engines mutate canonical fields post-construction; refresh the
        # file/line/replacement/attack_vector/nist_standard aliases now so the
        # API response, cache and SQLite copy are all consistent.
        for asset in inventory:
            asset.sync_aliases()

        # ─── 11. Compute Summary ──────────────────────────────────────────────
        total = len(inventory)
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "safe": 0}
        for a in inventory:
            counts[a.criticality] = counts.get(a.criticality, 0) + 1

        safe_count = sum(1 for a in inventory if a.quantum_status == "SAFE")
        readiness_pct = round((safe_count / total * 100), 1) if total > 0 else 0.0

        languages = sorted(list(set(a.language for a in inventory if a.language)))
        py_files = sum(1 for _ in extract_dir.rglob("*.py"))
        java_files = sum(1 for _ in extract_dir.rglob("*.java"))
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
            files_scanned=py_files + java_files + cert_files + conf_files,
        )

        # ─── 12. Build Final Result ────────────────────────────────────────────
        result = ScanResult(
            target_name=file.filename,
            summary=summary,
            mosca=mosca,
            assets=inventory,
        )

        # Register in memory cache for immediate exports and AI remediation
        try:
            from .ai.code_remediator import register_scan
            register_scan(result.scan_id, result.assets)
        except Exception:
            pass

        # Keep the full ScanResult in the shared in-memory cache so exports
        # carry Mosca / summary metadata even before SQLite flush
        try:
            scan_cache.save(result.scan_id, result)
        except Exception:
            pass

        # Persist scan to SQLite database
        try:
            save_scan(result, data_category=cat_str, exposure_context=exp_str)
        except Exception as db_err:
            print(f"[WARN] Database persistence failed: {db_err}")

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

@app.get("/api/pqc/proof", tags=["PQC"])
@app.get("/api/demo/pqc", tags=["PQC"])
def pqc_proof():
    """
    Live PQC operational verification using liboqs-python.
    Executes ML-KEM-768 key encapsulation and ML-DSA-65 digital signatures to verify NIST PQC algorithms.
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


# ─── Export Endpoints (Owner: Aujasya) ────────────────────────────────────────

@app.get("/api/export/cbom", tags=["Export"])
def export_cbom(scan_id: str = Query(...)):
    """Export scan results as CycloneDX 1.6 CBOM JSON. (Owner: Aujasya)"""
    try:
        from .exporters.cbom_exporter import export_to_cbom
        return export_to_cbom(scan_id)
    except HTTPException:
        raise  # let 404 "scan not found" pass through
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"CBOM exporter: {e}")


@app.get("/api/export/csv", tags=["Export"])
def export_csv(scan_id: str = Query(...)):
    """Export scan results as CSV. (Owner: Aujasya)"""
    try:
        from .exporters.csv_exporter import export_to_csv
        return export_to_csv(scan_id)
    except HTTPException:
        raise  # let 404 "scan not found" pass through
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"CSV exporter: {e}")


@app.get("/api/export/pdf", tags=["Export"])
def export_pdf(scan_id: str = Query(...)):
    """Export scan results as PDF audit report. (Owner: Aujasya)"""
    try:
        from .exporters.pdf_report import export_to_pdf
        return export_to_pdf(scan_id)
    except HTTPException:
        raise  # let 404 "scan not found" pass through
    except Exception as e:
        raise HTTPException(status_code=501, detail=f"PDF exporter: {e}")


# ─── Scan History / Persistence Endpoints ─────────────────────────────────────

@app.get("/api/scans", tags=["History"])
def get_scan_history(limit: int = Query(50, ge=1, le=200, description="Max number of scans to return")):
    """List historical scan summaries stored in SQLite."""
    return list_scans(limit=limit)


@app.get("/api/scans/{scan_id}", response_model=ScanResult, tags=["History"])
@app.get("/api/scan/{scan_id}", response_model=ScanResult, tags=["History"])
def get_scan_by_id(scan_id: str):
    """Retrieve full details of a previous scan by ID (or 'latest' for the most recent scan)."""
    if scan_id == "latest":
        recent = list_scans(limit=1)
        if not recent:
            raise HTTPException(status_code=404, detail="No scans found in history")
        scan_id = recent[0]["scan_id"]

    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan with ID '{scan_id}' not found")
    return scan


@app.delete("/api/scans/{scan_id}", tags=["History"])
def delete_scan_by_id(scan_id: str):
    """Delete a scan record from history."""
    deleted = delete_scan(scan_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Scan with ID '{scan_id}' not found")
    return {"status": "ok", "message": f"Scan {scan_id} deleted successfully"}
