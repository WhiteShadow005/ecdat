# SIH26164: Enterprise Cryptographic Discovery & Analysis Tool (ECDAT)
## Master Research & Engineering Dossier | NTRO (National Technical Research Organisation)

---

## 1. Executive Summary & Problem Breakdown

### Problem Statement Identity
- **PS ID**: `SIH26164`
- **Title**: Enterprise Cryptographic Discovery & Analysis Tool (ECDAT)
- **Organization**: National Technical Research Organisation (NTRO) (Prime Minister's Office, India)
- **Theme**: Blockchain & Cybersecurity
- **Category**: Software

---

### The Core National Security Problem: Why NTRO Needs This
Governments and critical infrastructure organizations (banking, power grids, defense, space) protect sensitive communications, encrypted databases, and identities using **Classical Public Key Cryptography** (primarily RSA, Elliptic Curve Cryptography - ECC, Diffie-Hellman).

A **Cryptographically Relevant Quantum Computer (CRQC)** running **Shor’s Algorithm** will mathematically factor large prime numbers and solve discrete logarithms in polynomial time—**completely breaking RSA, ECC, ECDSA, and Diffie-Hellman**.

#### The Immediate Threat: "Harvest Now, Decrypt Later" (HNDL)
Adversarial nation-states are actively intercepting and archiving encrypted government and military traffic *today*. When a CRQC becomes operational (estimated **2030–2035**), they will decrypt this stored historical data.

#### The Problem Facing NTRO:
Organizations do not even know **where** cryptography is used across millions of lines of legacy code, microservices, SSL/TLS certificates, hardware security modules (HSMs), and cloud configurations.
> **You cannot migrate what you cannot see.**  
> **Phase 1 of Post-Quantum Cryptography (PQC) Migration is Automated Cryptographic Discovery & Inventory (CBOM generation).**

---

## 2. Cryptographic Foundations Cheat Sheet (What You MUST Know)

You do **NOT** need to understand quantum mechanics or complex lattice polynomial math. You only need to understand the **impact rules**:

```
                              ┌───────────────────────────────────┐
                              │     CRYPTOGRAPHIC ALGORITHMS      │
                              └─────────────────┬─────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │  Asymmetric (Public-Key)    │                   │   Symmetric & Hash Algos    │
        │   RSA, ECC, ECDSA, DH       │                   │    AES, SHA-2, SHA-3, ChaCha│
        └──────────────┬──────────────┘                   └──────────────┬──────────────┘
                       │                                                 │
            Attacked by Shor's Algo                           Attacked by Grover's Algo
                       │                                                 │
                       ▼                                                 ▼
        ╔═════════════════════════════╗                   ╔═════════════════════════════╗
        ║    COMPLETELY BROKEN ❌     ║                   ║   EFFECTIVE KEY HALVED ⚠️   ║
        ║  (Security reduces to 0)    ║                   ║ AES-128 -> 64-bit (Weak)    ║
        ║ Must REPLACE with NIST PQC  ║                   ║ AES-256 -> 128-bit (SAFE)   ║
        ╚═════════════════════════════╝                   ╚═════════════════════════════╝
```

---

### The Master Algorithm Classification & Rules Matrix

This table forms the **core rules database** for your scanning tool:

| Legacy / Classical Algorithm | Primary Use Case | Quantum Status | Quantum Attack | NIST Approved PQC Replacement | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSA-2048 / 3072 / 4096** | Key Exchange / Signatures | ❌ **Broken** | Shor's Algorithm | **ML-KEM** (Key Exchange) / **ML-DSA** (Signatures) | Replace completely |
| **ECDSA (secp256r1, ed25519)** | Digital Signatures | ❌ **Broken** | Shor's Algorithm | **ML-DSA** (FIPS 204) / **SLH-DSA** (FIPS 205) | Replace completely |
| **ECDH / Diffie-Hellman** | Key Agreement | ❌ **Broken** | Shor's Algorithm | **ML-KEM** (FIPS 203) / Hybrid X25519+ML-KEM | Replace with Hybrid/PQC |
| **DSA / ElGamal** | Digital Signatures | ❌ **Broken** | Shor's Algorithm | **ML-DSA** (FIPS 204) | Deprecate immediately |
| **AES-128** | Symmetric Encryption | ⚠️ **Weakened** | Grover's Algorithm | **AES-256** | Upgrade key length to 256-bit |
| **AES-256** | Symmetric Encryption | ✅ **Quantum-Safe** | Grover's (128-bit remaining) | Keep AES-256 / AES-GCM-256 | Maintain |
| **ChaCha20-Poly1305** | Symmetric Encryption | ✅ **Quantum-Safe** | Grover's (128-bit remaining) | Keep ChaCha20-Poly1305 | Maintain |
| **SHA-1 / MD5** | Hashing | ❌ **Classically Broken** | Collision Attacks | **SHA-256 / SHA-384 / SHA-3** | Urgent Deprecation |
| **SHA-256 / SHA-512** | Hashing | ✅ **Quantum-Safe** | Grover's (Preimage resist) | Keep SHA-256 / SHA-3 | Maintain |
| **SHA-3 (Keccak)** | Hashing | ✅ **Quantum-Safe** | Grover's | Keep SHA-3 | Maintain |

---

### NIST Finalized Post-Quantum Standards (Released August 13, 2024)

NIST officially released the finalized FIPS standards for PQC. Use these exact formal names in your tool and pitch:

1. **FIPS 203: ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)**
   - *Derived from:* CRYSTALS-Kyber
   - *Use:* Securing web traffic, TLS, SSH, VPN key exchange.
   - *Variants:* ML-KEM-512 (Level 1), **ML-KEM-768 (Level 3 - Recommended Default)**, ML-KEM-1024 (Level 5).
2. **FIPS 204: ML-DSA (Module-Lattice-Based Digital Signature Algorithm)**
   - *Derived from:* CRYSTALS-Dilithium
   - *Use:* Identity verification, digital signatures, PKI certificates.
   - *Variants:* ML-DSA-44, **ML-DSA-65 (Recommended Default)**, ML-DSA-87.
3. **FIPS 205: SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)**
   - *Derived from:* SPHINCS+
   - *Use:* Backup signature standard not relying on lattice math; ideal for code signing and document timestamping.
4. **Stateful Hash-Based Signatures (NIST SP 800-208 / RFC 8554 / RFC 8391)**
   - *Algorithms:* **LMS (Leighton-Micali Signatures)** & **XMSS (eXtended Merkle Signature Scheme)**
   - *Use:* Firmware validation, secure bootloader verification, OS image signing.

---

## 3. Mathematical & Risk Frameworks Demystified

NTRO explicitly asks for: *"Apply structured frameworks such as Mosca’s algorithm to identify and categorize risks."*

### 1. Mosca's Theorem (The Quantum Risk Inequality)

Devised by Dr. Michele Mosca (University of Waterloo):

$$\mathbf{X + Y > Z \implies \text{CRITICAL RISK (Data Compromised)}}$$

Where:
- $\mathbf{X}$ = **Shelf-life of Data Confidentiality** (How many years must secrets remain secret?)
  - *Examples:* Military secrets = 30 yrs; Health/Genomic data = 50 yrs; Banking PINs/OTPs = 1 day.
- $\mathbf{Y}$ = **Migration Time** (How many years will it take to re-architect, test, and deploy PQC across the enterprise?)
  - *Industry average:* 3 to 7 years for large government infrastructure.
- $\mathbf{Z}$ = **Time to Collapse / "Q-Day"** (How many years until a Cryptographically Relevant Quantum Computer exists?)
  - *Consensus estimate:* 7 to 10 years (~2032–2035).

```
   Today (2026)                          Q-Day (Z years)
      │                                         │
      ├── Migration Time (Y) ──► Complete       │
      │                                         │
      ├── Data Shelf Life (X) ──────────────────────────► Exposure End
                                                ▲
                                                │
                                 DANGER: Data exposed before shelf life ends!
```

#### In your Tool:
The user can input or select their data category (e.g., "Defense Intelligence", "Financial Records", "Session Tokens"), and ECDAT automatically calculates the Mosca equation and flags:
- 🔴 **CRITICAL (HNDL Active Threat):** $X + Y > Z$
- 🟡 **HIGH RISK:** $X + Y \approx Z$
- 🟢 **SAFE / LOW RISK:** $X + Y < Z$

---

### 2. Quantum-Adjusted Risk Score (QARS) Formula

Your tool should compute a composite risk score (0 to 100) for every detected cryptographic asset:

$$\text{QARS} = w_1 \cdot \text{CryptoWeakness} + w_2 \cdot \text{ExposureFactor} + w_3 \cdot \text{DataCriticality} + w_4 \cdot \text{MoscaScore}$$

- **CryptoWeakness (0–40):** RSA-1024 (40), RSA-2048 (35), ECC-256 (35), AES-128 (15), AES-256 (0), ML-KEM (0).
- **ExposureFactor (0–25):** Public Internet / External API (25), Internal Service (15), Air-gapped / Local (5).
- **DataCriticality (0–20):** Top Secret / PII / Financial (20), Operational (10), Ephemeral/Public (2).
- **MoscaScore (0–15):** Calculated directly from $X + Y > Z$.

---

## 4. Standardized Output: CycloneDX 1.6 Cryptography Bill of Materials (CBOM)

NTRO specifically requires: *"A Comprehensive CBOM analytics tool... standardised formats."*

CycloneDX 1.6 is the **official international standard (ECMA-424)** for CBOM. Your tool will generate this exact JSON structure:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:4a7e93b1-8419-4f2b-9831-23d9a71091b4",
  "version": 1,
  "metadata": {
    "timestamp": "2026-08-29T10:00:00Z",
    "tools": [
      {
        "vendor": "NTRO-ECDAT",
        "name": "Enterprise Cryptographic Discovery & Analysis Tool",
        "version": "1.0.0"
      }
    ]
  },
  "components": [
    {
      "name": "RSA-KeyExchange",
      "type": "cryptographic-asset",
      "bom-ref": "crypto-asset-001",
      "cryptoProperties": {
        "assetType": "algorithm",
        "algorithmProperties": {
          "primitive": "asymmetric",
          "parameterSetIdentifier": "2048",
          "nistQuantumSecurityLevel": 0,
          "classicalSecurityLevel": 112
        }
      },
      "properties": [
        { "name": "ecdat:vulnerabilityStatus", "value": "QUANTUM_VULNERABLE" },
        { "name": "ecdat:recommendedReplacement", "value": "ML-KEM-768 (FIPS 203)" },
        { "name": "ecdat:filePath", "value": "/src/auth/jwt_signer.py:42" },
        { "name": "ecdat:qarsRiskScore", "value": "88" },
        { "name": "ecdat:moscaStatus", "value": "EXPIRED_BEFORE_QDAY" }
      ]
    }
  ]
}
```

---

## 5. System Architecture & Module Specifications

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           ECDAT MULTI-VECTOR SCANNER                        │
  └───────┬───────────────────────────────┬─────────────────────────────┬───────┘
          │                               │                             │
          ▼                               ▼                             ▼
   [Source Code Engine]        [Config & Infra Engine]       [Certs & Live Network]
   - AST & Regex Parsers       - Nginx / Apache / SSH        - X.509 PEM/CRT Parser
   - Python, Java, C++, JS     - IPsec VPN, OpenSSL cnf      - Live TLS Port 443 Probe
          │                               │                             │
          └───────────────────────┬───────┴─────────────────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │  CRYPTOGRAPHIC INVENTORY ENGINE   │
                │  - Normalize primitives & keys    │
                │  - Deduplicate & trace call-sites │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │   QUANTUM RISK & MOSCA ENGINE     │
                │   - FIPS 203/204/205 Mapping      │
                │   - Mosca X+Y>Z Computation       │
                │   - QARS Score Generation         │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │   HYBRID MIGRATION RECOMMENDER    │
                │   - Suggest X25519+ML-KEM Hybrid  │
                │   - BouncyCastle / liboqs recipes │
                └─────────────────┬─────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     STANDARDIZED EXPORTS      │               │     INTERACTIVE DASHBOARD     │
│ - CycloneDX 1.6 CBOM (JSON)   │               │ - Quantum Readiness Heatmap   │
│ - Executive PDF Audit Report  │               │ - Dependency Graph Explorer   │
│ - Remediation Action Plan     │               │ - Live Scan Upload & Terminal │
└───────────────────────────────┘               └───────────────────────────────┘
```

---

## 6. How the Scanner Actually Discovers Cryptography

Your scanner inspects **four layers**:

### 1. Source Code AST & Pattern Matching
Detects cryptographic library calls across languages:
- **Python:** `from cryptography.hazmat...`, `Crypto.PublicKey.RSA`, `hashlib.md5()`, `jwt.encode(..., algorithm="RS256")`
- **Java:** `KeyPairGenerator.getInstance("RSA")`, `Cipher.getInstance("AES/CBC/PKCS5Padding")`, `MessageDigest.getInstance("SHA-1")`
- **C/C++ (OpenSSL):** `EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, NULL)`, `RSA_generate_key_ex()`, `EC_KEY_new_by_curve_name()`
- **JavaScript / Go:** `crypto.createSign('RSA-SHA256')`, `rsa.GenerateKey(rand.Reader, 2048)`

### 2. Configuration & Infrastructure Scanning
- **Web Servers:** Nginx (`ssl_ciphers`, `ssl_protocols`), Apache (`SSLCipherSuite`)
- **Remote Access:** SSH (`/etc/ssh/sshd_config` checking for `ssh-rsa` or `diffie-hellman-group1-sha1`)
- **VPN:** IPsec / Wireguard / OpenVPN cipher suites.
- **Containers:** Dockerfiles installing old OpenSSL packages or deprecated crypto libs.

### 3. Certificate & Keystore Inspection
- Parses X.509 certificates (`.pem`, `.crt`, `.jks`, `.pfx`):
  - Subject Name, Issuer Name, Expiry Date.
  - Public Key Algorithm (`rsaEncryption`, `id-ecPublicKey`) & Key Size.
  - Signature Algorithm (`sha256WithRSAEncryption`, `sha1WithRSAEncryption`).

### 4. Active Live Network TLS Probe
- Connects to an IP/Domain (e.g. `https://internal.agency.gov.in:443`).
- Performs a TLS handshake to extract negotiated Cipher Suite, supported curves, and server certificate chain.

---

## 7. Migration & Remediation Strategies (What Your Tool Recommends)

NTRO asks to *"Recommend suitable alternatives (PQC/ Hybrid algorithms)"*.

### The Hybrid Transition Strategy (Dual-KEM / Composite Signatures)
Full replacement in a single day is risky. The global consensus (IETF, Google, Cloudflare) is **Hybrid Cryptography**:

1. **Hybrid Key Exchange (TLS / VPNs):**
   $$\text{Shared Secret} = \text{KDF}(\text{Classical X25519 Secret} \parallel \text{Post-Quantum ML-KEM-768 Secret})$$
   - *Why:* If the new PQC algorithm has an unforeseen mathematical flaw, classical X25519 still protects it. If quantum computers arrive, ML-KEM protects it.
2. **Dual / Composite Digital Signatures:**
   - Sign with **both** RSA-2048 and **ML-DSA-65**. Verifier validates both.

---

## 8. High-Impact Industry Jargon (Glossary for Presentations & Q&A)

Use these terms during your demo and presentation to immediately establish authority with NTRO judges:

1. **Crypto-Agility:** The ability of an application's architecture to rapidly swap cryptographic algorithms without modifying core application logic.
2. **CBOM (Cryptography Bill of Materials):** A machine-readable inventory of all cryptographic assets, keys, and algorithms (ECMA-424 / CycloneDX 1.6).
3. **CRQC (Cryptographically Relevant Quantum Computer):** A quantum computer with sufficient stable, error-corrected physical qubits to execute Shor's algorithm on RSA-2048 (~4,000 logical / ~1,000,000 physical qubits).
4. **HNDL (Harvest Now, Decrypt Later):** The espionage practice of capturing encrypted ciphertext today to decrypt once CRQC arrives.
5. **Q-Day / Y2Q:** The theoretical day when classical public-key cryptography becomes obsolete.
6. **Lattice-Based Cryptography:** The mathematical foundation (Learning With Errors problem in high-dimensional lattices) behind ML-KEM and ML-DSA.
7. **Composite Key:** A single public/private key pair combining both classical and post-quantum keys.

---

## 9. Step-by-Step 5-Day Prototype Execution Blueprint

```
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                               DAY-BY-DAY SPRINT                            │
 ├──────────────┬─────────────────────────────────────────────────────────────┤
 │ Day 1 (6 hrs)│ Domain Mastery: Read this guide, test NIST sample algorithms │
 │              │ Build rules matrix (`crypto_rules.json`).                   │
 ├──────────────┼─────────────────────────────────────────────────────────────┤
 │ Day 2        │ Scanner Core: Build Python AST code scanner + Regex matcher │
 │              │ Support Python, Java, C/C++ files and X.509 cert parser.    │
 ├──────────────┼─────────────────────────────────────────────────────────────┤
 │ Day 3        │ Analysis Engines: Implement Mosca's formula & QARS score.   │
 │              │ Implement CycloneDX 1.6 CBOM JSON exporter.                 │
 ├──────────────┼─────────────────────────────────────────────────────────────┤
 │ Day 4        │ Web Dashboard: Build React/Tailwind or FastAPI web UI.     │
 │              │ Drag-and-drop repo upload, risk graphs, PDF report generator│
 ├──────────────┼─────────────────────────────────────────────────────────────┤
 │ Day 5        │ Demo Polish: Synthetic enterprise repo testbench.           │
 │              │ 3-Minute pitch deck and live demo rehearsal.                │
 └──────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 10. The Winning 3-Minute Live Demo Choreography

1. **The Hook (0:00 - 0:30):**  
   *"Judges, right now, foreign adversaries are capturing India's encrypted communications under 'Harvest Now, Decrypt Later'. In August 2024, NIST released FIPS 203, 204, and 205. But NTRO and critical infrastructure cannot migrate what they cannot see. We built ECDAT."*
2. **The Live Action (0:30 - 1:45):**  
   - Drag and drop a sample enterprise codebase + Nginx config + SSL cert into ECDAT.
   - Click **"Execute Cryptographic Discovery"**.
   - Watch the terminal logs stream: AST Parser -> Cert Extractor -> Config Inspector.
   - Instantly show the **Interactive Quantum Readiness Heatmap**:
     - *88% Quantum Vulnerable* (RSA-2048 in JWT, ECDSA in Auth, TLS 1.2 using DHE).
   - Show **Mosca’s Theorem Evaluation**: *"Data Shelf Life (15 yrs) + Migration (4 yrs) > Estimated Q-Day (7 yrs) $\implies$ ACTIVE COMPROMISE."*
3. **The Solution & Output (1:45 - 2:30):**  
   - Click on an asset: Show automated code fix suggestion (e.g. `replace RSA-2048 with ML-KEM-768`).
   - Click **"Export CycloneDX 1.6 CBOM"** (show the standardized JSON).
   - Click **"Generate NTRO Executive Audit PDF"** (download the professional compliance report).
4. **The Close (2:30 - 3:00):**  
   *"ECDAT turns an intractable multi-year quantum migration blindspot into a 30-second actionable roadmap. Ready for deployment across national critical infrastructure."*
