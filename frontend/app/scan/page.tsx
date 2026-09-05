"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScan } from "@/context/ScanContext";
import { UploadZone } from "@/components/scanner/UploadZone";
import { ScanProgress } from "@/components/scanner/ScanProgress";
import { ShieldCheck, FileCode, Sparkles } from "lucide-react";

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
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h4 className="font-bold text-[#1C1917]">AI Semantic Discovery</h4>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Gemini LLM discovers hidden crypto wrappers and dynamic algorithm calls.
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
