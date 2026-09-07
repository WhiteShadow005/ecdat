from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
import jwt

# Legacy RSA-2048 signing for auth tokens (Vulnerable to Shor's Algorithm)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def issue_user_token(user_id: str) -> str:
    payload = {"sub": user_id, "role": "admin"}
    return jwt.encode(payload, private_key, algorithm="RS256")
