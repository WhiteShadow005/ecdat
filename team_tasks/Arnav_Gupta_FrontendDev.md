# 👤 Arnav Gupta — Frontend Developer (Dashboard & UI)

## Your Role
You build what the judges **actually see and interact with**. A working backend with a bad UI loses. Your dashboard is the demo — it's what creates the "wow" moment in the 3-minute presentation. You work **independently** from Day 1 using mock data, and only plug into the real backend on Day 4.

---

## What We Are Building (Project Context)
**Project Name:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool  
**Problem Statement:** SIH26164 by NTRO (National Technical Research Organisation, under PMO)  
**Theme:** Blockchain & Cybersecurity  

We are building a tool that scans codebases, finds cryptographic vulnerabilities (RSA, AES, MD5, etc.), checks quantum risk, and shows everything in an interactive dashboard. Think of it like a cybersecurity analytics platform — SOC dashboard vibes, dark theme, charts, tables, risk indicators.

**Tech Stack (Your Part):**
- Framework: **Next.js 14** (App Router)
- Styling: **Tailwind CSS**
- Charts: **Recharts**
- Language: **TypeScript**
- Code Diff View: **react-diff-viewer** or **monaco-editor**

**Project folder:** `ecdat/frontend/`

---

## Day-by-Day Tasks

### Day 1 — Project Setup + Layout Shell
> **Goal by end of day:** App loads with layout, sidebar, all pages exist (even if empty)

- [ ] **Bootstrap the Next.js app**
  ```bash
  cd ecdat
  npx create-next-app@latest frontend --typescript --tailwind --app
  cd frontend
  npm install recharts react-diff-viewer lucide-react
  ```

- [ ] **Design language** — we want:
  - Dark background (`#0a0f1e` or similar deep navy)
  - Red/orange for CRITICAL findings, yellow for HIGH, green for SAFE
  - Clean monospace font for code snippets
  - Professional/enterprise feel — NOT a student project look

- [ ] **Build the app layout shell** → `app/layout.tsx`
  - Top header bar: "ECDAT" logo left, scan status indicator right
  - Left sidebar with navigation links:
    - 🏠 Dashboard
    - 🔍 New Scan
    - 📊 Risk Heatmap
    - 📋 Asset Inventory
    - ⏳ Mosca Timeline
    - 🤖 AI Remediation
    - 📄 Reports

- [ ] **Create all page files** (empty for now, just with a heading):
  - `app/page.tsx` — Dashboard home
  - `app/scan/page.tsx` — New scan upload
  - `app/heatmap/page.tsx` — Risk heatmap
  - `app/inventory/page.tsx` — Asset inventory table
  - `app/mosca/page.tsx` — Mosca timeline
  - `app/remediation/page.tsx` — AI code fix viewer
  - `app/reports/page.tsx` — Download reports

- [ ] **Save the mock API response** as `lib/mock_data.ts`
  - Copy the exact JSON from below into this file
  - All components will import from here until Day 4

```typescript
// lib/mock_data.ts
export const mockScanResult = {
  scan_id: "demo-001",
  timestamp: "2026-09-01T10:00:00Z",
  summary: {
    total_assets: 15,
    critical: 8,
    high: 3,
    medium: 2,
    safe: 2,
    quantum_readiness_pct: 13.3
  },
  mosca: {
    x: 15, y: 4, z: 7,
    status: "CRITICAL",
    message: "X+Y (19) > Z (7) — Active HNDL threat"
  },
  assets: [
    { id: "asset-001", algorithm: "RSA-2048", type: "algorithm", quantum_status: "BROKEN", qars_score: 88, file: "src/auth/jwt_signer.py", line: 42, language: "python", replacement: "ML-KEM-768 (FIPS 203)", criticality: "critical", code_snippet: "private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)" },
    { id: "asset-002", algorithm: "MD5", type: "algorithm", quantum_status: "BROKEN", qars_score: 95, file: "src/auth/password_hasher.py", line: 18, language: "python", replacement: "SHA-256 / SHA-3", criticality: "critical", code_snippet: "hash = hashlib.md5(password.encode()).hexdigest()" },
    { id: "asset-003", algorithm: "ECDSA-secp256r1", type: "algorithm", quantum_status: "BROKEN", qars_score: 82, file: "src/payments/TransactionSigner.java", line: 67, language: "java", replacement: "ML-DSA-65 (FIPS 204)", criticality: "critical", code_snippet: "KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"EC\");" },
    { id: "asset-004", algorithm: "AES-128-CBC", type: "algorithm", quantum_status: "WEAKENED", qars_score: 45, file: "src/utils/file_encryptor.py", line: 31, language: "python", replacement: "AES-256-GCM", criticality: "medium", code_snippet: "cipher = AES.new(key, AES.MODE_CBC, iv)" },
    { id: "asset-005", algorithm: "AES-256-GCM", type: "algorithm", quantum_status: "SAFE", qars_score: 0, file: "src/core/session.py", line: 88, language: "python", replacement: "None required", criticality: "safe", code_snippet: "cipher = AES.new(key, AES.MODE_GCM)" },
    { id: "asset-006", algorithm: "SHA-1", type: "algorithm", quantum_status: "BROKEN", qars_score: 90, file: "certs/ca_bundle.crt", line: 0, language: "certificate", replacement: "SHA-256 / SHA-3", criticality: "critical", code_snippet: "Signature Algorithm: sha1WithRSAEncryption" },
    { id: "asset-007", algorithm: "Diffie-Hellman-1024", type: "algorithm", quantum_status: "BROKEN", qars_score: 92, file: "config/sshd_config", line: 14, language: "config", replacement: "ML-KEM-768 (FIPS 203) / X25519+ML-KEM Hybrid", criticality: "critical", code_snippet: "KexAlgorithms diffie-hellman-group1-sha1" },
    { id: "asset-008", algorithm: "RSA-2048 Certificate", type: "certificate", quantum_status: "BROKEN", qars_score: 85, file: "certs/server.pem", line: 0, language: "certificate", replacement: "ML-DSA-65 (FIPS 204) Certificate", criticality: "critical", code_snippet: "Public Key Algorithm: rsaEncryption (2048 bit)" }
  ]
}
```

---

### Day 2 — File Upload + Summary Cards
> **Goal by end of day:** Upload page works beautifully, dashboard shows summary stats

- [ ] **Build Scan Upload Page** → `app/scan/page.tsx`
  - Large drag-and-drop zone (dashed border, cloud icon)
  - Text: "Drop your ZIP file here, or click to browse"
  - Accepted: `.zip` files
  - After drop: show file name + size, "Start Scan" button
  - Progress indicator while scanning (animated bar or spinner)
  - On complete: redirect to dashboard with results

- [ ] **Build Dashboard Summary Cards** → `app/page.tsx`
  - 4 stat cards at the top:
    - 🔴 **Critical** — count (e.g., "8 Assets")
    - 🟡 **High Risk** — count
    - 🟠 **Medium Risk** — count
    - 🟢 **Quantum Safe** — count
  - One big percentage: "**13.3% Quantum Ready**" with a circular progress ring
  - Mosca status banner at the top: if CRITICAL, show a red alert banner: "⚠️ ACTIVE HNDL THREAT DETECTED"

---

### Day 3 — Charts + Tables + Mosca Timeline (USP 3)
> **Goal by end of day:** The 3 most impressive visual pages are done

- [ ] **Quantum Readiness Heatmap** → `app/heatmap/page.tsx`
  - Use Recharts to build a Treemap or Pie chart
  - Each segment = one asset, colored by status (red/yellow/green)
  - Click on a segment → show details panel on the right
  - Also add a bar chart: breakdown by language (Python: 5 issues, Java: 3, Config: 2, etc.)

- [ ] **Asset Inventory Table** → `app/inventory/page.tsx`
  - Full sortable, filterable table of all assets
  - Columns: Algorithm | File | Line | Risk Status | QARS Score | Replacement | Action
  - Color-coded status badges (red pill for BROKEN, yellow for WEAKENED, green for SAFE)
  - Search bar at the top to filter by algorithm name or file path
  - Click any row → expand to show code snippet + recommendation

- [ ] **Mosca Timeline Visualization (USP 3)** → `app/mosca/page.tsx`
  - This is our most unique feature — make it look amazing
  - Layout: horizontal timeline with a slider
  - Three inputs at the top:
    - **X** = Data Shelf Life (dropdown: Defense=30yr, Financial=10yr, Health=50yr, Session=0yr)
    - **Y** = Migration Time (slider: 1–10 years)
    - **Z** = Q-Day Estimate (slider: 5–15 years, default 7)
  - Timeline bar below shows:
    - Green zone: today → safety window
    - Red zone: where X+Y crosses Z → "BREACH WINDOW OPENS"
  - Big status indicator: 🔴 "CRITICAL — Data at Risk" or 🟢 "SAFE — X+Y < Z"
  - Formula displayed: `X (15) + Y (4) = 19 > Z (7) → CRITICAL`
  - Updates live as sliders move

---

### Day 4 — AI Fix Viewer + Reports + Real API Integration
> **Goal by end of day:** Full app connected to real backend

- [ ] **AI Remediation Viewer** → `app/remediation/page.tsx`
  - Left panel: list of all vulnerable assets
  - Click any asset → right panel shows:
    - The original vulnerable code (with red highlighting)
    - The AI-generated fix code (with green highlighting)
    - Use `react-diff-viewer` for this side-by-side diff view
    - "Copy Fix" button to copy the replacement code

- [ ] **Reports Download Page** → `app/reports/page.tsx`
  - Three big download buttons:
    - 📄 **Download PDF Audit Report** → calls `/api/export/pdf`
    - 🔗 **Download CycloneDX 1.6 CBOM (JSON)** → calls `/api/export/cbom`
    - 📊 **Download CSV Spreadsheet** → calls `/api/export/csv`
  - Show preview thumbnail of the PDF report

- [ ] **Connect to real backend** (replace all mock data)
  - Create `lib/api.ts` with fetch functions for:
    - `uploadScan(file: File)` → POST to `http://localhost:8000/api/scan`
    - `exportCBOM(scanId: string)` → GET `/api/export/cbom`
    - `exportPDF(scanId: string)` → GET `/api/export/pdf`
    - `remediateAsset(assetId: string)` → POST `/api/remediate`
  - Replace all `mockScanResult` imports with real API calls

---

## Design Reference
Think of how a professional security dashboard looks:
- **Dark theme** — deep navy/dark grey background
- **Red = danger**, yellow = warning, green = safe (consistent everywhere)
- **Clean data tables** with good spacing
- **Smooth animations** on numbers loading in
- Mobile doesn't matter — this is a desktop tool for security analysts

---

## Git Workflow
```bash
# Your branch: dev/arnav
git checkout -b dev/arnav

# Commit every 30–60 mins
git add .
git commit -m "feat: add quantum readiness heatmap"
git push origin dev/arnav

# When done: merge to main
git checkout main
git pull origin main
git merge dev/arnav
git push origin main
```

---

## Key Resources
- Next.js 14 App Router: https://nextjs.org/docs/app
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts (for charts): https://recharts.org/en-US/
- react-diff-viewer: https://github.com/praneshr/react-diff-viewer
- lucide-react (icons): https://lucide.dev/icons/
