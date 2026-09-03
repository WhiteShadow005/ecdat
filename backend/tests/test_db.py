"""
ECDAT — Database Persistence Unit Tests
Tests SQLite scan history storage and retrieval.
Owner: Shaurya Pratap Singh
"""

import pytest
from app.models import ScanResult, ScanSummary, MoscaResult, CryptoAsset
from app.db import init_db, save_scan, get_scan, list_scans, delete_scan


@pytest.fixture
def dummy_scan():
    asset = CryptoAsset(
        id="asset-test-01",
        algorithm="RSA-2048",
        quantum_status="BROKEN",
        qars_score=95,
        file_path="src/Test.java",
        line_number=10,
        language="java",
    )
    return ScanResult(
        scan_id="scan-db-unit-test-123",
        target_name="enterprise_app.zip",
        summary=ScanSummary(total_assets=1, critical=1, safe=0, quantum_readiness_pct=0.0),
        mosca=MoscaResult(x_shelf_life_years=10, y_migration_years=4, z_qday_years=7, status="CRITICAL"),
        assets=[asset],
    )


class TestDatabasePersistence:

    def test_save_and_retrieve_scan(self, dummy_scan):
        init_db()
        saved = save_scan(dummy_scan, data_category="defense", exposure_context="public_api")
        assert saved is True

        retrieved = get_scan(dummy_scan.scan_id)
        assert retrieved is not None
        assert retrieved.scan_id == dummy_scan.scan_id
        assert retrieved.target_name == "enterprise_app.zip"
        assert retrieved.summary.total_assets == 1
        assert retrieved.summary.critical == 1
        assert len(retrieved.assets) == 1
        assert retrieved.assets[0].algorithm == "RSA-2048"

    def test_list_scans_includes_saved(self, dummy_scan):
        save_scan(dummy_scan)
        scans = list_scans(limit=10)
        assert len(scans) >= 1
        scan_ids = [s["scan_id"] for s in scans]
        assert dummy_scan.scan_id in scan_ids

    def test_get_nonexistent_scan_returns_none(self):
        result = get_scan("nonexistent-scan-id-xyz")
        assert result is None

    def test_delete_scan(self, dummy_scan):
        save_scan(dummy_scan)
        deleted = delete_scan(dummy_scan.scan_id)
        assert deleted is True
        assert get_scan(dummy_scan.scan_id) is None
