#!/usr/bin/env python3
"""
ECDAT Shift-Left Cryptographic Defense Gate
============================================
Zips the repository, sends it to the ECDAT backend for scanning,
and exits 1 (fail) if any CRITICAL cryptographic vulnerabilities are found.

Usage:
    python scripts/ecdat_gate.py [--backend-url URL]

Exit codes:
    0  No critical vulnerabilities — PR may merge
    1  Critical vulnerabilities found — PR is blocked
    2  Gate could not run (backend unreachable) — non-blocking by default
"""

import argparse
import io
import json
import os
import sys
import zipfile

try:
    import requests
except ImportError:
    print("::error::Missing 'requests' package. Add it to gate requirements.")
    sys.exit(2)

# Directories/files to exclude from the scan ZIP
EXCLUDE_PATTERNS = {
    "node_modules", ".next", "__pycache__", ".git", "*.pyc",
    "dist", "build", ".env", ".venv", "venv", "*.egg-info",
}


def should_exclude(path: str) -> bool:
    parts = path.replace("\\", "/").split("/")
    for part in parts:
        for pattern in EXCLUDE_PATTERNS:
            if pattern.startswith("*"):
                if part.endswith(pattern[1:]):
                    return True
            elif part == pattern:
                return True
    return False


def zip_repo(root: str) -> io.BytesIO:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(root):
            # Prune excluded directories in-place so os.walk skips them
            dirnames[:] = [
                d for d in dirnames
                if not should_exclude(os.path.relpath(os.path.join(dirpath, d), root))
            ]
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                arcname = os.path.relpath(filepath, root)
                if not should_exclude(arcname):
                    try:
                        zf.write(filepath, arcname)
                    except (OSError, PermissionError):
                        pass  # skip unreadable files
    buf.seek(0)
    return buf


def main():
    parser = argparse.ArgumentParser(description="ECDAT Crypto Defense Gate")
    parser.add_argument(
        "--backend-url",
        default=os.environ.get("ECDAT_BACKEND_URL", "http://localhost:8000"),
        help="Base URL of the ECDAT backend",
    )
    parser.add_argument(
        "--fail-on-unreachable",
        action="store_true",
        default=False,
        help="Exit 1 if the backend cannot be reached (default: non-blocking)",
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Root directory of the repository to scan (default: current dir)",
    )
    args = parser.parse_args()

    backend_url = args.backend_url.rstrip("/")
    repo_root = os.path.abspath(args.repo_root)

    print("=" * 60)
    print("  ECDAT Shift-Left Cryptographic Defense Gate")
    print("  Problem Statement: SIH26164 | Evaluator: NTRO")
    print("=" * 60)
    print(f"  Backend : {backend_url}")
    print(f"  Repo    : {repo_root}")
    print()

    # ── 1. Health check ───────────────────────────────────────────
    print("[ 1/3 ] Checking ECDAT backend health...")
    try:
        health = requests.get(f"{backend_url}/api/health", timeout=10)
        health.raise_for_status()
        print(f"        ✅ Backend live — {health.json().get('version', '?')}")
    except Exception as e:
        print(f"        ⚠️  Backend unreachable: {e}")
        if args.fail_on_unreachable:
            print("::error::ECDAT backend unreachable. Gate failed.")
            sys.exit(1)
        else:
            print("        ℹ️  Gate is non-blocking when backend is down. Skipping.")
            sys.exit(0)

    # ── 2. Zip and scan ───────────────────────────────────────────
    print("[ 2/3 ] Zipping repository and running ECDAT scan...")
    try:
        zip_buf = zip_repo(repo_root)
        response = requests.post(
            f"{backend_url}/api/scan",
            files={"file": ("repo.zip", zip_buf, "application/zip")},
            timeout=300,  # large repos can take a while
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout:
        print("::error::Scan timed out after 300s.")
        sys.exit(2)
    except Exception as e:
        print(f"::error::Scan request failed: {e}")
        sys.exit(2)

    # ── 3. Evaluate results ───────────────────────────────────────
    print("[ 3/3 ] Evaluating cryptographic risk posture...")
    summary = data.get("summary", {})
    assets = data.get("assets", [])

    total    = summary.get("total_assets", len(assets))
    critical = summary.get("critical", 0)
    high     = summary.get("high", 0)
    medium   = summary.get("medium", 0)
    safe     = summary.get("safe", 0)
    readiness = summary.get("quantum_readiness_pct", 0)
    mosca_status = (data.get("mosca") or {}).get("status", "UNKNOWN")
    scan_id  = data.get("scan_id", "unknown")

    print()
    print("  ┌─────────────────────────────────────────────┐")
    print("  │        ECDAT Scan Summary                   │")
    print("  ├─────────────────────────────────────────────┤")
    print(f"  │  Scan ID    : {scan_id[:36]:<29} │")
    print(f"  │  Total Assets : {total:<27} │")
    print(f"  │  Critical     : {critical:<27} │")
    print(f"  │  High         : {high:<27} │")
    print(f"  │  Medium       : {medium:<27} │")
    print(f"  │  Safe         : {safe:<27} │")
    print(f"  │  PQC Readiness: {readiness:.1f}%{'':<25} │")
    print(f"  │  Mosca Status : {mosca_status:<27} │")
    print("  └─────────────────────────────────────────────┘")
    print()

    if critical > 0:
        critical_assets = [a for a in assets if a.get("criticality") == "critical" or a.get("quantum_status") == "BROKEN"]
        print(f"  ❌ GATE FAILED — {critical} critical cryptographic vulnerabilit{'y' if critical == 1 else 'ies'} found:\n")
        for a in critical_assets[:20]:  # cap output at 20 lines
            algo  = a.get("algorithm", "unknown")
            file_ = a.get("file", "unknown")
            line  = a.get("line", 0)
            repl  = a.get("replacement", "NIST PQC replacement")
            print(f"     • {algo:<12} @ {file_}:{line}")
            print(f"       → Migrate to: {repl}")
        if len(critical_assets) > 20:
            print(f"     … and {len(critical_assets) - 20} more. Run ECDAT locally for full report.")
        print()
        print("  Fix these vulnerabilities before merging.")
        print("  Run ECDAT locally → http://localhost:3000/scan for full analysis.")
        print()
        # Emit GitHub Actions annotations
        for a in critical_assets:
            file_ = a.get("file", "")
            line  = a.get("line", 1)
            algo  = a.get("algorithm", "?")
            repl  = a.get("replacement", "NIST PQC replacement")
            print(f"::error file={file_},line={line}::ECDAT: {algo} is broken by quantum computing. Migrate to {repl} [NIST FIPS 203/204/205]")
        sys.exit(1)

    print("  ✅ GATE PASSED — No critical cryptographic vulnerabilities found.")
    print(f"     PQC Readiness: {readiness:.1f}% | Mosca: {mosca_status}")
    print()
    sys.exit(0)


if __name__ == "__main__":
    main()
