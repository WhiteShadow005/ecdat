"use client";

import React, { useState } from "react";
import { ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";

export function QarsScoreDiagram() {
  const [selectedAsset, setSelectedAsset] = useState<"jwt" | "tls" | "aes">("jwt");

  const assets = {
    jwt: {
      name: "JWT Auth Signer (RSA-2048)",
      weakness: 40,
      exposure: 23,
      criticality: 15,
      mosca: 10,
      total: 88,
      status: "CRITICAL",
      replacement: "ML-KEM-768 / ML-DSA-65",
    },
    tls: {
      name: "TLS Gateway Handshake (ECDH secp256r1)",
      weakness: 35,
      exposure: 20,
      criticality: 15,
      mosca: 10,
      total: 80,
      status: "CRITICAL",
      replacement: "X25519 + ML-KEM-768 Hybrid",
    },
    aes: {
      name: "Database Field Encryption (AES-128-CBC)",
      weakness: 20,
      exposure: 15,
      criticality: 10,
      mosca: 7,
      total: 52,
      status: "MEDIUM",
      replacement: "AES-256-GCM (Quantum Safe)",
    },
  };

  const current = assets[selectedAsset];

  return (
    <div className="retro-card w-full space-y-5 p-5 md:p-6 border border-yellow-500/30 shadow-cyber-yellow">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/40">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              QARS 0–100 Composite Risk Engine
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Standardized Quantum Vulnerability Formula
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-500/40">
          QARS: {current.total}/100
        </span>
      </div>

      {/* Asset Selector */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <button
          onClick={() => setSelectedAsset("jwt")}
          className={`p-2 rounded-lg border text-center transition-all ${
            selectedAsset === "jwt" ? "bg-white text-black font-bold" : "bg-black/40 text-slate-400 border-white/10"
          }`}
        >
          RSA-2048
        </button>
        <button
          onClick={() => setSelectedAsset("tls")}
          className={`p-2 rounded-lg border text-center transition-all ${
            selectedAsset === "tls" ? "bg-white text-black font-bold" : "bg-black/40 text-slate-400 border-white/10"
          }`}
        >
          ECDH-256
        </button>
        <button
          onClick={() => setSelectedAsset("aes")}
          className={`p-2 rounded-lg border text-center transition-all ${
            selectedAsset === "aes" ? "bg-white text-black font-bold" : "bg-black/40 text-slate-400 border-white/10"
          }`}
        >
          AES-128
        </button>
      </div>

      {/* Breakdown Progress Bars */}
      <div className="space-y-2.5 font-mono text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">1. Cryptographic Weakness (Max 40):</span>
            <span className="text-white font-bold">{current.weakness} / 40</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${(current.weakness / 40) * 100}%` }} className="h-full bg-red-500 rounded-full" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">2. Exposure Factor (Max 25):</span>
            <span className="text-white font-bold">{current.exposure} / 25</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${(current.exposure / 25) * 100}%` }} className="h-full bg-purple-500 rounded-full" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">3. Data Criticality (Max 20):</span>
            <span className="text-white font-bold">{current.criticality} / 20</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${(current.criticality / 20) * 100}%` }} className="h-full bg-cyan-500 rounded-full" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">4. Mosca Threat Factor (Max 15):</span>
            <span className="text-white font-bold">{current.mosca} / 15</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div style={{ width: `${(current.mosca / 15) * 100}%` }} className="h-full bg-yellow-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Target Replacement */}
      <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-400 block">Recommended PQC Replacement:</span>
          <span className="text-emerald-400 font-bold">{current.replacement}</span>
        </div>
        <Link
          href="/inventory"
          className="text-xs text-white underline hover:text-cyan-300 flex items-center gap-1 font-bold"
        >
          View CBOM <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
