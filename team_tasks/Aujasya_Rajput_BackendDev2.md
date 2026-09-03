# 👤 Aujasya Rajput — Backend Dev 2 (Exports + AI + Reports)

## Your Role
You handle everything that comes **after** the scanner finds the vulnerabilities. You build the export formats (CBOM JSON, CSV), the AI-powered features (semantic detection + code remediator), and the PDF report that NTRO judges will see. Your work is what makes this feel like a professional enterprise tool.

---

## What We Are Building (Project Context)
**Project Name:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool  
**Problem Statement:** SIH26164 by NTRO (National Technical Research Organisation, under PMO)  
**Theme:** Blockchain & Cybersecurity  

We are building a tool that:
1. Scans codebases for cryptographic algorithms (RSA, AES, ECDSA, etc.)
2. Checks which ones are quantum-vulnerable
3. Scores the risk using Mosca's Theorem and QARS formula
4. **Exports findings as a standardised CBOM (CycloneDX 1.6 JSON)** ← your job
5. **Uses AI to find hidden crypto and generate code fixes** ← your job
6. **Generates a professional PDF audit report** ← your job

**Tech Stack (Your Part):**
- Language: Python 3.11
- CBOM Library: `cyclonedx-python-lib` (pip)
- PDF: `WeasyPrint` (pip)
- AI: Google Gemini API (`google-generativeai` pip)
- PQC Demo: `liboqs-python` (pip)

**Project folder:** `ecdat/backend/`  
**Shaurya's scanner output** is what you consume — he will share the unified inventory JSON format with you on Day 1.

---

## Day-by-Day Tasks

### Day 1 — Learn the CycloneDX 1.6 CBOM Standard
> **Goal by end of day:** You can write a valid CycloneDX 1.6 CBOM JSON by hand

- [ ] **Install your dependencies**
  ```bash
  pip install cyclonedx-python-lib WeasyPrint google-generativeai
  ```

- [ ] **Read and understand CycloneDX 1.6 CBOM format**
  - Go to: https://cyclonedx.org/docs/1.6/
  - Focus on: `cryptographic-asset` component type, `cryptoProperties` object, `algorithmProperties`, `certificateProperties`
  - Write a sample CBOM JSON file manually with 2–3 fake assets just to understand the schema

- [ ] **Set up Gemini API key**
  - Go to: https://aistudio.google.com/app/apikey
  - Get a free API key, store it in `ecdat/backend/.env` as `GEMINI_API_KEY=your_key_here`
  - Test it: `from google import generativeai as genai` → send a test message

- [ ] **Understand Shaurya's output format**
  - Ask Shaurya for the unified inventory JSON schema (the asset list format)
  - This is your input — you take his list and produce the CBOM, PDF, AI outputs

---

### Day 2 — CBOM Exporter + CSV + PDF Template
> **Goal by end of day:** Given a list of scan findings, you can export CBOM JSON and CSV

- [ ] **Build CycloneDX 1.6 CBOM Exporter** → `ecdat/backend/app/exporters/cbom_exporter.py`
  - Use `cyclonedx-python-lib` to construct CBOM objects
  - For each asset from Shaurya's inventory: create a `Component` of type `cryptographic-asset`
  - Add `cryptoProperties` with: `assetType`, `algorithmProperties` (primitive, parameterSetIdentifier, nistQuantumSecurityLevel)
  - Add custom `properties`: `ecdat:vulnerabilityStatus`, `ecdat:qarsRiskScore`, `ecdat:moscaStatus`, `ecdat:recommendedReplacement`, `ecdat:filePath`
  - Serialize to CycloneDX 1.6 JSON
  - Expose as: `GET /api/export/cbom?scan_id=abc123`

- [ ] **Build CSV Exporter** → `ecdat/backend/app/exporters/csv_exporter.py`
  - Simple: convert asset list to CSV with columns: Algorithm, File, Line, Quantum Status, QARS Score, Replacement, Criticality
  - Expose as: `GET /api/export/csv?scan_id=abc123`

- [ ] **Start PDF Report Template** → `ecdat/backend/app/exporters/pdf_report.py`
  - Create an HTML template (Jinja2) for the report
  - Sections to include:
    - Cover page: "ECDAT Quantum Risk Audit Report", org name, date, scan ID
    - Executive Summary: total assets, % vulnerable, Mosca status
    - Detailed Findings Table: one row per asset
    - Recommendations section: PQC migration plan
  - Use WeasyPrint to convert HTML → PDF
  - Expose as: `GET /api/export/pdf?scan_id=abc123`

---

### Day 3 — AI Features + PQC Proof Demo
> **Goal by end of day:** AI detects hidden crypto AND generates code fixes. PQC demo runs live.

- [ ] **AI Semantic Analyzer (USP 1)** → `ecdat/backend/app/ai/semantic_analyzer.py`
  - This catches crypto that the static scanner MISSES (wrapper classes, dynamic selection)
  - After static scan, collect all Python function bodies that look "suspicious" (contain words like `encrypt`, `sign`, `hash`, `key`, `cipher` but weren't flagged by the scanner)
  - Send them to Gemini API with this prompt:
    ```
    Analyze this Python function. Does it perform any cryptographic operations?
    If yes, identify: algorithm name, key size (if visible), what it's used for.
    If no, say "no crypto found".
    Function: {code_snippet}
    ```
  - Parse the response and add newly found assets back to the inventory
  - Expose as part of the `/api/scan` pipeline (called after static scan)

- [ ] **AI Code Remediator (USP 2)** → `ecdat/backend/app/ai/code_remediator.py`
  - Input: `{asset_id}` from the scan results
  - Fetch the original code snippet + recommended replacement algorithm
  - Send to Gemini API:
    ```
    The following Python code uses {algorithm} which is quantum-vulnerable.
    Replace it with {replacement} using the liboqs-python library.
    Show the change as a unified diff.
    Original code:
    {code_snippet}
    ```
  - Return the diff to the frontend
  - Expose as: `POST /api/remediate` with body `{"asset_id": "asset-001", "scan_id": "abc123"}`

- [ ] **liboqs PQC Proof Endpoint** → `ecdat/backend/app/ai/pqc_proof.py`
  - Install liboqs: https://github.com/open-quantum-safe/liboqs-python (follow their README carefully, needs liboqs C library)
  - Build `GET /api/demo/pqc` that:
    1. Runs ML-KEM-768 key encapsulation (proves key exchange works)
    2. Runs ML-DSA-65 signing (proves digital signatures work)
    3. Returns: algorithm names, key sizes, timing in milliseconds
  - This is used in the demo to say: *"The replacement we recommend — it actually works, right here"*

- [ ] **Finalize PDF report** with real data, scan summary charts (use base64-encoded chart images)

---

## Key Concepts You Need to Know

### CycloneDX 1.6 CBOM — What it is
CycloneDX is an international standard (ECMA-424) for listing all cryptographic assets in software. It's like a "bill of materials" for crypto — instead of listing ingredients in food, it lists all algorithms, keys, and certificates in a system. NTRO explicitly asked for this format.

### AI Semantic Detection — Why it matters
Normal scanners use pattern matching (like CTRL+F for crypto keywords). They miss:
- Custom wrapper functions: `def encrypt_data(msg):` that internally uses RSA
- Dynamic algorithm selection: `algo = config["cipher"]` → Cipher.get(algo)

Our AI reads the actual function body and understands what it does, catching what pattern matching misses.

### Code Remediator — Why it's a USP
Every other CBOM tool on Earth says "you're using RSA-2048, that's bad." And then... nothing. The developer still has to figure out how to fix it. We generate the actual fix code. Nobody else does this.

---

## Git Workflow
```bash
# Your branch: dev/aujasya
git checkout -b dev/aujasya

# Commit often (every 30–60 mins)
git add .
git commit -m "feat: add CycloneDX 1.6 CBOM exporter"
git push origin dev/aujasya

# When done: merge to main
git checkout main
git pull origin main
git merge dev/aujasya
git push origin main
```

---

## Key Resources
- cyclonedx-python-lib: https://github.com/CycloneDX/cyclonedx-python-lib
- CycloneDX 1.6 CBOM spec: https://cyclonedx.org/docs/1.6/
- Gemini API Python: https://ai.google.dev/gemini-api/docs/quickstart?lang=python
- liboqs-python: https://github.com/open-quantum-safe/liboqs-python
- WeasyPrint docs: https://doc.courtbouillon.org/weasyprint/stable/
