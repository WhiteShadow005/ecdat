"""
ECDAT — Unified Inventory Engine
Merges, normalizes, and deduplicates all scanner outputs into a single asset list.
Owner: Shaurya Pratap Singh
"""

from typing import List
from ..models import CryptoAsset


def _dedup_key(asset: CryptoAsset) -> str:
    """Generate a deduplication key for an asset."""
    return f"{asset.algorithm}|{asset.file_path or ''}|{asset.line_number or 0}"


def build_inventory(raw_assets: List[CryptoAsset]) -> List[CryptoAsset]:
    """
    Take raw assets from all scanners, deduplicate, assign sequential IDs,
    and return a clean, normalized inventory list.
    """
    seen: dict[str, CryptoAsset] = {}

    for asset in raw_assets:
        key = _dedup_key(asset)
        if key not in seen:
            seen[key] = asset
        else:
            # Merge: keep the richer entry
            existing = seen[key]
            if asset.code_snippet and not existing.code_snippet:
                existing.code_snippet = asset.code_snippet
            if asset.library_used and not existing.library_used:
                existing.library_used = asset.library_used
            if asset.key_size and not existing.key_size:
                existing.key_size = asset.key_size
            if asset.notes and not existing.notes:
                existing.notes = asset.notes

    # Assign sequential IDs and return ordered list
    inventory = list(seen.values())
    for i, asset in enumerate(inventory, 1):
        asset.id = f"asset-{i:03d}"

    return inventory
