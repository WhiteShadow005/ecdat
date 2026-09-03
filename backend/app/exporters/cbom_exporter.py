"""
ECDAT — CycloneDX 1.6 CBOM Exporter (Enhanced)
Converts scan inventory to ECMA-424 / CycloneDX 1.6 CBOM JSON format.

Improvements over stub:
  - Full cryptoProperties.algorithmProperties with proper primitive mapping
  - externalReferences per component pointing to relevant NIST FIPS docs
  - vulnerabilities array for BROKEN/WEAKENED assets
  - Proper NIST quantum security levels (0 / 1 / 3 / 5)
  - Reads full ScanResult from shared cache (includes Mosca metadata)

Owner: Aujasya Rajput
"""

import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from ..models import CryptoAsset, ScanResult
from .. import cache as scan_cache


# ─── NIST FIPS documentation references per algorithm family ──────────────────
_NIST_REFS = {
    "RSA":          {"url": "https://doi.org/10.6028/NIST.FIPS.186-5",  "comment": "NIST FIPS 186-5 — Digital Signature Standard"},
    "ECDSA":        {"url": "https://doi.org/10.6028/NIST.FIPS.186-5",  "comment": "NIST FIPS 186-5 — Elliptic Curve DSS"},
    "ECDH":         {"url": "https://doi.org/10.6028/NIST.SP.800-56Ar3","comment": "NIST SP 800-56A — ECC Key Agreement"},
    "Diffie-Hellman":{"url": "https://doi.org/10.6028/NIST.SP.800-56Ar3","comment": "NIST SP 800-56A — Key Agreement"},
    "AES":          {"url": "https://doi.org/10.6028/NIST.FIPS.197-upd1","comment": "NIST FIPS 197 — Advanced Encryption Standard"},
    "MD5":          {"url": "https://doi.org/10.6028/NIST.SP.800-131Ar2","comment": "NIST SP 800-131A Rev2 — MD5 deprecated"},
    "SHA-1":        {"url": "https://doi.org/10.6028/NIST.SP.800-131Ar2","comment": "NIST SP 800-131A Rev2 — SHA-1 deprecated"},
    "SHA-256":      {"url": "https://doi.org/10.6028/NIST.FIPS.180-4",  "comment": "NIST FIPS 180-4 — Secure Hash Standard"},
    "DES":          {"url": "https://doi.org/10.6028/NIST.SP.800-131Ar2","comment": "NIST SP 800-131A Rev2 — DES withdrawn"},
    "3DES":         {"url": "https://doi.org/10.6028/NIST.SP.800-131Ar2","comment": "NIST SP 800-131A Rev2 — 3DES deprecated 2023"},
    "RC4":          {"url": "https://www.rfc-editor.org/rfc/rfc7465",    "comment": "RFC 7465 — RC4 prohibited in TLS"},
    "ML-KEM-768":   {"url": "https://doi.org/10.6028/NIST.FIPS.203",    "comment": "NIST FIPS 203 — ML-KEM (Kyber)"},
    "ML-DSA-65":    {"url": "https://doi.org/10.6028/NIST.FIPS.204",    "comment": "NIST FIPS 204 — ML-DSA (Dilithium)"},
    "SLH-DSA":      {"url": "https://doi.org/10.6028/NIST.FIPS.205",    "comment": "NIST FIPS 205 — SLH-DSA (SPHINCS+)"},
}

# Maps algorithm primitive labels to CycloneDX primitive values
_PRIMITIVE_MAP = {
    "asymmetric":              "asymmetric-encryption",
    "encryption_and_signature":"asymmetric-encryption",
    "key_agreement":           "key-agreement",
    "key_encapsulation":       "kem",
    "signature":               "signature",
    "hash":                    "hash",
    "symmetric":               "symmetric-encryption",
    "stream_cipher":           "stream-cipher",
    "mac":                     "mac",
    "message_authentication":  "mac",
    "protocol":                "protocol",
}

# NIST Quantum Security Level per quantum_status
_NIST_LEVEL = {
    "BROKEN":   0,
    "WEAKENED": 1,
    "SAFE":     3,
    "UNKNOWN":  0,
}


def _get_nist_ref(algorithm: str) -> Optional[dict]:
    """Find the best NIST reference for a given algorithm name."""
    algo_upper = algorithm.upper()
    for key, ref in _NIST_REFS.items():
        if key.upper() in algo_upper:
            return ref
    return None


def _map_primitive(primitive: str) -> str:
    return _PRIMITIVE_MAP.get((primitive or "").lower(), "other")


def _asset_to_component(asset: CryptoAsset) -> dict:
    """Convert a CryptoAsset to a full CycloneDX 1.6 component dict."""

    component = {
        "type": "cryptographic-asset",
        "bom-ref": asset.id,
        "name": asset.algorithm,
        "cryptoProperties": {
            "assetType": asset.type or "algorithm",
        },
        "properties": [
            {"name": "ecdat:quantumStatus",        "value": asset.quantum_status},
            {"name": "ecdat:vulnerabilityStatus",  "value": asset.quantum_status},
            {"name": "ecdat:qarsRiskScore",        "value": str(asset.qars_score)},
            {"name": "ecdat:criticality",          "value": asset.criticality},
        ],
    }

    # ─── algorithmProperties (for algorithm-type assets) ─────────────────────
    if asset.type in ("algorithm", None):
        algo_props: dict = {
            "primitive": _map_primitive(asset.primitive or ""),
            "nistQuantumSecurityLevel": _NIST_LEVEL.get(asset.quantum_status, 0),
        }
        if asset.key_size:
            algo_props["parameterSetIdentifier"] = str(asset.key_size)

        # Execution environment — inferred from language
        if asset.language:
            lang_env = {
                "python": "application",
                "java": "application",
                "config:nginx": "server",
                "config:ssh": "server",
                "certificate": "other",
            }
            algo_props["executionEnvironment"] = lang_env.get(asset.language, "application")

        component["cryptoProperties"]["algorithmProperties"] = algo_props

    # ─── certificateProperties (for certificate-type assets) ─────────────────
    elif asset.type == "certificate":
        cert_props: dict = {}
        if asset.algorithm:
            cert_props["signatureAlgorithmRef"] = asset.algorithm
        if asset.key_size:
            cert_props["subjectPublicKeyRef"] = f"{asset.algorithm}-{asset.key_size}"
        component["cryptoProperties"]["certificateProperties"] = cert_props

    # ─── Optional property enrichments ───────────────────────────────────────
    optional_props = [
        ("ecdat:recommendedReplacement", asset.recommended_replacement),
        ("ecdat:filePath",               f"{asset.file_path}:{asset.line_number or 0}" if asset.file_path else None),
        ("ecdat:moscaStatus",            asset.mosca_status),
        ("ecdat:libraryUsed",            asset.library_used),
        ("ecdat:sourceLanguage",         asset.language),
        ("ecdat:exposureContext",        asset.exposure_context),
        ("ecdat:sourceScanner",          asset.source_scanner),
    ]
    for name, value in optional_props:
        if value:
            component["properties"].append({"name": name, "value": str(value)})

    if asset.notes:
        component["properties"].append({"name": "ecdat:notes", "value": asset.notes[:300]})

    # ─── External references (NIST FIPS docs) ────────────────────────────────
    nist_ref = _get_nist_ref(asset.algorithm)
    if nist_ref:
        component["externalReferences"] = [
            {
                "type": "documentation",
                "url": nist_ref["url"],
                "comment": nist_ref["comment"],
            }
        ]

    # ─── Vulnerabilities array for BROKEN/WEAKENED assets ────────────────────
    if asset.quantum_status in ("BROKEN", "WEAKENED"):
        severity = "critical" if asset.quantum_status == "BROKEN" else "high"
        desc = (
            f"{asset.algorithm} is {'broken' if asset.quantum_status == 'BROKEN' else 'weakened'} "
            f"against Cryptographically Relevant Quantum Computers (CRQC) via "
            f"{'Shor' if asset.primitive in ('asymmetric', 'signature', 'key_agreement', None) else 'Grover'}'s Algorithm."
        )
        component["vulnerabilities"] = [
            {
                "id": f"ECDAT-{asset.id}",
                "description": desc,
                "severity": severity,
                "advisories": [
                    {
                        "title": "NIST Post-Quantum Cryptography Migration",
                        "url": "https://csrc.nist.gov/projects/post-quantum-cryptography",
                    }
                ],
                "recommendation": asset.recommended_replacement or "Migrate to NIST FIPS 203/204/205",
            }
        ]

    return component


def build_cbom_json(
    assets: List[CryptoAsset],
    target_name: str = "",
    scan_id: str = "",
    mosca=None,
) -> dict:
    """
    Build a CycloneDX 1.6 CBOM JSON document from a list of crypto assets.
    Returns the document as a Python dict (serialize with json.dumps).
    """
    components = [_asset_to_component(a) for a in assets]

    broken  = sum(1 for a in assets if a.quantum_status == "BROKEN")
    weakened= sum(1 for a in assets if a.quantum_status == "WEAKENED")
    safe    = sum(1 for a in assets if a.quantum_status == "SAFE")

    metadata_props = [
        {"name": "ecdat:scanId",       "value": scan_id},
        {"name": "ecdat:targetName",   "value": target_name},
        {"name": "ecdat:standard",     "value": "NIST FIPS 203/204/205 (August 2024)"},
        {"name": "ecdat:moscaZDefault","value": "7 years (Q-Day ~2033)"},
        {"name": "ecdat:totalAssets",  "value": str(len(assets))},
        {"name": "ecdat:brokenAssets", "value": str(broken)},
        {"name": "ecdat:weakenedAssets","value": str(weakened)},
        {"name": "ecdat:safeAssets",   "value": str(safe)},
    ]

    if mosca:
        metadata_props += [
            {"name": "ecdat:moscaStatus",   "value": mosca.status},
            {"name": "ecdat:moscaXPlusY",   "value": f"{mosca.x_plus_y} years"},
            {"name": "ecdat:moscaMessage",  "value": mosca.message},
        ]

    cbom = {
        "bomFormat":    "CycloneDX",
        "specVersion":  "1.6",
        "serialNumber": f"urn:uuid:{uuid.uuid4()}",
        "version":      1,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools": [
                {
                    "vendor":  "NTRO-ECDAT",
                    "name":    "Enterprise Cryptographic Discovery & Analysis Tool",
                    "version": "1.0.0",
                    "externalReferences": [
                        {"type": "website",    "url": "https://github.com/sps-exe/ecdat"},
                        {"type": "vcs",        "url": "https://github.com/sps-exe/ecdat"},
                        {"type": "documentation","url": "https://csrc.nist.gov/projects/post-quantum-cryptography"},
                    ],
                }
            ],
            "properties": metadata_props,
        },
        "components": components,
    }

    return cbom


def export_to_cbom(scan_id: str) -> dict:
    """Export a stored scan as CycloneDX 1.6 CBOM JSON."""
    # Try new shared cache first
    result = scan_cache.get(scan_id)
    if result:
        return build_cbom_json(
            assets=result.assets,
            target_name=result.target_name,
            scan_id=scan_id,
            mosca=result.mosca,
        )

    # Fallback: check legacy remediator cache (for backward compatibility)
    try:
        from ..ai.code_remediator import _scan_cache as _legacy
        assets = _legacy.get(scan_id, [])
        if assets:
            return build_cbom_json(assets, scan_id=scan_id)
    except Exception:
        pass

    from fastapi import HTTPException
    raise HTTPException(
        status_code=404,
        detail=f"No scan found with ID: {scan_id}. Run /api/scan first.",
    )
