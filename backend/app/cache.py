"""
ECDAT — Shared Scan Result Cache
A single in-memory store that all of Aujasya's modules read from.
Exporters, remediator, and PDF report all use this instead of each
importing _scan_cache from code_remediator (which was a hidden coupling).

Owner: Aujasya Rajput
"""

from typing import Optional, List, Dict
from .models import ScanResult, CryptoAsset, ScanSummary

# ─── In-memory store ──────────────────────────────────────────────────────────
# Maps scan_id → full ScanResult
_store: Dict[str, ScanResult] = {}


def save(scan_id: str, result: ScanResult) -> None:
    """Persist a full ScanResult in the cache."""
    _store[scan_id] = result


def save_assets(scan_id: str, assets: List[CryptoAsset]) -> None:
    """Save or update assets for a scan ID when only asset list is provided."""
    if scan_id not in _store:
        total = len(assets)
        safe = sum(1 for a in assets if a.quantum_status == "SAFE")
        _store[scan_id] = ScanResult(
            scan_id=scan_id,
            target_name=scan_id,
            summary=ScanSummary(
                total_assets=total,
                safe=safe,
                quantum_readiness_pct=round(safe / total * 100, 1) if total else 0.0,
            ),
            assets=assets,
        )
    else:
        _store[scan_id].assets = assets


def get(scan_id: str) -> Optional[ScanResult]:
    """Retrieve a full ScanResult by scan_id. Returns None if not found."""
    return _store.get(scan_id)


def get_assets(scan_id: str) -> List[CryptoAsset]:
    """Retrieve just the asset list for a scan. Returns empty list if not found."""
    result = _store.get(scan_id)
    return result.assets if result else []


def get_asset_by_id(scan_id: str, asset_id: str) -> Optional[CryptoAsset]:
    """Find a specific asset inside a scan result by its ID."""
    for asset in get_assets(scan_id):
        if asset.id == asset_id:
            return asset
    return None


def list_scans() -> List[str]:
    """Return all cached scan IDs."""
    return list(_store.keys())


def clear(scan_id: str) -> None:
    """Remove a single scan from the cache."""
    _store.pop(scan_id, None)
