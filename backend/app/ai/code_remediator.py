"""
ECDAT — AI Code Remediator (USP 2)
Uses Google Gemini API to generate unified Git diff patches that replace
vulnerable cryptographic code with NIST PQC implementations.
Owner: Ojasya Rajput
"""

import json
from typing import Optional
from ..models import RemediationResult, CryptoAsset
from ..config import GEMINI_API_KEY

# In-memory scan cache (in production this would be a database)
# scan_id → list of CryptoAsset
_scan_cache: dict = {}


def register_scan(scan_id: str, assets: list):
    """Store scan results for later remediation requests."""
    _scan_cache[scan_id] = assets


def _get_asset(asset_id: str, scan_id: str) -> Optional[CryptoAsset]:
    """Retrieve a specific asset from the scan cache."""
    assets = _scan_cache.get(scan_id, [])
    for a in assets:
        if a.id == asset_id:
            return a
    return None


def generate_remediation(asset_id: str, scan_id: str) -> RemediationResult:
    """
    Generate a Git diff patch for a vulnerable asset using Gemini.
    """
    asset = _get_asset(asset_id, scan_id)

    if not asset:
        return RemediationResult(
            asset_id=asset_id,
            original_algorithm="Unknown",
            replacement_algorithm="Unknown",
            diff="# Asset not found in scan cache",
            explanation="Asset ID not found. Re-run the scan first.",
        )

    replacement = asset.recommended_replacement or "ML-KEM-768 (FIPS 203)"
    code = asset.code_snippet or f"# {asset.algorithm} usage in {asset.file_path}"

    if not GEMINI_API_KEY:
        # Return a template diff when no API key is available
        return _template_diff(asset, replacement)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are a Post-Quantum Cryptography migration expert.

The following Python code uses {asset.algorithm} which is quantum-vulnerable.
Replace it with {replacement} using the liboqs-python library (import oqs).

Show ONLY a unified diff (--- original / +++ fixed format). No markdown, no explanation outside the diff.

Vulnerable code (file: {asset.file_path or 'unknown'}, line {asset.line_number or 0}):
```python
{code}
```

Requirements:
- Use `import oqs` for PQC operations
- Preserve the same variable names where possible
- Add a comment explaining the PQC algorithm used
- Output a valid Python unified diff"""

        response = model.generate_content(prompt)
        diff_text = response.text.strip()

        # Clean markdown fences
        if "```" in diff_text:
            parts = diff_text.split("```")
            for p in parts:
                if "---" in p or "+++" in p or "@@" in p:
                    diff_text = p.strip()
                    break

        return RemediationResult(
            asset_id=asset_id,
            original_algorithm=asset.algorithm,
            replacement_algorithm=replacement,
            file_path=asset.file_path,
            diff=diff_text,
            explanation=f"AI-generated patch replacing {asset.algorithm} with {replacement} (NIST FIPS 203/204)",
            confidence=0.85,
        )

    except Exception as e:
        return _template_diff(asset, replacement, error=str(e))


def _template_diff(asset: CryptoAsset, replacement: str, error: str = None) -> RemediationResult:
    """Generate a template diff when Gemini is unavailable."""
    algo = asset.algorithm
    file_path = asset.file_path or "unknown_file.py"
    line = asset.line_number or 1
    code = asset.code_snippet or f"# {algo} usage"

    if "RSA" in algo.upper():
        fixed_code = "kem = oqs.KeyEncapsulation('Kyber768')  # ML-KEM-768 (FIPS 203)\npublic_key = kem.generate_keypair()"
        import_old = "from cryptography.hazmat.primitives.asymmetric import rsa"
        import_new = "import oqs  # pip install liboqs-python"
    elif "MD5" in algo.upper():
        fixed_code = "hash_value = hashlib.sha256(data).hexdigest()  # SHA-256 (quantum-safe)"
        import_old = ""
        import_new = ""
    elif "SHA-1" in algo.upper() or "SHA1" in algo.upper():
        fixed_code = "hash_value = hashlib.sha256(data).hexdigest()  # SHA-256 (quantum-safe)"
        import_old = ""
        import_new = ""
    elif "AES-128" in algo.upper():
        fixed_code = "cipher = AES.new(key_256bit, AES.MODE_GCM)  # AES-256-GCM (quantum-safe)"
        import_old = ""
        import_new = ""
    else:
        fixed_code = f"# TODO: Replace {algo} with {replacement}"
        import_old = ""
        import_new = ""

    diff = f"""--- a/{file_path}
+++ b/{file_path}
@@ -{line},1 +{line},2 @@
-{import_old if import_old else code}
+{import_new if import_new else ''}
+{fixed_code}"""

    explanation = f"Template patch: Replace {algo} with {replacement}."
    if error:
        explanation += f" (Gemini unavailable: {error})"

    return RemediationResult(
        asset_id=asset.id,
        original_algorithm=algo,
        replacement_algorithm=replacement,
        file_path=file_path,
        diff=diff,
        explanation=explanation,
        confidence=0.6,
    )
