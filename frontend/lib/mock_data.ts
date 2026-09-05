import { ScanResult, MoscaPreset, RemediationResult, PQCProofResult } from "./types";

export const mockScanResult: ScanResult = {
  scan_id: "scan-ecdat-sih26164-demo",
  timestamp: new Date().toISOString(),
  repo_name: "demo_enterprise_repo",
  summary: {
    total_assets: 15,
    critical: 8,
    high: 3,
    medium: 2,
    safe: 2,
    quantum_readiness_pct: 13.3,
    scanned_files_count: 42,
    duration_ms: 1420,
  },
  mosca: {
    x: 15,
    y: 4,
    z: 7,
    status: "CRITICAL",
    message: "X+Y (19) > Z (7) — Active HNDL Threat Detected: Attackers recording encrypted traffic now can decrypt it before data expiration.",
    breach_year: new Date().getFullYear() + 7,
    safety_margin_years: -12,
  },
  assets: [
    {
      id: "asset-001",
      algorithm: "RSA-2048",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 88,
      file: "src/auth/jwt_signer.py",
      line: 42,
      language: "python",
      replacement: "ML-KEM-768 (FIPS 203) / ML-DSA-65 (FIPS 204)",
      nist_standard: "FIPS 204 (ML-DSA)",
      attack_vector: "Shor's Algorithm (Polynomial Time Prime Factorization)",
      library_used: "cryptography.hazmat",
      description: "RSA-2048 asymmetric key pair used for JWT token signing and authentication headers.",
      code_snippet: `from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
import jwt

# Vulnerable RSA-2048 Key Generation for Auth Tokens
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def sign_auth_jwt(payload: dict) -> str:
    token = jwt.encode(payload, private_key, algorithm="RS256")
    return token`,
      remediation: {
        original_code: `from cryptography.hazmat.primitives.asymmetric import rsa
import jwt

private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def sign_auth_jwt(payload: dict) -> str:
    return jwt.encode(payload, private_key, algorithm="RS256")`,
        remediated_code: `import oqs
import json
import base64

# NIST FIPS 204 ML-DSA-65 Quantum-Safe Digital Signature
signer = oqs.Signature("ML-DSA-65")
public_key = signer.generate_keypair()

def sign_auth_jwt(payload: dict) -> dict:
    serialized = json.dumps(payload).encode("utf-8")
    signature = signer.sign(serialized)
    return {
        "payload": payload,
        "alg": "ML-DSA-65",
        "signature_b64": base64.b64encode(signature).decode("utf-8"),
        "pubkey_b64": base64.b64encode(public_key).decode("utf-8")
    }`,
        diff_snippet: `- from cryptography.hazmat.primitives.asymmetric import rsa
- private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
- def sign_auth_jwt(payload: dict) -> str:
-     return jwt.encode(payload, private_key, algorithm="RS256")
+ import oqs
+ # NIST FIPS 204 ML-DSA-65 Quantum-Safe Digital Signature
+ signer = oqs.Signature("ML-DSA-65")
+ public_key = signer.generate_keypair()
+ def sign_auth_jwt(payload: dict) -> dict:
+     signature = signer.sign(json.dumps(payload).encode())
+     return {"payload": payload, "alg": "ML-DSA-65", "sig": signature}`,
        explanation: "Replaced Shor-vulnerable RSA-2048 signature scheme with NIST FIPS 204 ML-DSA-65 (Module-Lattice Digital Signature Algorithm) via liboqs, achieving Category 3 quantum security.",
        nist_standard: "FIPS 204 (ML-DSA-65)",
        library_recommendation: "liboqs-python / pyoqs",
      },
    },
    {
      id: "asset-002",
      algorithm: "MD5",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 95,
      file: "src/auth/password_hasher.py",
      line: 18,
      language: "python",
      replacement: "Argon2id / SHA-3-512 (FIPS 202)",
      nist_standard: "FIPS 202 (SHA-3)",
      attack_vector: "Severe Collision Vulnerability + Grover's Algorithm",
      library_used: "hashlib",
      description: "Legacy MD5 hash function used for password digests and token checksums.",
      code_snippet: `import hashlib

def hash_user_password(password: str) -> str:
    # CRITICAL: MD5 is broken classically and quantumly
    digest = hashlib.md5(password.encode("utf-8")).hexdigest()
    return digest`,
      remediation: {
        original_code: `import hashlib

def hash_user_password(password: str) -> str:
    digest = hashlib.md5(password.encode("utf-8")).hexdigest()
    return digest`,
        remediated_code: `import hashlib
import os

def hash_user_password(password: str, salt: bytes = None) -> dict:
    if salt is None:
        salt = os.urandom(32)
    # NIST FIPS 202 SHA-3-512 + PBKDF2 with 600k rounds
    key = hashlib.pbkdf2_hmac(
        'sha3_512',
        password.encode('utf-8'),
        salt,
        600000
    )
    return {"salt_hex": salt.hex(), "hash_hex": key.hex(), "alg": "PBKDF2-SHA3-512"}`,
        diff_snippet: `- import hashlib
- def hash_user_password(password: str) -> str:
-     return hashlib.md5(password.encode("utf-8")).hexdigest()
+ import hashlib, os
+ def hash_user_password(password: str, salt: bytes = None) -> dict:
+     salt = salt or os.urandom(32)
+     key = hashlib.pbkdf2_hmac('sha3_512', password.encode(), salt, 600000)
+     return {"salt": salt.hex(), "hash": key.hex(), "alg": "PBKDF2-SHA3-512"}`,
        explanation: "Upgraded obsolete MD5 to quantum-resistant PBKDF2 with SHA-3-512 (FIPS 202) and 600,000 iterations + 256-bit cryptographically secure salt.",
        nist_standard: "FIPS 202 (SHA-3)",
        library_recommendation: "hashlib (built-in) / argon2-cffi",
      },
    },
    {
      id: "asset-003",
      algorithm: "ECDSA-secp256r1",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 84,
      file: "src/payments/TransactionSigner.java",
      line: 67,
      language: "java",
      replacement: "ML-DSA-65 (FIPS 204)",
      nist_standard: "FIPS 204 (ML-DSA)",
      attack_vector: "Shor's Algorithm (Discrete Logarithm on Elliptic Curves)",
      library_used: "java.security.KeyPairGenerator",
      description: "Elliptic curve digital signature on secp256r1 / P-256 for financial ledger transaction signing.",
      code_snippet: `KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
ECGenParameterSpec ecsp = new ECGenParameterSpec("secp256r1");
kpg.initialize(ecsp);
KeyPair kp = kpg.generateKeyPair();
Signature ecdsaSign = Signature.getInstance("SHA256withECDSA");
ecdsaSign.initSign(kp.getPrivate());`,
      remediation: {
        original_code: `KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
kpg.initialize(new ECGenParameterSpec("secp256r1"));
KeyPair kp = kpg.generateKeyPair();
Signature ecdsaSign = Signature.getInstance("SHA256withECDSA");
ecdsaSign.initSign(kp.getPrivate());`,
        remediated_code: `// BouncyCastle 1.78+ NIST PQC ML-DSA-65 Provider
Security.addProvider(new BouncyCastlePQCProvider());
KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA-65", "BCPQC");
KeyPair kp = kpg.generateKeyPair();
Signature pqcSign = Signature.getInstance("ML-DSA", "BCPQC");
pqcSign.initSign(kp.getPrivate());`,
        diff_snippet: `- KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
- kpg.initialize(new ECGenParameterSpec("secp256r1"));
+ Security.addProvider(new BouncyCastlePQCProvider());
+ KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA-65", "BCPQC");
- Signature ecdsaSign = Signature.getInstance("SHA256withECDSA");
+ Signature pqcSign = Signature.getInstance("ML-DSA", "BCPQC");`,
        explanation: "Migrated Java cryptographic provider to Bouncy Castle PQC supporting NIST FIPS 204 ML-DSA-65, preventing quantum discrete log forging.",
        nist_standard: "FIPS 204 (ML-DSA-65)",
        library_recommendation: "org.bouncycastle:bcpqc-jdk18on:1.78.1",
      },
    },
    {
      id: "asset-004",
      algorithm: "RSA-2048 / AES-128-CBC",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 86,
      file: "src/payments/PaymentGateway.java",
      line: 112,
      language: "java",
      replacement: "ML-KEM-768 (FIPS 203) + AES-256-GCM",
      nist_standard: "FIPS 203 (ML-KEM)",
      attack_vector: "Shor's (RSA) + Padding Oracle & Grover's (AES-128-CBC)",
      library_used: "javax.crypto.Cipher",
      description: "Hybrid RSA envelope encryption wrapping an AES-128-CBC session key for merchant cardholder transactions.",
      code_snippet: `Cipher rsaCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
rsaCipher.init(Cipher.ENCRYPT_MODE, merchantPublicKey);
byte[] encryptedKey = rsaCipher.doFinal(aesKey);
Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");`,
      remediation: {
        original_code: `Cipher rsaCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
rsaCipher.init(Cipher.ENCRYPT_MODE, merchantPublicKey);
byte[] encryptedKey = rsaCipher.doFinal(aesKey);
Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");`,
        remediated_code: `// Quantum-Safe KEM + Authenticated Symmetric Encryption
KEM kem = KEM.getInstance("ML-KEM-768", "BCPQC");
KEM.Encapsulator encapsulator = kem.newEncapsulator(merchantPqcPublicKey);
KEM.Encapsulated encapsulated = encapsulator.encapsulate();
byte[] sharedSecret = encapsulated.getKey();
Cipher aesGcm = Cipher.getInstance("AES/GCM/NoPadding");`,
        diff_snippet: `- Cipher rsaCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
- byte[] encryptedKey = rsaCipher.doFinal(aesKey);
- Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
+ KEM kem = KEM.getInstance("ML-KEM-768", "BCPQC");
+ KEM.Encapsulated encapsulated = kem.newEncapsulator(merchantPqcPublicKey).encapsulate();
+ Cipher aesGcm = Cipher.getInstance("AES/GCM/NoPadding");`,
        explanation: "Replaced vulnerable RSA key encapsulation and CBC mode with NIST FIPS 203 ML-KEM-768 key encapsulation and AES-256-GCM AEAD encryption.",
        nist_standard: "FIPS 203 (ML-KEM-768)",
        library_recommendation: "org.bouncycastle:bcpqc-jdk18on:1.78.1",
      },
    },
    {
      id: "asset-005",
      algorithm: "3DES (Triple DES)",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 91,
      file: "src/api/crypto_wrapper.py",
      line: 34,
      language: "python",
      replacement: "AES-256-GCM / ML-KEM-768 Hybrid",
      nist_standard: "NIST SP 800-38D",
      attack_vector: "Sweet32 Collision Attack (64-bit block) + Grover's Algorithm",
      library_used: "Crypto.Cipher.DES3",
      description: "Custom dynamic cipher wrapper dynamically selecting 3DES-EDE3 with small block size for legacy API clients.",
      code_snippet: `from Crypto.Cipher import DES3
from Crypto.Random import get_random_bytes

class CryptoWrapper:
    def __init__(self, key: bytes):
        # Hidden crypto wrapper detected via AI Semantic Analyzer
        self.cipher = DES3.new(key, DES3.MODE_ECB)
        
    def encrypt_data(self, data: bytes) -> bytes:
        return self.cipher.encrypt(data)`,
      remediation: {
        original_code: `from Crypto.Cipher import DES3
class CryptoWrapper:
    def __init__(self, key: bytes):
        self.cipher = DES3.new(key, DES3.MODE_ECB)
    def encrypt_data(self, data: bytes) -> bytes:
        return self.cipher.encrypt(data)`,
        remediated_code: `from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class CryptoWrapper:
    def __init__(self, key: bytes = None):
        self.key = key or AESGCM.generate_key(bit_length=256)
        self.aesgcm = AESGCM(self.key)
        
    def encrypt_data(self, data: bytes) -> bytes:
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, data, None)
        return nonce + ciphertext`,
        diff_snippet: `- from Crypto.Cipher import DES3
- self.cipher = DES3.new(key, DES3.MODE_ECB)
- return self.cipher.encrypt(data)
+ from cryptography.hazmat.primitives.ciphers.aead import AESGCM
+ self.key = key or AESGCM.generate_key(bit_length=256)
+ nonce = os.urandom(12)
+ return nonce + self.aesgcm.encrypt(nonce, data, None)`,
        explanation: "AI Semantic Analyzer identified a hidden legacy 3DES cipher wrapper in ECB mode. Remediated to 256-bit AES-GCM AEAD.",
        nist_standard: "NIST SP 800-38D",
        library_recommendation: "cryptography.hazmat.primitives.ciphers.aead",
      },
    },
    {
      id: "asset-006",
      algorithm: "AES-128-CBC",
      type: "algorithm",
      quantum_status: "WEAKENED",
      criticality: "medium",
      qars_score: 48,
      file: "src/utils/file_encryptor.py",
      line: 31,
      language: "python",
      replacement: "AES-256-GCM",
      nist_standard: "NIST SP 800-38D",
      attack_vector: "Grover's Algorithm (Reduces 128-bit security to 64-bit effective quantum security)",
      library_used: "Crypto.Cipher.AES",
      description: "AES with 128-bit key size and CBC mode. Grover's algorithm halves key strength to 64-bit quantum equivalent.",
      code_snippet: `from Crypto.Cipher import AES
import os

def encrypt_file_chunk(chunk: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv) # 128-bit key
    return iv + cipher.encrypt(chunk)`,
      remediation: {
        original_code: `def encrypt_file_chunk(chunk: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return iv + cipher.encrypt(chunk)`,
        remediated_code: `from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_file_chunk(chunk: bytes, key256: bytes) -> bytes:
    # AES-256 provides 128-bit post-quantum security against Grover
    aesgcm = AESGCM(key256)
    nonce = os.urandom(12)
    return nonce + aesgcm.encrypt(nonce, chunk, None)`,
        diff_snippet: `- cipher = AES.new(key, AES.MODE_CBC, iv)
- return iv + cipher.encrypt(chunk)
+ aesgcm = AESGCM(key256)
+ nonce = os.urandom(12)
+ return nonce + aesgcm.encrypt(nonce, chunk, None)`,
        explanation: "Upgraded 128-bit CBC to 256-bit AES-GCM, restoring quantum security margin to 128 bits under Grover's search.",
        nist_standard: "NIST SP 800-38D",
        library_recommendation: "cryptography.hazmat.primitives.ciphers.aead",
      },
    },
    {
      id: "asset-007",
      algorithm: "AES-256-GCM",
      type: "algorithm",
      quantum_status: "SAFE",
      criticality: "safe",
      qars_score: 5,
      file: "src/core/session.py",
      line: 88,
      language: "python",
      replacement: "None required (Compliant with Post-Quantum Baseline)",
      nist_standard: "NIST SP 800-38D",
      attack_vector: "None (Grover's algorithm leaves 128 bits of quantum security)",
      library_used: "cryptography.hazmat.primitives.ciphers.aead",
      description: "Authenticated symmetric session encryption using AES-256-GCM with secure random 96-bit nonces.",
      code_snippet: `from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def seal_session(data: bytes, session_key: bytes) -> bytes:
    aesgcm = AESGCM(session_key) # 256-bit key: Quantum Safe
    nonce = os.urandom(12)
    return nonce + aesgcm.encrypt(nonce, data, None)`,
    },
    {
      id: "asset-008",
      algorithm: "TLSv1.0 / Diffie-Hellman",
      type: "protocol",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 92,
      file: "config/nginx.conf",
      line: 27,
      language: "config",
      replacement: "TLSv1.3 with X25519Kyber768Draft00 / ML-KEM-768",
      nist_standard: "FIPS 203 / RFC 8446",
      attack_vector: "Shor's Algorithm on Classical DH + Deprecated TLS Ciphers",
      description: "Nginx reverse proxy configured with obsolete TLS versions and weak DHE cipher suites.",
      code_snippet: `server {
    listen 443 ssl;
    server_name api.enterprise.internal;
    
    # VULNERABLE: Deprecated TLS & Shor-vulnerable DHE
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers 'ECDHE-RSA-AES128-SHA:DHE-RSA-AES128-SHA:RC4:HIGH:!MD5:!aNULL';
    ssl_prefer_server_ciphers on;
}`,
      remediation: {
        original_code: `ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers 'ECDHE-RSA-AES128-SHA:DHE-RSA-AES128-SHA:RC4:HIGH:!MD5:!aNULL';
ssl_prefer_server_ciphers on;`,
        remediated_code: `ssl_protocols TLSv1.3;
# Hybrid Post-Quantum Key Exchange: X25519 + ML-KEM-768
ssl_ecdh_curve X25519Kyber768Draft00:X25519:secp384r1;
ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
ssl_prefer_server_ciphers off;`,
        diff_snippet: `- ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
- ssl_ciphers 'ECDHE-RSA-AES128-SHA:DHE-RSA-AES128-SHA:RC4:HIGH:!MD5:!aNULL';
+ ssl_protocols TLSv1.3;
+ ssl_ecdh_curve X25519Kyber768Draft00:X25519:secp384r1;
+ ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';`,
        explanation: "Enforced TLS 1.3 only and enabled hybrid post-quantum key exchange curve X25519+Kyber768 (ML-KEM) to prevent HNDL interception of traffic.",
        nist_standard: "FIPS 203 (ML-KEM)",
        library_recommendation: "Nginx 1.25+ with OpenSSL 3.3 / oqs-provider",
      },
    },
    {
      id: "asset-009",
      algorithm: "Diffie-Hellman-1024 / ssh-rsa",
      type: "protocol",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 89,
      file: "config/sshd_config",
      line: 14,
      language: "config",
      replacement: "sntrup761x25519-sha512@openssh.com / ssh-ed25519",
      nist_standard: "NIST Post-Quantum Hybrid",
      attack_vector: "Logjam Attack + Shor's Quantum Discrete Logarithm",
      description: "SSH daemon accepting 1024-bit Diffie-Hellman group 1 and legacy RSA host keys.",
      code_snippet: `# OpenSSH Server Configuration
Port 22
KexAlgorithms diffie-hellman-group1-sha1,diffie-hellman-group14-sha1
HostKeyAlgorithms ssh-rsa,ssh-dss
Ciphers aes128-cbc,3des-cbc`,
      remediation: {
        original_code: `KexAlgorithms diffie-hellman-group1-sha1,diffie-hellman-group14-sha1
HostKeyAlgorithms ssh-rsa,ssh-dss
Ciphers aes128-cbc,3des-cbc`,
        remediated_code: `# OpenSSH Post-Quantum Hybrid Configuration
KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256
HostKeyAlgorithms ssh-ed25519
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com`,
        diff_snippet: `- KexAlgorithms diffie-hellman-group1-sha1,diffie-hellman-group14-sha1
- HostKeyAlgorithms ssh-rsa,ssh-dss
+ KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256
+ HostKeyAlgorithms ssh-ed25519`,
        explanation: "Updated SSH KEX algorithm to post-quantum hybrid NTRU Prime (sntrup761) + X25519 and removed deprecated 1024-bit DH algorithms.",
        nist_standard: "OpenSSH 9.0+ PQC Hybrid",
        library_recommendation: "OpenSSH 9.3+",
      },
    },
    {
      id: "asset-010",
      algorithm: "RSA-2048 Certificate",
      type: "certificate",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 85,
      file: "certs/server.pem",
      line: 1,
      language: "certificate",
      replacement: "ML-DSA-65 (FIPS 204) Certificate",
      nist_standard: "FIPS 204 (ML-DSA)",
      attack_vector: "Shor's Algorithm (Public Key Factorization)",
      description: "X.509 server TLS identity certificate with 2048-bit RSA public key (Expires: 2027-11-14).",
      code_snippet: `Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 4a:2b:89:12:ef:90
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=IN, O=Enterprise CA, CN=Internal Root
        Subject: CN=api.enterprise.internal
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus: 00:c4:98:31...`,
      remediation: {
        original_code: `Public Key Algorithm: rsaEncryption (2048 bit)
Signature Algorithm: sha256WithRSAEncryption`,
        remediated_code: `Public Key Algorithm: id-ml-dsa-65 (FIPS 204)
Signature Algorithm: id-ml-dsa-65`,
        diff_snippet: `- Public Key Algorithm: rsaEncryption (2048 bit)
- Signature Algorithm: sha256WithRSAEncryption
+ Public Key Algorithm: id-ml-dsa-65 (FIPS 204 Module-Lattice)
+ Signature Algorithm: id-ml-dsa-65`,
        explanation: "Re-issued X.509 certificate using NIST FIPS 204 ML-DSA-65 key pair and quantum-safe signature hierarchy.",
        nist_standard: "FIPS 204 (ML-DSA-65)",
        library_recommendation: "OpenSSL 3.3 with oqs-provider",
      },
    },
    {
      id: "asset-011",
      algorithm: "SHA-1 Certificate Signature",
      type: "certificate",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 94,
      file: "certs/ca_bundle.crt",
      line: 1,
      language: "certificate",
      replacement: "SHA-384 / ML-DSA-87 Root Certificate",
      nist_standard: "FIPS 204 (ML-DSA-87)",
      attack_vector: "SHAttered Collision Attack + Shor's Signature Forging",
      description: "Legacy Root CA bundle containing deprecated SHA-1 digest signatures vulnerable to chosen-prefix collision.",
      code_snippet: `Certificate:
    Data:
        Version: 3 (0x2)
        Signature Algorithm: sha1WithRSAEncryption
        Issuer: C=IN, O=Legacy National Root CA
        Validity: Not After : Dec 31 2029 GMT
        Subject: C=IN, O=Legacy National Root CA`,
      remediation: {
        original_code: `Signature Algorithm: sha1WithRSAEncryption
Validity: Not After : Dec 31 2029 GMT`,
        remediated_code: `Signature Algorithm: id-ml-dsa-87
Validity: Not After : Dec 31 2035 GMT (Post-Quantum Root)`,
        diff_snippet: `- Signature Algorithm: sha1WithRSAEncryption
+ Signature Algorithm: id-ml-dsa-87 (NIST Level 5 PQC)`,
        explanation: "Revoked legacy SHA-1 signed intermediate CA certificate and replaced with NIST Level 5 ML-DSA-87 quantum-hardened root.",
        nist_standard: "FIPS 204 (ML-DSA-87)",
        library_recommendation: "PKI Management Suite / HashiCorp Vault PQC",
      },
    },
    {
      id: "asset-012",
      algorithm: "ECDH-P256",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "high",
      qars_score: 82,
      file: "src/messaging/E2EEChannel.java",
      line: 55,
      language: "java",
      replacement: "ML-KEM-1024 (FIPS 203)",
      nist_standard: "FIPS 203 (ML-KEM)",
      attack_vector: "Shor's Algorithm (HNDL Attack on Encrypted Chat Logs)",
      library_used: "javax.crypto.KeyAgreement",
      description: "End-to-end encrypted messaging channel performing ephemeral Diffie-Hellman key exchange over NIST P-256.",
      code_snippet: `KeyAgreement keyAgree = KeyAgreement.getInstance("ECDH");
keyAgree.init(userPrivateKey);
keyAgree.doPhase(peerPublicKey, true);
byte[] sharedSecret = keyAgree.generateSecret();`,
      remediation: {
        original_code: `KeyAgreement keyAgree = KeyAgreement.getInstance("ECDH");
keyAgree.init(userPrivateKey);
keyAgree.doPhase(peerPublicKey, true);
byte[] sharedSecret = keyAgree.generateSecret();`,
        remediated_code: `// FIPS 203 ML-KEM-1024 Post-Quantum Key Encapsulation
KEM kem = KEM.getInstance("ML-KEM-1024", "BCPQC");
KEM.Decapsulator decapsulator = kem.newDecapsulator(userPqcPrivateKey);
byte[] sharedSecret = decapsulator.decapsulate(encapsulatedCiphertext);`,
        diff_snippet: `- KeyAgreement keyAgree = KeyAgreement.getInstance("ECDH");
- keyAgree.doPhase(peerPublicKey, true);
+ KEM kem = KEM.getInstance("ML-KEM-1024", "BCPQC");
+ byte[] sharedSecret = kem.newDecapsulator(userPqcPrivateKey).decapsulate(encapsulatedCiphertext);`,
        explanation: "Upgraded E2EE channel from Shor-vulnerable ECDH P-256 to NIST FIPS 203 ML-KEM-1024, neutralizing HNDL eavesdropping on messaging channels.",
        nist_standard: "FIPS 203 (ML-KEM-1024)",
        library_recommendation: "org.bouncycastle:bcpqc-jdk18on:1.78.1",
      },
    },
    {
      id: "asset-013",
      algorithm: "DES (Data Encryption Standard)",
      type: "algorithm",
      quantum_status: "BROKEN",
      criticality: "critical",
      qars_score: 96,
      file: "src/db/CredentialStore.py",
      line: 45,
      language: "python",
      replacement: "AES-256-KW (Key Wrap) + ML-KEM-768",
      nist_standard: "NIST SP 800-38F",
      attack_vector: "56-bit Key Exhaustive Search + Grover's Algorithm ($O(2^{28})$)",
      library_used: "Crypto.Cipher.DES",
      description: "Database credential store encrypting database connection strings with legacy 56-bit single DES.",
      code_snippet: `from Crypto.Cipher import DES

def encrypt_db_password(password: str, key_8bytes: bytes) -> bytes:
    # CRITICAL: 56-bit DES is broken classically in under 1 day
    des = DES.new(key_8bytes, DES.MODE_ECB)
    return des.encrypt(password.encode().ljust(8))`,
      remediation: {
        original_code: `from Crypto.Cipher import DES
def encrypt_db_password(password: str, key_8bytes: bytes) -> bytes:
    des = DES.new(key_8bytes, DES.MODE_ECB)
    return des.encrypt(password.encode().ljust(8))`,
        remediated_code: `from cryptography.hazmat.primitives.keywrap import aes_key_wrap
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_db_password(password: str, master_key_32bytes: bytes) -> bytes:
    # NIST SP 800-38F AES-256-GCM Secure Enclave Storage
    aesgcm = AESGCM(master_key_32bytes)
    nonce = os.urandom(12)
    return nonce + aesgcm.encrypt(nonce, password.encode(), None)`,
        diff_snippet: `- from Crypto.Cipher import DES
- des = DES.new(key_8bytes, DES.MODE_ECB)
- return des.encrypt(password.encode().ljust(8))
+ from cryptography.hazmat.primitives.ciphers.aead import AESGCM
+ aesgcm = AESGCM(master_key_32bytes)
+ nonce = os.urandom(12)
+ return nonce + aesgcm.encrypt(nonce, password.encode(), None)`,
        explanation: "Replaced 56-bit DES with NIST SP 800-38F compliant AES-256 authenticated encryption.",
        nist_standard: "NIST SP 800-38F",
        library_recommendation: "cryptography.hazmat.primitives.ciphers.aead",
      },
    },
    {
      id: "asset-014",
      algorithm: "SHA-256 Merkle Ledger",
      type: "algorithm",
      quantum_status: "SAFE",
      criticality: "safe",
      qars_score: 12,
      file: "src/blockchain/LedgerVerifier.py",
      line: 72,
      language: "python",
      replacement: "None required (Safe against Grover's algorithm with 128-bit quantum security)",
      nist_standard: "FIPS 180-4",
      attack_vector: "None (Grover's algorithm requires $2^{128}$ operations)",
      library_used: "hashlib",
      description: "Cryptographic hash tree verification using SHA-256 for audit immutability logs.",
      code_snippet: `import hashlib

def compute_merkle_leaf(tx_data: bytes) -> str:
    # SHA-256 provides 128-bit collision resistance under quantum attacks
    return hashlib.sha256(tx_data).hexdigest()`,
    },
    {
      id: "asset-015",
      algorithm: "IKEv1 / 3DES-SHA1 VPN",
      type: "protocol",
      quantum_status: "BROKEN",
      criticality: "high",
      qars_score: 90,
      file: "src/vpn/ipsec_tunnel.conf",
      line: 8,
      language: "config",
      replacement: "IKEv2 with ML-KEM-768 + AES-256-GCM",
      nist_standard: "FIPS 203 / RFC 7296",
      attack_vector: "Shor's Algorithm on Diffie-Hellman Key Exchange + 3DES weakness",
      description: "IPSec VPN tunnel configuration using IKEv1, 3DES encryption, and SHA1 integrity check.",
      code_snippet: `conn enterprise-ipsec-tunnel
    keyexchange=ikev1
    ike=3des-sha1-modp1024!
    esp=3des-sha1!
    authby=secret`,
      remediation: {
        original_code: `keyexchange=ikev1
ike=3des-sha1-modp1024!
esp=3des-sha1!`,
        remediated_code: `keyexchange=ikev2
# Quantum-Resistant IKEv2 with ML-KEM-768
ike=aes256gcm16-prfsha384-mlkem768!
esp=aes256gcm16-sha384!`,
        diff_snippet: `- keyexchange=ikev1
- ike=3des-sha1-modp1024!
- esp=3des-sha1!
+ keyexchange=ikev2
+ ike=aes256gcm16-prfsha384-mlkem768!
+ esp=aes256gcm16-sha384!`,
        explanation: "Upgraded IPSec VPN tunnel definition to IKEv2 with post-quantum ML-KEM-768 key encapsulation and AES-256-GCM AEAD.",
        nist_standard: "FIPS 203 (ML-KEM)",
        library_recommendation: "strongSwan 5.9.11+ with PQC plugin",
      },
    },
  ],
};

export const mockMoscaPresets: MoscaPreset[] = [
  {
    name: "Defense & Tactical Systems",
    label: "Defense (NTRO/PMO)",
    x: 30,
    y: 5,
    z: 7,
    description: "Classified military intelligence, satellite telemetry, and defense communications requiring 30+ year confidentiality.",
    badge: "Critical Infrastructure",
  },
  {
    name: "Financial & Banking Records",
    label: "Financial Systems",
    x: 10,
    y: 3,
    z: 7,
    description: "Core banking ledgers, KYC identities, and payment transaction history (10 year statutory retention).",
    badge: "BFSI Sector",
  },
  {
    name: "Healthcare & Genomic Data",
    label: "Healthcare / Genomic",
    x: 50,
    y: 4,
    z: 7,
    description: "Electronic health records and individual genomic profiles requiring lifetime secrecy (50+ years).",
    badge: "HIPAA / Health",
  },
  {
    name: "Ephemeral Session Tokens",
    label: "Web Session Tokens",
    x: 0.05,
    y: 1,
    z: 7,
    description: "Short-lived bearer access tokens and web session IDs expiring within hours.",
    badge: "Low Threat Horizon",
  },
];

export const mockPqcProof: PQCProofResult = {
  kem_algo: "ML-KEM-768 (FIPS 203)",
  kem_time_ms: 0.042,
  kem_key_bytes: 1184,
  sig_algo: "ML-DSA-65 (FIPS 204)",
  sig_time_ms: 0.128,
  sig_size_bytes: 3309,
  status: "VERIFIED_LIVE",
};
