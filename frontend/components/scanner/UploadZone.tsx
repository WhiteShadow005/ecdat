"use client";

import React, { useState, useRef } from "react";
import { Upload, FileArchive, Zap, Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onDemoSelect: () => void;
  isScanning: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  onDemoSelect,
  isScanning,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        alert("Please upload a .zip archive of your codebase or configuration repository.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleStartScan = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-md ${
          dragActive
            ? "border-sky-400 bg-sky-950/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            : selectedFile
            ? "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            : "border-slate-800 bg-[#0A1424]/90 hover:border-sky-500/40 hover:bg-[#0c182c]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleChange}
          className="hidden"
          disabled={isScanning}
        />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {selectedFile ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Quantum Analysis
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Choose Different File
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartScan();
                  }}
                  disabled={isScanning}
                  className="btn-primary"
                >
                  <Zap className="w-4 h-4" />
                  Initiate Cryptographic Scan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Drag & Drop codebase ZIP archive
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Upload source code, X.509 certs, TLS/SSH configs, or container bills for automated CBOM discovery.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050B14] border border-slate-800 text-xs text-slate-400 font-mono">
                <FileArchive className="w-3.5 h-3.5 text-sky-400" />
                Supports .zip packages (Python, Java, Go, Configs, PEM/CRT)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Demo Repository Quick-Scan Card */}
      <div className="nexus-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.15)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Instant Hackathon Demo:
              <span className="text-xs text-sky-400 font-mono font-semibold">demo_enterprise_repo</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Scan pre-configured vulnerable enterprise suite (JWT RSA-2048, Java Payments, MD5, Nginx TLS, X.509).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDemoSelect}
          disabled={isScanning}
          className="btn-primary shrink-0"
        >
          <Zap className="w-4 h-4" />
          Scan Demo Repo
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
