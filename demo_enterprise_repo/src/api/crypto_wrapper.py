"""
DEMO ENTERPRISE REPO — Hidden Crypto Wrapper (for AI USP 1 Demo)
This file uses CUSTOM WRAPPER CLASSES that HIDE the underlying crypto from static scanners.
The AI Semantic Analyzer (USP 1) should detect these even though they don't import crypto directly.
This is intentionally vulnerable for ECDAT demo scanning.
"""

import hashlib
import base64
import os


class SecureTokenService:
    """
    Token generation service using 'secure' naming to obscure the actual algorithm used.
    Static scanners won't flag this directly — the AI semantic analyzer (USP 1) will.
    """

    def __init__(self, secret_key: str):
        # Using MD5 for 'fast hashing' — hidden inside a class
        self._key_digest = hashlib.md5(secret_key.encode()).hexdigest()

    def generate_session_token(self, user_id: str, session_data: dict) -> str:
        """Create session token — uses MD5 internally (hidden from static scanners)."""
        raw = f"{user_id}:{self._key_digest}:{str(session_data)}"
        # MD5 based token — BROKEN (not visible to simple regex/AST scanners)
        return hashlib.md5(raw.encode()).hexdigest()

    def verify_session_token(self, token: str, user_id: str, session_data: dict) -> bool:
        """Verify token — compares MD5 hashes."""
        expected = self.generate_session_token(user_id, session_data)
        return token == expected


class DataProtectionLayer:
    """
    Data protection abstraction — hides that it uses SHA-1 and AES-128 inside.
    Static scanners may miss these because the class name sounds security-conscious.
    AI semantic analysis (USP 1) will catch this by analyzing function bodies.
    """

    def protect(self, data: bytes, password: str) -> bytes:
        """Encrypt data — uses SHA-1 for key derivation and AES-128 for encryption."""
        # SHA-1 key derivation — WEAKENED
        key = hashlib.sha1(password.encode()).digest()[:16]  # SHA1 → 16 bytes → AES-128 key
        
        # CBC mode without authentication — malleable ciphertext
        iv = b'\x00' * 16  # Static IV — INSECURE
        
        # Simulating AES-128-CBC with static IV
        from Crypto.Cipher import AES
        from Crypto.Util.Padding import pad
        cipher = AES.new(key, AES.MODE_CBC, iv)  # AES-128 — WEAKENED
        return cipher.encrypt(pad(data, 16))

    def compute_integrity_hash(self, data: bytes) -> str:
        """Compute integrity hash — uses MD5."""
        # MD5 for integrity — BROKEN (collision attacks)
        return hashlib.md5(data).hexdigest()


def encode_sensitive_payload(user_email: str, user_role: str) -> str:
    """
    'Encode' a payload for API transmission.
    Uses base64(md5(data)) — sounds safe but MD5 is broken.
    """
    raw = f"{user_email}|{user_role}|salt123"
    digest = hashlib.md5(raw.encode()).hexdigest()  # MD5 — hidden in seemingly benign function
    return base64.b64encode(digest.encode()).decode()


if __name__ == "__main__":
    svc = SecureTokenService("supersecret")
    token = svc.generate_session_token("user-001", {"role": "admin"})
    print(f"[DEMO] Token: {token}")
    print("[DEMO] ⚠️  AI Semantic Analyzer (USP 1) should detect MD5 usage inside SecureTokenService")
    print("[DEMO] ⚠️  Static scanners would miss this — proving AI advantage")
