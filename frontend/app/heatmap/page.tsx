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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Quantum Risk Heatmap & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual distribution of cryptographic vulnerabilities across repository components and languages.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[#07111F] border border-slate-800 text-slate-300 font-medium shadow-2xs font-mono">
            Total Assets: <strong className="text-white">{totalAssets}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 font-medium font-mono shadow-[0_0_10px_rgba(244,63,94,0.1)]">
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
            <div className="nexus-card p-4 space-y-3.5 shadow-xs">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Selected Primitive
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedAsset.algorithm}
                  </h3>
                </div>
                <StatusBadge status={selectedAsset.quantum_status} size="sm" />
              </div>

              {/* Asset Meta Info */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#050B14] rounded-xl border border-slate-800 space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Language / Type:</span>
                    <span className="text-slate-200 font-medium capitalize">
                      {selectedAsset.language} ({selectedAsset.type})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>File Location:</span>
                    <span className="text-sky-400 text-[11px] truncate max-w-[160px] text-right">
                      {selectedAsset.file}:{selectedAsset.line}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>QARS Risk Score:</span>
                    <span className="font-bold text-rose-400">
                      {selectedAsset.qars_score}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-1 font-mono">
                  <span className="text-slate-400 text-[11px] font-medium">Attack Vector:</span>
                  <p className="text-[11px] text-rose-300 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl leading-relaxed">
                    {selectedAsset.attack_vector}
                  </p>
                </div>

                <div className="space-y-1 font-mono">
                  <span className="text-slate-400 text-[11px] font-medium">NIST Replacement:</span>
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
                    <p className="font-bold text-emerald-300 text-xs">
                      {selectedAsset.replacement}
                    </p>
                    <p className="text-[10px] text-emerald-400/80 font-medium">
                      {selectedAsset.nist_standard}
                    </p>
                  </div>
                </div>

                {selectedAsset.remediation && (
                  <div className="pt-1">
                    <Link
                      href={`/remediation?asset_id=${selectedAsset.id}`}
                      className="w-full btn-primary text-xs py-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Remediate Code Diff</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="nexus-card p-6 text-center text-slate-400 text-xs font-mono">
              Select an algorithm from the matrix to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
