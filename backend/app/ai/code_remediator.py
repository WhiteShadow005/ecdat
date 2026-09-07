"""
ECDAT — AI Code Remediator (Enhanced, USP 2)
Uses Google Gemini API to generate unified Git diff patches that replace
vulnerable cryptographic code with NIST PQC implementations.

Improvements over stub:
  - Upgraded to gemini-2.0-flash model
  - Uses shared scan cache (app.cache) with fallback to own _scan_cache
  - Cleaner prompt with explicit output format instruction
  - Better markdown fence stripping

Owner: Aujasya Rajput
"""

import json
from typing import Optional
from ..models import RemediationResult, CryptoAsset
from ..config import GEMINI_API_KEY

# ─── Legacy in-memory cache ────────────────────────────────────────────────────
# Kept for backward compat with main.py which calls register_scan() here.
# New code should use app.cache instead.
_scan_cache: dict = {}


def register_scan(scan_id: str, assets: list):
    """Store scan results for later remediation requests (legacy entry point)."""
    _scan_cache[scan_id] = assets

    # Also mirror into the shared cache so all exporters have access
    try:
        from .. import cache as scan_cache
        scan_cache.save_assets(scan_id, assets)
    except Exception:
        pass


def _get_asset(asset_id: str, scan_id: str) -> Optional[CryptoAsset]:
    """Retrieve a specific asset — checks shared cache first, then legacy."""
    # 1. Try shared scan cache (has full ScanResult)
    try:
        from .. import cache as scan_cache
        asset = scan_cache.get_asset_by_id(scan_id, asset_id)
        if asset:
            return asset
    except Exception:
        pass

    # 2. Fallback: legacy _scan_cache (asset list only)
    assets = _scan_cache.get(scan_id, [])
    for a in assets:
        if a.id == asset_id:
            return a

    # 3. Fallback: SQLite persistence (survives backend restarts)
    try:
        from ..db import get_scan
        scan_rec = get_scan(scan_id)
        if scan_rec:
            for a in scan_rec.assets:
                if a.id == asset_id:
                    _scan_cache[scan_id] = scan_rec.assets
                    return a
    except Exception:
        pass
    return None


# ─── Gemini model to use ──────────────────────────────────────────────────────
_GEMINI_MODEL = "gemini-2.0-flash"


def generate_remediation(asset_id: str, scan_id: str) -> RemediationResult:
    """
    Generate a Git diff patch for a vulnerable asset using Gemini.
    Falls back to a template diff if no API key or Gemini is unavailable.
    """
    asset = _get_asset(asset_id, scan_id)

    if not asset:
        return RemediationResult(
            asset_id=asset_id,
            original_algorithm="Unknown",
            replacement_algorithm="Unknown",
            diff="# Asset not found in scan cache",
            explanation=(
                f"Asset '{asset_id}' not found in scan '{scan_id}'. "
                "Re-run /api/scan first, then use the returned asset IDs."
            ),
        )

    replacement = asset.recommended_replacement or "ML-KEM-768 (FIPS 203)"
    code = asset.code_snippet or f"# {asset.algorithm} usage in {asset.file_path}"

    if not GEMINI_API_KEY:
        return _template_diff(asset, replacement)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(_GEMINI_MODEL)

        prompt = f"""You are a Post-Quantum Cryptography (PQC) migration expert specialised in NIST FIPS 203/204/205.

The following Python code uses **{asset.algorithm}** which is quantum-vulnerable (QARS score: {asset.qars_score}/100).
Replace it with **{replacement}** using the `liboqs-python` library (`import oqs`).

Constraints:
- Output ONLY a unified diff (--- original / +++ fixed). No markdown, no explanation text outside the diff.
- Preserve existing variable names where possible.
- Add a single-line comment explaining the PQC algorithm chosen.
- Do NOT change unrelated code.

Vulnerable code (file: {asset.file_path or 'unknown'}, line {asset.line_number or 0}):
```python
{code}
```

Output format (strict):
--- a/{asset.file_path or 'unknown'}
+++ b/{asset.file_path or 'unknown'}
@@ ... @@
-<original line>
+<fixed line>"""

        response = model.generate_content(prompt)
        diff_text = response.text.strip()

        # Strip any markdown code fences
        if "```" in diff_text:
            parts = diff_text.split("```")
            for part in parts:
                stripped = part.strip()
                if stripped.startswith("diff") or "---" in stripped or "+++" in stripped or "@@" in stripped:
                    diff_text = stripped.removeprefix("diff").strip()
                    break

        # Extract original and remediated lines from diff_text for side-by-side view
        orig_lines = [
            ln[1:] for ln in diff_text.split("\n")
            if ln.startswith("-") and not ln.startswith("---")
        ]
        new_lines = [
            ln[1:] for ln in diff_text.split("\n")
            if ln.startswith("+") and not ln.startswith("+++")
        ]
        return RemediationResult(
            asset_id=asset_id,
            original_algorithm=asset.algorithm,
            replacement_algorithm=replacement,
            file_path=asset.file_path,
            diff=diff_text,
            explanation=(
                f"AI-generated patch (Gemini {_GEMINI_MODEL}) replacing "
                f"{asset.algorithm} with {replacement} per NIST FIPS 203/204."
            ),
            confidence=0.88,
            original_code="\n".join(orig_lines) if orig_lines else code.strip(),
            remediated_code="\n".join(new_lines) if new_lines else f"# TODO: {replacement}",
            nist_standard="NIST FIPS 203/204",
            library_recommendation="liboqs-python (import oqs)",
        )

    except Exception as e:
        return _template_diff(asset, replacement, error=str(e))


def _template_diff(asset: CryptoAsset, replacement: str, error: str = None) -> RemediationResult:
    """
    Generate a deterministic template diff when Gemini is unavailable.
    Covers the most common vulnerable algorithms.
    """
    algo = asset.algorithm
    file_path = asset.file_path or "unknown_file.py"
    line = asset.line_number or 1
    code = asset.code_snippet or f"# {algo} usage"

    algo_upper = algo.upper()

    if "RSA" in algo_upper:
        import_old  = "from cryptography.hazmat.primitives.asymmetric import rsa"
        import_new  = "import oqs  # pip install liboqs-python"
        fixed_code  = (
            "# ML-KEM-768 (FIPS 203) — replaces RSA key encapsulation\n"
            "+kem = oqs.KeyEncapsulation('ML-KEM-768')\n"
            "+public_key = kem.generate_keypair()\n"
            "+ciphertext, shared_secret = kem.encap_secret(public_key)"
        )
    elif "ECDSA" in algo_upper or algo_upper == "EC":
        import_old  = "from cryptography.hazmat.primitives.asymmetric import ec"
        import_new  = "import oqs  # pip install liboqs-python"
        fixed_code  = (
            "# ML-DSA-65 (FIPS 204) — replaces ECDSA digital signatures\n"
            "+sig = oqs.Signature('ML-DSA-65')\n"
            "+public_key = sig.generate_keypair()\n"
            "+signature = sig.sign(message)"
        )
    elif "MD5" in algo_upper:
        import_old  = ""
        import_new  = ""
        fixed_code  = "hashlib.sha256(data).hexdigest()  # SHA-256 (quantum-safe, FIPS 180-4)"
    elif "SHA-1" in algo_upper or "SHA1" in algo_upper:
        import_old  = ""
        import_new  = ""
        fixed_code  = "hashlib.sha256(data).hexdigest()  # SHA-256 (quantum-safe, FIPS 180-4)"
    elif "AES-128" in algo_upper or "AES128" in algo_upper:
        import_old  = ""
        import_new  = ""
        fixed_code  = "AES.new(key_256bit, AES.MODE_GCM)  # AES-256-GCM (quantum-safe)"
    elif "DES" in algo_upper or "3DES" in algo_upper:
        import_old  = "from Crypto.Cipher import DES"
        import_new  = "from Crypto.Cipher import AES"
        fixed_code  = "AES.new(key_256, AES.MODE_GCM)  # AES-256-GCM replaces DES/3DES"
    elif "RC4" in algo_upper:
        import_old  = "from Crypto.Cipher import ARC4"
        import_new  = "from Crypto.Cipher import ChaCha20_Poly1305"
        fixed_code  = "ChaCha20_Poly1305.new(key=key_256)  # ChaCha20-Poly1305 replaces RC4"
    else:
        import_old  = ""
        import_new  = ""
        fixed_code  = f"# TODO: Replace {algo} with {replacement}"

    old_line = import_old if import_old else code.split("\n")[0]

    # fixed_code body lines are authored with a leading "+" for some branches;
    # strip it so each line is prefixed exactly once below (previously produced
    # "++line" artifacts, duplicated the first body line, and dropped the
    # replacement import entirely).
    body_lines = [
        ln[1:] if ln.startswith("+") else ln
        for ln in fixed_code.split("\n")
        if ln.strip()
    ]

    added_lines = ([import_new] if import_new else []) + body_lines
    if not added_lines:
        added_lines = [f"# TODO: Replace {algo} with {replacement}"]

    diff = (
        f"--- a/{file_path}\n"
        f"+++ b/{file_path}\n"
        f"@@ -{line},1 +{line},{len(added_lines)} @@\n"
        f"-{old_line}\n"
    )
    diff += "".join(f"+{ln}\n" for ln in added_lines)

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
        confidence=0.65,
        original_code=code.strip() if code else old_line,
        remediated_code="\n".join(added_lines),
        nist_standard="NIST FIPS 203/204",
        library_recommendation="liboqs / Bouncy Castle PQC",
    )
