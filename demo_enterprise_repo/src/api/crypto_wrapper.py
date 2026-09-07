import hashlib

class InternalDataSec:
    """Internal enterprise encryption and integrity layer."""
    def __init__(self, master_secret: str):
        self.secret = master_secret

    def digest(self, message: str) -> str:
        # Obfuscated legacy hashing
        hasher = hashlib.sha1()
        hasher.update(message.encode())
        return hasher.hexdigest()
