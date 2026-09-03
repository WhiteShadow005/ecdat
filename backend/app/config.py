"""
ECDAT — App Configuration
Loads from .env file. Provides defaults for all settings.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

# ─── Base Paths ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent          # ecdat/backend/
APP_DIR = Path(__file__).parent                  # ecdat/backend/app/
DATA_DIR = APP_DIR / "data"
TEMPLATES_DIR = APP_DIR / "templates"
BIN_DIR = BASE_DIR / "bin"
TEMP_DIR = BASE_DIR / "tmp" / "uploads"

# Create temp dir if it doesn't exist
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# ─── API Keys ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

# ─── Scan / Upload Limits ──────────────────────────────────────────────────────
# Maximum accepted ZIP upload size (default: 50 MB) — read in streaming chunks
# so oversized files are rejected before being buffered into memory.
MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_MB", "50")) * 1024 * 1024

# ─── CORS Origins ──────────────────────────────────────────────────────────────
# Explicit allow-list (never "*" together with allow_credentials=True, which
# browsers reject). Override via CORS_ORIGINS="a,b,c" env var if needed.
CORS_ORIGINS: list = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

# ─── Risk Engine Defaults ──────────────────────────────────────────────────────
DEFAULT_Z_YEARS: float = float(os.getenv("DEFAULT_Z_YEARS", "7"))     # Q-Day estimate
DEFAULT_Y_YEARS: float = float(os.getenv("DEFAULT_Y_YEARS", "4"))     # Migration time

# ─── QARS Score Weights (must sum to 100) ─────────────────────────────────────
QARS_WEIGHTS = {
    "crypto_weakness": 40,    # How broken the algorithm is (0–40)
    "exposure_factor": 25,    # How exposed the asset is (0–25)
    "data_criticality": 20,   # How sensitive the data being protected is (0–20)
    "mosca_score": 15,        # Mosca temporal risk contribution (0–15)
}

# ─── QARS Sub-scores by quantum status ────────────────────────────────────────
CRYPTO_WEAKNESS_SCORES = {
    "BROKEN": 40,
    "WEAKENED": 18,
    "SAFE": 0,
    "UNKNOWN": 10,
}

# ─── QARS Exposure Factor Scores ──────────────────────────────────────────────
EXPOSURE_SCORES = {
    "public_api": 25,
    "internet_facing": 25,
    "internal": 15,
    "local": 5,
    "unknown": 12,
}

# ─── QARS Data Criticality Scores ─────────────────────────────────────────────
DATA_CRITICALITY_SCORES = {
    "defense": 20,
    "health": 20,
    "pii": 18,
    "financial": 17,
    "infrastructure": 20,
    "legal": 15,
    "internal": 10,
    "session": 2,
    "unknown": 10,
}

# ─── Criticality Tier Thresholds ──────────────────────────────────────────────
CRITICALITY_THRESHOLDS = {
    "critical": 75,   # QARS >= 75 → Critical
    "high": 55,       # QARS >= 55 → High
    "medium": 35,     # QARS >= 35 → Medium
    "low": 15,        # QARS >= 15 → Low
    # Below 15 → Safe
}

# ─── Cryptoscan Binary Path ────────────────────────────────────────────────────
CRYPTOSCAN_BINARY = BIN_DIR / os.getenv("CRYPTOSCAN_BINARY_NAME", "cryptoscan")

# ─── Load Master Crypto Rules ─────────────────────────────────────────────────
def load_crypto_rules() -> dict:
    """Load and return the master crypto_rules.json database."""
    rules_path = DATA_DIR / "crypto_rules.json"
    if not rules_path.exists():
        raise FileNotFoundError(f"crypto_rules.json not found at {rules_path}")
    with open(rules_path, "r") as f:
        return json.load(f)

# ─── App Info ─────────────────────────────────────────────────────────────────
APP_VERSION = "1.0.0"
APP_NAME = "ECDAT Backend"
APP_ENV = os.getenv("APP_ENV", "development")
