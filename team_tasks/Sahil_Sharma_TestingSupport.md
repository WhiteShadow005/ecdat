# 👤 Sahil Sharma — QA, Testbench & Utility Support Lead

## Your Role
You are the **Reliability & Integration Guardian** of the team. A demo failure in front of SIH judges is fatal. Your job is to make sure our code never crashes, that our testbench repository contains realistic enterprise vulnerabilities, that the generated CBOM files are 100% standards-compliant, and that every team member has what they need to stay unblocked.

---

## What We Are Building (Project Context)
**Project Name:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool  
**Problem Statement:** `SIH26164` by NTRO (National Technical Research Organisation / PMO India)  
**Theme:** Blockchain & Cybersecurity  

We are building a tool that scans codebases, config files, certificates, and Docker images to find all cryptographic algorithms (RSA, AES, ECDSA, MD5, etc.), assesses quantum risk using NIST 2024 standards and Mosca's Theorem, exports CycloneDX 1.6 CBOMs, and provides 1-click AI code remediation.

**Your Primary Responsibilities:**
1. **The Synthetic Demo Testbench:** Build the realistic enterprise mock repository that we will upload during the live demo.
2. **QA & Edge Case Testing:** Stress-test Shaurya's backend, Aujasya's CBOM exporter, and Arnav's frontend.
3. **Environment & Utility Support:** Help team members with Git conflicts, package installations, dependencies, and local dev environments.
4. **CBOM Schema Validation:** Verify that our exported JSON strictly matches the official CycloneDX 1.6 specification.

---

## Day-by-Day Tasks

### Day 1 — Build the Synthetic Enterprise Testbench
> **Goal by end of day:** A fully populated `demo_enterprise_repo/` ready for Shaurya and Arnav to test with.

- [ ] **Create the testbench repository structure inside `ecdat/demo_enterprise_repo/`:**
  ```text
  demo_enterprise_repo/
  ├── src/
  │   ├── auth/
  │   │   ├── jwt_signer.py          # Deliberate RSA-2048 JWT signing
  │   │   └── password_hasher.py     # Deliberate MD5 password hashing
  │   ├── payments/
  │   │   ├── PaymentGateway.java    # KeyPairGenerator("RSA"), Cipher("AES/CBC")
  │   │   └── TransactionSigner.java # ECDSA (secp256r1) signing
  │   ├── api/
  │   │   └── crypto_wrapper.py      # Custom wrapper class (for AI USP detection)
  │   └── utils/
  │       └── file_encryptor.py      # AES-128-CBC (weakened symmetric)
  ├── config/
  │   ├── nginx.conf                 # ssl_protocols TLSv1.2; ssl_ciphers ECDHE-RSA-AES128
  │   └── sshd_config                # HostKeyAlgorithms ssh-rsa; KexAlgorithms diffie-hellman
  ├── certs/
  │   ├── server.pem                 # Self-signed RSA-2048 certificate
  │   └── ca_bundle.crt              # Intermediate CA with SHA-1 signature
  ├── requirements.txt               # pycryptodome==3.19.0, PyJWT==2.8.0
  └── pom.xml                        # BouncyCastle 1.70 dependency
  ```

- [ ] **Write the actual code files** inside `demo_enterprise_repo/` with realistic syntax and deliberate cryptographic flaws.
- [ ] **Create a `.zip` archive of this folder** (`demo_enterprise_repo.zip`) for drag-and-drop testing on Arnav's UI.

---

### Day 2 — Validation & Test Automation Setup
> **Goal by end of day:** Automated test scripts verifying the scanner output against expected findings.

- [ ] **Write a verification test script** (`backend/tests/test_scanner_accuracy.py`):
  - Call Shaurya's `/api/scan` on `demo_enterprise_repo.zip`
  - Assert that all 10+ expected vulnerabilities are found:
    - [x] RSA-2048 in `jwt_signer.py` (Broken)
    - [x] MD5 in `password_hasher.py` (Broken)
    - [x] RSA in `PaymentGateway.java` (Broken)
    - [x] ECDSA in `TransactionSigner.java` (Broken)
    - [x] AES-128 in `file_encryptor.py` (Weakened)
    - [x] SHA-1 in `ca_bundle.crt` (Broken)
    - [x] RSA in `server.pem` (Broken)
    - [x] TLS 1.2 / DHE in `nginx.conf` and `sshd_config` (Broken)

- [ ] **Verify CycloneDX 1.6 CBOM JSON Schema Compliance:**
  - Install schema validator: `pip install jsonschema`
  - Download official CycloneDX 1.6 JSON schema from https://cyclonedx.org/schema/bom-1.6.schema.json
  - Write a validator script: `python tests/validate_cbom_schema.py`
  - Ensure Aujasya's exported CBOM passes validation with 0 errors.

---

### Day 3 — Edge Case & Stress Testing
> **Goal by end of day:** Identify and log all failure points before judges see them.

- [ ] **Create 3 additional test datasets:**
  1. `clean_pqc_repo.zip`: A codebase using ONLY quantum-safe crypto (ML-KEM, AES-256, SHA-3) → Verify ECDAT gives a 100% Quantum-Ready score!
  2. `empty_repo.zip`: An empty project → Verify ECDAT handles gracefully without crashing or 500 error.
  3. `corrupted_certs_repo.zip`: A folder with truncated `.pem` files and invalid configs → Verify error handling.

- [ ] **Test the live TLS Prober:**
  - Test Shaurya's TLS probe against real websites: `google.com`, `cloudflare.com`, `badssl.com`
  - Verify cipher suite extraction and cert expiration warnings.

---

### Day 4 — End-to-End Integration QA & Bug Squashing
> **Goal by end of day:** The full flow works smoothly on both local and staging setups.

- [ ] **Perform Full User Journey Testing on Arnav's Frontend:**
  - Upload `demo_enterprise_repo.zip` → Check loading spinner → Verify all cards populate
  - Check Heatmap rendering → Click an asset → Check details drawer
  - Open Mosca Timeline → Move sliders → Check real-time calculation
  - Click AI Fix → Verify diff viewer displays cleanly without layout breaks
  - Click Download CBOM, PDF, and CSV → Verify valid files download to disk
- [ ] **Log and triage bugs:** Keep a simple shared bug list in WhatsApp/Notion and help Shaurya, Aujasya, and Arnav squash them immediately.

---

### Day 5 — Demo Lockdown & Disaster Recovery
> **Goal by end of day:** 100% fail-safe environment for the live presentation.

- [ ] **Set up Offline / Fallback Demo Mode:**
  - Save pre-computed scan results as JSON in the frontend so if the local backend port fails during the pitch, the UI can switch to "Cached Demo Mode" with zero delay.
- [ ] **Hardware & Device Checklist:**
  - Ensure 2 laptops have the complete backend + frontend running locally on `localhost:3000` and `localhost:8000`.
  - Ensure `demo_enterprise_repo.zip` is placed directly on the desktop for instant drag-and-drop.
  - Keep offline backup copies of the PDF report and CBOM JSON on a USB drive.
- [ ] **Timekeeper:** Run the stopwatch during Mehek and Jashanpreet's rehearsals to enforce the strict 3:00 minute cutoff.

---

## 🛠️ Handy Commands for You

```bash
# Test backend health
curl http://localhost:8000/api/health

# Test upload & scan via cURL
curl -X POST -F "file=@demo_enterprise_repo.zip" http://localhost:8000/api/scan

# Validate CBOM JSON
python -m jsonschema -i exported_cbom.json bom-1.6.schema.json
```
