"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Terminal, Cpu, ShieldCheck } from "lucide-react";

interface ScanProgressProps {
  fileName?: string;
  onComplete: () => void;
}

const SCAN_STEPS = [
  { id: 1, label: "Archive Extraction & Source File Mapping", tool: "Zip Extractor & File Walker" },
  { id: 2, label: "Abstract Syntax Tree (AST) & Code Parsing", tool: "Python AST & Java Bytecode Engine" },
  { id: 3, label: "X.509 Certificate & PKI Hierarchy Inspection", tool: "Cert Parser (OpenSSL / Cryptography)" },
  { id: 4, label: "Network Protocol & Server Config Auditing", tool: "Config Parser (TLS / SSH / Nginx)" },
  { id: 5, label: "AI Semantic Wrapper & Dynamic Discovery", tool: "Gemini 2.0 Flash Semantic Analyzer" },
  { id: 6, label: "QARS Risk Scoring & Mosca HNDL Assessment", tool: "QARS Composite & Mosca Inequality" },
  { id: 7, label: "CycloneDX 1.6 CBOM Synthesis (ECMA-424)", tool: "CBOM Exporter Engine" },
];

export const ScanProgress: React.FC<ScanProgressProps> = ({ fileName = "codebase archive", onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(5);

  const stageLogs = [
    `[PIPELINE] Receiving archive ${fileName} — initializing sandboxed extraction...`,
    `[EXTRACTOR] Archive extracted. Enumerating source files, certificates, and configuration manifests...`,
    `[AST-PARSER] Walking Abstract Syntax Trees (Python AST & Java Parser) for crypto primitives...`,
    `[CRYPTO-SCAN] Analyzing key generation calls, symmetric ciphers, and hash functions...`,
    `[CERT-PARSER] Parsing X.509 certificate chains, public key algorithms, and signature algorithms...`,
    `[CONFIG-AUDIT] Inspecting TLS/SSL, SSH, and VPN configuration directives...`,
    `[SEMANTIC-AI] Running semantic discovery heuristics and Gemini 2.0 wrapper analysis...`,
    `[QARS-ENGINE] Computing Quantum Asset Risk Scores (0–100) per identified primitive...`,
    `[MOSCA-ENGINE] Calculating Michele Mosca's HNDL inequality (X shelf-life + Y migration vs Z Q-Day)...`,
    `[CBOM-SYNTH] Compiling CycloneDX 1.6 Cryptographic Bill of Materials (ECMA-424)...`,
    `[PIPELINE] Scan complete. Finalizing cryptographic asset inventory...`,
  ];

  const [logs, setLogs] = useState<string[]>([stageLogs[0]]);

  useEffect(() => {
    const totalDuration = 2800; // 2.8 seconds smooth progression
    const interval = 100;
    const increment = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 100;
        }

        const stepIndex = Math.min(
          SCAN_STEPS.length,
          Math.floor((next / 100) * SCAN_STEPS.length) + 1
        );
        setCurrentStep(stepIndex);

        const logIndex = Math.min(
          stageLogs.length - 1,
          Math.floor((next / 100) * stageLogs.length)
        );
        setLogs((prevLogs) => {
          if (!prevLogs.includes(stageLogs[logIndex])) {
            return [...prevLogs, stageLogs[logIndex]];
          }
          return prevLogs;
        });

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete, fileName]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Overall Bar */}
      <div className="nexus-card p-6 bg-white border-[#E8E2D5] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shadow-2xs">
              <Cpu className="w-5 h-5 animate-spin text-[#8B5E34]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] tracking-tight">
                ECDAT Cryptographic Discovery Pipeline Active
              </h3>
              <p className="text-xs text-[#57534E]">
                Scanning <span className="font-mono font-semibold text-[#1C1917]">{fileName}</span> for post-quantum readiness
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-[#1C1917] font-mono">
            {Math.floor(progress)}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full bg-[#1C1917] rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SCAN_STEPS.map((step) => {
          const isDone = currentStep > step.id || progress >= 100;
          const isRunning = currentStep === step.id && progress < 100;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                isDone
                  ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#166534] shadow-2xs"
                  : isRunning
                  ? "bg-[#FAF7F2] border-[#C28E58] text-[#1C1917] shadow-md"
                  : "bg-white border-[#E8E2D5] text-[#78716C]"
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isRunning ? (
                  <Loader2 className="w-5 h-5 text-[#8B5E34] animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#E8E2D5] bg-[#FAF7F2] flex items-center justify-center text-[10px] font-mono text-[#78716C]">
                    {step.id}
                  </div>
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate text-[#1C1917]">{step.label}</p>
                <p className="text-[10px] text-[#78716C] font-mono truncate">
                  Engine: {step.tool}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Terminal Console Log */}
      <div className="nexus-card overflow-hidden font-mono text-xs bg-white border-[#E8E2D5] shadow-2xs">
        <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#8B5E34]" />
            <span className="text-xs text-[#1C1917] font-bold font-mono">
              ECDAT Discovery Engine Real-Time Log
            </span>
          </div>
          <span className="text-[10px] text-[#78716C] font-mono">Live stdout</span>
        </div>

        <div className="p-4 h-48 overflow-y-auto space-y-1.5 bg-white text-[#1C1917]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <span className="text-[#8B5E34] select-none font-bold">&gt;</span>
              <span
                className={
                  log.includes("CRITICAL") || log.includes("Vulnerable")
                    ? "text-[#991B1B] font-bold"
                    : log.includes("Warning") || log.includes("deprecated")
                    ? "text-[#92400E] font-semibold"
                    : log.includes("completed") || log.includes("Detected")
                    ? "text-[#166534] font-semibold"
                    : log.includes("LLM")
                    ? "text-[#6B21A8] font-semibold"
                    : "text-[#57534E]"
                }
              >
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
