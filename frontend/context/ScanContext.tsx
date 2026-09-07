"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { ScanResult, CryptoAsset, PQCProofResult, ScanListItem } from "@/lib/types";
import { mockScanResult, mockPqcProof } from "@/lib/mock_data";
import { getScanResult, getPQCProof, uploadScanZip, checkBackendHealth, listAllScans, getScanById } from "@/lib/api";

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
}

const ScanContext = createContext<ScanContextType | null>(null);

export const ScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scanData, setScanData] = useState<ScanResult>(mockScanResult);
  const [pqcProof, setPqcProof] = useState<PQCProofResult>(mockPqcProof);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allScans, setAllScans] = useState<ScanListItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

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
        const [liveData, liveProof] = await Promise.all([
          getScanResult(),
          getPQCProof(),
        ]);
        if (liveData && liveData.assets) setScanData(liveData);
        if (liveProof) setPqcProof(liveProof);
        // Also refresh history when backend comes up
        refreshHistory();
      }
    } catch (err) {
      console.warn("ScanContext: Using default offline scan state", err);
    }
  };

  useEffect(() => {
    refreshScanData();
  }, []);

  const runScan = async (file?: File): Promise<ScanResult> => {
    setIsLoading(true);
    try {
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
    if (summary.quantum_readiness_pct !== undefined) {
      return Number(summary.quantum_readiness_pct.toFixed(1));
    }
    if (totalAssets === 0) return 0;
    return Number(((safeCount / totalAssets) * 100).toFixed(1));
  }, [summary.quantum_readiness_pct, safeCount, totalAssets]);

  const vulnerablePct = useMemo(() => {
    return Number((100 - readinessPct).toFixed(1));
  }, [readinessPct]);

  const { x = 15, y = 4, z = 7 } = scanData.mosca || {};
  const qDayYear = currentYear + z;
  const breachYears = Math.max(0, x + y - z);

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
