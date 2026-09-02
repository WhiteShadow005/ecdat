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

  const handleFileSelect = async (file: File) => {
    setIsScanning(true);
    try {
      await runScan(file);
    } catch (e) {
      console.error("Scan error:", e);
    }
  };

  const handleDemoSelect = async () => {
    setIsScanning(true);
    try {
      await runScan();
    } catch (e) {
      console.error("Demo scan error:", e);
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
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display">
          Automated Codebase & CBOM Scanner
        </h1>
        <p className="text-xs text-[#A6A6AD] max-w-xl mx-auto">
          Scan repository archives or server configurations to discover cryptographic primitives, certificates, and assess NIST PQC compliance.
        </p>
      </div>

      {/* Main Scanner Section */}
      {isScanning ? (
        <div className="space-y-5">
          <ScanProgress onComplete={handleScanDone} />
        </div>
      ) : (
        <div className="space-y-5">
          <UploadZone
            onFileSelect={handleFileSelect}
            onDemoSelect={handleDemoSelect}
            isScanning={isScanning}
          />

          {/* Engine Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="nexus-card p-4 space-y-2 hover:border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center">
                <FileCode className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white">AST & Binary Parser</h4>
              <p className="text-[11px] text-[#71717A] leading-relaxed">
                Inspects Python AST, Java bytecode, OpenSSL certificates, and SSH/Nginx configs.
              </p>
            </div>

            <div className="nexus-card p-4 space-y-2 hover:border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white">AI Semantic Discovery</h4>
              <p className="text-[11px] text-[#71717A] leading-relaxed">
                Gemini LLM discovers hidden crypto wrappers and dynamic algorithm calls.
              </p>
            </div>

            <div className="nexus-card p-4 space-y-2 hover:border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white">CycloneDX 1.6 CBOM</h4>
              <p className="text-[11px] text-[#71717A] leading-relaxed">
                Generates ECMA-424 standardized Cryptographic Bill of Materials JSON.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
