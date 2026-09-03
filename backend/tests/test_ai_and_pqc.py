"""
ECDAT — Unit Tests for Aujasya's Backend Dev 2 Deliverables
Covers: Shared Cache, CBOM Exporter, CSV Exporter, PDF Exporter,
AI Semantic Analyzer, AI Code Remediator, and PQC Demo.

Owner: Aujasya Rajput
Run: python -m pytest backend/tests/test_ai_and_pqc.py -v
"""

import sys
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import CryptoAsset, ScanResult, ScanSummary, MoscaResult
from app import cache as scan_cache
from app.exporters.cbom_exporter import build_cbom_json, export_to_cbom
from app.exporters.csv_exporter import build_csv_string
from app.exporters.pdf_report import build_pdf_bytes, _render_html
from app.ai.semantic_analyzer import _heuristic_semantic_detection, _extract_suspicious_functions
from app.ai.code_remediator import generate_remediation, register_scan
from app.ai.pqc_proof import run_pqc_demo


@pytest.fixture
def test_assets():
    return [
        CryptoAsset(
            id="asset-t1",
            algorithm="RSA-2048",
            type="algorithm",
            primitive="asymmetric",
            key_size=2048,
            quantum_status="BROKEN",
            qars_score=92,
            file_path="src/auth/jwt_signer.py",
            line_number=16,
            language="python",
            library_used="cryptography",
            code_snippet="private_key = rsa.generate_private_key(65537, 2048)",
            recommended_replacement="ML-KEM-768 (FIPS 203)",
            criticality="critical",
            mosca_status="CRITICAL",
            notes="Active HNDL threat",
        ),
        CryptoAsset(
            id="asset-t2",
            algorithm="AES-256",
            type="algorithm",
            primitive="symmetric",
            key_size=256,
            quantum_status="SAFE",
            qars_score=10,
            file_path="src/vault.py",
            line_number=5,
            language="python",
            library_used="pycryptodome",
            code_snippet="AES.new(key, AES.MODE_GCM)",
            recommended_replacement=None,
            criticality="safe",
            mosca_status="SAFE",
        ),
    ]


class TestSharedCache:
    def test_save_and_retrieve_scan(self, test_assets):
        scan_id = "test-cache-001"
        res = ScanResult(
            scan_id=scan_id,
            target_name="test.zip",
            summary=ScanSummary(total_assets=2, critical=1, safe=1, quantum_readiness_pct=50.0),
            assets=test_assets,
        )
        scan_cache.save(scan_id, res)
        retrieved = scan_cache.get(scan_id)
        assert retrieved is not None
        assert retrieved.scan_id == scan_id
        assert len(retrieved.assets) == 2

    def test_get_asset_by_id(self, test_assets):
        scan_id = "test-cache-002"
        scan_cache.save_assets(scan_id, test_assets)
        asset = scan_cache.get_asset_by_id(scan_id, "asset-t1")
        assert asset is not None
        assert asset.algorithm == "RSA-2048"

        missing = scan_cache.get_asset_by_id(scan_id, "nonexistent")
        assert missing is None


class TestCBOMEnhancements:
    def test_cbom_has_vulnerability_status(self, test_assets):
        cbom = build_cbom_json(test_assets, target_name="test.zip", scan_id="scan-cbom-test")
        c1 = cbom["components"][0]
        prop_names = [p["name"] for p in c1["properties"]]
        assert "ecdat:vulnerabilityStatus" in prop_names
        assert "ecdat:quantumStatus" in prop_names

    def test_cbom_vulnerabilities_array(self, test_assets):
        cbom = build_cbom_json(test_assets, target_name="test.zip", scan_id="scan-cbom-test")
        broken_comp = cbom["components"][0]
        assert "vulnerabilities" in broken_comp
        assert len(broken_comp["vulnerabilities"]) >= 1
        assert "ECDAT-" in broken_comp["vulnerabilities"][0]["id"]

    def test_cbom_external_references(self, test_assets):
        cbom = build_cbom_json(test_assets, target_name="test.zip", scan_id="scan-cbom-test")
        c1 = cbom["components"][0]
        assert "externalReferences" in c1
        assert any("NIST" in ref.get("comment", "") for ref in c1["externalReferences"])

    def test_export_to_cbom_uses_cache(self, test_assets):
        scan_id = "scan-cbom-cache"
        scan_cache.save_assets(scan_id, test_assets)
        cbom = export_to_cbom(scan_id)
        assert cbom.get("bomFormat") == "CycloneDX"
        assert len(cbom.get("components", [])) == 2


class TestPDFReportEnhancements:
    def test_html_render_includes_recommendations(self, test_assets):
        res = ScanResult(
            scan_id="scan-pdf-test",
            target_name="demo.zip",
            summary=ScanSummary(total_assets=2, critical=1, safe=1, quantum_readiness_pct=50.0),
            mosca=MoscaResult(x_shelf_life_years=10, y_migration_years=4, z_qday_years=7),
            assets=test_assets,
        )
        html = _render_html(res)
        assert "PQC Migration Recommendations" in html
        assert "ML-KEM-768" in html
        assert "Risk Distribution" in html

    def test_pdf_bytes_generation(self, test_assets):
        res = ScanResult(
            scan_id="scan-pdf-gen",
            target_name="demo.zip",
            summary=ScanSummary(total_assets=2, critical=1, safe=1, quantum_readiness_pct=50.0),
            assets=test_assets,
        )
        data = build_pdf_bytes(res)
        assert len(data) > 0


class TestAISemanticAnalyzer:
    def test_heuristic_detection_md5(self):
        res = _heuristic_semantic_detection("raw = hashlib.md5(data).digest()", "generate_token")
        assert res["detected"] is True
        assert res["algorithm"] == "MD5"

    def test_heuristic_detection_aes(self):
        res = _heuristic_semantic_detection("cipher = AES.new(key, AES.MODE_CBC)", "protect_payload")
        assert res["detected"] is True
        assert res["algorithm"] == "AES-128"


class TestAICodeRemediator:
    def test_remediation_diff_structure(self, test_assets):
        register_scan("scan-rem-t", test_assets)
        result = generate_remediation("asset-t1", "scan-rem-t")
        assert result.asset_id == "asset-t1"
        assert "--- a/" in result.diff
        assert "+++ b/" in result.diff
        assert "ML-KEM-768" in result.replacement_algorithm


class TestPQCProofDemo:
    def test_pqc_demo_structure(self):
        res = run_pqc_demo()
        assert res.kem_algorithm != ""
        assert res.sig_algorithm != ""
        assert res.message != ""
