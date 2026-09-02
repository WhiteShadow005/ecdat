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
      <div className="nexus-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Cpu className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ECDAT Cryptographic Discovery Pipeline Active
              </h3>
              <p className="text-xs text-slate-500">
                Analyzing cryptographic primitives, certificates, and post-quantum readiness
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-600">
            {Math.floor(progress)}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-150"
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
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                isDone
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : isRunning
                  ? "bg-indigo-50/60 border-indigo-300 text-indigo-900 shadow-xs"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isRunning ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-500">
                    {step.id}
                  </div>
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate">{step.label}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  Engine: {step.tool}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Terminal Console Log */}
      <div className="nexus-card overflow-hidden font-mono text-xs">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs text-slate-700 font-semibold">
              ECDAT Discovery Engine Real-Time Log
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Live stdout</span>
        </div>

        <div className="p-4 h-48 overflow-y-auto space-y-1.5 bg-slate-900 text-slate-300">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <span className="text-indigo-400 select-none">&gt;</span>
              <span
                className={
                  log.includes("CRITICAL") || log.includes("Vulnerable")
                    ? "text-rose-400"
                    : log.includes("Warning") || log.includes("deprecated")
                    ? "text-amber-400"
                    : log.includes("completed") || log.includes("Detected")
                    ? "text-emerald-400"
                    : log.includes("LLM")
                    ? "text-indigo-300"
                    : "text-slate-300"
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
