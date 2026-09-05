"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useScan } from "@/context/ScanContext";
import { CryptoAsset, RemediationDiff } from "@/lib/types";
import { getRemediation } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DiffMethod } from "react-diff-viewer-continued";
import {
  BrainCircuit,
  FileCode,
  Copy,
  Check,
  Download,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const ReactDiffViewer = dynamic(
  () => import("react-diff-viewer-continued"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12 text-[#78716C] text-xs">
        <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#8B5E34]" /> Loading Diff Engine...
      </div>
    ),
  }
);

function RemediationContent() {
  const searchParams = useSearchParams();
  const { scanData } = useScan();
  const assets = scanData.assets || [];

  const vulnerableAssets = assets.filter(
    (a) => a.quantum_status !== "SAFE"
  );

  const initialAssetId = (searchParams ? searchParams.get("asset_id") : null) || vulnerableAssets[0]?.id;

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
    const paramId = searchParams ? searchParams.get("asset_id") : null;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#C28E58]" />
            <h1 className="text-lg md:text-xl font-bold text-[#1C1917] tracking-tight font-display">
              AI Code Remediator
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
            Automated migration patches upgrading legacy primitives to NIST PQC standards (FIPS 203/204).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSplitView(!splitView)}
            className="btn-pill-dark"
          >
            {splitView ? "Split View" : "Unified View"}
          </button>
        </div>
      </div>

      {/* Main Remediation Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* Left Column: Vulnerable Findings Selector */}
        <div className="xl:col-span-1 space-y-2">
          <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
            Vulnerable Findings ({vulnerableAssets.length})
          </span>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {vulnerableAssets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#C28E58] shadow-md"
                      : "bg-white border-[#E8E2D5] hover:border-[#D5CBB9] shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-bold text-xs font-mono text-[#1C1917]`}>
                      {asset.algorithm}
                    </span>
                    <StatusBadge status={asset.quantum_status} size="sm" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-mono truncate ${isSelected ? "text-[#8B5E34]" : "text-[#78716C]"}`}>
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
          <div className="nexus-card p-4 space-y-3 bg-white border-[#E8E2D5] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#E8E2D5]">
              <div>
                <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                  Target File
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-sm font-bold text-[#1C1917] font-mono">
                    {selectedAsset.file}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#57534E] font-mono">
                    Line {selectedAsset.line}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFix}
                  className="btn-pill-dark"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78716C]" /> Copy Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadPatch}
                  className="btn-primary text-xs py-1.5 px-3.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download .patch
                </button>
              </div>
            </div>

            {/* AI Explanation Pill */}
            {remediation && (
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D5] text-xs text-[#57534E] space-y-0.5">
                <div className="font-bold text-[#8B5E34] flex items-center gap-1.5 font-mono">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#C28E58]" />
                  Migration Rationale ({remediation.nist_standard}):
                </div>
                <p className="text-[#57534E] leading-relaxed text-[11px]">
                  {remediation.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Diff Viewer Card */}
          {remediation ? (
            <div className="nexus-card overflow-hidden bg-white border-[#E8E2D5] shadow-2xs">
              <div className="bg-[#FAF7F2] px-4 py-2 border-b border-[#E8E2D5] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4 text-[11px] font-medium">
                  <span className="text-[#991B1B] font-bold">
                    - Legacy Code ({selectedAsset.algorithm})
                  </span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[#166534] font-bold">
                    + NIST Remediated ({selectedAsset.replacement})
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-mono p-2 bg-[#FAF7F2]">
                <ReactDiffViewer
                  oldValue={remediation.original_code}
                  newValue={remediation.remediated_code}
                  splitView={splitView}
                  useDarkTheme={false}
                  compareMethod={DiffMethod.WORDS}
                  styles={{
                    variables: {
                      light: {
                        diffViewerBackground: "#FAF7F2",
                        diffViewerColor: "#1C1917",
                        addedBackground: "#E6F4EA",
                        addedColor: "#137333",
                        removedBackground: "#FCE8E6",
                        removedColor: "#C5221F",
                        wordAddedBackground: "#CEEAD6",
                        wordRemovedBackground: "#FAD2CF",
                        gutterBackground: "#F5F0E8",
                        gutterBackgroundDark: "#EDE7DC",
                        gutterColor: "#78716C",
                      },
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="nexus-card p-8 text-center text-[#78716C] text-xs bg-white border-[#E8E2D5]">
              No code diff available for this asset.
            </div>
          )}

          {/* Apply Fix Action */}
          <div className="nexus-card p-3.5 bg-white border-[#E8E2D5] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-[#57534E]">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>Apply patch directly to workspace</span>
            </div>

            <button
              onClick={handleApplyFix}
              disabled={applied}
              className={`btn-primary text-xs py-1.5 px-3.5 ${
                applied ? "bg-emerald-700 hover:bg-emerald-700 border-emerald-700 text-white" : ""
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Patch Applied
                </>
              ) : (
                <>
                  <BrainCircuit className="w-3.5 h-3.5" /> Apply Patch
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
