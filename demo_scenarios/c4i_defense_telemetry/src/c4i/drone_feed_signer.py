from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import hashes

# Tactical Drone Stream Signer (Vulnerable to Shor's Algorithm)
signer = ed25519.Ed25519PrivateKey.generate()

def sign_telemetry_frame(frame_data: bytes) -> bytes:
    return signer.sign(frame_data)
