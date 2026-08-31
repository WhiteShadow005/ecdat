"""
ECDAT — Migration Recommender Engine
Maps vulnerable assets to specific NIST PQC replacements with migration guidance.
Owner: Shaurya Pratap Singh
"""

from typing import List, Optional
from ..models import CryptoAsset
from ..config import load_crypto_rules


_rules_cache: Optional[dict] = None

def _get_rules():
    global _rules_cache
    if _rules_cache is None:
        _rules_cache = load_crypto_rules()
    return _rules_cache


# Detailed migration guidance per algorithm family
MIGRATION_GUIDANCE = {
    "RSA": {
        "primary": "ML-KEM-768 (FIPS 203) for key encapsulation; ML-DSA-65 (FIPS 204) for signatures",
        "hybrid": "During transition: X25519 + ML-KEM-768 (dual-KEM) for TLS, Ed25519 + ML-DSA-65 composite for signing",
        "performance_impact": "ML-KEM-768 keys are ~1.2KB (vs 256B for RSA-2048). Encapsulation is ~2x faster than RSA-2048.",
        "compatibility": "liboqs-python, BouncyCastle PQC, OpenSSL 3.5+ (experimental), AWS s2n-tls",
        "nist_doc": "FIPS 203 (August 2024): https://doi.org/10.6028/NIST.FIPS.203",
    },
    "ECDSA": {
        "primary": "ML-DSA-65 (FIPS 204) for all digital signatures",
        "hybrid": "Ed25519 + ML-DSA-65 composite signature during transition window",
        "performance_impact": "ML-DSA-65 signatures are ~3.3KB (vs 64B for ECDSA-P256). Sign/verify ~3x slower.",
        "compatibility": "liboqs-python, BouncyCastle PQC, OpenSSL 3.5+ (experimental)",
        "nist_doc": "FIPS 204 (August 2024): https://doi.org/10.6028/NIST.FIPS.204",
    },
    "ECDH": {
        "primary": "ML-KEM-768 (FIPS 203) for key encapsulation",
        "hybrid": "X25519 + ML-KEM-768 hybrid KEM (RFC 9180 HPKE style)",
        "performance_impact": "ML-KEM-768 is actually faster than ECDH on most platforms.",
        "compatibility": "liboqs-python, OpenSSL 3.5+ (experimental), Cloudflare CIRCL",
        "nist_doc": "FIPS 203 (August 2024): https://doi.org/10.6028/NIST.FIPS.203",
    },
    "Diffie-Hellman": {
        "primary": "ML-KEM-768 (FIPS 203) for TLS key agreement; ML-KEM-1024 for high-security",
        "hybrid": "X25519 + ML-KEM-768 for TLS; ML-KEM-768 for SSH kex",
        "performance_impact": "ML-KEM-768 significantly faster than classic DH at equivalent security levels.",
        "compatibility": "OpenSSH 10+ (draft support), liboqs",
        "nist_doc": "FIPS 203 (August 2024): https://doi.org/10.6028/NIST.FIPS.203",
    },
    "AES-128": {
        "primary": "AES-256-GCM (drop-in upgrade — same library, different key length)",
        "hybrid": "No hybrid needed — direct upgrade",
        "performance_impact": "Minimal. AES-256 is ~15% slower than AES-128 on hardware without AES-NI.",
        "compatibility": "Universal — all major crypto libraries support AES-256-GCM",
        "nist_doc": "NIST SP 800-38D (GCM mode): https://csrc.nist.gov/publications/detail/sp/800-38d/final",
    },
    "hash": {
        "primary": "SHA-256 or SHA-3-256 (direct drop-in replacement)",
        "hybrid": "No hybrid needed — direct upgrade",
        "performance_impact": "SHA-256 hardware acceleration available on all modern CPUs. SHA-3 is ~2x slower without HW support.",
        "compatibility": "Universal — Python hashlib, Java MessageDigest, OpenSSL",
        "nist_doc": "FIPS 202 (SHA-3): https://doi.org/10.6028/NIST.FIPS.202",
    },
    "DES": {
        "primary": "AES-256-GCM (mandatory replacement)",
        "hybrid": "No hybrid needed — DES is classically broken, immediate replacement required",
        "performance_impact": "AES-256-GCM is significantly faster than DES on modern hardware.",
        "compatibility": "Universal",
        "nist_doc": "DES deprecated: NIST SP 800-131A Rev 2",
    },
    "3DES": {
        "primary": "AES-256-GCM (NIST deprecated 3DES in 2023)",
        "hybrid": "No hybrid — immediate replacement",
        "performance_impact": "AES-256-GCM is ~6x faster than 3DES on modern CPUs.",
        "compatibility": "Universal",
        "nist_doc": "3DES deprecated: NIST SP 800-131A Rev 2 (2019)",
    },
    "RC4": {
        "primary": "ChaCha20-Poly1305 (best for software) or AES-256-GCM (best for hardware with AES-NI)",
        "hybrid": "No hybrid — RC4 is critically broken",
        "performance_impact": "ChaCha20 is comparable to RC4 in pure software speed, much more secure.",
        "compatibility": "TLS 1.3 mandates AEAD ciphers. ChaCha20-Poly1305 in all modern TLS stacks.",
        "nist_doc": "RFC 7465 prohibits RC4 in TLS. RFC 8439 defines ChaCha20-Poly1305.",
    },
    "code_signing": {
        "primary": "SLH-DSA (FIPS 205 / SPHINCS+) for long-term code signing and firmware",
        "hybrid": "Ed25519 + SLH-DSA during transition for broad verifier compatibility",
        "performance_impact": "SLH-DSA signing is slow (~50ms). Verification is fast. Suitable for one-time signing.",
        "compatibility": "liboqs-python supports SLH-DSA. Not yet in mainstream TLS.",
        "nist_doc": "FIPS 205 (August 2024): https://doi.org/10.6028/NIST.FIPS.205",
    },
}


def get_migration_guidance(asset: CryptoAsset) -> dict:
    """
    Return detailed migration guidance for a given asset.
    """
    algo_upper = asset.algorithm.upper()

    # Find the right guidance category
    guidance_key = None
    if "RSA" in algo_upper:
        guidance_key = "RSA"
    elif "ECDSA" in algo_upper or "EC" == algo_upper:
        guidance_key = "ECDSA"
    elif "ECDH" in algo_upper:
        guidance_key = "ECDH"
    elif "DIFFIE" in algo_upper or "DH" in algo_upper or "DHE" in algo_upper:
        guidance_key = "Diffie-Hellman"
    elif "AES-128" in algo_upper or "AES128" in algo_upper:
        guidance_key = "AES-128"
    elif "MD5" in algo_upper or "SHA-1" in algo_upper or "SHA1" in algo_upper:
        guidance_key = "hash"
    elif "DES3" in algo_upper or "3DES" in algo_upper or "TRIPLE" in algo_upper:
        guidance_key = "3DES"
    elif "DES" in algo_upper:
        guidance_key = "DES"
    elif "RC4" in algo_upper or "ARC4" in algo_upper:
        guidance_key = "RC4"

    if guidance_key and guidance_key in MIGRATION_GUIDANCE:
        return MIGRATION_GUIDANCE[guidance_key]

    # Fallback
    return {
        "primary": asset.recommended_replacement or "See NIST PQC guidance",
        "hybrid": "Consult NIST SP 800-208 for hybrid transition strategy",
        "performance_impact": "Varies by algorithm",
        "compatibility": "Check vendor PQC roadmap",
        "nist_doc": "https://csrc.nist.gov/projects/post-quantum-cryptography",
    }


def enrich_with_recommendations(assets: List[CryptoAsset]) -> List[CryptoAsset]:
    """
    Enrich all BROKEN/WEAKENED assets with detailed migration recommendations.
    """
    for asset in assets:
        if asset.quantum_status in ("BROKEN", "WEAKENED"):
            guidance = get_migration_guidance(asset)
            if not asset.recommended_replacement:
                asset.recommended_replacement = guidance["primary"]
            # Store hybrid strategy in notes if not already set
            if not asset.notes:
                asset.notes = f"Migration: {guidance['hybrid']}"
    return assets
