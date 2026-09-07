import hashlib

# Quantum-Safe SHA-256 Digesting
def compute_record_digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
