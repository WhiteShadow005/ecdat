"use client";

import React from "react";
import Link from "next/link";
import { useScan } from "@/context/ScanContext";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ShieldAlert,
  FileCode,
  ArrowRight,
  Sparkles,
  Zap,
  Download,
  Cpu,
} from "lucide-react";

import { ThreatBannerVisual } from "@/components/ui/ThreatBannerVisual";

export default function DashboardPage() {
  const {
    scanData,
    pqcProof,
    totalAssets,
    criticalAssets,
    criticalCount,
    highCount,
    mediumCount,
    safeCount,
    readinessPct,
    vulnerablePct,
    qDayYear,
    breachYears,
  } = useScan();

  const { mosca } = scanData;

  return (
    <div className="space-y-5">
      {/* Top Banner: Mosca Theorem HNDL Active Alert */}
      <div className="nexus-card p-4 md:p-5 border-rose-500/30 bg-[#0c1626]/90 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(244,63,94,0.08)] relative overflow-hidden">
        {/* Subtle Animated Holographic Shield & Padlock Visual */}
        <ThreatBannerVisual />

        {/* Left Side Content */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Active HNDL Threat Detected
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400 font-mono">
                X ({mosca.x}y) + Y ({mosca.y}y) &gt; Z ({mosca.z}y)
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white mt-1 tracking-tight">
              {breachYears.toFixed(0)}-Year Breach Window: Encrypted Traffic Decryptable by ~{qDayYear}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Adversaries harvesting communications today can decrypt stored payloads upon Q-Day. Immediate migration to NIST FIPS 203/204 is advised.
            </p>
          </div>
        </div>

        {/* Right Side CTA Button */}
        <Link
          href="/mosca"
          className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:shadow-[0_0_18px_rgba(244,63,94,0.25)] relative z-10"
        >
          <span>Mosca Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Executive Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Left 3 cols: 4 Stat Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Critical */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-rose-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400">Critical Risk</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{criticalCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Broken by Shor's (RSA, ECC)</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Action</span>
              <span className="text-rose-400 font-semibold text-[11px] font-mono">1-Click Fix</span>
            </div>
          </div>

          {/* Card 2: High */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-amber-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">High Risk</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{highCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">ECDH key exchanges & VPNs</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Target</span>
              <span className="text-amber-400 font-semibold text-[11px] font-mono">ML-KEM-768</span>
            </div>
          </div>

          {/* Card 3: Medium */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-yellow-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-yellow-400">Medium Risk</span>
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{mediumCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">AES-128 weakened by Grover's</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Target</span>
              <span className="text-yellow-400 font-semibold text-[11px] font-mono">AES-256</span>
            </div>
          </div>

          {/* Card 4: Safe */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-emerald-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Quantum Safe</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{safeCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">AES-256 & SHA-256 primitives</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Status</span>
              <span className="text-emerald-400 font-semibold text-[11px]">NIST Compliant</span>
            </div>
          </div>
        </div>

        {/* Right 1 col: Quantum Readiness Gauge */}
        <div className="nexus-card p-4 flex flex-col items-center justify-center">
          <ScoreRing percentage={readinessPct} size={135} />
          <div className="mt-2 text-center">
            <span className="text-xs text-rose-400 font-semibold font-mono">
              {vulnerablePct}% Assets Vulnerable
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/scan"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-sky-500/40 hover:bg-[#0e1d33] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Run Codebase Scan</h4>
              <p className="text-[11px] text-slate-400">Upload ZIP or scan demo repo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/remediation"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-sky-500/40 hover:bg-[#0e1d33] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AI Code Remediator</h4>
              <p className="text-[11px] text-slate-400">NIST PQC side-by-side Git diffs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/reports"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-sky-500/40 hover:bg-[#0e1d33] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">CycloneDX Reports</h4>
              <p className="text-[11px] text-slate-400">ECMA-424 JSON + Executive PDF</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Urgent Cryptographic Vulnerabilities Table */}
      <div className="nexus-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-white text-xs md:text-sm tracking-tight">
              Urgent Cryptographic Vulnerabilities ({criticalCount} Critical)
            </h3>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-semibold text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
          >
            <span>All Assets ({totalAssets})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#060e1a]/90 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">File Location</th>
                <th className="py-2.5 px-4">QARS Risk</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {criticalAssets.slice(0, 5).map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{asset.algorithm}</span>
                      <StatusBadge status={asset.quantum_status} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300">{asset.file}</span>
                      {asset.line > 0 && <span className="text-slate-500">:{asset.line}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-rose-400 font-mono">{asset.qars_score}/100</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold font-mono">
                    {asset.replacement}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/remediation?asset_id=${asset.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-medium text-[11px] transition-colors shadow-[0_0_10px_rgba(56,189,248,0.12)]"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Remediate</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* liboqs PQC Proof Benchmark Card */}
      <div className="nexus-card p-3.5 border-emerald-500/30 bg-[#08151e]/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-[0_0_20px_rgba(16,185,129,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">
              Live NIST Post-Quantum Execution Proof (liboqs engine)
            </span>
            <span className="font-medium text-slate-200 text-xs font-mono">
              {pqcProof.kem_algo}: Encapsulation {pqcProof.kem_time_ms}ms ({pqcProof.kem_key_bytes} B) •{" "}
              {pqcProof.sig_algo}: Sign {pqcProof.sig_time_ms}ms ({pqcProof.sig_size_bytes} B)
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-semibold text-[10px] tracking-wider">
          {pqcProof.status}
        </span>
      </div>
    </div>
  );
}
