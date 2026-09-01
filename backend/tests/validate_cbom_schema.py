"""
ECDAT — CBOM Schema Validator
Validates exported CycloneDX 1.6 CBOM structures for structural compliance.
Owner: Sahil Sharma
Run: python -m pytest backend/tests/validate_cbom_schema.py -v
"""

import sys
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import CryptoAsset
from app.exporters.cbom_exporter import build_cbom_json


def test_cbom_mandatory_fields():
    """Verify all top-level mandatory CycloneDX 1.6 fields are present."""
    assets = [
        CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN", key_size=2048, primitive="asymmetric"),
        CryptoAsset(algorithm="AES-256", quantum_status="SAFE", key_size=256, primitive="symmetric"),
        CryptoAsset(algorithm="ECDSA-secp256r1", quantum_status="BROKEN", primitive="signature"),
    ]
    cbom = build_cbom_json(assets, target_name="production-repo.zip", scan_id="scan-xyz")

    assert cbom.get("bomFormat") == "CycloneDX"
    assert cbom.get("specVersion") == "1.6"
    assert cbom.get("serialNumber", "").startswith("urn:uuid:")
    assert cbom.get("version") == 1
    assert "metadata" in cbom
    assert "timestamp" in cbom["metadata"]
    assert "tools" in cbom["metadata"]
    assert len(cbom["metadata"]["tools"]) >= 1

    components = cbom.get("components", [])
    assert len(components) == 3

    for comp in components:
        assert comp["type"] == "cryptographic-asset"
        assert "name" in comp
        assert "bom-ref" in comp
        assert "cryptoProperties" in comp
        assert "assetType" in comp["cryptoProperties"]
        assert "properties" in comp
        assert any(p["name"] == "ecdat:quantumStatus" for p in comp["properties"])
        assert any(p["name"] == "ecdat:qarsRiskScore" for p in comp["properties"])
