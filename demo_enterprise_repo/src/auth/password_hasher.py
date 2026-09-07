import hashlib

# Legacy MD5 password hashing (Classically broken & Grover vulnerable)
def hash_password(password: str) -> str:
    return hashlib.md5(password.encode('utf-8')).hexdigest()

def verify_password(password: str, expected_hash: str) -> bool:
    return hash_password(password) == expected_hash
