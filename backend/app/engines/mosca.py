"""
ECDAT — Mosca Theorem Engine
Evaluates X + Y > Z quantum risk inequality for each asset or scan.
Owner: Shaurya Pratap Singh
"""

from typing import List, Optional
from ..models import CryptoAsset, MoscaResult
from ..config import DEFAULT_Z_YEARS, DEFAULT_Y_YEARS, load_crypto_rules


def _get_data_categories() -> dict:
    rules = load_crypto_rules()
    return rules.get("data_categories", {})


def evaluate_mosca(
    x_years: Optional[float] = None,
    y_years: Optional[float] = None,
    z_years: float = DEFAULT_Z_YEARS,
    data_category: Optional[str] = None,
) -> MoscaResult:
    """
    Evaluate Mosca's Theorem: X + Y > Z → CRITICAL (HNDL threat active).

    Args:
        x_years:       Data confidentiality shelf life (years). If None, use data_category preset.
        y_years:       Estimated PQC migration timeline (years). If None, use default.
        z_years:       Estimated years until CRQC arrives (default: 7).
        data_category: Preset category name (e.g., "defense", "financial").

    Returns:
        MoscaResult with status (CRITICAL / HIGH / SAFE) and explanation.
    """
    # Resolve X from data_category if not explicitly given
    if x_years is None:
        categories = _get_data_categories()
        cat = (data_category or "infrastructure").lower()
        if cat in categories:
            x_years = float(categories[cat]["x_years"])
        else:
            x_years = 15.0  # Sensible default for critical infrastructure

    # Resolve Y from default if not given
    if y_years is None:
        y_years = DEFAULT_Y_YEARS

    return MoscaResult(
        x_shelf_life_years=x_years,
        y_migration_years=y_years,
        z_qday_years=z_years,
        data_category=data_category,
    )


def apply_mosca_to_assets(
    assets: List[CryptoAsset],
    mosca: MoscaResult,
) -> List[CryptoAsset]:
    """
    Apply Mosca status to each BROKEN/WEAKENED asset in the inventory.
    SAFE assets get SAFE mosca status regardless of global Mosca result.
    """
    for asset in assets:
        if asset.quantum_status == "SAFE":
            asset.mosca_status = "SAFE"
        else:
            asset.mosca_status = mosca.status
    return assets
