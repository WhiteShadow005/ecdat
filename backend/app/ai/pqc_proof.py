"""
ECDAT — Live PQC Proof Demonstration
Uses liboqs-python to perform a real ML-KEM-768 key encapsulation + ML-DSA-65 signing.
This is the live proof that PQC actually works — shown during the demo.
Owner: Ojasya Rajput
"""

import time
from ..models import PQCProofResult


def run_pqc_demo() -> PQCProofResult:
    """
    Run a live demonstration of PQC algorithms using liboqs.
    Returns key sizes, timings, and success status.
    """
    result = PQCProofResult()

    try:
        import oqs

        # ─── ML-KEM-768 Key Encapsulation ──────────────────────────────────────
        t0 = time.perf_counter()
        with oqs.KeyEncapsulation("Kyber768") as kem:
            result.kem_algorithm = "ML-KEM-768 (FIPS 203 / CRYSTALS-Kyber)"
            public_key = kem.generate_keypair()
            result.kem_public_key_size_bytes = len(public_key)
            result.kem_secret_key_size_bytes = len(kem.export_secret_key())

            ciphertext, shared_secret_enc = kem.encap_secret(public_key)
            result.kem_ciphertext_size_bytes = len(ciphertext)

            shared_secret_dec = kem.decap_secret(ciphertext)
            result.kem_success = (shared_secret_enc == shared_secret_dec)

        t1 = time.perf_counter()
        result.kem_time_ms = round((t1 - t0) * 1000, 2)

        # ─── ML-DSA-65 Digital Signing ────────────────────────────────────────
        t0 = time.perf_counter()
        with oqs.Signature("Dilithium3") as sig:  # Dilithium3 = ML-DSA-65
            result.sig_algorithm = "ML-DSA-65 (FIPS 204 / CRYSTALS-Dilithium)"
            sig_public_key = sig.generate_keypair()
            result.sig_public_key_size_bytes = len(sig_public_key)
            result.sig_secret_key_size_bytes = len(sig.export_secret_key())

            message = b"NTRO ECDAT — Post-Quantum Signature Proof 2026"
            signature = sig.sign(message)
            result.sig_signature_size_bytes = len(signature)

            is_valid = sig.verify(message, signature, sig_public_key)
            result.sig_success = is_valid

        t1 = time.perf_counter()
        result.sig_time_ms = round((t1 - t0) * 1000, 2)

        result.message = (
            f"✅ ML-KEM-768 KEM complete in {result.kem_time_ms}ms | "
            f"ML-DSA-65 sign+verify in {result.sig_time_ms}ms | "
            "India is quantum-ready with ECDAT."
        )

    except ImportError:
        result.message = (
            "liboqs-python not installed. "
            "Install with: pip install liboqs-python "
            "(also requires the liboqs C library — see https://github.com/open-quantum-safe/liboqs)"
        )
    except Exception as e:
        result.message = f"PQC demo error: {str(e)}"

    return result
