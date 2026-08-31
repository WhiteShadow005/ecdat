"""
ECDAT — Live TLS Probe Scanner
Connects to a host on port 443, performs TLS handshake, extracts cipher suite, 
TLS version, and certificate chain details.
Owner: Shaurya Pratap Singh
"""

import ssl
import socket
from datetime import datetime, timezone
from typing import Optional
from cryptography import x509
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa
from cryptography.x509.oid import NameOID
from ..models import TLSProbeResult


# Dangerous TLS protocol identifiers
WEAK_TLS_PROTOCOLS = {
    ssl.PROTOCOL_TLS_CLIENT: "TLS",
}

TLS_VERSION_STATUS = {
    "TLSv1": "BROKEN",
    "TLSv1.1": "WEAKENED",
    "TLSv1.2": "WEAKENED",  # Weakened but still used. Cipher matters more.
    "TLSv1.3": "SAFE",
}

WEAK_CIPHER_KEYWORDS = {
    "RC4": ("RC4", "BROKEN", "ChaCha20-Poly1305"),
    "DES": ("DES", "BROKEN", "AES-256-GCM"),
    "3DES": ("3DES/SWEET32", "BROKEN", "AES-256-GCM"),
    "NULL": ("NULL cipher", "BROKEN", "AES-256-GCM"),
    "EXPORT": ("Export cipher", "BROKEN", "AES-256-GCM"),
    "MD5": ("HMAC-MD5", "BROKEN", "HMAC-SHA256"),
    "RSA": ("RSA key exchange (no forward secrecy)", "BROKEN", "X25519 + ML-KEM-768"),
    "AES128": ("AES-128 (weakened by Grover's)", "WEAKENED", "AES-256-GCM"),
}


def _cert_bytes_to_crypto(cert_der: bytes) -> Optional[x509.Certificate]:
    """Convert raw DER bytes to a cryptography Certificate object."""
    try:
        return x509.load_der_x509_certificate(cert_der)
    except Exception:
        return None


def _analyze_pubkey(cert: x509.Certificate) -> tuple[str, Optional[int], str, str]:
    """Return (algorithm, key_size, quantum_status, replacement)."""
    pubkey = cert.public_key()
    if isinstance(pubkey, rsa.RSAPublicKey):
        size = pubkey.key_size
        return f"RSA-{size}", size, "BROKEN", f"ML-KEM-768 (FIPS 203) / ML-DSA-65 (FIPS 204)"
    elif isinstance(pubkey, ec.EllipticCurvePublicKey):
        curve = pubkey.curve.name
        return f"ECDSA-{curve}", pubkey.key_size, "BROKEN", "ML-DSA-65 (FIPS 204)"
    elif isinstance(pubkey, dsa.DSAPublicKey):
        return "DSA", pubkey.key_size, "BROKEN", "ML-DSA-65 (FIPS 204)"
    else:
        return "Unknown", None, "UNKNOWN", "Contact vendor for PQC roadmap"


def probe_tls(host: str, port: int = 443, timeout: float = 10.0) -> TLSProbeResult:
    """
    Connect to host:port via TLS, extract cipher suite, TLS version, and cert info.
    Returns a TLSProbeResult.
    """
    result = TLSProbeResult(target=host, port=port)

    try:
        context = ssl.create_default_context()
        context.check_hostname = True
        context.verify_mode = ssl.CERT_REQUIRED

        with socket.create_connection((host, port), timeout=timeout) as raw_sock:
            with context.wrap_socket(raw_sock, server_hostname=host) as ssock:
                # TLS version
                tls_version = ssock.version() or "Unknown"
                result.tls_version = tls_version

                # Cipher suite
                cipher_info = ssock.cipher()
                if cipher_info:
                    result.cipher_suite = cipher_info[0]

                # Get the peer's DER-encoded certificate
                cert_der = ssock.getpeercert(binary_form=True)
                if cert_der:
                    cert = _cert_bytes_to_crypto(cert_der)
                    if cert:
                        algo, key_size, quantum_status, replacement = _analyze_pubkey(cert)
                        result.cert_algorithm = algo
                        result.cert_key_size = key_size
                        result.quantum_status = quantum_status
                        result.recommended_replacement = replacement

                        try:
                            cn = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)
                            result.cert_subject = cn[0].value if cn else host
                        except Exception:
                            result.cert_subject = host

                        try:
                            cn = cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)
                            result.cert_issuer = cn[0].value if cn else "Unknown"
                        except Exception:
                            result.cert_issuer = "Unknown"

                        result.cert_expiry = cert.not_valid_after_utc.strftime("%Y-%m-%d")

    except ssl.SSLCertVerificationError as e:
        result.error = f"TLS verification failed: {str(e)}"
        result.quantum_status = "UNKNOWN"
    except socket.timeout:
        result.error = f"Connection timed out after {timeout}s"
    except ConnectionRefusedError:
        result.error = f"Connection refused on port {port}"
    except Exception as e:
        result.error = f"Probe failed: {str(e)}"

    # Determine QARS score from TLS version and cipher suite
    result.qars_score = _estimate_tls_qars(result)
    return result


def _estimate_tls_qars(result: TLSProbeResult) -> int:
    """Quick QARS estimate based on TLS version and cipher suite keywords."""
    score = 0

    # TLS version contribution
    if result.tls_version:
        if "1.0" in result.tls_version or "1" == result.tls_version.split("v")[-1]:
            score += 35
        elif "1.1" in result.tls_version:
            score += 25
        elif "1.2" in result.tls_version:
            score += 15
        # TLS 1.3 contributes 0

    # Cert algo contribution
    if result.quantum_status == "BROKEN":
        score += 35
    elif result.quantum_status == "WEAKENED":
        score += 15

    # Cipher suite contribution
    if result.cipher_suite:
        for keyword in WEAK_CIPHER_KEYWORDS:
            if keyword in result.cipher_suite.upper():
                score += 10
                break

    return min(score, 100)
