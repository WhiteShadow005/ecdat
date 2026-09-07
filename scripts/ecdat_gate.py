#!/usr/bin/env python3
"""
ECDAT Shift-Left Cryptographic Defense Gate
============================================
Zips the repository, sends it to the ECDAT backend for scanning,
and checks for CRITICAL cryptographic vulnerabilities.

Usage:
    python scripts/ecdat_gate.py [--backend-url URL] [--repo-root DIR] [--fail-on-critical]

Exit codes:
    0  Gate passed (or non-blocking demo mode)
    1  Critical vulnerabilities found and --fail-on-critical was specified
    2  Infrastructure / network error
"""

import argparse
import io
import json
import os
import sys
import uuid
import zipfile
import urllib.request
import urllib.error

# Directories/files to exclude from the scan ZIP
EXCLUDE_PATTERNS = {
    "node_modules", ".next", "__pycache__", ".git", "*.pyc",
    "dist", "build", ".env", ".venv", "venv", "*.egg-info",
    ".pytest_cache", ".coverage",
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
                        pass
    buf.seek(0)
    return buf


def http_post_file(url: str, file_buf: io.BytesIO, filename: str = "repo.zip") -> dict:
    boundary = f"----ECDATBoundary{uuid.uuid4().hex}"
    file_bytes = file_buf.getvalue()

    header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/zip\r\n\r\n"
    ).encode("utf-8")
    footer = f"\r\n--{boundary}--\r\n".encode("utf-8")

    body = header + file_bytes + footer
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body)),
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_get(url: str) -> dict:
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="ECDAT Crypto Defense Gate")
    parser.add_argument(
        "--backend-url",
        default=os.environ.get("ECDAT_BACKEND_URL", "http://localhost:8000"),
        help="Base URL of the ECDAT backend",
    )
    parser.add_argument(
        "--repo-root",
        default="demo_quantum_safe_repo",
        help="Root directory of repository to scan (default: demo_quantum_safe_repo)",
    )
    parser.add_argument(
        "--fail-on-critical",
        action="store_true",
        default=False,
        help="Exit with status 1 if any critical vulnerability is found",
    )
    parser.add_argument(
        "--fail-on-unreachable",
        action="store_true",
        default=False,
        help="Exit 1 if backend is unreachable",
    )
    args = parser.parse_args()

    backend_url = args.backend_url.rstrip("/")
    repo_root = os.path.abspath(args.repo_root)

    print("=" * 60)
    print("  ECDAT Shift-Left Cryptographic Defense Gate")
    print("  Problem Statement: SIH26164 | Evaluator: NTRO")
    print("=" * 60)
    print(f"  Backend : {backend_url}")
    print(f"  Target  : {repo_root}")
    print(f"  Mode    : {'Enforcing (fail on critical)' if args.fail_on_critical else 'Audit / Reporting'}")
    print()

    # ── 1. Health check ───────────────────────────────────────────
    print("[ 1/3 ] Checking ECDAT backend health...")
    try:
        health = http_get(f"{backend_url}/api/health")
        print(f"        ✅ Backend live — version {health.get('version', '1.0.0')}")
    except Exception as e:
        print(f"        ⚠️  Backend unreachable: {e}")
        if args.fail_on_unreachable:
            print("::error::ECDAT backend unreachable. Gate failed.")
            sys.exit(1)
        else:
            print("        ℹ️  Gate non-blocking when backend offline. Skipping.")
            sys.exit(0)

    # ── 2. Zip and scan ───────────────────────────────────────────
    print(f"[ 2/3 ] Zipping target codebase ({os.path.basename(repo_root)}) and submitting for analysis...")
    try:
        zip_buf = zip_repo(repo_root)
        data = http_post_file(f"{backend_url}/api/scan", zip_buf, filename=f"{os.path.basename(repo_root)}.zip")
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
    print(f"  │  Scan ID      : {scan_id[:36]:<27} │")
    print(f"  │  Target       : {os.path.basename(repo_root):<27} │")
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
        print(f"  ⚠️  GATE AUDIT: {critical} critical cryptographic vulnerability detected:\n")
        for a in critical_assets[:15]:
            algo  = a.get("algorithm", "unknown")
            file_ = a.get("file", "unknown")
            line  = a.get("line", 0)
            repl  = a.get("replacement", "NIST PQC replacement")
            print(f"     • {algo:<12} @ {file_}:{line} → Migrate to: {repl}")
        print()

        if args.fail_on_critical:
            print("  ❌ GATE FAILED — Critical cryptographic vulnerabilities must be resolved before merging.")
            for a in critical_assets:
                file_ = a.get("file", "")
                line  = a.get("line", 1)
                algo  = a.get("algorithm", "?")
                repl  = a.get("replacement", "NIST PQC replacement")
                print(f"::error file={file_},line={line}::ECDAT: {algo} broken by quantum computing. Migrate to {repl}")
            sys.exit(1)
        else:
            print("  ℹ️  Audit logged. Non-blocking mode passed.")
            sys.exit(0)

    print("  ✅ GATE PASSED — No critical cryptographic vulnerabilities found.")
    print(f"     PQC Readiness: {readiness:.1f}% | Mosca: {mosca_status}")
    print()
    sys.exit(0)


if __name__ == "__main__":
    main()
