"""
ECDAT — QARS Scoring Engine
Quantum-Adjusted Risk Score (0–100) per asset.
Formula: CryptoWeakness(0-40) + ExposureFactor(0-25) + DataCriticality(0-20) + MoscaScore(0-15)
Owner: Shaurya Pratap Singh
"""

from typing import List, Optional
from ..models import CryptoAsset, MoscaResult
from ..config import (
    CRYPTO_WEAKNESS_SCORES,
    EXPOSURE_SCORES,
    DATA_CRITICALITY_SCORES,
)


def compute_mosca_contribution(mosca: Optional[MoscaResult]) -> int:
    """
    Convert Mosca theorem result into a QARS sub-score (0–15).
    CRITICAL → 15, HIGH → 8, SAFE → 0
    """
    if mosca is None:
        return 8  # Default to mid-range if no Mosca data
    if mosca.status == "CRITICAL":
        return 15
    elif mosca.status == "HIGH":
        return 8
    else:
        return 0


def score_asset(
    asset: CryptoAsset,
    mosca: Optional[MoscaResult] = None,
    data_category: str = "unknown",
    exposure_context: str = "unknown",
) -> CryptoAsset:
    """
    Compute QARS score for a single asset and update it in-place.
    Returns the updated asset.
    """
    # Component 1: Crypto Weakness (0–40)
    crypto_score = CRYPTO_WEAKNESS_SCORES.get(asset.quantum_status, 10)

    # Boost for classically broken algorithms (MD5, SHA-1, DES, RC4)
    classically_broken = {"md5", "sha-1", "sha1", "des", "rc4", "ssl", "3des"}
    if any(cb in asset.algorithm.lower() for cb in classically_broken):
        crypto_score = min(crypto_score + 5, 40)

    # Component 2: Exposure Factor (0–25)
    ctx = (asset.exposure_context or exposure_context or "unknown").lower()
    exposure_score = EXPOSURE_SCORES.get(ctx, EXPOSURE_SCORES["unknown"])

    # Component 3: Data Criticality (0–20)
    cat = data_category.lower()
    data_score = DATA_CRITICALITY_SCORES.get(cat, DATA_CRITICALITY_SCORES["unknown"])

    # Component 4: Mosca Score (0–15)
    mosca_score = compute_mosca_contribution(mosca)

    # Final QARS (capped at 100)
    qars = crypto_score + exposure_score + data_score + mosca_score
    asset.qars_score = min(qars, 100)

    return asset


def score_inventory(
    assets: List[CryptoAsset],
    mosca: Optional[MoscaResult] = None,
    data_category: str = "unknown",
    exposure_context: str = "internal",
) -> List[CryptoAsset]:
    """Compute QARS scores for all assets in the inventory."""
    return [
        score_asset(a, mosca, data_category, exposure_context)
        for a in assets
    ]
