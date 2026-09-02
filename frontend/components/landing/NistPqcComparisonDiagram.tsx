"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function NistPqcComparisonDiagram() {
  const [selectedCategory, setSelectedCategory] = useState<"kem" | "sig">("kem");

  return (
    <div className="retro-card w-full space-y-5 p-5 md:p-6 border border-purple-500/30 shadow-cyber-purple">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              NIST PQC Migration Benchmark
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Classical vs NIST FIPS 203/204 Standards
            </span>
          </div>
        </div>

        <div className="flex rounded-lg bg-black/60 p-0.5 border border-white/10 font-mono text-[10px]">
          <button
            onClick={() => setSelectedCategory("kem")}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              selectedCategory === "kem" ? "bg-white text-black" : "text-slate-400"
            }`}
          >
            Key Encapsulation (KEM)
          </button>
          <button
            onClick={() => setSelectedCategory("sig")}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              selectedCategory === "sig" ? "bg-white text-black" : "text-slate-400"
            }`}
          >
            Signatures (DSA)
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      {selectedCategory === "kem" ? (
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {/* Classical: RSA / ECDH */}
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300">RSA-2048 / ECDH</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900 text-red-200 uppercase font-bold">
                BROKEN (Shor's)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Security:</span>
                <span className="text-red-400 font-bold">0 Bits (Broken)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Public Key Size:</span>
                <span>256 Bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encapsulation Latency:</span>
                <span>0.18 ms</span>
              </div>
            </div>
          </div>

          {/* Quantum Safe: ML-KEM-768 */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">ML-KEM-768 (FIPS 203)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 uppercase font-bold">
                SAFE (Lattice)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Security:</span>
                <span className="text-emerald-400 font-bold">128 Bits (Cat 3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Public Key Size:</span>
                <span>1,184 Bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encapsulation Latency:</span>
                <span className="text-emerald-400 font-bold">0.04 ms</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {/* Classical: ECDSA */}
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300">ECDSA (secp256r1)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900 text-red-200 uppercase font-bold">
                BROKEN (Shor's)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Security:</span>
                <span className="text-red-400 font-bold">0 Bits (Broken)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signature Size:</span>
                <span>64 Bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sign Time:</span>
                <span>0.05 ms</span>
              </div>
            </div>
          </div>

          {/* Quantum Safe: ML-DSA-65 */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">ML-DSA-65 (FIPS 204)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 uppercase font-bold">
                SAFE (Lattice)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Security:</span>
                <span className="text-emerald-400 font-bold">128 Bits (Cat 3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signature Size:</span>
                <span>3,309 Bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sign Time:</span>
                <span className="text-emerald-400 font-bold">0.12 ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-between items-center pt-1 font-mono text-xs">
        <span className="text-[11px] text-slate-400">1-Click PQC code diff generator available</span>
        <Link
          href="/remediation"
          className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 font-bold text-xs"
        >
          <span>Open AI Diff Viewer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
