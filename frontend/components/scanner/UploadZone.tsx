"use client";

import React, { useState, useRef } from "react";
import { Upload, FileArchive, Zap, Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onDemoSelect?: () => void;
  isScanning: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
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
        className={`relative rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
          dragActive
            ? "border-[#C28E58] bg-[#FAF7F2] shadow-md"
            : selectedFile
            ? "border-emerald-500 bg-[#F0FDF4] shadow-md"
            : "border-[#DCD4C4] bg-white hover:border-[#C28E58] hover:bg-[#FAF7F2]/50 shadow-2xs"
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
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C1917] font-mono">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-[#57534E] mt-0.5 font-mono">
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
                  className="btn-pill-dark"
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
              <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1C1917] tracking-tight">
                  Drag & Drop codebase ZIP archive
                </h3>
                <p className="text-xs text-[#57534E] mt-1 max-w-sm mx-auto leading-relaxed">
                  Upload source code, X.509 certs, TLS/SSH configs, or container bills for automated CBOM discovery.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-xs text-[#57534E] font-mono">
                <FileArchive className="w-3.5 h-3.5 text-[#8B5E34]" />
                Supports .zip packages (Python, Java, Go, Configs, PEM/CRT)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
