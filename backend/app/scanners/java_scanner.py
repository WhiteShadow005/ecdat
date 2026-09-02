"""
ECDAT — Java Cryptographic Scanner
Scans .java source files for cryptographic patterns in standard Java APIs
(java.security, javax.crypto, BouncyCastle).
Owner: Shaurya Pratap Singh
"""

import re
from pathlib import Path
from typing import List, Optional
from ..models import CryptoAsset


# Standard Java crypto API factory methods
JAVA_CRYPTO_PATTERNS = [
    # Cipher.getInstance("AES/CBC/PKCS5Padding") or Cipher.getInstance("RSA")
    (
        r'Cipher\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "Cipher",
        "javax.crypto.Cipher",
    ),
    # MessageDigest.getInstance("SHA-256")
    (
        r'MessageDigest\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "MessageDigest",
        "java.security.MessageDigest",
    ),
    # KeyPairGenerator.getInstance("RSA")
    (
        r'KeyPairGenerator\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "KeyPairGenerator",
        "java.security.KeyPairGenerator",
    ),
    # KeyGenerator.getInstance("AES")
    (
        r'KeyGenerator\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "KeyGenerator",
        "javax.crypto.KeyGenerator",
    ),
    # Signature.getInstance("SHA256withRSA")
    (
        r'Signature\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "Signature",
        "java.security.Signature",
    ),
    # Mac.getInstance("HmacSHA256")
    (
        r'Mac\.getInstance\s*\(\s*["\']([^"\']+)["\']',
        "Mac",
        "javax.crypto.Mac",
    ),
    # SecretKeySpec(key, "AES")
    (
        r'new\s+SecretKeySpec\s*\([^,]+,\s*["\']([^"\']+)["\']',
        "SecretKeySpec",
        "javax.crypto.spec.SecretKeySpec",
    ),
]

# Patterns for extracting key sizes like:
# kpg.initialize(2048) or keyGen.init(128)
KEY_SIZE_PATTERN = re.compile(r'\.(?:initialize|init)\s*\(\s*(\d{2,5})\s*[\),]')


def _normalize_java_algorithm(raw_algo: str) -> str:
    """
    Normalizes Java algorithm transformations into standard algorithm names.
    Examples:
      - "RSA/ECB/PKCS1Padding" -> "RSA"
      - "AES/CBC/PKCS5Padding" -> "AES"
      - "DESede/CBC/PKCS5Padding" -> "3DES"
      - "SHA256withRSA" -> "RSA"
      - "SHA256withECDSA" -> "ECDSA"
      - "EC" -> "ECDSA"
    """
    cleaned = raw_algo.strip()
    
    # Strip mode and padding if present (e.g. AES/GCM/NoPadding)
    base_part = cleaned.split('/')[0].strip()
    
    # Handle Java Signature combos (e.g. SHA256withRSA -> RSA)
    if "with" in base_part.lower():
        parts = re.split(r'with', base_part, flags=re.IGNORECASE)
        if len(parts) == 2:
            sig_algo = parts[1].strip().upper()
            if sig_algo in ("RSA", "ECDSA", "DSA"):
                return sig_algo
            if sig_algo == "EC":
                return "ECDSA"
    
    upper_base = base_part.upper()
    if upper_base == "DESEDE":
        return "3DES"
    if upper_base == "EC":
        return "ECDSA"
    if upper_base in ("DIFFIEHELLMAN", "DH"):
        return "Diffie-Hellman"
    
    return base_part


def scan_java_file(file_path: str) -> List[CryptoAsset]:
    """Scan a single .java file for cryptographic usage."""
    path = Path(file_path)
    if not path.is_file() or path.suffix.lower() != ".java":
        return []

    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except Exception:
        return []

    assets: List[CryptoAsset] = []
    in_block_comment = False

    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Handle multi-line block comments
        if in_block_comment:
            if "*/" in stripped:
                in_block_comment = False
            continue
        if stripped.startswith("/*"):
            if "*/" not in stripped:
                in_block_comment = True
            continue
        if stripped.startswith("//"):
            continue

        # Look for cryptographic calls
        for pattern_re, factory_type, library in JAVA_CRYPTO_PATTERNS:
            for match in re.finditer(pattern_re, line):
                raw_algo = match.group(1)
                norm_algo = _normalize_java_algorithm(raw_algo)

                # Look forward a few lines for key size initialization
                key_size: Optional[int] = None
                for forward_idx in range(idx - 1, min(idx + 5, len(lines))):
                    forward_line = lines[forward_idx]
                    size_match = KEY_SIZE_PATTERN.search(forward_line)
                    if size_match:
                        try:
                            key_size = int(size_match.group(1))
                            break
                        except ValueError:
                            pass

                # If key size found and algorithm is RSA/AES, combine name nicely
                full_algo_name = norm_algo
                if key_size and norm_algo.upper() in ("RSA", "AES"):
                    full_algo_name = f"{norm_algo.upper()}-{key_size}"

                asset = CryptoAsset(
                    algorithm=full_algo_name,
                    type="algorithm",
                    key_size=key_size,
                    file_path=str(path),
                    line_number=idx,
                    language="java",
                    library_used=library,
                    code_snippet=line.strip(),
                    notes=f"Found via {factory_type}.getInstance('{raw_algo}')",
                    source_scanner="java_scanner",
                )
                assets.append(asset)

    return assets


def scan_java_directory(dir_path: str) -> List[CryptoAsset]:
    """Scan all .java files within a directory recursively."""
    path = Path(dir_path)
    if not path.is_dir():
        return []

    all_assets: List[CryptoAsset] = []
    for java_file in path.rglob("*.java"):
        # Skip hidden or build directories
        parts = java_file.parts
        if any(p.startswith(".") or p in ("target", "build", "out", "bin") for p in parts):
            continue
        all_assets.extend(scan_java_file(str(java_file)))

    return all_assets
