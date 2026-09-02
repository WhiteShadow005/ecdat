"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Terminal, Cpu, ShieldCheck } from "lucide-react";

interface ScanProgressProps {
  onComplete: () => void;
}

const SCAN_STEPS = [
  { id: 1, label: "Extracting Archive & Scanning Python/Java AST Trees", tool: "AST Parser + Go cryptoscan" },
  { id: 2, label: "Parsing X.509 Certificates & Signature Algorithms", tool: "Cert Parser (OpenSSL/Cryptography)" },
  { id: 3, label: "Inspecting TLS, SSH & VPN Configuration Files", tool: "Config Parser (Nginx / SSHD / IPSec)" },
  { id: 4, label: "Running AI Semantic Crypto Discovery", tool: "Gemini 1.5 Pro LLM" },
  { id: 5, label: "Computing QARS Risk Scores & Mosca Theorem HNDL", tool: "QARS Engine (0-100)" },
  { id: 6, label: "Synthesizing CycloneDX 1.6 CBOM (ECMA-424)", tool: "CBOM Exporter Engine" },
];

const LOG_MESSAGES = [
  "[AST-SCANNER] Initializing AST walker over src/auth/jwt_signer.py...",
  "[AST-SCANNER] Detected: RSA-2048 key generation (public_exponent=65537) -> Vulnerable to Shor's algorithm.",
  "[AST-SCANNER] Flagged: MD5 digest in src/auth/password_hasher.py -> Collision attack risk.",
  "[JAVA-SCAN] Found: ECDSA secp256r1 in TransactionSigner.java -> Shor curve forgery risk.",
  "[CERT-PARSER] Inspecting certs/server.pem -> Subject: CN=api.enterprise.internal, Key: RSA-2048.",
  "[CERT-PARSER] Warning: certs/ca_bundle.crt uses deprecated SHA-1 signature algorithm.",
  "[CONFIG-PARSER] Parsing config/nginx.conf -> TLSv1.0 / TLSv1.1 protocols and DHE ciphers enabled.",
  "[CONFIG-PARSER] Parsing config/sshd_config -> Found diffie-hellman-group1-sha1 and ssh-rsa.",
  "[AI-SEMANTIC] Triggering Gemini LLM on custom wrapper in src/api/crypto_wrapper.py...",
  "[AI-SEMANTIC] LLM identified hidden 3DES ECB cipher wrapper -> Flagged as CRITICAL.",
  "[QARS-ENGINE] Calculating composite risk: CryptoWeakness(40) + Exposure(25) + DataCrit(20) + Mosca(15)...",
  "[MOSCA-ENGINE] Running Mosca Theorem: X (15yr) + Y (4yr) = 19yr > Z (7yr) -> CRITICAL HNDL Threat.",
  "[CBOM-SYNTH] Compiling CycloneDX 1.6 CBOM with 15 cryptographic components...",
  "[PIPELINE] Scan completed successfully. Redirecting to Executive Dashboard...",
];

export const ScanProgress: React.FC<ScanProgressProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(5);
  const [logs, setLogs] = useState<string[]>([LOG_MESSAGES[0]]);

  useEffect(() => {
    const totalDuration = 3200; // 3.2 seconds simulated deep scan
    const interval = 120;
    const increment = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }

        // Update step based on progress
        const stepIndex = Math.min(
          SCAN_STEPS.length,
          Math.floor((next / 100) * SCAN_STEPS.length) + 1
        );
        setCurrentStep(stepIndex);

        // Add log messages smoothly
        const logIndex = Math.min(
          LOG_MESSAGES.length - 1,
          Math.floor((next / 100) * LOG_MESSAGES.length)
        );
        setLogs((prevLogs) => {
          if (!prevLogs.includes(LOG_MESSAGES[logIndex])) {
            return [...prevLogs, LOG_MESSAGES[logIndex]];
          }
          return prevLogs;
        });

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

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
                Analyzing cryptographic primitives, certificates, and post-quantum readiness
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
