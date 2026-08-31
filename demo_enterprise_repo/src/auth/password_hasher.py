"""
DEMO ENTERPRISE REPO — Password Hasher (VULNERABLE)
Uses MD5 for password hashing — CLASSICALLY BROKEN + QUANTUM BROKEN.
This file is intentionally vulnerable for ECDAT demo scanning.
DO NOT USE IN PRODUCTION.
"""

import hashlib
import os


def hash_password_md5(password: str) -> str:
    """
    Hash a password using MD5 — CRITICALLY INSECURE.
    MD5 is classically broken (2004 collision attack), trivially crackable
    with rainbow tables, and further weakened by Grover's Algorithm.
    Replace with bcrypt, Argon2id, or PBKDF2-SHA256.
    """
    return hashlib.md5(password.encode()).hexdigest()


def hash_password_sha1(password: str, salt: bytes = None) -> str:
    """
    Hash a password using SHA-1 — BROKEN (SHAttered collision attack 2017).
    SHA-1 is deprecated. Replace with SHA-256 minimum.
    """
    if salt is None:
        salt = os.urandom(16)
    combined = salt + password.encode()
    return hashlib.sha1(combined).hexdigest()


def verify_password_md5(password: str, stored_hash: str) -> bool:
    """Verify using MD5 — insecure comparison."""
    return hash_password_md5(password) == stored_hash


def weak_token_generator(user_id: str) -> str:
    """Generate session token using MD5 — insecure."""
    raw = f"{user_id}:secret123"
    return hashlib.md5(raw.encode()).hexdigest()


if __name__ == "__main__":
    test_pass = "admin123"
    md5_hash = hash_password_md5(test_pass)
    sha1_hash = hash_password_sha1(test_pass)
    print(f"[DEMO] MD5 hash: {md5_hash}")
    print(f"[DEMO] SHA-1 hash: {sha1_hash}")
    print("[DEMO] ⚠️  MD5 and SHA-1 are BROKEN. Replace with Argon2id for passwords, SHA-256 for hashing.")
