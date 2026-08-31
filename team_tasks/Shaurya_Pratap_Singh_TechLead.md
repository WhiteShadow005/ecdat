# 👤 Shaurya Pratap Singh — Tech Lead (Core Backend)

## Your Role
You are the backbone of this project. You build the scanner engines and the risk analysis brain. Everything else (AI, frontend, reports) is built on top of your work. If your part doesn't work, nothing works.

---

## What We Are Building (Project Context)
**Project Name:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool  
**Problem Statement:** SIH26164 by NTRO (National Technical Research Organisation, under PMO)  
**Theme:** Blockchain & Cybersecurity  

We are building a tool that scans codebases, config files, certificates, and Docker images to find all cryptographic algorithms being used (RSA, AES, ECDSA, MD5, etc.), checks which ones are vulnerable to quantum computers, scores the risk, and recommends quantum-safe replacements from the NIST 2024 standards (ML-KEM, ML-DSA, SLH-DSA).

**Tech Stack (Your Part):**
- Language: Python 3.11
- Framework: FastAPI
- Scanner: CSNP cryptoscan (Go binary, called as subprocess)
- Crypto Library: `cryptography` (pip)
- Database: SQLite

**Project folder:** `ecdat/backend/`

---

## Your Day-by-Day Tasks

### Day 1 — Core Scanner Engines
> **Goal by end of day:** Upload a ZIP → get back JSON list of all crypto findings

- [ ] **Set up the project**
  - Create `ecdat/backend/` folder
  - Create `requirements.txt` with: `fastapi`, `uvicorn`, `cryptography`, `python-multipart`, `aiofiles`
  - Run `pip install -r requirements.txt`
  - Download `cryptoscan` Go binary from https://github.com/csnp/cryptoscan/releases and put it in `ecdat/backend/bin/`

- [ ] **Create `crypto_rules.json`** inside `ecdat/backend/app/`
  - This is the master database of all algorithms. Each entry needs:
    - `algorithm` name (e.g., "RSA-2048")
    - `quantum_status`: `"BROKEN"` / `"WEAKENED"` / `"SAFE"`
    - `attack`: `"Shor's Algorithm"` / `"Grover's Algorithm"` / `"None"`
    - `nist_replacement`: e.g., `"ML-KEM-768 (FIPS 203)"`
    - `action`: `"Replace"` / `"Upgrade Key Length"` / `"Maintain"`
  - Include at minimum: RSA-1024, RSA-2048, RSA-4096, ECDSA, ECDH, DSA, AES-128, AES-256, ChaCha20, SHA-1, MD5, SHA-256, SHA-512, SHA-3, DES, 3DES, RC4, Diffie-Hellman, ElGamal

- [ ] **Build Python AST scanner** → `ecdat/backend/app/scanners/python_scanner.py`
  - Use Python's built-in `ast` module to parse `.py` files
  - Detect calls to: `cryptography`, `pycryptodome`, `hashlib`, `jwt`, `ssl`, `hmac`
  - Return: `{algorithm, file_path, line_number, library_used}`

- [ ] **Build X.509 cert parser** → `ecdat/backend/app/scanners/cert_parser.py`
  - Use `cryptography` library to parse `.pem`, `.crt`, `.cer` files
  - Extract: public key algorithm, key size, signature algorithm, expiry date, subject, issuer
  - Flag if: SHA-1 signature, RSA < 2048 bits, expiry within 6 months

- [ ] **Build config file parser** → `ecdat/backend/app/scanners/config_parser.py`
  - Parse Nginx config files: find `ssl_ciphers`, `ssl_protocols` lines
  - Parse SSH config (`sshd_config`): find `HostKeyAlgorithms`, `KexAlgorithms`
  - Parse Apache config: find `SSLCipherSuite`, `SSLProtocol`
  - Flag old/insecure values (TLSv1.0, TLSv1.1, diffie-hellman-group1-sha1, ssh-rsa)

- [ ] **Build FastAPI app skeleton** → `ecdat/backend/app/main.py`
  - Create `POST /api/scan` endpoint that:
    1. Accepts a ZIP file upload
    2. Extracts it to a temp folder
    3. Calls all scanners (Python AST + cryptoscan subprocess + cert parser + config parser)
    4. Returns a unified JSON response (see API contract below)
  - Create `GET /api/health` endpoint (returns `{"status": "ok"}`)

---

### Day 2 — Risk Engine + Mosca
> **Goal by end of day:** Every asset has a risk score, Mosca classification, and CBOM JSON exports

- [ ] **Unified Inventory Engine** → `ecdat/backend/app/engines/inventory.py`
  - Merge all findings from all scanners into one normalized list
  - Deduplicate (same algorithm in same file, same line = one entry)
  - Assign each a unique ID: `asset-001`, `asset-002`, ...

- [ ] **Quantum Risk Classifier** → `ecdat/backend/app/engines/risk_classifier.py`
  - Load `crypto_rules.json`
  - For each asset, look up its quantum status → assign `BROKEN` / `WEAKENED` / `SAFE`
  - Assign criticality tier: CRITICAL / HIGH / MEDIUM / LOW

- [ ] **QARS Scoring Engine** → `ecdat/backend/app/engines/qars.py`
  - Formula: `QARS = CryptoWeakness(0-40) + ExposureFactor(0-25) + DataCriticality(0-20) + MoscaScore(0-15)`
  - Returns a 0–100 score per asset

- [ ] **Mosca Engine** → `ecdat/backend/app/engines/mosca.py`
  - Inputs: `X` (data shelf-life in years), `Y` (migration time), `Z` (Q-Day estimate, default 7)
  - If `X + Y > Z` → status = `"CRITICAL"` (Active HNDL threat)
  - If `X + Y ≈ Z` (within 1 year) → `"HIGH"`
  - If `X + Y < Z` → `"SAFE"`
  - Preset data categories: Defense (X=30), Financial Records (X=10), Health Data (X=50), Session Tokens (X=0.003)

---

### Day 3 — Migration Recommender + TLS Probe
> **Goal by end of day:** Full analysis pipeline working end-to-end

- [ ] **Migration Recommender** → `ecdat/backend/app/engines/recommender.py`
  - For each BROKEN/WEAKENED asset, return:
    - PQC replacement name + FIPS number
    - Hybrid strategy note (e.g., "Use X25519 + ML-KEM-768 during transition")
    - Trade-offs: key size increase, performance impact, compatibility notes

- [ ] **TLS Probe** → `ecdat/backend/app/scanners/tls_probe.py`
  - `GET /api/probe?url=example.com`
  - Connect to the URL on port 443, do a TLS handshake using Python `ssl` module
  - Extract: TLS version, cipher suite, certificate chain, key algorithm
  - Run it through the risk classifier

- [ ] **Wire everything together** in `main.py`
  - Full scan pipeline: upload → extract → scan → inventory → classify → score → mosca → recommend
  - Make sure all `/api/` endpoints return clean JSON

---

## API Contract (Share with Arnav on Day 1 so he can start frontend)

```json
{
  "scan_id": "abc123",
  "timestamp": "2026-09-01T10:00:00Z",
  "summary": {
    "total_assets": 15,
    "critical": 8,
    "high": 3,
    "medium": 2,
    "safe": 2,
    "quantum_readiness_pct": 13.3
  },
  "mosca": {
    "x": 15, "y": 4, "z": 7,
    "status": "CRITICAL",
    "message": "X+Y (19) > Z (7) — Active HNDL threat"
  },
  "assets": [
    {
      "id": "asset-001",
      "algorithm": "RSA-2048",
      "type": "algorithm",
      "quantum_status": "BROKEN",
      "qars_score": 88,
      "file": "src/auth/jwt_signer.py",
      "line": 42,
      "language": "python",
      "replacement": "ML-KEM-768 (FIPS 203)",
      "criticality": "critical",
      "code_snippet": "private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)"
    }
  ]
}
```

---

## Git Workflow
```bash
# Your branch: dev/shaurya
git checkout -b dev/shaurya

# Commit every 30–60 mins
git add .
git commit -m "feat: add Python AST crypto scanner"
git push origin dev/shaurya

# When a feature is DONE: merge to main
git checkout main
git pull origin main
git merge dev/shaurya
git push origin main
```

---

## Key Resources
- cryptoscan releases: https://github.com/csnp/cryptoscan/releases
- FastAPI docs: https://fastapi.tiangolo.com/
- `cryptography` library (cert parsing): https://cryptography.io/en/latest/x509/
- CycloneDX 1.6 CBOM spec: https://cyclonedx.org/docs/1.6/
- NIST PQC standards: https://csrc.nist.gov/projects/post-quantum-cryptography
