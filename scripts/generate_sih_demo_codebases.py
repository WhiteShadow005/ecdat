"""
Generate distinct enterprise demo codebases for SIH 2026 Jury Evaluation:
1. Banking & NPCI Gateway (Java JCA, RSA-2048, 3DES, UPI JWT)
2. Defense C4I Enclave (Python, Obfuscated Wrappers, CryptoSense AI, ECDSA P-256)
3. SCADA Power Grid (CII Asset, Nginx & SSH Configs, Weak RC4, 3DES, Deprecated TLS)
"""

import os
import shutil
import zipfile
import json
from pathlib import Path

from backend.app.scanners.python_scanner import scan_python_directory
from backend.app.scanners.java_scanner import scan_java_directory
from backend.app.scanners.cert_parser import scan_certs_in_directory
from backend.app.scanners.config_parser import scan_configs_in_directory
from backend.app.ai.semantic_analyzer import run_semantic_analysis, crypto_family
from backend.app.engines.inventory import build_inventory
from backend.app.engines.risk_classifier import classify_inventory, assign_criticality
from backend.app.engines.qars import score_inventory
from backend.app.engines.mosca import evaluate_mosca, apply_mosca_to_assets
from backend.app.engines.recommender import enrich_with_recommendations
from backend.app.models import ScanResult, ScanSummary

ROOT_DIR = Path("/Users/arnavgupta/Desktop/ecdat")
DEMOS_TEMP = ROOT_DIR / "demos_source"
BACKEND_DEMOS = ROOT_DIR / "backend" / "app" / "data" / "demos"
FRONTEND_DEMOS = ROOT_DIR / "frontend" / "public" / "demos"

BACKEND_DEMOS.mkdir(parents=True, exist_ok=True)
FRONTEND_DEMOS.mkdir(parents=True, exist_ok=True)
if DEMOS_TEMP.exists():
    shutil.rmtree(DEMOS_TEMP)
DEMOS_TEMP.mkdir(parents=True, exist_ok=True)


def create_banking_codebase(base_dir: Path):
    """Create Java-heavy Banking & NPCI Gateway codebase."""
    d = base_dir / "banking_upi_gateway"
    d.mkdir(parents=True, exist_ok=True)

    # 1. Java Payment Gateway
    pkg = d / "src" / "main" / "java" / "in" / "npci" / "upi"
    pkg.mkdir(parents=True, exist_ok=True)

    (pkg / "PaymentGateway.java").write_text("""package in.npci.upi;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import java.security.Signature;

public class PaymentGateway {
    public void processUpiTransaction() throws Exception {
        // Vulnerable 3DES ATM PIN block encryption
        KeyGenerator keyGen = KeyGenerator.getInstance("DESede");
        keyGen.init(168);
        Cipher desCipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");

        // Vulnerable RSA-2048 Digital Signature for NPCI settlement
        Signature rsaSig = Signature.getInstance("SHA256withRSA");

        // AES-128 Session token encryption (Grover's weakened)
        Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
    }
}
""")

    (pkg / "TransactionSigner.java").write_text("""package in.npci.upi;

import java.security.KeyPairGenerator;
import java.security.MessageDigest;

public class TransactionSigner {
    public void initializeSettlementKey() throws Exception {
        // RSA-2048 KeyPair for inter-bank transaction payloads
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);

        // Broken SHA-1 checksum in legacy settlement reconciliation
        MessageDigest sha1Digest = MessageDigest.getInstance("SHA-1");

        // Classical SHA-256 for payment message digests
        MessageDigest sha256Digest = MessageDigest.getInstance("SHA-256");
    }
}
""")

    # 2. Python Auth Filter
    auth_dir = d / "src" / "auth"
    auth_dir.mkdir(parents=True, exist_ok=True)

    (auth_dir / "npci_jwt_auth.py").write_text("""from cryptography.hazmat.primitives.asymmetric import rsa
import jwt

# Asymmetric RSA-2048 token signing for banking APIs (Vulnerable to Shor's)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def issue_npci_token(merchant_id: str) -> str:
    payload = {"sub": merchant_id, "scope": "upi:collect", "aud": "npci.org.in"}
    return jwt.encode(payload, private_key, algorithm="RS256")
""")

    # 3. Config
    cfg_dir = d / "config"
    cfg_dir.mkdir(parents=True, exist_ok=True)
    (cfg_dir / "nginx.conf").write_text("""server {
    listen 443 ssl;
    server_name api.npci-upi-gateway.bank.in;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
}
""")

    (d / "pom.xml").write_text("""<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>in.npci.upi</groupId>
  <artifactId>upi-payment-gateway</artifactId>
  <version>3.4.0</version>
</project>
""")
    (d / "requirements.txt").write_text("cryptography>=41.0.0\nPyJWT>=2.8.0\n")
    return d


def create_defense_codebase(base_dir: Path):
    """Create Defense C4I Enclave with obfuscated wrappers for CryptoSense AI."""
    d = base_dir / "c4i_defense_telemetry"
    d.mkdir(parents=True, exist_ok=True)

    c4i_dir = d / "src" / "c4i"
    c4i_dir.mkdir(parents=True, exist_ok=True)

    # 1. Telemetry uplink
    (c4i_dir / "telemetry_uplink.py").write_text("""from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes

# Tactical ECDSA P-256 Key Exchange for Military UAV Control (Vulnerable to Shor's)
uav_privkey = ec.generate_private_key(ec.SECP256R1())

def establish_c4i_session(ground_station_pubkey):
    shared_key = uav_privkey.exchange(ec.ECDH(), ground_station_pubkey)
    # AES-256-GCM authenticated tactical telemetry encryption
    aes_gcm = AESGCM(shared_key[:32])
    return aes_gcm
""")

    # 2. Drone feed signer
    (c4i_dir / "drone_feed_signer.py").write_text("""from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import hashes

# Tactical Drone Stream Signer (Vulnerable to Shor's Algorithm)
signer = ed25519.Ed25519PrivateKey.generate()

def sign_telemetry_frame(frame_data: bytes) -> bytes:
    return signer.sign(frame_data)
""")

    # 3. Sovereign obfuscated wrapper (Target for CryptoSense CodeBERT)
    (c4i_dir / "crypto_wrapper.py").write_text("""# Classified Defence Research & Development Organization (DRDO) Telemetry Module
# Sovereign Encapsulation Layer for Military Communications

def seal_tactical_telemetry_payload(packet_bytes: bytes, key: bytes) -> bytes:
    \"\"\"
    Custom obfuscated cryptographic wrapper for tactical drone command packets.
    Dynamically instantiates underlying cipher without top-level static imports.
    \"\"\"
    from Crypto.Cipher import AES
    cipher = AES.new(key[:32], AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(packet_bytes)
    return cipher.nonce + tag + ciphertext

def derive_tactical_session_token(seed: bytes) -> str:
    \"\"\"Legacy MD5 wrapper used for quick packet checksum verification.\"\"\"
    import hashlib
    return hashlib.md5(seed).hexdigest()
""")

    # 4. Config & certs
    certs_dir = d / "certs"
    certs_dir.mkdir(parents=True, exist_ok=True)
    (certs_dir / "tactical_ca.pem").write_text((ROOT_DIR / "demo_enterprise_repo" / "certs" / "server.pem").read_text())
    (d / "requirements.txt").write_text("cryptography>=41.0.0\npycryptodome>=3.19.0\n")
    return d


def create_scada_codebase(base_dir: Path):
    """Create SCADA Power Grid CII Asset with weak legacy ciphers & configs."""
    d = base_dir / "scada_powergrid_configs"
    d.mkdir(parents=True, exist_ok=True)

    cfg_dir = d / "config"
    cfg_dir.mkdir(parents=True, exist_ok=True)

    # 1. Nginx with weak RC4 and 3DES
    (cfg_dir / "nginx.conf").write_text("""# State Grid Power Substation Ingress Gateway
server {
    listen 443 ssl;
    server_name telemetry.substation.powergrid.cii.in;

    ssl_certificate /etc/scada/certs/substation.pem;
    ssl_certificate_key /etc/scada/certs/substation.key;

    # Critical Vulnerability: Deprecated TLS protocols and weak stream ciphers
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers 'RC4-SHA:DES-CBC3-SHA:AES128-SHA:ECDHE-RSA-RC4-SHA';
    ssl_prefer_server_ciphers on;
}
""")

    # 2. SSH with weak DH group1
    (cfg_dir / "sshd_config").write_text("""# Substation RTU Remote Maintenance Gateway
Port 2222
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKeyAlgorithms ssh-rsa
KexAlgorithms diffie-hellman-group1-sha1,diffie-hellman-group14-sha1
Ciphers 3des-cbc,aes128-cbc
MACs hmac-sha1
""")

    # 3. Modbus SCADA config
    (cfg_dir / "modbus_tls.conf").write_text("""# Modbus TCP/IP Security Gateway Config
[modbus_tls]
listen_port = 802
tls_version = TLSv1.0
ciphers = DHE-RSA-AES128-SHA:RC4-MD5
cert_file = /etc/scada/certs/substation.pem
""")

    # 4. Cert
    certs_dir = d / "certs"
    certs_dir.mkdir(parents=True, exist_ok=True)
    (certs_dir / "substation.pem").write_text((ROOT_DIR / "demo_enterprise_repo" / "certs" / "server.pem").read_text())
    return d


def run_scan_pipeline(extract_dir: Path, data_category: str, exposure_context: str, repo_name: str) -> ScanResult:
    raw_assets = []
    py_assets = scan_python_directory(str(extract_dir))
    raw_assets.extend(py_assets)

    java_assets = scan_java_directory(str(extract_dir))
    raw_assets.extend(java_assets)

    try:
        static_keys = {
            f"{crypto_family(a.algorithm)}|{a.file_path or ''}"
            for a in py_assets
        }
        ai_assets = run_semantic_analysis(
            str(extract_dir),
            skip_keys=static_keys,
            use_gemini=False,
        )
        if ai_assets:
            raw_assets.extend(ai_assets)
    except Exception:
        pass

    cert_assets = scan_certs_in_directory(str(extract_dir))
    raw_assets.extend(cert_assets)

    config_assets = scan_configs_in_directory(str(extract_dir))
    raw_assets.extend(config_assets)

    inventory = build_inventory(raw_assets)

    prefix = str(extract_dir).rstrip("/\\") + os.sep
    for a in inventory:
        if a.file_path and a.file_path.startswith(prefix):
            a.file_path = a.file_path[len(prefix):]

    inventory = classify_inventory(inventory)

    mosca = evaluate_mosca(
        x_years=None,
        y_years=None,
        z_years=7.0,
        data_category=data_category,
    )

    inventory = score_inventory(
        inventory,
        mosca=mosca,
        data_category=data_category,
        exposure_context=exposure_context,
    )

    for asset in inventory:
        assign_criticality(asset)

    inventory = apply_mosca_to_assets(inventory, mosca)
    inventory = enrich_with_recommendations(inventory)

    for asset in inventory:
        asset.sync_aliases()

    total = len(inventory)
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "safe": 0}
    for a in inventory:
        counts[a.criticality] = counts.get(a.criticality, 0) + 1

    safe_count = sum(1 for a in inventory if a.quantum_status == "SAFE")
    readiness_pct = round((safe_count / total * 100), 1) if total > 0 else 0.0

    languages = sorted(list(set(a.language for a in inventory if a.language)))
    py_files = sum(1 for _ in extract_dir.rglob("*.py"))
    java_files = sum(1 for _ in extract_dir.rglob("*.java"))
    cert_files = sum(1 for _ in extract_dir.rglob("*.pem")) + sum(1 for _ in extract_dir.rglob("*.crt"))
    conf_files = sum(1 for _ in extract_dir.rglob("*.conf")) + sum(1 for _ in extract_dir.rglob("*sshd_config*"))

    summary = ScanSummary(
        total_assets=total,
        critical=counts["critical"],
        high=counts["high"],
        medium=counts["medium"],
        low=counts.get("low", 0),
        safe=counts["safe"],
        quantum_readiness_pct=readiness_pct,
        languages_scanned=languages,
        files_scanned=py_files + java_files + cert_files + conf_files,
    )

    return ScanResult(
        target_name=repo_name,
        repo_name=repo_name,
        summary=summary,
        mosca=mosca,
        assets=inventory,
    )


def make_zip(source_dir: Path, output_zip: Path):
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                full_path = Path(root) / file
                rel_path = full_path.relative_to(source_dir)
                zf.write(full_path, rel_path)


def main():
    print("Creating distinct codebases...")
    banking_dir = create_banking_codebase(DEMOS_TEMP)
    defense_dir = create_defense_codebase(DEMOS_TEMP)
    scada_dir = create_scada_codebase(DEMOS_TEMP)

    print("Running ECDAT scan on Banking...")
    banking_scan = run_scan_pipeline(banking_dir, "financial", "internal", "banking_upi_gateway")
    print(f"Banking Scan: {banking_scan.summary.total_assets} assets, Readiness: {banking_scan.summary.quantum_readiness_pct}%, QARS avg: {sum(a.qars_score for a in banking_scan.assets)//len(banking_scan.assets)}")

    print("Running ECDAT scan on Defense...")
    defense_scan = run_scan_pipeline(defense_dir, "defense", "internal", "c4i_defense_telemetry")
    print(f"Defense Scan: {defense_scan.summary.total_assets} assets, Readiness: {defense_scan.summary.quantum_readiness_pct}%, QARS avg: {sum(a.qars_score for a in defense_scan.assets)//len(defense_scan.assets)}")

    print("Running ECDAT scan on SCADA...")
    scada_scan = run_scan_pipeline(scada_dir, "infrastructure", "public_api", "scada_powergrid_configs")
    print(f"SCADA Scan: {scada_scan.summary.total_assets} assets, Readiness: {scada_scan.summary.quantum_readiness_pct}%, QARS avg: {sum(a.qars_score for a in scada_scan.assets)//len(scada_scan.assets)}")

    # Make ZIP archives
    for name, s_dir in [
        ("banking_upi_gateway.zip", banking_dir),
        ("c4i_defense_telemetry.zip", defense_dir),
        ("scada_powergrid_configs.zip", scada_dir),
    ]:
        backend_dest = BACKEND_DEMOS / name
        frontend_dest = FRONTEND_DEMOS / name
        root_dest = ROOT_DIR / name

        make_zip(s_dir, backend_dest)
        shutil.copy2(backend_dest, frontend_dest)
        shutil.copy2(backend_dest, root_dest)
        print(f"Created {name} ({backend_dest.stat().st_size} bytes)")

    # Save Scan JSON outputs for fast loading
    scans_dict = {
        "banking_upi_gateway": banking_scan.model_dump(),
        "c4i_defense_telemetry": defense_scan.model_dump(),
        "scada_powergrid_configs": scada_scan.model_dump(),
    }
    json_path = BACKEND_DEMOS / "demo_scans.json"
    with open(json_path, "w") as f:
        json.dump(scans_dict, f, indent=2)
    print(f"Saved demo scan JSONs to {json_path}")

    # Copy source folders to permanent demo folder
    perm_demos = ROOT_DIR / "demo_scenarios"
    if perm_demos.exists():
        shutil.rmtree(perm_demos)
    shutil.copytree(DEMOS_TEMP, perm_demos)
    print(f"Preserved source trees in {perm_demos}")


if __name__ == "__main__":
    main()
