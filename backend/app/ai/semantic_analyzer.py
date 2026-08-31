"""
ECDAT — AI Semantic Crypto Analyzer (USP 1)
Uses Google Gemini API to detect hidden cryptographic operations in code
that static AST scanners miss (wrapper classes, dynamic factories, etc.)
Owner: Ojasya Rajput
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


def _analyze_with_gemini(code_snippet: str, function_name: str) -> dict:
    """
    Send a suspicious function to Gemini API for semantic crypto detection.
    Returns {"detected": bool, "algorithm": str, "confidence": float, "explanation": str}
    """
    if not GEMINI_API_KEY:
        return {"detected": False, "algorithm": None, "confidence": 0.0, "explanation": "No API key"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

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
        # Remove markdown fences if present
        if "```" in text:
            text = text.split("```")[1].strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)

    except Exception as e:
        return {"detected": False, "algorithm": None, "confidence": 0.0, "explanation": str(e)}


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
