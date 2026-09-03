"""
ECDAT — AI Semantic Crypto Analyzer (USP 1)
Uses Google Gemini API to detect hidden cryptographic operations in code
that static AST scanners miss (wrapper classes, dynamic factories, etc.)
Owner: Aujasya Rajput
"""

import os
import ast
from pathlib import Path
from typing import List, Optional
from ..models import CryptoAsset
from ..config import GEMINI_API_KEY


SUSPICIOUS_NAMES = {
    "encrypt", "decrypt", "sign", "verify", "hash", "cipher",
    "key", "secret", "token", "digest", "hmac", "aes", "rsa",
    "ssl", "tls", "pem", "cert", "crypt", "encode", "decode",
    "generate_key", "derive_key", "wrap_key", "seal", "unseal",
}


def _extract_suspicious_functions(file_path: str) -> List[dict]:
    """
    Find functions whose name suggests crypto activity but weren't flagged
    by the AST scanner (i.e., they don't use known library names directly).
    """
    suspicious = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            source = f.read()
        tree = ast.parse(source, filename=file_path)
    except Exception:
        return suspicious

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            name_lower = node.name.lower()
            if any(kw in name_lower for kw in SUSPICIOUS_NAMES):
                try:
                    body_src = ast.unparse(node)[:800]
                except Exception:
                    body_src = node.name
                suspicious.append({
                    "function_name": node.name,
                    "line_number": node.lineno,
                    "body_snippet": body_src,
                    "file_path": file_path,
                })
    return suspicious


def _heuristic_semantic_detection(code_snippet: str, function_name: str) -> dict:
    """Offline heuristic fallback for semantic detection when Gemini API is unavailable."""
    code_lower = (code_snippet + " " + function_name).lower()
    if "md5" in code_lower:
        return {"detected": True, "algorithm": "MD5", "confidence": 0.85, "explanation": "MD5 hash/token generation detected in wrapper function"}
    if "sha1" in code_lower or "sha-1" in code_lower:
        return {"detected": True, "algorithm": "SHA-1", "confidence": 0.85, "explanation": "SHA-1 digest detected in wrapper function"}
    if "sha256" in code_lower or "sha-256" in code_lower:
        return {"detected": True, "algorithm": "SHA-256", "confidence": 0.80, "explanation": "SHA-256 digest detected in wrapper function"}
    if "aes" in code_lower:
        return {"detected": True, "algorithm": "AES-128", "confidence": 0.80, "explanation": "Symmetric AES cipher operation detected in wrapper function"}
    if "rsa" in code_lower:
        return {"detected": True, "algorithm": "RSA-2048", "confidence": 0.80, "explanation": "RSA key or signing operation detected in wrapper function"}
    if "des" in code_lower:
        return {"detected": True, "algorithm": "DES", "confidence": 0.80, "explanation": "DES cipher operation detected in wrapper function"}
    return {"detected": False, "algorithm": None, "confidence": 0.0, "explanation": "no crypto found"}


def _analyze_with_gemini(code_snippet: str, function_name: str) -> dict:
    """
    Send a suspicious function to Gemini API for semantic crypto detection.
    Falls back to offline heuristic analysis if API key is not configured or network fails.
    Returns {"detected": bool, "algorithm": str, "confidence": float, "explanation": str}
    """
    if not GEMINI_API_KEY:
        return _heuristic_semantic_detection(code_snippet, function_name)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = f"""Analyze this Python function for cryptographic operations.

Function name: {function_name}
Code:
```python
{code_snippet[:600]}
```

Answer ONLY in this exact JSON format (no markdown, no extra text):
{{"detected": true/false, "algorithm": "RSA-2048 or AES-128 or MD5 etc or null", "confidence": 0.0-1.0, "explanation": "brief reason"}}

If no cryptographic operation is present, return {{"detected": false, "algorithm": null, "confidence": 0.0, "explanation": "no crypto found"}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Parse JSON response
        import json
        if "```" in text:
            text = text.split("```")[1].strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)

    except Exception:
        return _heuristic_semantic_detection(code_snippet, function_name)


# Ordered (fragment, family) rules for coarse dedupe keys. Order matters:
# more specific fragments (3DES, SHA-1 vs SHA-256) must precede generic ones
# (DES, SHA). "AES", "AES-128", "AES-256" all collapse to "aes" so the AI
# pass never re-reports crypto the static scanner already found.
_FAMILY_RULES = (
    ("TRIPLE", "3des"), ("3DES", "3des"),
    ("SHA-256", "sha256"), ("SHA256", "sha256"),
    ("SHA-3", "sha3"), ("SHA3", "sha3"),
    ("SHA-1", "sha1"), ("SHA1", "sha1"),
    ("HMAC", "hmac"),
    ("MD5", "md5"),
    ("ECDSA", "ecdsa"),
    ("RSA", "rsa"),
    ("AES", "aes"),
    ("ARC4", "rc4"), ("RC4", "rc4"),
    ("DIFFIE", "dh"), ("ECDH", "ecdh"),
    ("DSA", "dsa"),
    ("DES", "des"),
    ("JWT", "jwt"),
)


def crypto_family(algorithm: Optional[str]) -> str:
    """
    Coarse algorithm family key used for cross-scanner deduplication.

    'AES', 'AES-128' and 'AES-256' all collapse to 'aes', while 'SHA-1' vs
    'SHA-256' and 'DES' vs '3DES' remain distinct families.
    """
    a = (algorithm or "").upper().strip()
    if not a:
        return ""
    for fragment, family in _FAMILY_RULES:
        if fragment in a:
            return family
    return a


def run_semantic_analysis(
    dir_path: str,
    skip_keys: Optional[set] = None,
    use_gemini: bool = False,
) -> List[CryptoAsset]:
    """
    Run AI semantic analysis on Python files in dir_path.
    Detects crypto hidden in wrappers / dynamic code that static scanners miss.

    Args:
        dir_path:   Root directory to walk for .py files.
        skip_keys:  Set of "ALGORITHM|file_path" keys already reported by the
                    static scanners — those (file, algorithm) hits are not
                    re-reported as AI findings.
        use_gemini: When True, query Gemini for analysis (still falls back to
                    the offline heuristic when no API key or on network error).
                    When False, only the fast offline heuristic runs.

    Returns:
        List of newly discovered CryptoAsset findings.
    """
    skip_keys = skip_keys or set()
    new_assets: List[CryptoAsset] = []

    for root, _, files in _walk(dir_path):
        for fname in files:
            if not fname.endswith(".py"):
                continue
            fpath = str(Path(root) / fname)
            suspicious_fns = _extract_suspicious_functions(fpath)
            seen_keys = set()

            for fn in suspicious_fns:
                if use_gemini:
                    result = _analyze_with_gemini(fn["body_snippet"], fn["function_name"])
                else:
                    result = _heuristic_semantic_detection(fn["body_snippet"], fn["function_name"])

                if not (result.get("detected") and result.get("algorithm")):
                    continue
                if result.get("confidence", 0) < 0.6:
                    continue

                # Don't re-report crypto the static scanner already flagged in
                # this file, and avoid duplicate hits within this pass. Family
                # keys make 'AES-128' (AI) dedupe against 'AES' (static).
                key = f"{crypto_family(result['algorithm'])}|{fpath}"
                if key in skip_keys or key in seen_keys:
                    continue
                seen_keys.add(key)

                asset = CryptoAsset(
                    algorithm=result["algorithm"],
                    type="algorithm",
                    file_path=fpath,
                    line_number=fn["line_number"],
                    language="python",
                    code_snippet=fn["body_snippet"][:200],
                    notes=f"AI detected (confidence {result['confidence']:.0%}): {result['explanation']}",
                    source_scanner="ai_semantic_analyzer",
                )
                new_assets.append(asset)

    return new_assets


def _walk(dir_path: str):
    """Fallback os.walk wrapper."""
    import os
    for root, dirs, files in os.walk(dir_path):
        yield root, dirs, files
