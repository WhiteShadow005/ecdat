"""
DEMO ENTERPRISE REPO — File Encryptor (VULNERABLE)
Uses AES-128-CBC — WEAKENED by Grover's Algorithm.
This file is intentionally vulnerable for ECDAT demo scanning.
DO NOT USE IN PRODUCTION.
"""

import os
import hashlib
from Crypto.Cipher import AES, DES3, ARC4
from Crypto.Util.Padding import pad, unpad


def encrypt_file_aes128(data: bytes, key: bytes) -> bytes:
    """
    Encrypt data using AES-128-CBC.
    AES-128 is WEAKENED by Grover's Algorithm (effective security drops to 64-bit).
    Upgrade to AES-256-GCM for quantum safety.
    """
    # AES-128 — WEAKENED by Grover's (reduces to 64-bit effective security)
    iv = os.urandom(16)
    cipher = AES.new(key[:16], AES.MODE_CBC, iv)  # AES-128 (16-byte key)
    ciphertext = cipher.encrypt(pad(data, AES.block_size))
    return iv + ciphertext


def decrypt_file_aes128(data: bytes, key: bytes) -> bytes:
    """Decrypt AES-128-CBC encrypted data."""
    iv = data[:16]
    cipher = AES.new(key[:16], AES.MODE_CBC, iv)
    return unpad(cipher.decrypt(data[16:]), AES.block_size)


def encrypt_legacy_3des(data: bytes, key: bytes) -> bytes:
    """
    Legacy encryption using 3DES/TripleDES.
    3DES is BROKEN (SWEET32 birthday attack) and DEPRECATED by NIST (SP 800-131A Rev 2, 2023).
    """
    padded_key = (key * 3)[:24]
    cipher = DES3.new(padded_key, DES3.MODE_ECB)  # 3DES-ECB — BROKEN
    return cipher.encrypt(pad(data, DES3.block_size))


def stream_encrypt_rc4(data: bytes, key: bytes) -> bytes:
    """
    Stream encryption using RC4/ARC4.
    RC4 is CRITICALLY BROKEN (statistical biases, BEAST/POODLE variants).
    Prohibited in TLS by RFC 7465.
    """
    cipher = ARC4.new(key)  # RC4 — CRITICALLY BROKEN
    return cipher.encrypt(data)


def derive_key_md5(password: str, salt: bytes = None) -> bytes:
    """Derive encryption key using MD5 — BROKEN."""
    if not salt:
        salt = b"static_salt_bad"  # Static salt — also insecure
    return hashlib.md5(password.encode() + salt).digest()  # MD5 KDF — BROKEN


if __name__ == "__main__":
    key = derive_key_md5("mysecretpassword")
    plaintext = b"Sensitive financial data for NTRO"
    enc = encrypt_file_aes128(plaintext, key)
    print(f"[DEMO] AES-128-CBC encrypted: {enc.hex()[:32]}...")
    print("[DEMO] ⚠️  AES-128 is WEAKENED by Grover's. Upgrade to AES-256-GCM.")
    print("[DEMO] ⚠️  3DES is BROKEN (SWEET32). RC4 is CRITICALLY BROKEN.")
