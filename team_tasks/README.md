# 🛡️ Team ECDAT — SIH 2026 Master Task Allocation Directory
### Problem Statement: `SIH26164` | NTRO (National Technical Research Organisation / PMO India)
### Theme: Blockchain & Cybersecurity | Category: Software

---

## 👥 The 6-Member Team Roster & Individual Task Guides

Click on your name to view your dedicated day-by-day task checklist, technical specifications, and resources:

| # | Team Member | Track | Primary Role | Task Document |
|---|---|---|---|---|
| 1 | **Shaurya Pratap Singh** | **Engineering** | **Tech Lead** (Core Backend, AST Scanners, Risk Engine, Mosca, FastAPI) | [`Shaurya_Pratap_Singh_TechLead.md`](./Shaurya_Pratap_Singh_TechLead.md) |
| 2 | **Aujasya Rajput** | **Engineering** | **Backend Dev 2** (CycloneDX 1.6 CBOM Exporter, AI Remediation, PDF Reports) | [`Aujasya_Rajput_BackendDev2.md`](./Aujasya_Rajput_BackendDev2.md) |
| 3 | **Arnav Gupta** | **Engineering** | **Frontend Lead** (Next.js 14, Tailwind, Recharts, Interactive Mosca UI, Diff Viewer) | [`Arnav_Gupta_FrontendDev.md`](./Arnav_Gupta_FrontendDev.md) |
| 4 | **Mehek Sharma** | **PPT / Pitch Track** | **Pitch Deck & Strategy Lead** (SIH PPT Template, HNDL Narrative, Problem/Solution/Impact Slides, Pitching) | [`Mehek_Sharma_PitchDeck.md`](./Mehek_Sharma_PitchDeck.md) |
| 5 | **Jashanpreet Singh** | **PPT / Pitch Track** | **Pitch Deck & Technical Content Lead** (SIH PPT Template, Architecture Slides, NIST FIPS & Competitor Analysis, Technical Pitching) | [`Jashanpreet_Singh_PitchDeck.md`](./Jashanpreet_Singh_PitchDeck.md) |
| 6 | **Sahil Sharma** | **QA / Utility Track** | **Testbench Architect & QA Lead** (Vulnerable Repo Creation, Schema Validation, Stress Testing, Offline Backups) | [`Sahil_Sharma_TestingSupport.md`](./Sahil_Sharma_TestingSupport.md) |

---

## 🎯 Track Breakdown

- **🛠️ Engineering Track (3 Members):**
  - **Shaurya Pratap Singh:** Scanner engine, AST parsers, certificates, configs, risk logic, and FastAPI endpoints.
  - **Aujasya Rajput:** CycloneDX 1.6 CBOM generator, AI semantic analysis, AI 1-click code remediation, and PDF audit reports.
  - **Arnav Gupta:** Complete Next.js 14 web dashboard, interactive Mosca timeline slider, quantum readiness heatmap, and live diff viewer.

- **📊 Pitch Deck & Strategy Track (2 Members):**
  - **Mehek Sharma & Jashanpreet Singh:** Co-leading the official SIH PPT presentation deck. Mehek handles problem definition, HNDL threat model, solution overview, and defense impact. Jashanpreet handles technical architecture diagrams, NIST FIPS standards breakdown, and competitor comparison matrices. Both co-present and defend during Q&A.

- **🧪 QA, Testbench & Utility Track (1 Member):**
  - **Sahil Sharma:** Constructs the realistic `demo_enterprise_repo/` with deliberate vulnerabilities, verifies CBOM JSON schema compliance, performs edge-case/stress testing, and sets up offline fallback demo packages.

---

## 🌿 Git Collaboration Rules

1. **Main Branch is Protected:** Never push directly to `main`.
2. **Individual Feature Branches:**
   - Shaurya: `dev/shaurya`
   - Aujasya: `dev/aujasya`
   - Arnav: `dev/arnav`
   - Sahil: `dev/sahil`
3. **Daily Routine:**
   ```bash
   git checkout main && git pull origin main
   git checkout dev/<your-name> && git merge main
   # Do work...
   git commit -m "feat: your descriptive message"
   git push origin dev/<your-name>
   ```
4. **End of Day Merge:** Once a feature is tested and verified, merge into `main` after a quick sanity check.
