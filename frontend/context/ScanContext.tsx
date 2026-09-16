"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { ScanResult, CryptoAsset, PQCProofResult, ScanListItem } from "@/lib/types";
import { mockScanResult, mockPqcProof } from "@/lib/mock_data";
import { getScanResult, getPQCProof, uploadScanZip, checkBackendHealth, listAllScans, getScanById } from "@/lib/api";

export const emptyScanResult: ScanResult = {
  scan_id: "",
  timestamp: new Date().toISOString(),
  repo_name: "Awaiting Codebase Archive",
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
    message: "No active scan loaded",
    breach_year: 0,
    safety_margin_years: 0,
  },
  assets: [],
};

interface ScanContextType {
  scanData: ScanResult;
  pqcProof: PQCProofResult;
  isBackendLive: boolean;
  isLoading: boolean;
  totalAssets: number;
  criticalAssets: CryptoAsset[];
  highAssets: CryptoAsset[];
  mediumAssets: CryptoAsset[];
  safeAssets: CryptoAsset[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  safeCount: number;
  readinessPct: number;
  vulnerablePct: number;
  currentYear: number;
  qDayYear: number;
  breachYears: number;
  allScans: ScanListItem[];
  isHistoryLoading: boolean;
  refreshScanData: () => Promise<void>;
  runScan: (file?: File) => Promise<ScanResult>;
  loadHistoricalScan: (scanId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  resetScanData: () => void;
}

const ScanContext = createContext<ScanContextType | null>(null);

export const ScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scanData, setScanDataState] = useState<ScanResult>(mockScanResult);
  const [pqcProof, setPqcProofState] = useState<PQCProofResult>(mockPqcProof);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allScans, setAllScans] = useState<ScanListItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  // Helper to update scanData in both React state and localStorage
  const setScanData = (data: ScanResult) => {
    setScanDataState(data);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ecdat_active_scan", JSON.stringify(data));
      } catch (e) {
        console.warn("ScanContext: Failed to persist scan to localStorage", e);
      }
    }
  };

  // Helper to update pqcProof in both React state and localStorage
  const setPqcProof = (proof: PQCProofResult) => {
    setPqcProofState(proof);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ecdat_pqc_proof", JSON.stringify(proof));
      } catch (e) {
        console.warn("ScanContext: Failed to persist PQC proof to localStorage", e);
      }
    }
  };

  const refreshHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const scans = await listAllScans(50);
      setAllScans(scans);
    } catch {
      // keep existing list on error
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const refreshScanData = async () => {
    try {
      const isLive = await checkBackendHealth();
      setIsBackendLive(isLive);
      if (isLive) {
        const isReset =
          typeof window !== "undefined" &&
          localStorage.getItem("ecdat_is_reset") === "true";

        if (!isReset) {
          // 1. Fetch latest scan independently without blocking (fast ~200ms)
          getScanResult()
            .then((liveData) => {
              if (
                typeof window !== "undefined" &&
                localStorage.getItem("ecdat_is_reset") === "true"
              ) {
                return;
              }
              if (liveData && liveData.assets && liveData.assets.length > 0) {
                setScanData(liveData);
              }
            })
            .catch((err) => console.warn("ScanContext: Failed to fetch latest scan", err));
        }

        // 2. Fetch PQC proof in the background without blocking UI
        getPQCProof()
          .then((liveProof) => {
            if (liveProof && liveProof.kem_algo) {
              setPqcProof(liveProof);
            }
          })
          .catch((err) => console.warn("ScanContext: Failed to fetch live PQC proof", err));

        // 3. Refresh audit history
        refreshHistory();
      }
    } catch (err) {
      console.warn("ScanContext: Using default offline scan state", err);
    }
  };

  const resetScanData = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ecdat_is_reset", "true");
        localStorage.removeItem("ecdat_active_scan");
      } catch (e) {
        console.warn("ScanContext: Failed to reset localStorage", e);
      }
    }
    setScanDataState(emptyScanResult);
  };

  useEffect(() => {
    // Immediately restore the last active scan from localStorage on page load / refresh (0ms delay)
    if (typeof window !== "undefined") {
      try {
        const isReset = localStorage.getItem("ecdat_is_reset") === "true";
        if (isReset) {
          setScanDataState(emptyScanResult);
        } else {
          const savedScan = localStorage.getItem("ecdat_active_scan");
          if (savedScan) {
            const parsed = JSON.parse(savedScan);
            if (parsed && parsed.assets && parsed.assets.length > 0) {
              setScanDataState(parsed);
            }
          }
        }
        const savedProof = localStorage.getItem("ecdat_pqc_proof");
        if (savedProof) {
          const parsedProof = JSON.parse(savedProof);
          if (parsedProof && parsedProof.kem_algo) {
            setPqcProofState(parsedProof);
          }
        }
      } catch (e) {
        console.warn("ScanContext: Failed to restore scan from localStorage", e);
      }
    }

    refreshScanData();
  }, []);

  const runScan = async (file?: File): Promise<ScanResult> => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("ecdat_is_reset");
        } catch (e) {}
      }
      let result: ScanResult;
      if (file) {
        result = await uploadScanZip(file);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        result = {
          ...mockScanResult,
          scan_id: `scan-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString(),
        };
      }
      setScanData(result);
      // Refresh history so the new scan appears immediately
      refreshHistory();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoricalScan = async (scanId: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("ecdat_is_reset");
        } catch (e) {}
      }
      const result = await getScanById(scanId);
      if (result) setScanData(result);
    } finally {
      setIsLoading(false);
    }
  };

  const assets = scanData.assets || [];
  const summary = scanData.summary || {
    total_assets: assets.length,
    critical: assets.filter((a) => a.criticality === "critical").length,
    high: assets.filter((a) => a.criticality === "high").length,
    medium: assets.filter((a) => a.criticality === "medium").length,
    safe: assets.filter((a) => a.criticality === "safe" || a.quantum_status === "SAFE").length,
    quantum_readiness_pct:
        assets.length > 0
          ? Math.round((assets.filter((a) => a.quantum_status === "SAFE" || a.criticality === "safe").length / assets.length) * 1000) / 10
          : 0,
  };

  const totalAssets = summary.total_assets || assets.length;
  const criticalCount = summary.critical;
  const highCount = summary.high;
  const mediumCount = summary.medium;
  const safeCount = summary.safe;

  const criticalAssets = useMemo(
    () => assets.filter((a) => a.criticality === "critical" || a.quantum_status === "BROKEN"),
    [assets]
  );
  const highAssets = useMemo(
    () => assets.filter((a) => a.criticality === "high"),
    [assets]
  );
  const mediumAssets = useMemo(
    () => assets.filter((a) => a.criticality === "medium"),
    [assets]
  );
  const safeAssets = useMemo(
    () => assets.filter((a) => a.quantum_status === "SAFE" || a.criticality === "safe"),
    [assets]
  );

  const readinessPct = useMemo(() => {
    if (totalAssets === 0) return 0;
    if (summary.quantum_readiness_pct !== undefined) {
      return Number(summary.quantum_readiness_pct.toFixed(1));
    }
    return Number(((safeCount / totalAssets) * 100).toFixed(1));
  }, [summary.quantum_readiness_pct, safeCount, totalAssets]);

  const vulnerablePct = useMemo(() => {
    if (totalAssets === 0) return 0;
    return Number((100 - readinessPct).toFixed(1));
  }, [readinessPct, totalAssets]);

  const { x = 15, y = 4, z = 7 } = scanData.mosca || {};
  const qDayYear = currentYear + z;
  const breachYears = totalAssets === 0 ? 0 : Math.max(0, x + y - z);

  const value: ScanContextType = {
    scanData,
    pqcProof,
    isBackendLive,
    isLoading,
    totalAssets,
    criticalAssets,
    highAssets,
    mediumAssets,
    safeAssets,
    criticalCount,
    highCount,
    mediumCount,
    safeCount,
    readinessPct,
    vulnerablePct,
    currentYear,
    qDayYear,
    breachYears,
    allScans,
    isHistoryLoading,
    refreshScanData,
    runScan,
    loadHistoricalScan,
    refreshHistory,
    resetScanData,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};

export const useScan = (): ScanContextType => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
};
