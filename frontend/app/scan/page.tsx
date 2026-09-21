"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScan } from "@/context/ScanContext";
import { UploadZone } from "@/components/scanner/UploadZone";
import { ScanProgress } from "@/components/scanner/ScanProgress";
import { ShieldCheck, FileCode, BrainCircuit } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const { runScan } = useScan();
  const [isScanning, setIsScanning] = useState(false);
  const [targetFile, setTargetFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setTargetFile(file);
    setIsScanning(true);
    try {
      await runScan(file);
    } catch (e) {
      console.error("Scan error:", e);
    }
  };

  const handleScanDone = () => {
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-xl md:text-2xl font-bold text-[#1C1917] tracking-tight font-display">
          Automated Codebase & CBOM Scanner
        </h1>
        <p className="text-xs text-[#57534E] max-w-xl mx-auto">
          Scan repository archives or server configurations to discover cryptographic primitives, certificates, and assess NIST PQC compliance.
        </p>
      </div>

      {/* Main Scanner Section */}
      {isScanning ? (
        <div className="space-y-5">
          <ScanProgress fileName={targetFile?.name} onComplete={handleScanDone} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* SIH Jury Evaluation Mode Banner & 1-Click Test Scenarios */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-[#FFFDF8] to-[#FFF9EE] p-4 md:p-5 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs md:text-sm font-bold text-[#1C1917] tracking-tight uppercase font-mono">
                  ⚖️ SIH 2026 Jury Evaluation Mode — 1-Click Live Audits
                </h3>
              </div>
              <span className="text-[11px] text-[#8B5E34] font-medium bg-amber-100/70 px-2.5 py-0.5 rounded-full w-fit">
                Zero ZIP Download Needed • 30-Sec Test
              </span>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed">
              Evaluating ECDAT from a mobile device or laptop? Select any pre-loaded enterprise repository below to execute the live 4-tier discovery pipeline, QARS calculation, and 1-click NIST PQC Git diff generation:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {/* Scenario 1: Banking */}
              <button
                type="button"
                onClick={() => {
                  const demoFile = new File(["dummy"], "banking_upi_gateway.zip", { type: "application/zip" });
                  handleFileSelect(demoFile);
                }}
                className="text-left p-3 rounded-xl bg-white border border-[#E8E2D5] hover:border-[#C28E58] hover:shadow-xs transition-all duration-150 group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917] group-hover:text-[#8B5E34] transition-colors">
                    🏦 Banking & NPCI Gateway
                  </span>
                  <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                    QARS 88
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  Java JCA • RSA-2048 JWT & TLS • High HNDL Breach Risk
                </p>
                <div className="text-[11px] font-bold text-[#8B5E34] flex items-center gap-1 pt-1">
                  <span>Audit Banking Repo</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>

              {/* Scenario 2: Defense */}
              <button
                type="button"
                onClick={() => {
                  const demoFile = new File(["dummy"], "c4i_defense_telemetry.zip", { type: "application/zip" });
                  handleFileSelect(demoFile);
                }}
                className="text-left p-3 rounded-xl bg-white border border-[#E8E2D5] hover:border-emerald-600 hover:shadow-xs transition-all duration-150 group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917] group-hover:text-emerald-800 transition-colors">
                    🛡️ Defense C4I Enclave
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Air-Gapped
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  Python • Obfuscated Wrappers • CryptoSense™ AI Target
                </p>
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 pt-1">
                  <span>Audit Defense Repo</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>

              {/* Scenario 3: SCADA Power Grid */}
              <button
                type="button"
                onClick={() => {
                  const demoFile = new File(["dummy"], "scada_powergrid_configs.zip", { type: "application/zip" });
                  handleFileSelect(demoFile);
                }}
                className="text-left p-3 rounded-xl bg-white border border-[#E8E2D5] hover:border-blue-600 hover:shadow-xs transition-all duration-150 group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917] group-hover:text-blue-800 transition-colors">
                    ⚡ SCADA Power Grid
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                    CII Asset
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  Nginx & SSH Configs • Weak RC4 / 3DES • Deprecated TLS
                </p>
                <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1 pt-1">
                  <span>Audit SCADA Configs</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>
            </div>
          </div>

          <UploadZone
            onFileSelect={handleFileSelect}
            isScanning={isScanning}
          />

          {/* Engine Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="nexus-card p-4 space-y-2 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#1C1917] flex items-center justify-center">
                <FileCode className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h4 className="font-bold text-[#1C1917]">AST & Binary Parser</h4>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Inspects Python AST, Java bytecode, OpenSSL certificates, and SSH/Nginx configs.
              </p>
            </div>

            <div className="nexus-card p-4 space-y-2 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#1C1917] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h4 className="font-bold text-[#1C1917]">CryptoSense™ AI</h4>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Fine-tuned on-premise CodeBERT discovers hidden crypto wrappers and dynamic calls.
              </p>
            </div>

            <div className="nexus-card p-4 space-y-2 bg-white border-[#E8E2D5] shadow-2xs hover:border-[#D5CBB9]">
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#1C1917] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h4 className="font-bold text-[#1C1917]">CycloneDX 1.6 CBOM</h4>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Generates ECMA-424 standardized Cryptographic Bill of Materials JSON.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
