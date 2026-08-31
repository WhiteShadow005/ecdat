"""
DEMO ENTERPRISE REPO — JWT Signer (VULNERABLE)
Uses RSA-2048 to sign JWTs — BROKEN by Shor's Algorithm.
This file is intentionally vulnerable for ECDAT demo scanning.
DO NOT USE IN PRODUCTION.
"""

import jwt
import datetime
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization


def generate_rsa_keypair():
    """Generate RSA-2048 private key — QUANTUM VULNERABLE."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,  # RSA-2048: BROKEN by Shor's Algorithm
    )
    return private_key


def create_jwt_token(user_id: str, role: str) -> str:
    """
    Create a signed JWT using RS256 (RSA-2048 + SHA-256).
    RS256 is QUANTUM VULNERABLE — use ML-DSA-65 (FIPS 204) instead.
    """
    private_key = generate_rsa_keypair()
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )

    payload = {
        "user_id": user_id,
        "role": role,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }

    # RS256 = RSA-2048 ECDSA — BROKEN by Shor's Algorithm
    token = jwt.encode(payload, private_pem, algorithm="RS256")
    return token


def sign_data_rsa(data: bytes, private_key) -> bytes:
    """Sign arbitrary data with RSA-PKCS1v15 — QUANTUM VULNERABLE."""
    signature = private_key.sign(
        data,
        padding.PKCS1v15(),  # RSA PKCS1v15 — BROKEN by Shor's Algorithm
        hashes.SHA256()
    )
    return signature


if __name__ == "__main__":
    print("[DEMO] Generating RSA-2048 keypair and signing JWT...")
    token = create_jwt_token("user-001", "admin")
    print(f"[DEMO] JWT (RS256): {token[:50]}...")
    print("[DEMO] ⚠️  RSA-2048 is QUANTUM VULNERABLE. Replace with ML-DSA-65 (FIPS 204)")
