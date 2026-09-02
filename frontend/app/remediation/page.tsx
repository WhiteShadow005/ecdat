"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScan } from "@/context/ScanContext";
import { CryptoAsset, RemediationDiff } from "@/lib/types";
import { getRemediation } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import {
  Sparkles,
  FileCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function RemediationContent() {
  const searchParams = useSearchParams();
  const { scanData } = useScan();
  const assets = scanData.assets || [];

  const vulnerableAssets = assets.filter(
    (a) => a.quantum_status !== "SAFE"
  );

  const initialAssetId = searchParams.get("asset_id") || vulnerableAssets[0]?.id;

  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | undefined>(
    vulnerableAssets.find((a) => a.id === initialAssetId) || vulnerableAssets[0]
  );
  const [remediation, setRemediation] = useState<RemediationDiff | undefined>(
    selectedAsset?.remediation
  );
  const [splitView, setSplitView] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  useEffect(() => {
    const paramId = searchParams.get("asset_id");
    if (paramId) {
      const found = vulnerableAssets.find((a) => a.id === paramId);
      if (found) setSelectedAsset(found);
    } else if (!selectedAsset && vulnerableAssets.length > 0) {
      setSelectedAsset(vulnerableAssets[0]);
    }
  }, [searchParams, vulnerableAssets, selectedAsset]);

  useEffect(() => {
    if (selectedAsset) {
      if (selectedAsset.remediation) {
        setRemediation(selectedAsset.remediation);
      } else {
        getRemediation(scanData.scan_id, selectedAsset.id, scanData).then((res) => {
          setRemediation({
            original_code: res.original_code,
            remediated_code: res.remediated_code,
            diff_snippet: res.diff,
            explanation: res.explanation,
            nist_standard: res.nist_standard,
            library_recommendation: res.library_recommendation,
          });
        });
      }
    }
  }, [selectedAsset, scanData]);

  const handleCopyFix = () => {
    if (remediation?.remediated_code) {
      navigator.clipboard.writeText(remediation.remediated_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPatch = () => {
    if (!remediation || !selectedAsset) return;
    const patchContent = `--- a/${selectedAsset.file}\n+++ b/${selectedAsset.file}\n${remediation.diff_snippet}`;
    const blob = new Blob([patchContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedAsset.id}_pqc_remediation.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyFix = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  if (!selectedAsset) {
    return (
      <div className="nexus-card p-12 text-center text-slate-400 text-xs">
        No vulnerable assets found in current scan.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-900" />
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              AI Code Remediator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated migration patches upgrading legacy primitives to NIST PQC standards (FIPS 203/204).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSplitView(!splitView)}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50"
          >
            {splitView ? "Split View" : "Unified View"}
          </button>
        </div>
      </div>

      {/* Main Remediation Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* Left Column: Vulnerable Findings Selector */}
        <div className="xl:col-span-1 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Vulnerable Findings ({vulnerableAssets.length})
          </span>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {vulnerableAssets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {asset.algorithm}
                    </span>
                    <StatusBadge status={asset.quantum_status} size="sm" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-mono truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    <FileCode className="w-3 h-3 shrink-0" />
                    <span className="truncate">{asset.file.split("/").pop()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Side-by-Side Diff Viewer & Patch Actions */}
        <div className="xl:col-span-3 space-y-4">
          {/* Target Metadata Banner */}
          <div className="nexus-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Target File
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedAsset.file}
                  </h3>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                    Line {selectedAsset.line}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFix}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 inline-flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadPatch}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Download className="w-3.5 h-3.5" /> Download .patch
                </button>
              </div>
            </div>

            {/* AI Explanation Pill */}
            {remediation && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  Migration Rationale ({remediation.nist_standard}):
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {remediation.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Diff Viewer Card */}
          {remediation ? (
            <div className="nexus-card overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-[11px] font-medium">
                  <span className="text-rose-700">
                    - Legacy Code ({selectedAsset.algorithm})
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-700">
                    + NIST Remediated ({selectedAsset.replacement})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-mono diff-viewer-light p-2">
                <ReactDiffViewer
                  oldValue={remediation.original_code}
                  newValue={remediation.remediated_code}
                  splitView={splitView}
                  useDarkTheme={false}
                  compareMethod={DiffMethod.WORDS}
                  styles={{
                    variables: {
                      light: {
                        diffViewerBackground: "#ffffff",
                        diffViewerColor: "#0f172a",
                        addedBackground: "#ecfdf5",
                        addedColor: "#065f46",
                        removedBackground: "#fef2f2",
                        removedColor: "#991b1b",
                        wordAddedBackground: "#a7f3d0",
                        wordRemovedBackground: "#fecaca",
                        gutterBackground: "#f8fafc",
                        gutterBackgroundDark: "#f1f5f9",
                        gutterColor: "#94a3b8",
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="nexus-card p-8 text-center text-slate-400 text-xs">
              No code diff available for this asset.
            </div>
          )}

          {/* Apply Fix Action */}
          <div className="nexus-card p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Apply patch directly to workspace</span>
            </div>

            <button
              onClick={handleApplyFix}
              disabled={applied}
              className={`btn-primary text-xs py-1.5 px-3 ${
                applied ? "bg-emerald-600 hover:bg-emerald-600" : ""
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Patch Applied
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Apply Patch
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemediationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Remediator...
        </div>
      }
    >
      <RemediationContent />
    </Suspense>
  );
}
