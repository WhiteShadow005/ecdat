"""
ECDAT — Engine Tests
Tests for inventory, risk classifier, QARS scorer, and Mosca engine.
Owner: Sahil Sharma
Run: python -m pytest backend/tests/test_engines.py -v
"""

import sys
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import CryptoAsset, MoscaResult
from app.engines.inventory import build_inventory
from app.engines.risk_classifier import classify_asset, classify_inventory
from app.engines.qars import score_asset
from app.engines.mosca import evaluate_mosca
from app.engines.recommender import get_migration_guidance


# ─── Inventory Tests ───────────────────────────────────────────────────────────

class TestInventory:

    def test_deduplication(self):
        """Same algorithm at same file:line should produce one entry."""
        assets = [
            CryptoAsset(algorithm="RSA-2048", file_path="auth.py", line_number=10),
            CryptoAsset(algorithm="RSA-2048", file_path="auth.py", line_number=10),
        ]
        inv = build_inventory(assets)
        assert len(inv) == 1, "Duplicates should be merged into one entry"

    def test_different_locations_not_deduped(self):
        """Same algorithm in different files should be separate entries."""
        assets = [
            CryptoAsset(algorithm="RSA-2048", file_path="auth.py", line_number=10),
            CryptoAsset(algorithm="RSA-2048", file_path="payment.py", line_number=25),
        ]
        inv = build_inventory(assets)
        assert len(inv) == 2

    def test_sequential_ids_assigned(self):
        """Inventory should assign sequential IDs: asset-001, asset-002..."""
        assets = [
            CryptoAsset(algorithm="MD5"),
            CryptoAsset(algorithm="SHA-1"),
            CryptoAsset(algorithm="RSA-2048"),
        ]
        inv = build_inventory(assets)
        ids = [a.id for a in inv]
        assert "asset-001" in ids
        assert "asset-002" in ids
        assert "asset-003" in ids

    def test_empty_input(self):
        """Empty asset list should return empty inventory."""
        assert build_inventory([]) == []

    def test_merge_enriches_snippet(self):
        """When deduplicating, richer data (code_snippet) should be retained."""
        assets = [
            CryptoAsset(algorithm="AES-128", file_path="enc.py", line_number=5, code_snippet=None),
            CryptoAsset(algorithm="AES-128", file_path="enc.py", line_number=5, code_snippet="AES.new(key, AES.MODE_CBC)"),
        ]
        inv = build_inventory(assets)
        assert inv[0].code_snippet == "AES.new(key, AES.MODE_CBC)"


# ─── Risk Classifier Tests ─────────────────────────────────────────────────────

class TestRiskClassifier:

    def test_rsa_is_broken(self):
        """RSA-2048 should be classified as BROKEN."""
        asset = CryptoAsset(algorithm="RSA-2048")
        result = classify_asset(asset)
        assert result.quantum_status == "BROKEN"

    def test_md5_is_broken(self):
        """MD5 should be classified as BROKEN."""
        asset = CryptoAsset(algorithm="MD5")
        result = classify_asset(asset)
        assert result.quantum_status == "BROKEN"

    def test_sha1_is_broken(self):
        """SHA-1 should be classified as BROKEN."""
        asset = CryptoAsset(algorithm="SHA-1")
        result = classify_asset(asset)
        assert result.quantum_status == "BROKEN"

    def test_aes256_is_safe(self):
        """AES-256 should be classified as SAFE."""
        asset = CryptoAsset(algorithm="AES-256")
        result = classify_asset(asset)
        assert result.quantum_status == "SAFE"

    def test_aes128_is_weakened(self):
        """AES-128 should be classified as WEAKENED."""
        asset = CryptoAsset(algorithm="AES-128")
        result = classify_asset(asset)
        assert result.quantum_status == "WEAKENED"

    def test_sha256_is_safe(self):
        """SHA-256 should be classified as SAFE."""
        asset = CryptoAsset(algorithm="SHA-256")
        result = classify_asset(asset)
        assert result.quantum_status == "SAFE"

    def test_ecdsa_is_broken(self):
        """ECDSA should be classified as BROKEN."""
        asset = CryptoAsset(algorithm="ECDSA")
        result = classify_asset(asset)
        assert result.quantum_status == "BROKEN"

    def test_ml_kem_is_safe(self):
        """ML-KEM should be classified as SAFE."""
        asset = CryptoAsset(algorithm="ML-KEM-768")
        result = classify_asset(asset)
        assert result.quantum_status == "SAFE"

    def test_recommended_replacement_set(self):
        """RSA should get a recommended replacement."""
        asset = CryptoAsset(algorithm="RSA-2048")
        result = classify_asset(asset)
        assert result.recommended_replacement is not None
        assert len(result.recommended_replacement) > 0

    def test_unknown_algorithm_gets_unknown_status(self):
        """Completely unknown algorithm should get UNKNOWN status."""
        asset = CryptoAsset(algorithm="XYZ-NONEXISTENT-9999")
        result = classify_asset(asset)
        assert result.quantum_status == "UNKNOWN"


# ─── QARS Scoring Tests ────────────────────────────────────────────────────────

class TestQARS:

    def test_broken_algo_has_high_score(self):
        """BROKEN algorithm in public API should have high QARS."""
        asset = CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN")
        scored = score_asset(asset, exposure_context="public_api", data_category="financial")
        assert scored.qars_score >= 60, f"Expected >= 60 for BROKEN RSA, got {scored.qars_score}"

    def test_safe_algo_has_low_score(self):
        """SAFE algorithm should have low QARS score."""
        asset = CryptoAsset(algorithm="AES-256", quantum_status="SAFE")
        scored = score_asset(asset, exposure_context="local", data_category="session")
        assert scored.qars_score <= 40, f"Expected <= 40 for SAFE AES-256, got {scored.qars_score}"

    def test_score_between_0_and_100(self):
        """QARS score must always be in [0, 100]."""
        for algo, status in [("RSA-2048", "BROKEN"), ("AES-256", "SAFE"), ("AES-128", "WEAKENED")]:
            asset = CryptoAsset(algorithm=algo, quantum_status=status)
            scored = score_asset(asset)
            assert 0 <= scored.qars_score <= 100, f"QARS out of range for {algo}: {scored.qars_score}"

    def test_public_api_higher_than_local(self):
        """Public API exposure should produce higher QARS than local."""
        asset_pub = CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN")
        asset_loc = CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN")
        score_pub = score_asset(asset_pub, exposure_context="public_api").qars_score
        score_loc = score_asset(asset_loc, exposure_context="local").qars_score
        assert score_pub > score_loc


# ─── Mosca Engine Tests ────────────────────────────────────────────────────────

class TestMosca:

    def test_x_plus_y_greater_than_z_is_critical(self):
        """X=15, Y=4, Z=7: 19 > 7 → CRITICAL."""
        result = evaluate_mosca(x_years=15, y_years=4, z_years=7)
        assert result.status == "CRITICAL"
        assert result.x_plus_y == 19.0

    def test_x_plus_y_less_than_z_is_safe(self):
        """X=1, Y=2, Z=7: 3 < 7 → SAFE."""
        result = evaluate_mosca(x_years=1, y_years=2, z_years=7)
        assert result.status == "SAFE"

    def test_x_plus_y_near_z_is_high(self):
        """X=4, Y=2.5, Z=7: 6.5 ≈ 7 (within 1 year) → HIGH."""
        result = evaluate_mosca(x_years=4, y_years=2.5, z_years=7)
        assert result.status == "HIGH"

    def test_defense_category_always_critical(self):
        """Defense data (X=30yr) with Z=7 should always be CRITICAL."""
        result = evaluate_mosca(data_category="defense", z_years=7)
        assert result.status == "CRITICAL"

    def test_session_data_is_safe(self):
        """Session tokens (X=0.003yr) should be SAFE."""
        result = evaluate_mosca(data_category="session", y_years=4, z_years=7)
        assert result.status == "SAFE"

    def test_message_contains_formula(self):
        """Mosca message should explain X, Y, Z values."""
        result = evaluate_mosca(x_years=15, y_years=4, z_years=7)
        assert "15" in result.message or "19" in result.message


# ─── Recommender Tests ─────────────────────────────────────────────────────────

class TestRecommender:

    def test_rsa_gets_ml_kem_recommendation(self):
        """RSA should recommend ML-KEM."""
        asset = CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN")
        guidance = get_migration_guidance(asset)
        assert "ML-KEM" in guidance["primary"] or "FIPS 203" in guidance["primary"]

    def test_ecdsa_gets_ml_dsa_recommendation(self):
        """ECDSA should recommend ML-DSA."""
        asset = CryptoAsset(algorithm="ECDSA", quantum_status="BROKEN")
        guidance = get_migration_guidance(asset)
        assert "ML-DSA" in guidance["primary"] or "FIPS 204" in guidance["primary"]

    def test_aes128_gets_aes256_recommendation(self):
        """AES-128 should recommend AES-256-GCM."""
        asset = CryptoAsset(algorithm="AES-128", quantum_status="WEAKENED")
        guidance = get_migration_guidance(asset)
        assert "AES-256" in guidance["primary"]

    def test_guidance_has_nist_doc(self):
        """All guidance should include a NIST doc reference."""
        asset = CryptoAsset(algorithm="RSA-2048", quantum_status="BROKEN")
        guidance = get_migration_guidance(asset)
        assert "nist_doc" in guidance
        assert len(guidance["nist_doc"]) > 0


# ─── Frontend Alias Sync Tests (regression: aliases went stale after engines) ─

class TestAliasSync:

    def test_aliases_sync_after_classification(self):
        """attack_vector/nist_standard/replacement must reflect engine output."""
        asset = CryptoAsset(algorithm="RSA-2048", file_path="auth.py", line_number=10)
        assert asset.file == "auth.py"   # post_init alias
        assert asset.line == 10

        result = classify_asset(asset)
        assert result.quantum_status == "BROKEN"
        result.sync_aliases()
        assert result.attack_vector == "Shor's Algorithm"
        assert result.nist_standard == "NIST FIPS 203/204"
        assert result.replacement == result.recommended_replacement
        assert result.file == result.file_path
        assert result.line == result.line_number

    def test_aliases_recomputed_when_status_changes(self):
        """Derived aliases must not stay frozen at construction-time values."""
        asset = CryptoAsset(algorithm="AES-128", quantum_status="UNKNOWN")
        assert asset.attack_vector == "None"  # UNKNOWN at construction
        asset.quantum_status = "WEAKENED"
        asset.sync_aliases()
        assert asset.attack_vector == "Grover's Algorithm"
        assert asset.nist_standard == "NIST FIPS 203/204"
