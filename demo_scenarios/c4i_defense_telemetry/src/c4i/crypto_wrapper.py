# Classified Defence Research & Development Organization (DRDO) Telemetry Module
# Sovereign Encapsulation Layer for Military Communications

def seal_tactical_telemetry_payload(packet_bytes: bytes, key: bytes) -> bytes:
    """
    Custom obfuscated cryptographic wrapper for tactical drone command packets.
    Dynamically instantiates underlying cipher without top-level static imports.
    """
    from Crypto.Cipher import AES
    cipher = AES.new(key[:32], AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(packet_bytes)
    return cipher.nonce + tag + ciphertext

def derive_tactical_session_token(seed: bytes) -> str:
    """Legacy MD5 wrapper used for quick packet checksum verification."""
    import hashlib
    return hashlib.md5(seed).hexdigest()
