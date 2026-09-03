"use client";

import React, { useState, useEffect } from "react";
import { useScan } from "@/context/ScanContext";
import { CryptoAsset } from "@/lib/types";
import { Heatmap } from "@/components/charts/Heatmap";
import { RiskBar } from "@/components/charts/RiskBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Flame, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeatmapPage() {
  const { scanData, totalAssets, criticalCount } = useScan();
  const assets = scanData.assets || [];
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(assets[0] || null);

  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0]);
    }
  }, [assets, selectedAsset]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#8B5E34]" />
            <h1 className="text-lg md:text-xl font-bold text-[#1C1917] tracking-tight font-display">
              Quantum Risk Heatmap & Analytics
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
            Visual distribution of cryptographic vulnerabilities across repository components and languages.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-[#57534E] font-medium shadow-2xs font-mono">
            Total Assets: <strong className="text-[#1C1917]">{totalAssets}</strong>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] font-bold font-mono shadow-2xs">
            Critical: <strong>{criticalCount}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Heatmap + Detail Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: Interactive Charts & Heatmap */}
        <div className="xl:col-span-2 space-y-5">
          <Heatmap
            assets={assets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />

          <RiskBar assets={assets} />
        </div>

        {/* Right 1 Col: Selected Asset Detail Inspector Drawer */}
        <div className="xl:col-span-1 sticky top-20">
          {selectedAsset ? (
            <div className="nexus-card p-4 space-y-3.5 bg-white border-[#E8E2D5] shadow-2xs">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                    Selected Primitive
                  </span>
                  <h3 className="text-sm font-bold text-[#1C1917] font-mono mt-0.5">
                    {selectedAsset.algorithm}
                  </h3>
                </div>
                <StatusBadge status={selectedAsset.quantum_status} size="sm" />
              </div>

              {/* Asset Meta Info */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D5] space-y-1.5 font-mono">
                  <div className="flex justify-between text-[#78716C]">
                    <span className="font-semibold">Language / Type:</span>
                    <span className="text-[#1C1917] font-bold capitalize">
                      {selectedAsset.language} ({selectedAsset.type})
                    </span>
                  </div>
                  <div className="flex justify-between text-[#78716C]">
                    <span className="font-semibold">File Location:</span>
                    <span className="text-[#1C1917] font-bold text-[11px] truncate max-w-[160px] text-right">
                      {selectedAsset.file}:{selectedAsset.line}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#78716C]">
                    <span className="font-semibold">QARS Risk Score:</span>
                    <span className={`font-bold ${selectedAsset.qars_score >= 80 ? "text-[#DC2626]" : selectedAsset.qars_score >= 50 ? "text-[#D97706]" : "text-[#15803D]"}`}>
                      {selectedAsset.qars_score}/100
                    </span>
                  </div>
                </div>

                {/* Attack Vector with Crystal Clear Contrast */}
                <div className="space-y-1 font-mono">
                  <span className="text-[#78716C] text-[11px] font-bold">Attack Vector:</span>
                  <p className="text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#FEE2E2] p-3 rounded-2xl leading-relaxed">
                    {selectedAsset.attack_vector}
                  </p>
                </div>

                {/* NIST Replacement with Crystal Clear Contrast */}
                <div className="space-y-1 font-mono">
                  <span className="text-[#78716C] text-[11px] font-bold">NIST Replacement:</span>
                  <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl space-y-0.5">
                    <p className="font-bold text-[#166534] text-xs">
                      {selectedAsset.replacement}
                    </p>
                    <p className="text-[11px] text-[#15803D] font-medium">
                      {selectedAsset.nist_standard}
                    </p>
                  </div>
                </div>

                {selectedAsset.remediation && (
                  <div className="pt-1">
                    <Link
                      href={`/remediation?asset_id=${selectedAsset.id}`}
                      className="w-full btn-primary text-xs py-2.5 rounded-full justify-between px-4 shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C28E58]" />
                        <span>Remediate Code Diff</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="nexus-card p-6 text-center text-[#78716C] text-xs font-mono bg-white border-[#E8E2D5]">
              Select an algorithm from the matrix to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
