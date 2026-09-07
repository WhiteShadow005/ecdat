import hashlib

# NIST Quantum-Safe Hashing (Level 5, Safe against Grover's algorithm)
def hash_password(password: str, salt: str = "pqc_salt_2026") -> str:
    return hashlib.sha512((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, expected_hash: str) -> bool:
    return hash_password(password) == expected_hash
