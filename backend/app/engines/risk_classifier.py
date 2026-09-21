"""
ECDAT — Quantum Risk Classifier
Loads crypto_rules.json and classifies each asset's quantum vulnerability status
and criticality tier.
Owner: Shaurya Pratap Singh
"""

import re
from typing import List, Optional
from ..models import CryptoAsset, QuantumStatus, Criticality
from ..config import load_crypto_rules


_rules_cache: Optional[dict] = None

def _get_rules() -> dict:
    global _rules_cache
    if _rules_cache is None:
        _rules_cache = load_crypto_rules()
    return _rules_cache


def _match_rule(algorithm: str) -> Optional[dict]:
    """
    Find the matching rule for an algorithm name.
    Priority: 1) exact name, 2) exact variant, 3) startswith prefix match.
    Avoids false matches like SHA-1 matching SHA-256.
    """
    rules = _get_rules()
    raw_algo = algorithm.strip()
    # Strip common scanner prefixes like "SSH HostKey: ", "SSH KexAlgorithm: ", etc.
    clean_algo = re.sub(r'^(SSH\s+(?:HostKey|KexAlgorithm|Cipher)|TLS\s+(?:Protocol|Cipher)):\s*', '', raw_algo, flags=re.IGNORECASE)
    algo_upper = clean_algo.upper().strip()

    # Pass 1 — exact name match
    for rule in rules["algorithms"]:
        if rule["algorithm"].upper() == algo_upper:
            return rule

    # Pass 2 — exact variant match
    for rule in rules["algorithms"]:
        for variant in rule.get("variants", []):
            if variant.upper() == algo_upper:
                return rule

    # Pass 3 — prefix match (e.g. "ECDSA-secp256r1" → ECDSA rule)
    # Only if the rule name appears at the START of algo_upper followed by non-alpha char or end
    for rule in rules["algorithms"]:
        rule_algo = rule["algorithm"].upper()
        if algo_upper.startswith(rule_algo):
            rest = algo_upper[len(rule_algo):]
            if not rest or not rest[0].isalpha():
                return rule
        # Also check variants as prefix
        for variant in rule.get("variants", []):
            v = variant.upper()
            if algo_upper.startswith(v):
                rest = algo_upper[len(v):]
                if not rest or not rest[0].isalpha():
                    return rule

    # Pass 4 — substring match for composite ciphers (e.g., RC4, 3DES, DH)
    for rule in rules["algorithms"]:
        rule_algo = rule["algorithm"].upper()
        if rule_algo in ("RC4", "3DES", "DES", "RSA", "DH"):
            if rule_algo in algo_upper:
                return rule

    return None


def classify_asset(asset: CryptoAsset) -> CryptoAsset:
    """
    Look up an asset in crypto_rules.json and assign:
    - quantum_status (BROKEN / WEAKENED / SAFE / UNKNOWN)
    - recommended_replacement
    - primitive
    - notes (if any from rules)
    """
    rule = _match_rule(asset.algorithm)

    if rule:
        asset.quantum_status = rule.get("quantum_status", "UNKNOWN")
        if not asset.recommended_replacement:
            asset.recommended_replacement = rule.get("nist_replacement", "See NIST PQC guidance")
        if not asset.primitive:
            asset.primitive = rule.get("primitive")
        if not asset.notes:
            asset.notes = rule.get("notes")
        asset.remediation_ready = asset.quantum_status in ("BROKEN", "WEAKENED")
    elif asset.quantum_status in ("BROKEN", "WEAKENED", "SAFE"):
        # The scanner (e.g. config_parser) already accurately classified it
        asset.remediation_ready = asset.quantum_status in ("BROKEN", "WEAKENED")
        if not asset.recommended_replacement or asset.recommended_replacement.startswith("Manual review"):
            asset.recommended_replacement = "NIST FIPS 203/204 Upgrade"
    else:
        asset.quantum_status = "UNKNOWN"
        asset.recommended_replacement = "Manual review required — algorithm not in database"

    return asset


def assign_criticality(asset: CryptoAsset) -> CryptoAsset:
    """
    Assign criticality tier based on QARS score.
    Must be called after QARS scoring.
    """
    score = asset.qars_score
    if score >= 75:
        asset.criticality = "critical"
    elif score >= 55:
        asset.criticality = "high"
    elif score >= 35:
        asset.criticality = "medium"
    elif score >= 15:
        asset.criticality = "low"
    else:
        asset.criticality = "safe"
    return asset


def classify_inventory(assets: List[CryptoAsset]) -> List[CryptoAsset]:
    """Classify all assets in the inventory."""
    return [classify_asset(a) for a in assets]
