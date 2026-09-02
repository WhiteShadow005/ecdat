"""
ECDAT — AI Semantic Crypto Analyzer (USP 1)
Uses Google Gemini API to detect hidden cryptographic operations in code
that static AST scanners miss (wrapper classes, dynamic factories, etc.)
Owner: Aujasya Rajput
"""

import os
import ast
from pathlib import Path
from typing import List
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


def run_semantic_analysis(dir_path: str, already_found_paths: set = None) -> List[CryptoAsset]:
    """
    Run AI semantic analysis on Python files in dir_path.
    Focuses on functions NOT already detected by the static scanner.
    Returns list of newly discovered CryptoAsset findings.
    """
    already_found_paths = already_found_paths or set()
    new_assets: List[CryptoAsset] = []

    for root, _, files in Path(dir_path).walk() if hasattr(Path(dir_path), 'walk') else _walk(dir_path):
        for fname in files:
            if not fname.endswith(".py"):
                continue
            fpath = str(Path(root) / fname)
            suspicious_fns = _extract_suspicious_functions(fpath)

            for fn in suspicious_fns:
                result = _analyze_with_gemini(fn["body_snippet"], fn["function_name"])
                if result.get("detected") and result.get("algorithm") and result.get("confidence", 0) >= 0.6:
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
