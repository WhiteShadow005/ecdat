export type QuantumStatus = "BROKEN" | "WEAKENED" | "SAFE";

export type CriticalityTier = "critical" | "high" | "medium" | "low" | "safe";

export type AssetType = "algorithm" | "certificate" | "key" | "protocol" | "config";

export type LanguageType = "python" | "java" | "config" | "certificate" | "go" | "c" | "rust" | "other";

export interface RemediationDiff {
  original_code: string;
  remediated_code: string;
  diff_snippet: string;
  explanation: string;
  nist_standard: string;
  library_recommendation: string;
}

export interface CryptoAsset {
  id: string;
  algorithm: string;
  type: AssetType;
  quantum_status: QuantumStatus;
  criticality: CriticalityTier;
  qars_score: number;
  file: string;
  line: number;
  language: string;
  replacement: string;
  nist_standard: string;
  attack_vector: string;
  code_snippet: string;
  library_used?: string;
  description?: string;
  remediation?: RemediationDiff;
}

export interface ScanSummary {
  total_assets: number;
  critical: number;
  high: number;
  medium: number;
  safe: number;
  quantum_readiness_pct: number;
  scanned_files_count?: number;
  duration_ms?: number;
}

export interface MoscaSummary {
  x: number; // Data shelf life (years)
  y: number; // Migration time (years)
  z: number; // Q-Day estimate (years)
  status: "CRITICAL" | "HIGH" | "SAFE";
  message: string;
  breach_year?: number;
  safety_margin_years?: number;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  repo_name?: string;
  summary: ScanSummary;
  mosca: MoscaSummary;
  assets: CryptoAsset[];
}

export interface RemediationResult {
  asset_id: string;
  original_code: string;
  remediated_code: string;
  diff: string;
  explanation: string;
  nist_standard: string;
  library_recommendation: string;
  trade_offs?: {
    key_size_increase: string;
    perf_impact: string;
    compatibility: string;
  };
}

export interface PQCProofResult {
  kem_algo: string;
  kem_time_ms: number;
  kem_key_bytes: number;
  sig_algo: string;
  sig_time_ms: number;
  sig_size_bytes: number;
  status: string;
}

/** Lightweight summary row returned by GET /api/scans (list endpoint) */
export interface ScanListItem {
  scan_id: string;
  timestamp: string;
  target_name: string;
  total_assets: number;
  critical_count: number;
  high_count: number;
  readiness_pct: number;
  mosca_status: string;
  data_category: string;
  exposure_context: string;
}

export interface MoscaPreset {
  name: string;
  label: string;
  x: number;
  y: number;
  z: number;
  description: string;
  badge: string;
}
