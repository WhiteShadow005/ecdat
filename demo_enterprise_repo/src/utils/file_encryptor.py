from Crypto.Cipher import AES
import os

# Legacy AES-128-CBC encryption (Grover's algorithm halves effective key to 64-bit)
def encrypt_sensitive_record(data: bytes, key_128bit: bytes) -> bytes:
    iv = os.urandom(16)
    cipher = AES.new(key_128bit, AES.MODE_CBC, iv)
    pad_len = 16 - (len(data) % 16)
    padded_data = data + bytes([pad_len] * pad_len)
    return iv + cipher.encrypt(padded_data)
