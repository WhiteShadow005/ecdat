import { ScanResult, MoscaPreset, PQCProofResult } from "./types";

export const mockScanResult: ScanResult = {
  scan_id: "",
  timestamp: "",
  repo_name: "",
  summary: {
    total_assets: 0,
    critical: 0,
    high: 0,
    medium: 0,
    safe: 0,
    quantum_readiness_pct: 0,
    scanned_files_count: 0,
    duration_ms: 0,
  },
  mosca: {
    x: 0,
    y: 0,
    z: 7,
    status: "SAFE",
    message: "No scan currently loaded. Upload a codebase archive to begin cryptographic discovery.",
    breach_year: new Date().getFullYear() + 7,
    safety_margin_years: 7,
  },
  assets: [],
};

export const mockMoscaPresets: MoscaPreset[] = [
  {
    name: "Defense & Tactical Systems",
    label: "Defense (NTRO/PMO)",
    x: 30,
    y: 5,
    z: 7,
    description: "Classified military intelligence, satellite telemetry, and defense communications requiring 30+ year confidentiality.",
    badge: "Critical Infrastructure",
  },
  {
    name: "Financial & Banking Records",
    label: "Financial Systems",
    x: 10,
    y: 3,
    z: 7,
    description: "Core banking ledgers, KYC identities, and payment transaction history (10 year statutory retention).",
    badge: "BFSI Sector",
  },
  {
    name: "Healthcare & Genomic Data",
    label: "Healthcare / Genomic",
    x: 50,
    y: 4,
    z: 7,
    description: "Electronic health records and individual genomic profiles requiring lifetime secrecy (50+ years).",
    badge: "HIPAA / Health",
  },
  {
    name: "Ephemeral Session Tokens",
    label: "Web Session Tokens",
    x: 0.05,
    y: 1,
    z: 7,
    description: "Short-lived bearer access tokens and web session IDs expiring within hours.",
    badge: "Low Threat Horizon",
  },
];

export const mockPqcProof: PQCProofResult = {
  kem_algo: "ML-KEM-768 (FIPS 203)",
  kem_time_ms: 0.042,
  kem_key_bytes: 1184,
  sig_algo: "ML-DSA-65 (FIPS 204)",
  sig_time_ms: 0.128,
  sig_size_bytes: 3309,
  status: "VERIFIED_LIVE",
};
