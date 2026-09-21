from cryptography.hazmat.primitives.asymmetric import rsa
import jwt

# Asymmetric RSA-2048 token signing for banking APIs (Vulnerable to Shor's)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def issue_npci_token(merchant_id: str) -> str:
    payload = {"sub": merchant_id, "scope": "upi:collect", "aud": "npci.org.in"}
    return jwt.encode(payload, private_key, algorithm="RS256")
