"""
ECDAT — Live PQC Proof Demonstration (Fixed)
Uses liboqs-python to perform a real ML-KEM-768 key encapsulation + ML-DSA-65 signing.
This is the live proof that PQC actually works — shown during the demo.

Fixes over stub:
  - Tries new FIPS algorithm names first (ML-KEM-768 / ML-DSA-65)
  - Falls back to legacy names (Kyber768 / Dilithium3) for older liboqs builds
  - Reports which name was actually used in the result

Owner: Ojasya Rajput
"""

import time
from ..models import PQCProofResult


def _try_kem_names() -> list[str]:
    """Return KEM algorithm names to try, newest FIPS name first."""
    return ["ML-KEM-768", "Kyber768"]


def _try_sig_names() -> list[str]:
    """Return signature algorithm names to try, newest FIPS name first."""
    return ["ML-DSA-65", "Dilithium3"]


def run_pqc_demo() -> PQCProofResult:
    """
    Run a live demonstration of PQC algorithms using liboqs.
    Tries FIPS 203/204 algorithm names first; falls back to legacy names for
    older liboqs installs (< 0.10). Returns key sizes, timings, and success status.
    """
    result = PQCProofResult()

    try:
        import oqs

        # ─── ML-KEM-768 Key Encapsulation ──────────────────────────────────────
        kem_name_used = None
        for kem_name in _try_kem_names():
            try:
                t0 = time.perf_counter()
                with oqs.KeyEncapsulation(kem_name) as kem:
                    kem_name_used = kem_name
                    public_key = kem.generate_keypair()
                    result.kem_public_key_size_bytes  = len(public_key)
                    result.kem_secret_key_size_bytes  = len(kem.export_secret_key())

                    ciphertext, shared_secret_enc = kem.encap_secret(public_key)
                    result.kem_ciphertext_size_bytes  = len(ciphertext)

                    shared_secret_dec = kem.decap_secret(ciphertext)
                    result.kem_success = (shared_secret_enc == shared_secret_dec)

                t1 = time.perf_counter()
                result.kem_time_ms = round((t1 - t0) * 1000, 2)
                break  # succeeded — stop trying
            except (ValueError, KeyError):
                continue  # try next name

        if kem_name_used is None:
            result.message = (
                "liboqs installed but neither 'ML-KEM-768' nor 'Kyber768' is available. "
                "Check your liboqs build includes Kyber support."
            )
            return result

        # Set the algorithm label with the name that actually worked
        fips_label = "ML-KEM-768 (FIPS 203 / CRYSTALS-Kyber)"
        if "Kyber" in kem_name_used:
            fips_label += " [legacy name — update liboqs ≥ 0.10 for ML-KEM-768]"
        result.kem_algorithm = fips_label

        # ─── ML-DSA-65 Digital Signing ────────────────────────────────────────
        sig_name_used = None
        for sig_name in _try_sig_names():
            try:
                t0 = time.perf_counter()
                with oqs.Signature(sig_name) as sig:
                    sig_name_used = sig_name
                    sig_public_key = sig.generate_keypair()
                    result.sig_public_key_size_bytes = len(sig_public_key)
                    result.sig_secret_key_size_bytes = len(sig.export_secret_key())

                    message = b"NTRO ECDAT \xe2\x80\x94 Post-Quantum Signature Proof 2026"
                    signature = sig.sign(message)
                    result.sig_signature_size_bytes = len(signature)

                    is_valid = sig.verify(message, signature, sig_public_key)
                    result.sig_success = is_valid

                t1 = time.perf_counter()
                result.sig_time_ms = round((t1 - t0) * 1000, 2)
                break
            except (ValueError, KeyError):
                continue

        if sig_name_used is None:
            result.message = (
                f"ML-KEM-768 KEM succeeded in {result.kem_time_ms}ms, "
                "but neither 'ML-DSA-65' nor 'Dilithium3' is available. "
                "Check your liboqs build includes Dilithium support."
            )
            return result

        sig_fips_label = "ML-DSA-65 (FIPS 204 / CRYSTALS-Dilithium)"
        if "Dilithium" in sig_name_used:
            sig_fips_label += " [legacy name — update liboqs ≥ 0.10 for ML-DSA-65]"
        result.sig_algorithm = sig_fips_label

        result.message = (
            f"\u2705 ML-KEM-768 KEM complete in {result.kem_time_ms}ms "
            f"(keys: pub={result.kem_public_key_size_bytes}B, ct={result.kem_ciphertext_size_bytes}B) | "
            f"ML-DSA-65 sign+verify in {result.sig_time_ms}ms "
            f"(sig size: {result.sig_signature_size_bytes}B) | "
            "India is quantum-ready with ECDAT. \U0001f1ee\U0001f1f3"
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
