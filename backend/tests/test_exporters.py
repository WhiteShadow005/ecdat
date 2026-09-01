"""
ECDAT — Exporter Tests
Tests for CycloneDX 1.6 CBOM generator, CSV export, and PDF rendering.
Owner: Sahil Sharma
Run: python -m pytest backend/tests/test_exporters.py -v
"""

import sys
import json
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import CryptoAsset, ScanResult, ScanSummary, MoscaResult
from app.exporters.cbom_exporter import build_cbom_json
from app.exporters.csv_exporter import build_csv_string
from app.exporters.pdf_report import _render_html


@pytest.fixture
def sample_assets():
    return [
        CryptoAsset(
            id="asset-001",
            algorithm="RSA-2048",
            type="algorithm",
            primitive="asymmetric",
            key_size=2048,
            quantum_status="BROKEN",
            qars_score=88,
            file_path="src/auth/jwt_signer.py",
            line_number=42,
            language="python",
            library_used="cryptography",
            code_snippet="rsa.generate_private_key(65537, 2048)",
            recommended_replacement="ML-KEM-768 (FIPS 203)",
            criticality="critical",
            mosca_status="CRITICAL",
        ),
        CryptoAsset(
            id="asset-002",
            algorithm="AES-256",
            type="algorithm",
            primitive="symmetric",
            key_size=256,
            quantum_status="SAFE",
            qars_score=15,
            file_path="src/storage/vault.py",
            line_number=18,
            language="python",
            library_used="pycryptodome",
            code_snippet="AES.new(key, AES.MODE_GCM)",
            recommended_replacement="None required",
            criticality="safe",
            mosca_status="SAFE",
        ),
    ]


class TestCBOMExporter:
    def test_build_cbom_structure(self, sample_assets):
        """CBOM output must conform to CycloneDX 1.6 format."""
        cbom = build_cbom_json(sample_assets, target_name="test_repo.zip", scan_id="scan-123")
        assert cbom["bomFormat"] == "CycloneDX"
        assert cbom["specVersion"] == "1.6"
        assert "serialNumber" in cbom
        assert len(cbom["components"]) == 2

    def test_cbom_crypto_properties(self, sample_assets):
        """Components must have cryptographic-asset type and cryptoProperties."""
        cbom = build_cbom_json(sample_assets, target_name="test_repo.zip", scan_id="scan-123")
        c1 = cbom["components"][0]
        assert c1["type"] == "cryptographic-asset"
        assert c1["name"] == "RSA-2048"
        assert "cryptoProperties" in c1
        assert c1["cryptoProperties"]["assetType"] == "algorithm"
        assert c1["cryptoProperties"]["algorithmProperties"]["parameterSetIdentifier"] == "2048"
        assert c1["cryptoProperties"]["algorithmProperties"]["nistQuantumSecurityLevel"] == 0

    def test_cbom_custom_properties(self, sample_assets):
        """ECDAT risk score and replacement should be serialized in properties."""
        cbom = build_cbom_json(sample_assets, target_name="test_repo.zip", scan_id="scan-123")
        c1 = cbom["components"][0]
        prop_map = {p["name"]: p["value"] for p in c1["properties"]}
        assert prop_map["ecdat:quantumStatus"] == "BROKEN"
        assert prop_map["ecdat:qarsRiskScore"] == "88"
        assert prop_map["ecdat:recommendedReplacement"] == "ML-KEM-768 (FIPS 203)"


class TestCSVExporter:
    def test_csv_output_contains_headers_and_rows(self, sample_assets):
        """CSV export must include standard header and all asset rows."""
        csv_text = build_csv_string(sample_assets)
        assert "Asset ID,Algorithm,Type,Quantum Status,QARS Score" in csv_text
        assert "RSA-2048" in csv_text
        assert "AES-256" in csv_text
        assert "src/auth/jwt_signer.py" in csv_text


class TestPDFTemplateRenderer:
    def test_html_render(self, sample_assets):
        """Jinja2 template should render valid HTML with asset metrics."""
        scan_res = ScanResult(
            scan_id="scan-test",
            target_name="demo.zip",
            summary=ScanSummary(total_assets=2, critical=1, safe=1, quantum_readiness_pct=50.0),
            mosca=MoscaResult(x_shelf_life_years=10, y_migration_years=4, z_qday_years=7),
            assets=sample_assets,
        )
        html = _render_html(scan_res)
        assert "ECDAT" in html
        assert "RSA-2048" in html
        assert "50.0%" in html
