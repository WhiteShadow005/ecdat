"use client";

import React, { useState } from "react";
import { useScan } from "@/context/ScanContext";
import { exportCBOM, exportCSV, exportPDF } from "@/lib/api";
import {
  FileSpreadsheet,
  Download,
  FileText,
  Copy,
  Check,
  Code2,
} from "lucide-react";

export default function ReportsPage() {
  const { scanData } = useScan();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const sampleCbomJson = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    serialNumber: `urn:uuid:${scanData.scan_id}`,
    version: 1,
    metadata: {
      timestamp: scanData.timestamp,
      tools: [
        {
          vendor: "NTRO-SIH26164",
          name: "ECDAT (Enterprise Cryptographic Discovery & Analysis Tool)",
          version: "1.0.0",
        },
      ],
      component: {
        type: "application",
        name: scanData.repo_name || "enterprise_repo",
        version: "1.0.0",
      },
    },
    components: (scanData.assets || []).map((asset) => ({
      type: "cryptographic-asset",
      name: asset.algorithm,
      "bom-ref": asset.id,
      cryptoProperties: {
        assetType: asset.type === "certificate" ? "certificate" : "algorithm",
        algorithmProperties: {
          primitive: asset.type,
          parameterSetIdentifier: asset.algorithm,
          nistQuantumSecurityLevel:
            asset.quantum_status === "SAFE"
              ? 5
              : asset.quantum_status === "WEAKENED"
              ? 1
              : 0,
        },
      },
      properties: [
        { name: "ecdat:vulnerabilityStatus", value: asset.quantum_status },
        { name: "ecdat:qarsRiskScore", value: asset.qars_score.toString() },
        { name: "ecdat:attackVector", value: asset.attack_vector },
        { name: "ecdat:recommendedReplacement", value: asset.replacement },
        { name: "ecdat:nistStandard", value: asset.nist_standard },
        { name: "ecdat:filePath", value: asset.file },
        { name: "ecdat:lineNumber", value: asset.line.toString() },
      ],
    })),
  };

  const handleDownload = async (
    type: "cbom" | "pdf" | "csv",
    filename: string
  ) => {
    setDownloading(type);
    try {
      let blob: Blob;
      if (type === "cbom") blob = await exportCBOM(scanData);
      else if (type === "csv") blob = await exportCSV(scanData);
      else blob = await exportPDF(scanData);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleCbomJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Compliance & CBOM Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Export machine-readable ECMA-424 CycloneDX 1.6 JSON, executive PDF briefs, and CSV inventories.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#07111F] px-3 py-1.5 rounded-lg border border-slate-800 shadow-2xs">
          Standard: <strong className="text-sky-400">CycloneDX 1.6 (ECMA-424)</strong>
        </div>
      </div>

      {/* 3 Main Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: CycloneDX 1.6 CBOM */}
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 hover:border-sky-500/40">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              CycloneDX 1.6 CBOM
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized JSON Cryptographic Bill of Materials with cryptoProperties and NIST levels.
            </p>
          </div>

          <button
            onClick={() =>
              handleDownload("cbom", `${scanData.scan_id}_cyclonedx_cbom.json`)
            }
            disabled={downloading === "cbom"}
            className="w-full btn-primary text-xs py-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === "cbom" ? "Exporting..." : "Download CBOM JSON"}</span>
          </button>
        </div>

        {/* Card 2: Executive PDF Report */}
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 hover:border-sky-500/40">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Executive PDF Audit Brief
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CISO executive risk summary, Mosca timeline threat analysis, and prioritized remediation milestones.
            </p>
          </div>

          <button
            onClick={() =>
              handleDownload("pdf", `${scanData.scan_id}_audit_report.pdf`)
            }
            disabled={downloading === "pdf"}
            className="w-full btn-primary text-xs py-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === "pdf" ? "Generating..." : "Download Executive PDF"}</span>
          </button>
        </div>

        {/* Card 3: CSV Inventory */}
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 hover:border-sky-500/40">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cryptographic Asset CSV
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raw tabular coordinates, algorithm types, key sizes, QARS risk scores, and attack vectors.
            </p>
          </div>

          <button
            onClick={() =>
              handleDownload("csv", `${scanData.scan_id}_inventory.csv`)
            }
            disabled={downloading === "csv"}
            className="w-full btn-primary text-xs py-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === "csv" ? "Exporting..." : "Download CSV Data"}</span>
          </button>
        </div>
      </div>

      {/* Interactive CycloneDX 1.6 JSON Viewer */}
      <div className="nexus-card overflow-hidden">
        <div className="bg-[#060e1a]/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white font-mono">
              CycloneDX 1.6 Schema Output (ECMA-424)
            </span>
          </div>

          <button
            onClick={handleCopyJson}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy JSON
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-[#050B14] text-slate-300 font-mono text-[11px] max-h-80 overflow-y-auto">
          <pre>{JSON.stringify(sampleCbomJson, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
