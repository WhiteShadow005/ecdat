# ECDAT — Official Open Source Benchmark Repositories

This folder contains **5 genuine, unmodified open-source codebases** cloned directly from their official GitHub repositories. These repositories are used worldwide by millions of developers and enterprise organizations, providing 100% authentic, real-world data for testing ECDAT's post-quantum cryptographic discovery, Mosca Theorem modeling, and QARS risk scoring.

---

## 🌐 Cloned Official Repositories

| Package Archive | Official GitHub Repository | Stars / Adoption | Primary Domain | Cryptographic Primitives Discovered |
|---|---|---|---|---|
| [`pyjwt.zip`](./pyjwt.zip) | [jpadilla/pyjwt](https://github.com/jpadilla/pyjwt) | 5.2k+ ⭐<br>100M+ monthly downloads | Web Auth & JWT Tokens | **173 Assets Detected**<br>• RSA-2048 (`RS256`, `RS384`, `RS512`)<br>• ECDSA (`ES256`, `ES384`, `ES512`)<br>• HMAC-SHA256 (`HS256`)<br>• X.509 Certificate thumbprint verification |
| [`paramiko.zip`](./paramiko.zip) | [paramiko/paramiko](https://github.com/paramiko/paramiko) | 8.8k+ ⭐<br>Core Python SSH engine | Infrastructure & DevOps | **48 Assets Detected**<br>• Diffie-Hellman Key Exchange (Group 1, 14)<br>• RSA Host Key Generation & Signatures<br>• ECDSA (`secp256r1`, `secp384r1`)<br>• Triple-DES (3DES) & AES Ciphers |
| [`tink_crypto.zip`](./tink_crypto.zip) | [tink-crypto/tink-py](https://github.com/tink-crypto/tink-py) | Google Security & Cryptography | Enterprise Cryptography | **36 Assets Detected**<br>• Google's Digital Signature Primitives<br>• Hybrid Public Key Encryption (HPKE)<br>• ECDSA & RSA Key Managers<br>• AEAD & Streaming Encryption |
| [`oauthlib.zip`](./oauthlib.zip) | [oauthlib/oauthlib](https://github.com/oauthlib/oauthlib) | 2.5k+ ⭐<br>Official OAuth RFC Library | Identity & Access Control | **49 Assets Detected**<br>• RFC 5849 & RFC 6749 Cryptography<br>• RSA-SHA1 / RSA-SHA256 Token Signatures<br>• HMAC-SHA256 & SHA-512 Digests<br>• PKCE Code Verifiers |
| [`liboqs_python.zip`](./liboqs_python.zip) | [open-quantum-safe/liboqs-python](https://github.com/open-quantum-safe/liboqs-python) | Open Quantum Safe Project | Post-Quantum Cryptography | **19 Assets Detected**<br>• NIST FIPS 203 (ML-KEM) Python bindings<br>• NIST FIPS 204 (ML-DSA) Python bindings<br>• Classical fallback signature algorithms<br>• PQC migration evaluation tests |

---

## 🚀 How to Test in the ECDAT Web Interface

1. Open [**http://localhost:3000/scan**](http://localhost:3000/scan) in your browser.
2. Drag and drop any of the `.zip` packages from this folder:
   - `pyjwt.zip`
   - `paramiko.zip`
   - `tink_crypto.zip`
   - `oauthlib.zip`
   - `liboqs_python.zip`
3. Select the target **Data Sensitivity Preset** (e.g. *Infrastructure* for Paramiko, *Financial* for Google Tink, *Session* for PyJWT).
4. Click **Run Cryptographic Discovery**.
5. Watch ECDAT parse the real source AST, construct the Cryptographic Bill of Materials (CBOM), score quantum risks via QARS, and generate NIST PQC migration plans!
