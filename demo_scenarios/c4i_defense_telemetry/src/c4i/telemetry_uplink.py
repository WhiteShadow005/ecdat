from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes

# Tactical ECDSA P-256 Key Exchange for Military UAV Control (Vulnerable to Shor's)
uav_privkey = ec.generate_private_key(ec.SECP256R1())

def establish_c4i_session(ground_station_pubkey):
    shared_key = uav_privkey.exchange(ec.ECDH(), ground_station_pubkey)
    # AES-256-GCM authenticated tactical telemetry encryption
    aes_gcm = AESGCM(shared_key[:32])
    return aes_gcm
