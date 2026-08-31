# 👤 Jashanpreet Singh — Pitch Deck & Presentation Lead (PPT Track)

## Your Role
You and Mehek are our **dedicated 2-person Pitch Deck & Presentation team**. Your main responsibility is building and presenting the **official SIH PPT**. While Mehek focuses on the problem narrative, HNDL threat, and business/defense impact, you focus on the **technical slides of the PPT**: designing the architecture diagram slide, breaking down the NIST standards, crafting the competitor comparison matrix, and handling the technical slides during the pitch and Q&A.

---

## 📌 Complete Project Context (For You & Any AI You Use)

> **Use this summary as your prompt context when working with AI presentation tools (Gamma, ChatGPT, Claude, Canva).**

- **Project Title:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool
- **Problem Statement:** `SIH26164` (NTRO — National Technical Research Organisation / PMO India)
- **Theme:** Blockchain & Cybersecurity (Software Category)
- **What Our Tool Does:**
  1. **Automated Discovery:** Scans source code (Python, Java, JS, C++), certificates, and server configs to find all cryptographic algorithms.
  2. **Quantum Risk Assessment:** Calculates risk scores (0–100 QARS) and applies **Mosca's Theorem ($X + Y > Z$)** to detect when data will be breached by quantum computers.
  3. **Standardized CBOM:** Exports **CycloneDX 1.6 CBOM (ECMA-424)** JSON files (international standard).
  4. **NIST Post-Quantum Standards (August 2024):** Recommends **ML-KEM (FIPS 203)** for key exchange, **ML-DSA (FIPS 204)** for digital signatures, and **SLH-DSA (FIPS 205)** for hash-based signatures.
  5. **Our 3 Major USPs (Winning Points):**
     - *AI Semantic Discovery:* Uses an LLM to catch hidden/wrapper cryptography that static regex misses.
     - *1-Click Automated Code Fix:* Generates Git diff code patches transitioning legacy code to NIST PQC.
     - *Interactive Mosca Simulation:* Real-time timeline slider showing vulnerability progression and breach windows.

---

## 🎯 Official SIH PPT Template Alignment

> [!IMPORTANT]
> **You must strictly build your slides on the official SIH PPT template provided by the organizers.**

### How You and Mehek Split the PPT:

| Slide # | Slide Title (SIH Template) | PPT Owner | What Goes on the Slide |
|---|---|---|---|
| **Slide 1** | Team & Problem Statement Overview | **Mehek** | Team details, PS ID (SIH26164 - NTRO), HNDL threat hook |
| **Slide 2** | Proposed Solution & Concept Flow | **Mehek** | High-level concept diagram: Scan → Analyze → CBOM → Remediate |
| **Slide 3** | Novelty & Uniqueness (Our 3 USPs) | **Mehek** | AI Semantic Discovery, 1-Click Code Patching, Interactive Mosca Timeline |
| **Slide 4** | **Technical Architecture & Data Pipeline** | **Jashanpreet** | Clean flowchart: Input Layer → Scanners → Risk Engine → AI Remediation → Exports |
| **Slide 5** | Impact, Feasibility & Defense Relevance | **Mehek** | NTRO alignment, Critical Infrastructure protection, CERT-In compliance |
| **Slide 6** | **NIST Standards & Competitor Comparison** | **Jashanpreet** | FIPS 203/204/205 matrix + Comparison table: ECDAT vs. IBM CBOMkit vs. CSNP |
| **Slide 7** | **Scalability & Future Roadmap** | **Jashanpreet** | Phase 1 (Prototype), Phase 2 (CI/CD GitHub Action), Phase 3 (eBPF & Cloud KMS) |
| **Slide 8** | Live Demo Flow & Conclusion | **Both** | 3-minute seamless live demo walkthrough with Shaurya & Arnav |

---

## 📊 Content Ready for Your Slides (Copy-Paste / Adapt for PPT)

### For Slide 4: Architecture Diagram Flow
```
[User Input: ZIP / Git / Cert / URL]
               │
               ▼
[Discovery Layer: Python AST + Go cryptoscan + Cert Parser + Config Parser]
               │
               ▼
[Analysis Layer: Quantum Risk Classifier + QARS Scoring (0-100) + Mosca Theorem]
               │
               ▼
[AI Layer: Semantic Detection (Gemini) + 1-Click PQC Code Diff Generator]
               │
               ▼
[Output Layer: CycloneDX 1.6 CBOM JSON + PDF Audit Report + Next.js Dashboard]
```

### For Slide 6: Competitive Matrix Table
| Feature | IBM CBOMkit | CycloneDX cdxgen | CSNP cryptoscan | **Our ECDAT** |
|---|:---:|:---:|:---:|:---:|
| **Source AST Scanner (Python, Java, JS)** | ✅ (Heavy SonarQube) | ⚠️ (Limited) | ⚠️ (Regex only) | ✅ **Fast Hybrid AST + Patterns** |
| **CycloneDX 1.6 CBOM Export** | ✅ | ✅ | ⚠️ (Basic 1.5) | ✅ **Full ECMA-424 Standard** |
| **Mosca's Theorem ($X+Y>Z$) Engine** | ❌ No | ❌ No | ❌ No | 🟢 **Yes (Interactive Slider)** |
| **AI Semantic Hidden Crypto Detection** | ❌ No | ❌ No | ❌ No | 🟢 **Yes (LLM Analyzer)** |
| **1-Click Automated Code Fix (Git Diff)** | ❌ No | ❌ No | ❌ No | 🟢 **Yes (NIST PQC Patch)** |
| **Live Network TLS & X.509 Cert Probe** | ⚠️ (Requires Theia) | ⚠️ (Keystore only) | ⚠️ (Config only) | 🟢 **Yes (Native SSL Handshake)** |
| **Live PQC Cryptographic Verification** | ❌ No | ❌ No | ❌ No | 🟢 **Yes (Integrated `liboqs`)** |

---

## Day-by-Day Tasks for Jashanpreet

### Day 1 — PPT Research & Outline
- [ ] Read `/SIH26164_ECDAT_Master_Research_Guide.md` to get comfortable with the concepts
- [ ] Set up the official SIH PPT template with fonts and dark cybersecurity theme
- [ ] Outline Slide 4 (Architecture) and Slide 6 (NIST Standards & Competitor Table)

### Day 2 — Designing Your Slides (Slides 4 & 6)
- [ ] Build Slide 4: Clean, high-impact architecture diagram (using Canva, Draw.io, or Figma, then insert into PPT)
- [ ] Build Slide 6: Format the competitive matrix table comparing ECDAT vs IBM vs CSNP
- [ ] Add the NIST August 2024 standards badges (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA)

### Day 3 — Roadmap & Presentation Polish (Slide 7)
- [ ] Build Slide 7: Scalability & 6-month enterprise roadmap (CI/CD GitHub Actions, eBPF live monitoring, Cloud KMS)
- [ ] Review full PPT deck with Mehek to ensure consistent styling, font sizes, and layout

### Day 4 — Demo Coordination & Pitch Timing
- [ ] Coordinate with Shaurya (backend) and Arnav (dashboard) to align slide talking points with the live UI demo
- [ ] Practice speaking transitions with Mehek to ensure the PPT narrative flows naturally into the live demo

### Day 5 — Final PPT Polish & Judge Q&A Rehearsals
- [ ] Run 3 full timed rehearsals with Mehek and the team (strict 3-minute pitch)
- [ ] Review the technical Q&A cheat sheet below to confidently answer judge questions
- [ ] Export final PPT as `.pptx` and backup `.pdf`

---

## 🧠 Master Technical Q&A Cheat Sheet (For Judges)

1. **Judge:** *"Why do we need AI for crypto detection if we already have regex and ASTs?"*  
   **Your Answer:** *"Regex and ASTs only match known names like `RSA.generate`. But enterprise code often hides crypto inside custom wrapper classes, vendor SDKs, or dynamic factories like `CryptoFactory.get(config.getAlgo())`. Our AI Semantic Analyzer inspects unresolved function logic to detect cryptographic behavior that static rules miss."*

2. **Judge:** *"How does your tool calculate Mosca's Theorem?"*  
   **Your Answer:** *"We take data shelf-life $X$ and migration timeline $Y$, and compare it against the arrival of a Cryptographically Relevant Quantum Computer $Z$. If $X+Y > Z$, our engine flags an active Harvest Now Decrypt Later (HNDL) violation and prioritizes immediate migration for those assets."*

3. **Judge:** *"Why CycloneDX 1.6 instead of SPDX?"*  
   **Your Answer:** *"CycloneDX 1.6 is the first internationally standardized format (ECMA-424) that natively supports Cryptographic Bills of Materials (CBOM) with dedicated `cryptoProperties` schemas for algorithms, key sizes, NIST quantum levels, and certificates. SPDX currently lacks dedicated CBOM schemas."*
