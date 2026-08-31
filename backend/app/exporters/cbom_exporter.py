"""
ECDAT — CycloneDX 1.6 CBOM Exporter
Converts scan inventory to ECMA-424 / CycloneDX 1.6 CBOM JSON format.
Owner: Ojasya Rajput
"""

import uuid
import json
from datetime import datetime
from typing import List
from ..models import CryptoAsset, ScanResult


def _asset_to_cyclonedx_component(asset: CryptoAsset) -> dict:
    """Convert a CryptoAsset to a CycloneDX 1.6 component dict."""
    component = {
        "type": "cryptographic-asset",
        "bom-ref": asset.id,
        "name": asset.algorithm,
        "cryptoProperties": {
            "assetType": asset.type or "algorithm",
        },
        "properties": [
            {"name": "ecdat:quantumStatus", "value": asset.quantum_status},
            {"name": "ecdat:qarsRiskScore", "value": str(asset.qars_score)},
            {"name": "ecdat:criticality", "value": asset.criticality},
        ]
    }

    # algorithmProperties (for algorithm type assets)
    if asset.type == "algorithm":
        algo_props = {
            "primitive": _map_primitive(asset.primitive or ""),
            "nistQuantumSecurityLevel": _nist_level(asset.quantum_status),
        }
        if asset.key_size:
            algo_props["parameterSetIdentifier"] = str(asset.key_size)
        component["cryptoProperties"]["algorithmProperties"] = algo_props

    # certificateProperties (for cert type assets)
    elif asset.type == "certificate":
        cert_props = {}
        if asset.key_size:
            cert_props["subjectPublicKeyRef"] = asset.algorithm
        component["cryptoProperties"]["certificateProperties"] = cert_props

    # Optional enrichments
    if asset.recommended_replacement:
        component["properties"].append({
            "name": "ecdat:recommendedReplacement",
            "value": asset.recommended_replacement
        })
    if asset.file_path:
        component["properties"].append({
            "name": "ecdat:filePath",
            "value": f"{asset.file_path}:{asset.line_number or 0}"
        })
    if asset.mosca_status:
        component["properties"].append({
            "name": "ecdat:moscaStatus",
            "value": asset.mosca_status
        })
    if asset.library_used:
        component["properties"].append({
            "name": "ecdat:libraryUsed",
            "value": asset.library_used
        })
    if asset.language:
        component["properties"].append({
            "name": "ecdat:sourceLanguage",
            "value": asset.language
        })

    return component


def _map_primitive(primitive: str) -> str:
    MAP = {
        "asymmetric": "asymmetric-encryption",
        "encryption_and_signature": "asymmetric-encryption",
        "key_agreement": "key-agreement",
        "key_encapsulation": "kem",
        "signature": "signature",
        "hash": "hash",
        "symmetric": "symmetric-encryption",
        "stream_cipher": "stream-cipher",
        "mac": "mac",
        "message_authentication": "mac",
        "protocol": "protocol",
    }
    return MAP.get(primitive.lower(), "other")


def _nist_level(status: str) -> int:
    return {"BROKEN": 0, "WEAKENED": 1, "SAFE": 3, "UNKNOWN": 0}.get(status, 0)


def build_cbom_json(assets: List[CryptoAsset], target_name: str = "", scan_id: str = "") -> dict:
    """
    Build a CycloneDX 1.6 CBOM JSON document from a list of crypto assets.
    Returns the document as a Python dict (serialize with json.dumps).
    """
    components = [_asset_to_cyclonedx_component(a) for a in assets]

    cbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "serialNumber": f"urn:uuid:{uuid.uuid4()}",
        "version": 1,
        "metadata": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "tools": [
                {
                    "vendor": "NTRO-ECDAT",
                    "name": "Enterprise Cryptographic Discovery & Analysis Tool",
                    "version": "1.0.0",
                    "externalReferences": [
                        {"type": "website", "url": "https://github.com/sps-exe/ecdat"}
                    ]
                }
            ],
            "properties": [
                {"name": "ecdat:scanId", "value": scan_id},
                {"name": "ecdat:targetName", "value": target_name},
                {"name": "ecdat:standard", "value": "NIST FIPS 203/204/205 (August 2024)"},
                {"name": "ecdat:moscaZDefault", "value": "7 years (Q-Day ~2033)"},
            ]
        },
        "components": components,
    }

    return cbom


def export_to_cbom(scan_id: str) -> dict:
    """Export a stored scan as CycloneDX 1.6 CBOM JSON."""
    from ..ai.code_remediator import _scan_cache
    assets = _scan_cache.get(scan_id, [])
    if not assets:
        return {"error": f"No scan found with ID: {scan_id}. Run /api/scan first."}
    return build_cbom_json(assets, scan_id=scan_id)
