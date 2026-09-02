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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#1C1917]" />
            <h1 className="text-lg md:text-xl font-bold text-[#1C1917] tracking-tight font-display">
              Compliance & CBOM Reports
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
            Export machine-readable ECMA-424 CycloneDX 1.6 JSON, executive PDF briefs, and CSV inventories.
          </p>
        </div>

        <div className="text-xs font-mono text-[#57534E] bg-white px-3.5 py-1.5 rounded-full border border-[#E8E2D5] shadow-2xs">
          Standard: <strong className="text-[#1C1917]">CycloneDX 1.6 (ECMA-424)</strong>
        </div>
      </div>

      {/* 3 Main Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: CycloneDX 1.6 CBOM */}
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917]">
              <Code2 className="w-4 h-4 stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917] tracking-tight">
              CycloneDX 1.6 CBOM
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
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
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917]">
              <FileText className="w-4 h-4 stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917] tracking-tight">
              Executive PDF Audit Brief
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
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
        <div className="nexus-card p-5 flex flex-col justify-between space-y-3 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917]">
              <FileSpreadsheet className="w-4 h-4 stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917] tracking-tight">
              Cryptographic Asset CSV
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
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
      <div className="nexus-card overflow-hidden bg-white border-[#E8E2D5] shadow-2xs">
        <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Code2 className="w-4 h-4 text-[#8B5E34]" />
            <span className="font-bold text-[#1C1917] font-mono">
              CycloneDX 1.6 Schema Output (ECMA-424)
            </span>
          </div>

          <button
            onClick={handleCopyJson}
            className="text-xs text-[#8B5E34] hover:underline flex items-center gap-1 font-bold"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy JSON
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-white text-[#1C1917] font-mono text-[11px] max-h-80 overflow-y-auto">
          <pre>{JSON.stringify(sampleCbomJson, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
