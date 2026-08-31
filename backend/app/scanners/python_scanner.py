"""
ECDAT — Python AST Crypto Scanner
Walks .py files using Python's ast module to detect cryptographic library usage.
Owner: Shaurya Pratap Singh
"""

import ast
import os
from pathlib import Path
from typing import List, Optional
from ..models import CryptoAsset


# ─── Detection patterns for Python crypto libraries ───────────────────────────
# Maps library import names to algorithm hints we should flag

IMPORT_ALGORITHM_MAP = {
    # cryptography (hazmat)
    "cryptography.hazmat.primitives.asymmetric.rsa": "RSA",
    "cryptography.hazmat.primitives.asymmetric.ec": "ECDSA",
    "cryptography.hazmat.primitives.asymmetric.dh": "Diffie-Hellman",
    "cryptography.hazmat.primitives.asymmetric.dsa": "DSA",
    "cryptography.hazmat.primitives.asymmetric.padding": "RSA",
    "cryptography.hazmat.primitives.ciphers": "AES",
    "cryptography.hazmat.primitives.hashes": "hash",
    "cryptography.hazmat.primitives.hmac": "HMAC",

    # pycryptodome
    "Crypto.PublicKey.RSA": "RSA",
    "Crypto.PublicKey.ECC": "ECDSA",
    "Crypto.Cipher.AES": "AES",
    "Crypto.Cipher.DES": "DES",
    "Crypto.Cipher.DES3": "3DES",
    "Crypto.Cipher.ARC4": "RC4",
    "Crypto.Cipher.ChaCha20": "ChaCha20-Poly1305",
    "Crypto.Hash.MD5": "MD5",
    "Crypto.Hash.SHA1": "SHA-1",
    "Crypto.Hash.SHA256": "SHA-256",

    # hashlib
    "hashlib": "hash",

    # jwt / pyjwt
    "jwt": "JWT",
    "jose": "JOSE",

    # ssl / tls
    "ssl": "TLS",
}

# Maps function call patterns to specific algorithm names
CALL_ALGORITHM_MAP = {
    # RSA
    "generate_private_key": ("RSA", None),
    "rsa.generate_private_key": ("RSA-2048", "rsa"),
    "RSA.generate": ("RSA", "pycryptodome"),
    "RSA.import_key": ("RSA", "pycryptodome"),
    "RSA.construct": ("RSA", "pycryptodome"),

    # ECDSA / EC
    "generate": ("ECDSA", "ec"),
    "ec.generate_private_key": ("ECDSA", "cryptography"),
    "ec.SECP256R1": ("ECDSA-secp256r1", "cryptography"),
    "ec.SECP384R1": ("ECDSA-secp384r1", "cryptography"),

    # AES
    "AES.new": ("AES", "pycryptodome"),
    "Cipher": ("AES", "cryptography"),
    "algorithms.AES": ("AES", "cryptography"),

    # Hashes (need to check arg to know which)
    "hashlib.md5": ("MD5", "hashlib"),
    "hashlib.sha1": ("SHA-1", "hashlib"),
    "hashlib.sha256": ("SHA-256", "hashlib"),
    "hashlib.sha512": ("SHA-512", "hashlib"),
    "hashlib.sha3_256": ("SHA-3-256", "hashlib"),
    "hashlib.new": ("hash-dynamic", "hashlib"),

    # DES / RC4
    "DES.new": ("DES", "pycryptodome"),
    "DES3.new": ("3DES", "pycryptodome"),
    "ARC4.new": ("RC4", "pycryptodome"),

    # JWT
    "jwt.encode": ("JWT", "pyjwt"),
    "jwt.decode": ("JWT", "pyjwt"),
}

# String argument literals that give us the specific algorithm
STRING_ALGORITHM_MAP = {
    "RSA": "RSA",
    "EC": "ECDSA",
    "DSA": "DSA",
    "DH": "Diffie-Hellman",
    "AES": "AES",
    "AES-128-CBC": "AES-128",
    "AES-256-GCM": "AES-256",
    "AES/CBC/PKCS5Padding": "AES-128",
    "AES/GCM/NoPadding": "AES-256",
    "RSA/ECB/PKCS1Padding": "RSA",
    "secp256r1": "ECDSA-secp256r1",
    "prime256v1": "ECDSA-secp256r1",
    "MD5": "MD5",
    "SHA-1": "SHA-1",
    "SHA1": "SHA-1",
    "SHA-256": "SHA-256",
    "SHA-512": "SHA-512",
    "HS256": "HMAC-SHA256 (JWT)",
    "HS512": "HMAC-SHA512 (JWT)",
    "RS256": "RSA-2048 (JWT)",
    "ES256": "ECDSA (JWT)",
}

# Key size detection (look for numeric literals near crypto calls)
RSA_KEY_SIZES = {1024: "RSA-1024", 2048: "RSA-2048", 3072: "RSA-3072", 4096: "RSA-4096"}


class PythonCryptoVisitor(ast.NodeVisitor):
    """AST visitor that detects cryptographic API calls in Python source files."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.findings: List[dict] = []
        self._imports: dict = {}   # alias → module

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            name = alias.asname if alias.asname else alias.name
            self._imports[name] = alias.name
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            name = alias.asname if alias.asname else alias.name
            full = f"{module}.{alias.name}"
            self._imports[name] = full
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        algo, library, key_size = self._extract_crypto_call(node)
        if algo:
            snippet = self._get_snippet(node)
            self.findings.append({
                "algorithm": algo,
                "library_used": library,
                "key_size": key_size,
                "line_number": node.lineno,
                "code_snippet": snippet,
            })
        self.generic_visit(node)

    def _extract_crypto_call(self, node: ast.Call):
        """Try to extract algorithm name from a function call node."""
        algo = None
        library = None
        key_size = None

        call_str = self._call_to_str(node.func)

        # Direct call map match
        for pattern, (detected_algo, detected_lib) in CALL_ALGORITHM_MAP.items():
            if pattern in call_str:
                algo = detected_algo
                library = detected_lib

                # Try to extract key_size from arguments (e.g., key_size=2048)
                for kw in node.keywords:
                    if kw.arg == "key_size" and isinstance(kw.value, ast.Constant):
                        size = int(kw.value.value)
                        algo = RSA_KEY_SIZES.get(size, f"RSA-{size}")
                        key_size = size

                # Check positional args for string algorithm names
                for arg in node.args:
                    if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                        mapped = STRING_ALGORITHM_MAP.get(arg.value)
                        if mapped:
                            algo = mapped
                break

        # Also check if any string arg matches algorithm names (e.g., Cipher.getInstance("RSA"))
        if not algo:
            for arg in node.args:
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                    mapped = STRING_ALGORITHM_MAP.get(arg.value)
                    if mapped:
                        algo = mapped
                        library = "java-style-api"

        return algo, library, key_size

    def _call_to_str(self, node) -> str:
        """Convert a function call node to a string representation."""
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            return f"{self._call_to_str(node.value)}.{node.attr}"
        return ""

    def _get_snippet(self, node: ast.AST) -> str:
        """Extract a short code snippet. Falls back to empty string if unavailable."""
        try:
            return ast.unparse(node)[:200]
        except Exception:
            return ""


def scan_python_file(file_path: str) -> List[CryptoAsset]:
    """
    Scan a single Python file for cryptographic API usage.
    Returns a list of CryptoAsset findings.
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            source = f.read()
    except Exception:
        return []

    try:
        tree = ast.parse(source, filename=file_path)
    except SyntaxError:
        return []

    visitor = PythonCryptoVisitor(file_path)
    visitor.visit(tree)

    assets = []
    for finding in visitor.findings:
        algo = finding["algorithm"]
        asset = CryptoAsset(
            algorithm=algo,
            type="algorithm",
            file_path=file_path,
            line_number=finding["line_number"],
            language="python",
            library_used=finding.get("library_used"),
            key_size=finding.get("key_size"),
            code_snippet=finding.get("code_snippet", ""),
            source_scanner="python_ast_scanner",
        )
        assets.append(asset)

    return assets


def scan_python_directory(dir_path: str) -> List[CryptoAsset]:
    """
    Recursively scan all .py files in a directory.
    Returns a combined list of all CryptoAsset findings.
    """
    all_assets: List[CryptoAsset] = []
    for root, _, files in os.walk(dir_path):
        for fname in files:
            if fname.endswith(".py"):
                full_path = os.path.join(root, fname)
                found = scan_python_file(full_path)
                all_assets.extend(found)
    return all_assets
