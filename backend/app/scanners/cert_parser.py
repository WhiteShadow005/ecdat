"""
ECDAT — X.509 Certificate Parser
Parses .pem, .crt, .cer, .pfx certificate files to detect quantum-vulnerable algorithms.
Owner: Shaurya Pratap Singh
"""

import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa, dh
from cryptography.hazmat.primitives import hashes
from cryptography.x509.oid import NameOID
from ..models import CryptoAsset


CERT_EXTENSIONS = {".pem", ".crt", ".cer", ".der", ".cert"}


def _pubkey_algorithm(cert: x509.Certificate) -> tuple[str, Optional[int], str]:
    """
    Extract (algorithm_name, key_size_bits, quantum_status) from a cert's public key.
    """
    pubkey = cert.public_key()
    if isinstance(pubkey, rsa.RSAPublicKey):
        size = pubkey.key_size
        algo = f"RSA-{size}"
        status = "BROKEN"
        return algo, size, status
    elif isinstance(pubkey, ec.EllipticCurvePublicKey):
        curve = pubkey.curve.name
        algo = f"ECDSA-{curve}"
        return algo, pubkey.key_size, "BROKEN"
    elif isinstance(pubkey, dsa.DSAPublicKey):
        return "DSA", pubkey.key_size, "BROKEN"
    else:
        return "Unknown", None, "UNKNOWN"


def _sig_algorithm(cert: x509.Certificate) -> str:
    """Return human-readable signature algorithm name."""
    sig_hash = cert.signature_hash_algorithm
    if sig_hash is None:
        return "Unknown"
    return sig_hash.name.upper()


def _expiry_days(cert: x509.Certificate) -> int:
    """Return days until certificate expiry (negative = already expired)."""
    now = datetime.now(timezone.utc)
    expiry = cert.not_valid_after_utc
    return (expiry - now).days


def parse_certificate_file(file_path: str) -> List[CryptoAsset]:
    """
    Parse a single PEM/DER certificate file.
    Returns list of CryptoAsset findings.
    """
    assets: List[CryptoAsset] = []

    try:
        with open(file_path, "rb") as f:
            raw = f.read()
    except Exception:
        return assets

    # Try PEM first, then DER
    certs_to_parse = []
    try:
        # PEM files can have multiple certs (bundles)
        remaining = raw
        while b"-----BEGIN CERTIFICATE-----" in remaining:
            start = remaining.index(b"-----BEGIN CERTIFICATE-----")
            try:
                end = remaining.index(b"-----END CERTIFICATE-----") + len(b"-----END CERTIFICATE-----")
                cert_pem = remaining[start:end]
                cert = x509.load_pem_x509_certificate(cert_pem)
                certs_to_parse.append(cert)
                remaining = remaining[end:]
            except Exception:
                break
    except Exception:
        pass

    if not certs_to_parse:
        try:
            cert = x509.load_der_x509_certificate(raw)
            certs_to_parse.append(cert)
        except Exception:
            return assets

    for cert in certs_to_parse:
        try:
            algo, key_size, quantum_status = _pubkey_algorithm(cert)
            sig_algo = _sig_algorithm(cert)
            days_left = _expiry_days(cert)

            try:
                subject = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)
                subject_str = subject[0].value if subject else "Unknown"
            except Exception:
                subject_str = "Unknown"

            try:
                issuer = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)
                issuer_str = issuer[0].value if issuer else "Unknown"
            except Exception:
                issuer_str = "Unknown"

            # Build flags/notes
            notes_list = []
            if "SHA1" in sig_algo or "SHA-1" in sig_algo:
                notes_list.append("SHA-1 signature — classically broken, replace immediately")
                sig_algo_flag = "SHA-1 (BROKEN)"
            else:
                sig_algo_flag = sig_algo

            if key_size and key_size < 2048 and algo.startswith("RSA"):
                notes_list.append(f"Key size {key_size} bits — below minimum acceptable RSA key size")

            if days_left < 0:
                notes_list.append(f"Certificate EXPIRED {abs(days_left)} days ago")
            elif days_left < 180:
                notes_list.append(f"Certificate expires in {days_left} days — renewal recommended")

            expiry_str = cert.not_valid_after_utc.strftime("%Y-%m-%d")
            snippet = (
                f"Subject: {subject_str} | Issuer: {issuer_str} | "
                f"Sig: {sig_algo_flag} | Expires: {expiry_str}"
            )

            asset = CryptoAsset(
                algorithm=algo,
                type="certificate",
                primitive="asymmetric",
                key_size=key_size,
                quantum_status=quantum_status,
                file_path=file_path,
                line_number=None,
                language="certificate",
                code_snippet=snippet,
                notes="; ".join(notes_list) if notes_list else None,
                source_scanner="cert_parser",
                recommended_replacement="ML-DSA-65 (FIPS 204) for new certificates",
            )
            assets.append(asset)

        except Exception:
            continue

    return assets


def scan_certs_in_directory(dir_path: str) -> List[CryptoAsset]:
    """
    Recursively scan a directory for certificate files.
    Returns combined list of CryptoAsset findings.
    """
    all_assets: List[CryptoAsset] = []
    for root, _, files in os.walk(dir_path):
        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext in CERT_EXTENSIONS:
                full_path = os.path.join(root, fname)
                found = parse_certificate_file(full_path)
                all_assets.extend(found)
    return all_assets
