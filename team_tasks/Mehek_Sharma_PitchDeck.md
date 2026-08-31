# 👤 Mehek Sharma — Pitch Deck & Strategy Lead (Presentation Track)

## Your Role
You and Jashanpreet are in charge of **how the judges perceive ECDAT**. In SIH, a great technical project without a crisp, structured presentation loses. You will translate our deep cryptographic engineering into high-impact slides, clear diagrams, business/national security narratives, and the official SIH PPT template.

---

## 📌 Complete Project Context (For You & Any AI You Use)

> **Use this section as the Master Prompt if you use AI tools (ChatGPT, Claude, Gamma, Canva AI) to draft slides or script points.**

- **Project Title:** ECDAT — Enterprise Cryptographic Discovery & Analysis Tool
- **Problem Statement ID:** `SIH26164`
- **Theme:** Blockchain & Cybersecurity (Category: Software)
- **Problem Statement Owner / Ministry:** National Technical Research Organisation (**NTRO**) — Prime Minister's Office (PMO), India.
- **The Core Problem:** 
  - India's critical infrastructure (defense, banking, power grids, healthcare, government communications) relies on classical public-key cryptography (RSA, ECC, Diffie-Hellman).
  - A **Cryptographically Relevant Quantum Computer (CRQC)** running **Shor's Algorithm** will completely break RSA and ECC.
  - **Immediate Threat — "Harvest Now, Decrypt Later" (HNDL):** Hostile foreign state actors are intercepting and storing encrypted Indian intelligence and sensitive traffic *today*. Once Q-Day arrives (~2030–2035), they will decrypt this historical data.
  - **The Blindspot:** Organizations have no centralized visibility into where legacy cryptography resides across millions of lines of code, legacy microservices, SSL/TLS certificates, and container images.
- **Our Solution:**
  - **ECDAT** is an automated Cryptographic Bill of Materials (CBOM) discovery, quantum-risk assessment, and remediation platform.
  - Multi-surface discovery: Static AST source code analysis (Python/Java/JS/C++), container/filesystem inspection, X.509 certificate parsing, config files (Nginx, SSH), and live TLS probes.
  - Generates official **CycloneDX 1.6 CBOM (ECMA-424)** standard exports.
  - Evaluates **Mosca's Theorem ($X + Y > Z$)** and computes **Quantum-Adjusted Risk Scores (QARS 0–100)**.
  - Recommends NIST August 2024 finalized PQC standards: **ML-KEM (FIPS 203)**, **ML-DSA (FIPS 204)**, and **SLH-DSA (FIPS 205)**.
  - **3 Major USPs:**
    1. *AI Semantic Crypto Detection:* Catches obfuscated/custom crypto wrappers missed by static regex.
    2. *1-Click AI Code Remediation:* Generates Git diff code patches replacing RSA with NIST PQC liboqs code.
    3. *Interactive Mosca Risk Timeline:* Visualizes the exact temporal breach window ($X+Y > Z$).

---

## 🎯 Official SIH PPT Template Alignment

> [!IMPORTANT]
> SIH provides a standard PPT template (usually 6–8 mandatory slides with official headers, fonts, and guidelines). **You must strictly build the final presentation on the provided SIH template.**

### Standard SIH Slide Breakdown & Division of Work:
You and Jashanpreet will split the deck as follows:

| Slide # | Slide Title (SIH Template Standard) | Primary Owner | Focus / Content |
|---|---|---|---|
| **Slide 1** | Team & Problem Statement Overview | **Mehek** | Team details, PS ID (SIH26164 - NTRO), clear 1-liner hook on HNDL threat |
| **Slide 2** | Proposed Solution & Working Flow | **Mehek** | High-level architecture, how ECDAT scans & analyzes |
| **Slide 3** | Novelty & Uniqueness (Our 3 USPs) | **Mehek** | AI Semantic detection, 1-Click Code Patching, Mosca Timeline |
| **Slide 4** | Technical Architecture & Feasibility | **Jashanpreet** | Engine breakdown (FastAPI, AST, cryptoscan, CycloneDX 1.6, liboqs) |
| **Slide 5** | Impact, Feasibility & National Defense Relevance | **Mehek** | NTRO alignment, Critical Infrastructure protection, CERT-In compliance |
| **Slide 6** | Research, Standards (NIST/FIPS) & Competitor Analysis | **Jashanpreet** | IBM CBOMkit vs cdxgen vs ECDAT comparison, FIPS 203/204/205 |
| **Slide 7** | Roadmap, Scalability & Future Scope | **Jashanpreet** | 6-month enterprise roadmap (Cloud KMS, eBPF runtime, CI/CD plugins) |
| **Slide 8** | Live Demo Choreography & Conclusion | **Both** | 3-minute seamless live demo walkthrough with Shaurya & Arnav |

---

## Day-by-Day Tasks for Mehek

### Day 1 — Understanding the Domain & Drafting Content
- [ ] Read the master research guide in `/SIH26164_ECDAT_Master_Research_Guide.md`
- [ ] Understand key buzzwords: **HNDL, CRQC, Shor's Algorithm, Mosca's Theorem, CBOM, CycloneDX 1.6, ML-KEM, ML-DSA**
- [ ] Draft Slide 1 (Problem Hook), Slide 2 (Solution Concept), Slide 3 (Novelty / USPs) text in Markdown / Google Docs
- [ ] Collect official SIH 2026 PPT template and setup fonts, color scheme (Navy/Cyan/Dark cybersecurity theme)

### Day 2 — Slide Design & Visual Storytelling
- [ ] Design Slides 1, 2, 3, 5 directly into the SIH template
- [ ] Build clear diagrams for:
  - *The HNDL Attack Model:* Intercept today → Decrypt post-2030
  - *Mosca's Inequality ($X + Y > Z$):* Shelf life + Migration time vs Q-Day
- [ ] Highlight the 3 USPs with bold callouts (AI semantic discovery, 1-click refactoring diffs, Mosca interactive timeline)

### Day 3 — Business, Legal, & National Security Alignment
- [ ] Flesh out Slide 5: **National Security & Economic Value**
  - Why NTRO and Indian Cyber Command need this tool
  - Alignment with India's National Quantum Mission (NQM) and CERT-In advisories
  - Compliance with international standards (NIST SP 800-208, ECMA-424)
- [ ] Review Jashanpreet's technical slides (Slides 4, 6, 7) to ensure tone and visual styling match

### Day 4 — Demo Script & Rehearsal Flow
- [ ] Draft the 3-minute live presentation script (word-for-word timing)
- [ ] Coordinate with Shaurya (backend demo) and Arnav (dashboard visuals) on exact click sequence
- [ ] Review slide animations and typography on the final PPTX/PDF

### Day 5 — Polish, Judge Q&A Prep & Final Rehearsals
- [ ] Compile the Top 20 Judge Q&A Flashcards (Why not IBM CBOMkit? What about false positives? What is the computational overhead?)
- [ ] Conduct 3 timed mock runs with the whole team (strict 3-minute presentation + 2-minute Q&A)
- [ ] Finalize the export as PPTX and high-res PDF backup

---

## 3-Minute Live Demo Pitch Script (To memorize / practice)

```text
[0:00 - 0:30] THE HOOK (Mehek):
"Respected Judges, right now foreign adversaries are harvesting India's encrypted military, financial, and intelligence data under 'Harvest Now, Decrypt Later'. When Cryptographically Relevant Quantum Computers arrive around 2032, all RSA and ECC encryption will be cracked in seconds.
The biggest roadblock for NTRO and critical infrastructure? You cannot migrate what you cannot see. Today, we present ECDAT — India's Enterprise Cryptographic Discovery and Analysis Tool."

[0:30 - 1:30] THE TECH & DEMO (Handover to Tech Team / Jashanpreet):
"Watch as we drop an enterprise banking and auth repository into ECDAT. In under 5 seconds, our multi-surface scanner analyzes source code ASTs, config files, and X.509 certificates.
Look at the dashboard: 78% of the codebase is quantum-vulnerable. Our interactive Mosca Theorem engine proves that with 15-year data shelf-life and 4-year migration, the breach window has ALREADY opened."

[1:30 - 2:15] THE USPs (Mehek / Jashanpreet):
"Unlike static tools like IBM CBOMkit that miss hidden wrappers, ECDAT uses AI Semantic Detection to uncover obscured cryptography. Even better — with one click, our AI Code Remediator generates instant Git diffs migrating vulnerable RSA keys to NIST FIPS 203 ML-KEM-768 algorithms."

[2:15 - 3:00] THE CLOSE (Mehek):
"We export verified CycloneDX 1.6 CBOM standards and executive audit PDFs ready for CERT-In compliance. ECDAT turns years of manual cryptographic discovery into a 30-second automated roadmap — safeguarding India's digital sovereignty."
```
