# ECDAT — Enterprise Cryptographic Discovery & Analysis Tool
### Smart India Hackathon 2026 | Problem Statement: SIH26164 | NTRO (PMO India)
### Theme: Blockchain & Cybersecurity

> **ECDAT** is an automated, AI-powered Cryptographic Bill of Materials (CBOM) platform that scans codebases, certificates, configurations, and container images to discover quantum-vulnerable cryptographic algorithms, assess risk using Mosca's Theorem and QARS scoring, and generate standards-compliant CycloneDX 1.6 CBOM exports with 1-click AI code remediation.

---

## 📁 Project Structure

```
ecdat/
│
├── backend/                         # Python 3.11 + FastAPI backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app — all API routes
│   │   ├── models.py                # Pydantic models (CryptoAsset, ScanResult, etc.)
│   │   ├── config.py                # App config, env vars, defaults
│   │   │
│   │   ├── scanners/                # Layer 1: Discovery engines
│   │   │   ├── python_scanner.py    # Python AST-based crypto detection
│   │   │   ├── cert_parser.py       # X.509 certificate parser (.pem/.crt/.pfx)
│   │   │   ├── config_parser.py     # Nginx/SSH/Apache config scanner
│   │   │   └── tls_probe.py         # Live TLS handshake prober
│   │   │
│   │   ├── engines/                 # Layer 2: Analysis engines
│   │   │   ├── inventory.py         # Normalize & deduplicate all scan findings
│   │   │   ├── risk_classifier.py   # Classify assets: BROKEN/WEAKENED/SAFE
│   │   │   ├── qars.py              # QARS score engine (0–100 composite)
│   │   │   ├── mosca.py             # Mosca Theorem X+Y>Z calculator
│   │   │   └── recommender.py       # PQC/Hybrid migration recommender
│   │   │
│   │   ├── exporters/               # Layer 4: Output generators
│   │   │   ├── cbom_exporter.py     # CycloneDX 1.6 CBOM JSON (ECMA-424)
│   │   │   ├── csv_exporter.py      # CSV spreadsheet export
│   │   │   └── pdf_report.py        # Executive PDF audit report (WeasyPrint)
│   │   │
│   │   ├── ai/                      # AI-powered features (USP 1 & 2)
│   │   │   ├── semantic_analyzer.py # Gemini LLM: catch hidden crypto wrappers
│   │   │   ├── code_remediator.py   # Gemini LLM: generate NIST PQC Git diffs
│   │   │   └── pqc_proof.py         # liboqs: live ML-KEM & ML-DSA demo
│   │   │
│   │   ├── data/
│   │   │   └── crypto_rules.json    # Master rules: 25+ algorithms, quantum status
│   │   │
│   │   └── templates/
│   │       └── report.html          # Jinja2 PDF report template
│   │
│   ├── bin/                         # cryptoscan Go binary (download separately)
│   ├── tests/                       # Pytest unit & integration tests
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Copy to .env and add your API keys
│
├── frontend/                        # Next.js 14 App Router + Tailwind + Recharts
│   ├── app/
│   │   ├── layout.tsx               # Root layout: sidebar + header
│   │   ├── page.tsx                 # Dashboard: stat cards, readiness ring
│   │   ├── scan/page.tsx            # New Scan: drag-and-drop ZIP upload
│   │   ├── heatmap/page.tsx         # Quantum Readiness Heatmap (Treemap)
│   │   ├── inventory/page.tsx       # Asset Inventory Table (sortable/filterable)
│   │   ├── mosca/page.tsx           # Interactive Mosca Timeline Slider (USP 3)
│   │   ├── remediation/page.tsx     # AI Code Diff Viewer (USP 2)
│   │   └── reports/page.tsx         # Download: CBOM JSON + PDF + CSV
│   │
│   ├── components/
│   │   ├── ui/                      # Reusable: StatusBadge, ScoreRing, AssetCard
│   │   ├── charts/                  # Heatmap, MoscaChart, RiskBar components
│   │   └── scanner/                 # UploadZone, ScanProgress components
│   │
│   ├── lib/
│   │   ├── api.ts                   # All backend API fetch functions
│   │   ├── mock_data.ts             # Dev mock data (15-asset full demo set)
│   │   └── types.ts                 # TypeScript types (mirrors backend models)
│   │
│   └── public/                      # Static assets (logo, icons)
│
├── demo_enterprise_repo/            # Synthetic vulnerable codebase for live demo
│   ├── src/auth/                    # jwt_signer.py (RSA-2048), password_hasher.py (MD5)
│   ├── src/payments/                # PaymentGateway.java (RSA/AES-CBC), TransactionSigner.java (ECDSA)
│   ├── src/api/                     # crypto_wrapper.py (hidden crypto for AI USP demo)
│   ├── src/utils/                   # file_encryptor.py (AES-128-CBC weakened)
│   ├── config/                      # nginx.conf (weak TLS), sshd_config (DHE/ssh-rsa)
│   ├── certs/                       # server.pem (RSA-2048), ca_bundle.crt (SHA-1 sig)
│   ├── requirements.txt             # pycryptodome, PyJWT (vulnerable versions)
│   └── pom.xml                      # BouncyCastle 1.70 Maven dep
│
├── docs/                            # Project documentation
│   ├── AI_MASTER_CONTEXT.md         # AI context file for ChatGPT/Claude/Cursor
│   ├── ECDAT_Implementation_Plan.md # Full technical plan, sprint, architecture
│   └── SIH26164_ECDAT_Master_Research_Guide.md  # PQC/NIST/Mosca research dossier
│
├── team_tasks/                      # Individual member task checklists
│   ├── Shaurya_Pratap_Singh_TechLead.md
│   ├── Ojasya_Rajput_BackendDev2.md
│   ├── Arnav_Gupta_FrontendDev.md
│   ├── Mehek_Sharma_PitchDeck.md
│   ├── Jashanpreet_Singh_PitchDeck.md
│   └── Sahil_Sharma_TestingSupport.md
│
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md     # PR template for consistent reviews
│
├── .gitignore
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Backend
```bash
cd backend
cp .env.example .env          # Add your GEMINI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload  # Runs at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Runs at http://localhost:3000
```

### API Health Check
```bash
curl http://localhost:8000/api/health
# {"status": "ok"}
```

---

## 🌿 Git Branches

| Branch | Owner | Purpose |
|---|---|---|
| `main` | All | Protected — only tested, working code |
| `dev/shaurya` | Shaurya Pratap Singh | Core scanners, risk engine, FastAPI |
| `dev/ojasya` | Ojasya Rajput | CBOM export, AI features, PDF reports |
| `dev/arnav` | Arnav Gupta | Next.js frontend dashboard |
| `dev/sahil` | Sahil Sharma | Test repo, QA, schema validation |

---

## 👥 Team ECDAT

| Name | Role |
|---|---|
| **Shaurya Pratap Singh** | Tech Lead — Core Backend (Scanners, Risk Engine, Mosca) |
| **Ojasya Rajput** | Backend Dev 2 (CBOM Export, AI Semantic Analyzer, PDF Reports) |
| **Arnav Gupta** | Frontend Lead (Next.js Dashboard, Mosca Timeline, Diff Viewer) |
| **Mehek Sharma** | Pitch Deck & Strategy Lead (SIH PPT, Presentation) |
| **Jashanpreet Singh** | Pitch Deck Technical Lead (Architecture, NIST Standards, Q&A) |
| **Sahil Sharma** | QA & Testbench Lead (Demo Repo, Schema Validation, Testing) |
