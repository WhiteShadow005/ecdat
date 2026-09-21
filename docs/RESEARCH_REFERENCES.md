# ECDAT — Top 10 Research Papers & Official References

> **Purpose:** Verified, authoritative research papers and government publications that form the academic and regulatory foundation of ECDAT (Enterprise Cryptographic Discovery & Analysis Tool).  
> **Use:** Attach QR codes linking to this document or individual papers on Slide 6 (References) of the SIH 2026 pitch deck.  
> **Last Updated:** 2026-09-17  
> **Team:** ASTARR | Problem Statement: SIH26164 (NTRO / PMO India)

---

## Category A: Post-Quantum Cryptography Standards & Migration

### Paper 1 — NIST FIPS 203: ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)

| Field | Details |
|---|---|
| **Title** | Module-Lattice-Based Key-Encapsulation Mechanism Standard |
| **Authors** | NIST — Gorjan Alagic, Quynh Dang, Dustin Moody, Angela Robinson, Hamilton Silberg, Daniel Smith-Tone |
| **Venue** | NIST Federal Information Processing Standards (FIPS) |
| **Year** | 2024 |
| **DOI / URL** | [https://doi.org/10.6028/NIST.FIPS.203](https://doi.org/10.6028/NIST.FIPS.203) |
| **Relevance to ECDAT** | This is the official finalized standard for quantum-resistant key encapsulation (derived from CRYSTALS-Kyber). ECDAT's remediation engine generates 1-Click Git diffs that migrate legacy RSA/ECDH key exchange to ML-KEM-768 as specified in this standard. FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA) were published concurrently. |

---

### Paper 2 — Mosca's Theorem: The Mathematical Foundation of HNDL Risk

| Field | Details |
|---|---|
| **Title** | Cybersecurity in an Era with Quantum Computers: Will We Be Ready? |
| **Authors** | Michele Mosca |
| **Venue** | IEEE Security & Privacy |
| **Year** | 2018 |
| **DOI / URL** | [https://doi.org/10.1109/MSP.2018.3761723](https://doi.org/10.1109/MSP.2018.3761723) |
| **Relevance to ECDAT** | This seminal paper introduces **Mosca's Inequality (X + Y > Z)**, which mathematically formalizes the "Harvest Now, Decrypt Later" (HNDL) timeline risk. ECDAT's QARS (Quantum-Aware Risk Score) directly implements Mosca's inequality as the `MoscaRisk(0–15)` component to calculate whether an organization's cryptographic migration timeline is already breached. |

---

### Paper 3 — NIST SP 1800-38: Practical PQC Migration Guide

| Field | Details |
|---|---|
| **Title** | Migration to Post-Quantum Cryptography (NIST SP 1800-38 Series) |
| **Authors** | William Newhouse, Murugiah Souppaya, William Barker, Christopher Brown, and NIST NCCoE contributors |
| **Venue** | NIST National Cybersecurity Center of Excellence (NCCoE) |
| **Year** | 2023–Present (Ongoing) |
| **DOI / URL** | [https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/) |
| **Relevance to ECDAT** | This practice guide details the exact capabilities organizations need for PQC migration: automated cryptographic inventories, risk prioritization, and cryptographic agility architectures. ECDAT's multi-vector discovery pipeline (code + certs + configs + live TLS) directly implements the inventory and assessment phases described in this guide. |

---

## Category B: Cryptographic Bills of Materials (CBOM) & Automated Discovery

### Paper 4 — CycloneDX CBOM Standard (IBM Research)

| Field | Details |
|---|---|
| **Title** | The Anatomy of Cryptography Bills of Materials: Standardization and Practice in CycloneDX |
| **Authors** | Basil Hess (IBM Research Europe) |
| **Venue** | MAgiCS 2026 (Migration and Agility in Cryptographic Systems — co-located with Eurocrypt 2026) |
| **Year** | 2026 |
| **DOI / URL** | Available via IBM Research publications / arXiv |
| **Relevance to ECDAT** | This paper details the anatomy of CBOMs as standardized within the OWASP CycloneDX (ECMA-424) framework. ECDAT exports CycloneDX 1.6 CBOM documents as its primary compliance output, enabling one-click audit exports for RBI/SEBI regulators and NTRO defense evaluators. |

---

### Paper 5 — Architecture-Derived CBOMs for Cryptographic Migration

| Field | Details |
|---|---|
| **Title** | Architecture-Derived CBOMs for Cryptographic Migration: A Security-Aware Architecture Tradeoff Method |
| **Authors** | Eduard Hirsch, Kristina Raab |
| **Venue** | MAgiCS 2026 / Migration and Agility in Cryptographic Systems |
| **Year** | 2026 |
| **DOI / URL** | [https://arxiv.org/abs/2405.07823](https://arxiv.org/abs/2405.07823) |
| **Relevance to ECDAT** | This research introduces SATAM (Security-Aware Architecture Tradeoff Analysis Method) which enriches standard automated CBOMs with architectural context. ECDAT's approach of combining AST-level code discovery with CryptoSense™ AI semantic analysis mirrors this paper's thesis that automated scanning alone is insufficient — architectural intent must be considered for effective migration planning. |

---

## Category C: AI/ML for Code Vulnerability Detection (CodeBERT)

### Paper 6 — CodeBERT + Program Dependency Graphs for Vulnerability Detection

| Field | Details |
|---|---|
| **Title** | Code vulnerability detection based on augmented program dependency graph and optimized CodeBERT |
| **Authors** | Zhengbin Zou, Tao Jiang, Yizheng Wang, Tiancheng Xue, Nan Zhang, Jie Luan |
| **Venue** | Scientific Reports (Nature) |
| **Year** | 2025 |
| **DOI / URL** | [https://doi.org/10.1038/s41598-025-23029-4](https://doi.org/10.1038/s41598-025-23029-4) |
| **Relevance to ECDAT** | Proposes "AugSliceVul," combining augmented Program Dependency Graphs with optimized CodeBERT to achieve significantly higher accuracy in source code vulnerability detection compared to traditional static analysis. ECDAT's CryptoSense™ engine uses a similar approach — fine-tuning CodeBERT specifically on cryptographic patterns to detect obfuscated crypto wrappers that AST scanners miss entirely. |

---

### Paper 7 — VulBertCNN: CodeBERT + CNN for Automated Vulnerability Detection

| Field | Details |
|---|---|
| **Title** | Automated Software Vulnerability Detection Using CodeBERT and Convolutional Neural Network |
| **Authors** | Rabaya Sultana Mim, Abdus Satter, Toukir Ahammed, Kazi Sakib |
| **Venue** | 19th International Conference on Evaluation of Novel Approaches to Software Engineering (ENASE 2024) |
| **Year** | 2024 |
| **DOI / URL** | ENASE 2024 Proceedings, pp. 156–167 |
| **Relevance to ECDAT** | Presents "VulBertCNN," integrating CodeBERT embeddings with a CNN classifier to detect vulnerabilities in source code with high accuracy. This validates ECDAT's architectural decision to use CodeBERT (~125M params) as a lightweight, on-premise AI engine that can run air-gapped without cloud dependency — a critical requirement for NTRO/defense deployments where zero data exfiltration is mandatory. |

---

## Category D: Quantum Threat Assessment & Government Policy

### Paper 8 — NIST IR 8105: The Foundational Quantum Threat Report

| Field | Details |
|---|---|
| **Title** | Report on Post-Quantum Cryptography |
| **Authors** | Lily Chen, Stephen Jordan, Yi-Kai Liu, Dustin Moody, Rene Peralta, Ray Perlner, Daniel Smith-Tone |
| **Venue** | NIST Internal Report (NIST IR 8105) |
| **Year** | 2016 |
| **DOI / URL** | [https://doi.org/10.6028/NIST.IR.8105](https://doi.org/10.6028/NIST.IR.8105) |
| **Relevance to ECDAT** | The foundational NIST report establishing the authoritative basis for why quantum-safe cryptography is necessary. Explains how Shor's algorithm compromises RSA/ECC and Grover's algorithm weakens symmetric ciphers. This report initiated the entire NIST PQC standardization process that ECDAT's remediation engine is built upon. |

---

### Paper 9 — CISA/NSA/NIST Joint Quantum Readiness Factsheet

| Field | Details |
|---|---|
| **Title** | Quantum-Readiness: Migration to Post-Quantum Cryptography |
| **Authors** | CISA, NSA, and NIST (Joint Publication) |
| **Venue** | Cybersecurity and Infrastructure Security Agency (CISA) |
| **Year** | 2023 |
| **DOI / URL** | [https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography](https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography) |
| **Relevance to ECDAT** | This joint US government factsheet provides actionable guidance for organizations to prepare for PQC migration, heavily emphasizing the immediate need for comprehensive **cryptographic inventories** — which is ECDAT's core function. ECDAT's multi-vector discovery pipeline maps directly to CISA's recommended compliance steps: discover → catalog → prioritize → remediate. |

---

### Paper 10 — Global Risk Institute: Quantum Threat Timeline Estimates

| Field | Details |
|---|---|
| **Title** | 2025 Quantum Threat Timeline Report |
| **Authors** | Dr. Michele Mosca and Dr. Marco Piani |
| **Venue** | Global Risk Institute (GRI) in collaboration with evolutionQ |
| **Year** | 2025–2026 |
| **DOI / URL** | [https://globalriskinstitute.org/publication/2025-quantum-threat-timeline-report/](https://globalriskinstitute.org/publication/2025-quantum-threat-timeline-report/) |
| **Relevance to ECDAT** | This annual longitudinal report surveys dozens of global quantum computing experts and currently concludes that the probability of a Cryptographically Relevant Quantum Computer (CRQC) arriving within 10 years has reached **28–49%** (historic highs). This provides the actuarial risk justification that CISOs and defense agencies need to greenlight immediate investment in cryptographic discovery and migration tools like ECDAT. |

---

## Bonus: India-Specific Policy Reference

### India's National Quantum Mission (NQM) — Quantum Safe Ecosystem Report

| Field | Details |
|---|---|
| **Title** | Implementation of Quantum Safe Ecosystem in India — Report of the Task Force |
| **Authors** | Dr. Rajkumar Upadhyay (Chair) and the NQM Task Force |
| **Venue** | Department of Science and Technology (DST), Government of India |
| **Year** | 2026 |
| **DOI / URL** | [https://dst.gov.in](https://dst.gov.in) / [https://www.nqm.gov.in](https://www.nqm.gov.in) |
| **Relevance to ECDAT** | Official Indian government roadmap for transitioning India's digital ecosystem to quantum-safe security, targeting Critical Information Infrastructure (CII) compliance by 2029 and broader enterprise adoption by 2033. ECDAT is designed to be the operational execution tool for this mandate — discovering, scoring, and remediating vulnerable cryptographic assets across government and enterprise codebases as directed by NQM policy. |

---

## Quick Reference: Paper → ECDAT Feature Mapping

| Paper # | Paper Topic | ECDAT Feature It Validates |
|:---:|---|---|
| 1 | FIPS 203 ML-KEM Standard | 1-Click Git Diff Remediation (RSA → ML-KEM) |
| 2 | Mosca's Theorem (X+Y>Z) | QARS MoscaRisk(0–15) Component |
| 3 | NIST PQC Migration Guide | Multi-Vector Discovery Pipeline |
| 4 | CycloneDX CBOM Standard | CycloneDX 1.6 CBOM Export |
| 5 | Architecture-Derived CBOMs | CryptoSense™ AI Semantic Analysis |
| 6 | CodeBERT + PDG Vulnerability Detection | CryptoSense™ Fine-Tuned CodeBERT Engine |
| 7 | VulBertCNN On-Premise Detection | Air-Gapped 125M Param Local Inference |
| 8 | NIST IR 8105 Quantum Threat | Shor/Grover Risk Classification |
| 9 | CISA/NSA Quantum Readiness | Discover → Catalog → Prioritize → Remediate |
| 10 | GRI Quantum Timeline (28–49%) | HNDL Breach Window Risk Justification |
| Bonus | India NQM ₹6,003 Cr Mandate | Sovereign B2G Deployment Model |

---

*Generated by Team ASTARR for SIH 2026 — Problem Statement SIH26164 (NTRO / PMO India)*
