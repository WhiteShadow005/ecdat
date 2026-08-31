"""
ECDAT — Config File Scanner
Detects insecure cipher suites in Nginx, SSH (sshd_config), and Apache configs.
Owner: Shaurya Pratap Singh
"""

import os
import re
from pathlib import Path
from typing import List, Tuple
from ..models import CryptoAsset

# ─── Config file detection patterns ────────────────────────────────────────────

CONFIG_FILENAMES = {
    "nginx": {"nginx.conf", "nginx.cfg", "default.conf", "site.conf"},
    "ssh": {"sshd_config", "ssh_config"},
    "apache": {"httpd.conf", "apache2.conf", "ssl.conf", ".htaccess"},
}

# Dangerous TLS protocol versions
WEAK_TLS_VERSIONS = {
    "TLSv1": ("TLS 1.0", "BROKEN", "TLS 1.3 (disable TLS 1.0 and 1.1 entirely)"),
    "TLSv1.0": ("TLS 1.0", "BROKEN", "TLS 1.3"),
    "TLSv1.1": ("TLS 1.1", "WEAKENED", "TLS 1.3"),
    "SSLv2": ("SSL 2.0", "BROKEN", "TLS 1.3"),
    "SSLv3": ("SSL 3.0", "BROKEN", "TLS 1.3 (SSLv3 vulnerable to POODLE attack)"),
}

# Dangerous cipher suite patterns (substring match)
WEAK_CIPHERS = {
    "DES": ("DES", "BROKEN", "AES-256-GCM"),
    "3DES": ("3DES", "BROKEN", "AES-256-GCM"),
    "RC4": ("RC4", "BROKEN", "ChaCha20-Poly1305"),
    "EXPORT": ("Export Cipher", "BROKEN", "AES-256-GCM"),
    "NULL": ("NULL Cipher", "BROKEN", "AES-256-GCM"),
    "MD5": ("HMAC-MD5 in cipher suite", "BROKEN", "HMAC-SHA256"),
    "SHA ": ("HMAC-SHA1 in cipher suite", "WEAKENED", "HMAC-SHA256"),
    "SHA:": ("HMAC-SHA1 in cipher suite", "WEAKENED", "HMAC-SHA256"),
    "RSA:": ("RSA key exchange", "BROKEN", "ML-KEM-768 (FIPS 203) / ECDHE+ML-KEM hybrid"),
    "DHE-RSA-": ("Ephemeral RSA-DH", "BROKEN", "ML-KEM-768 (FIPS 203)"),
    "ECDHE-RSA-": ("ECDHE-RSA", "BROKEN", "X25519 + ML-KEM-768 hybrid"),
    "ECDHE-ECDSA-": ("ECDHE-ECDSA", "BROKEN", "ML-KEM-768 (FIPS 203)"),
    "AES128": ("AES-128 in cipher suite", "WEAKENED", "AES-256-GCM"),
}

# Dangerous SSH KexAlgorithms / HostKeyAlgorithms
WEAK_SSH_KEXALGS = {
    "diffie-hellman-group1-sha1": ("DH-Group1-SHA1", "BROKEN", "ML-KEM-768 (FIPS 203)"),
    "diffie-hellman-group14-sha1": ("DH-Group14-SHA1", "WEAKENED", "ML-KEM-768 (FIPS 203)"),
    "diffie-hellman-group14-sha256": ("DH-Group14-SHA256", "WEAKENED", "X25519 + ML-KEM-768"),
    "rsa2048-sha256": ("RSA-2048 in SSH KEx", "BROKEN", "ML-KEM-768 (FIPS 203)"),
}

WEAK_SSH_HOSTKEYS = {
    "ssh-rsa": ("RSA host key", "BROKEN", "ML-DSA-65 (FIPS 204)"),
    "ssh-dss": ("DSA host key", "BROKEN", "ML-DSA-65 (FIPS 204)"),
    "ecdsa-sha2-nistp256": ("ECDSA-nistp256 host key", "BROKEN", "ML-DSA-65 (FIPS 204)"),
    "ecdsa-sha2-nistp384": ("ECDSA-nistp384 host key", "BROKEN", "ML-DSA-65 (FIPS 204)"),
}


def _detect_config_type(file_path: str) -> str:
    """Guess config type from filename."""
    fname = Path(file_path).name.lower()
    for ctype, names in CONFIG_FILENAMES.items():
        if fname in names:
            return ctype
    # Heuristic from extension
    if fname.endswith(".conf") or fname.endswith(".cfg"):
        return "nginx"  # Most common
    return "unknown"


def _make_asset(algo: str, status: str, replacement: str,
                file_path: str, line_num: int, snippet: str,
                config_type: str) -> CryptoAsset:
    return CryptoAsset(
        algorithm=algo,
        type="config",
        primitive="protocol",
        quantum_status=status,
        file_path=file_path,
        line_number=line_num,
        language=f"config:{config_type}",
        code_snippet=snippet[:200],
        recommended_replacement=replacement,
        source_scanner="config_parser",
    )


def _scan_nginx_content(lines: List[str], file_path: str) -> List[CryptoAsset]:
    """Scan Nginx-style config lines for weak TLS settings."""
    assets = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("#"):
            continue

        # ssl_protocols
        if re.search(r"\bssl_protocols\b", stripped, re.IGNORECASE):
            for tls_ver, (name, status, replacement) in WEAK_TLS_VERSIONS.items():
                if tls_ver in stripped:
                    assets.append(_make_asset(
                        f"TLS Protocol: {name}", status, replacement,
                        file_path, i, stripped, "nginx"
                    ))

        # ssl_ciphers
        if re.search(r"\bssl_ciphers\b|\bSSLCipherSuite\b", stripped, re.IGNORECASE):
            for pattern, (name, status, replacement) in WEAK_CIPHERS.items():
                if pattern in stripped:
                    assets.append(_make_asset(
                        f"Cipher Suite: {name}", status, replacement,
                        file_path, i, stripped, "nginx"
                    ))

    return assets


def _scan_ssh_content(lines: List[str], file_path: str) -> List[CryptoAsset]:
    """Scan SSH sshd_config for weak key exchange and host key settings."""
    assets = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("#"):
            continue

        # KexAlgorithms
        if re.search(r"\bKexAlgorithms\b", stripped, re.IGNORECASE):
            for pattern, (name, status, replacement) in WEAK_SSH_KEXALGS.items():
                if pattern in stripped:
                    assets.append(_make_asset(
                        f"SSH KexAlgorithm: {name}", status, replacement,
                        file_path, i, stripped, "ssh"
                    ))

        # HostKeyAlgorithms / HostKey
        if re.search(r"\bHostKeyAlgorithms\b|\bHostKey\b", stripped, re.IGNORECASE):
            for pattern, (name, status, replacement) in WEAK_SSH_HOSTKEYS.items():
                if pattern in stripped:
                    assets.append(_make_asset(
                        f"SSH HostKey: {name}", status, replacement,
                        file_path, i, stripped, "ssh"
                    ))

        # Ciphers line
        if re.search(r"^Ciphers\b", stripped, re.IGNORECASE):
            for pattern, (name, status, replacement) in WEAK_CIPHERS.items():
                if pattern in stripped:
                    assets.append(_make_asset(
                        f"SSH Cipher: {name}", status, replacement,
                        file_path, i, stripped, "ssh"
                    ))

    return assets


def scan_config_file(file_path: str) -> List[CryptoAsset]:
    """
    Scan a single config file for insecure cryptographic settings.
    Supports Nginx, SSH sshd_config, and Apache configs.
    Returns list of CryptoAsset findings.
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception:
        return []

    config_type = _detect_config_type(file_path)

    if config_type == "ssh":
        return _scan_ssh_content(lines, file_path)
    else:
        # nginx and apache use similar ssl_* directives
        return _scan_nginx_content(lines, file_path)


CONFIG_EXTENSIONS = {".conf", ".cfg", ".ini"}
CONFIG_SPECIFIC_NAMES = {
    "nginx.conf", "sshd_config", "ssh_config", "httpd.conf",
    "apache2.conf", "ssl.conf", "site.conf", "default.conf"
}


def scan_configs_in_directory(dir_path: str) -> List[CryptoAsset]:
    """
    Recursively scan a directory for config files.
    Returns combined list of CryptoAsset findings.
    """
    all_assets: List[CryptoAsset] = []
    for root, _, files in os.walk(dir_path):
        for fname in files:
            fname_lower = fname.lower()
            ext = Path(fname).suffix.lower()
            if fname_lower in CONFIG_SPECIFIC_NAMES or ext in CONFIG_EXTENSIONS:
                full_path = os.path.join(root, fname)
                found = scan_config_file(full_path)
                all_assets.extend(found)
    return all_assets
