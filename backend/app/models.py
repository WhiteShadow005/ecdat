"""
ECDAT — Pydantic data models
Shared across all modules: scanners, engines, exporters, API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid


# ─── Asset Types ───────────────────────────────────────────────────────────────

QuantumStatus = Literal["BROKEN", "WEAKENED", "SAFE", "UNKNOWN"]
Criticality = Literal["critical", "high", "medium", "low", "safe"]
AssetType = Literal["algorithm", "certificate", "protocol", "key", "config"]
MoscaStatus = Literal["CRITICAL", "HIGH", "SAFE"]


class CryptoAsset(BaseModel):
    """A single cryptographic asset found during a scan."""
    id: str = Field(default_factory=lambda: f"asset-{uuid.uuid4().hex[:8]}")
    algorithm: str
    type: AssetType = "algorithm"
    primitive: Optional[str] = None         # e.g., "asymmetric", "hash", "symmetric"
    key_size: Optional[int] = None          # In bits, if applicable
    quantum_status: QuantumStatus = "UNKNOWN"
    qars_score: int = 0                     # 0–100
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    language: Optional[str] = None          # "python", "java", "config", "certificate"
    library_used: Optional[str] = None      # e.g., "cryptography", "pycryptodome"
    code_snippet: Optional[str] = None      # Short snippet showing the vulnerable usage
    recommended_replacement: Optional[str] = None
    criticality: Criticality = "medium"
    remediation_ready: bool = False
    exposure_context: Optional[str] = None  # "public_api", "internal", "local"
    mosca_status: Optional[MoscaStatus] = None
    notes: Optional[str] = None
    source_scanner: Optional[str] = None   # Which scanner found it

    # Frontend-friendly compatibility aliases
    file: Optional[str] = None
    line: Optional[int] = None
    replacement: Optional[str] = None
    attack_vector: Optional[str] = None
    nist_standard: Optional[str] = None

    def model_post_init(self, __context):
        self.sync_aliases()

    def sync_aliases(self):
        """
        Refresh frontend-friendly alias fields from the canonical values.

        Engines mutate canonical fields (quantum_status, recommended_replacement,
        file_path, …) *after* model construction, so aliases must be re-synced
        once analysis completes. Derived fields (attack_vector, nist_standard)
        are recomputed from quantum_status every call so they never go stale.
        """
        if self.file_path:
            self.file = self.file_path
        elif self.file:
            self.file_path = self.file

        if self.line_number is not None:
            self.line = self.line_number
        elif self.line is not None:
            self.line_number = self.line

        if self.recommended_replacement:
            self.replacement = self.recommended_replacement
        elif self.replacement:
            self.recommended_replacement = self.replacement

        if self.quantum_status == "BROKEN":
            self.attack_vector = "Shor's Algorithm"
        elif self.quantum_status == "WEAKENED":
            self.attack_vector = "Grover's Algorithm"
        else:
            self.attack_vector = "None"

        if self.quantum_status in ("BROKEN", "WEAKENED"):
            self.nist_standard = "NIST FIPS 203/204"
        else:
            self.nist_standard = "Classical"


class MoscaResult(BaseModel):
    """Result of Mosca's Theorem evaluation."""
    x_shelf_life_years: float = Field(..., description="Data confidentiality shelf life in years")
    y_migration_years: float = Field(..., description="Estimated PQC migration time in years")
    z_qday_years: float = Field(..., description="Estimated years until CRQC arrives")
    x_plus_y: float = 0.0
    status: MoscaStatus = "SAFE"
    message: str = ""
    data_category: Optional[str] = None

    # Frontend aliases
    x: float = 0.0
    y: float = 0.0
    z: float = 7.0

    def model_post_init(self, __context):
        self.x_plus_y = self.x_shelf_life_years + self.y_migration_years
        self.x = self.x_shelf_life_years
        self.y = self.y_migration_years
        self.z = self.z_qday_years

        if self.x_plus_y > self.z_qday_years:
            self.status = "CRITICAL"
            self.message = (
                f"X ({self.x_shelf_life_years}yr) + Y ({self.y_migration_years}yr) = "
                f"{self.x_plus_y}yr > Z ({self.z_qday_years}yr) — Active HNDL threat detected"
            )
        elif self.x_plus_y >= self.z_qday_years - 1:
            self.status = "HIGH"
            self.message = (
                f"X + Y ({self.x_plus_y}yr) ≈ Z ({self.z_qday_years}yr) — Within 1 year of breach window"
            )
        else:
            self.status = "SAFE"
            self.message = (
                f"X + Y ({self.x_plus_y}yr) < Z ({self.z_qday_years}yr) — Safe migration window"
            )


class ScanSummary(BaseModel):
    """High-level summary of a scan result."""
    total_assets: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    safe: int = 0
    quantum_readiness_pct: float = 0.0
    languages_scanned: List[str] = []
    files_scanned: int = 0


class ScanResult(BaseModel):
    """Complete result of a single ECDAT scan."""
    scan_id: str = Field(default_factory=lambda: f"scan-{uuid.uuid4().hex[:12]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    target_name: str = ""
    repo_name: str = ""
    summary: ScanSummary = ScanSummary()
    mosca: Optional[MoscaResult] = None
    assets: List[CryptoAsset] = []

    def model_post_init(self, __context):
        if not self.repo_name and self.target_name:
            self.repo_name = self.target_name
        elif not self.target_name and self.repo_name:
            self.target_name = self.repo_name


# ─── API Request / Response Models ─────────────────────────────────────────────

class ScanRequest(BaseModel):
    """Optional parameters passed alongside the uploaded file."""
    x_years: Optional[float] = None        # Data shelf life (override)
    y_years: Optional[float] = None        # Migration time (override)
    z_years: float = 7.0                   # Q-Day estimate (default 7)
    data_category: Optional[str] = None   # "defense", "financial", "health", etc.
    exposure_context: str = "internal"    # "public_api", "internal", "local"


class TLSProbeResult(BaseModel):
    """Result of a live TLS handshake probe."""
    target: str
    port: int = 443
    tls_version: Optional[str] = None
    cipher_suite: Optional[str] = None
    cert_subject: Optional[str] = None
    cert_issuer: Optional[str] = None
    cert_expiry: Optional[str] = None
    cert_algorithm: Optional[str] = None
    cert_key_size: Optional[int] = None
    quantum_status: QuantumStatus = "UNKNOWN"
    qars_score: int = 0
    recommended_replacement: Optional[str] = None
    error: Optional[str] = None


class RemediationRequest(BaseModel):
    """Request to generate AI code fix for a specific asset."""
    asset_id: str
    scan_id: str


class RemediationResult(BaseModel):
    """AI-generated code fix diff for a vulnerable asset."""
    asset_id: str
    original_algorithm: str
    replacement_algorithm: str
    file_path: Optional[str] = None
    diff: str = ""
    explanation: str = ""
    confidence: float = 0.0
    original_code: str = ""
    remediated_code: str = ""
    nist_standard: str = "NIST FIPS 203/204"
    library_recommendation: str = "liboqs / Bouncy Castle PQC"


class PQCProofResult(BaseModel):
    """Result of live liboqs PQC algorithm demonstration."""
    kem_algorithm: str = "ML-KEM-768"
    kem_public_key_size_bytes: int = 0
    kem_secret_key_size_bytes: int = 0
    kem_ciphertext_size_bytes: int = 0
    kem_time_ms: float = 0.0
    kem_success: bool = False
    sig_algorithm: str = "ML-DSA-65"
    sig_public_key_size_bytes: int = 0
    sig_secret_key_size_bytes: int = 0
    sig_signature_size_bytes: int = 0
    sig_time_ms: float = 0.0
    sig_success: bool = False
    message: str = ""


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    service: str = "ECDAT Backend"
