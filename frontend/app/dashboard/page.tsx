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
      <div className="nexus-card p-4 md:p-5 border-white/10 bg-[#0A0A0D]/90 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle Animated Holographic Shield & Padlock Visual */}
        <ThreatBannerVisual />

        {/* Left Side Content */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Active HNDL Threat Detected
              </span>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-xs text-[#A6A6AD] font-mono">
                X ({mosca.x}y) + Y ({mosca.y}y) &gt; Z ({mosca.z}y)
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white mt-1.5 tracking-tight">
              {breachYears.toFixed(0)}-Year Breach Window: Encrypted Traffic Decryptable by ~{qDayYear}
            </h2>
            <p className="text-xs text-[#A6A6AD] mt-0.5 max-w-2xl leading-relaxed">
              Adversaries harvesting communications today can decrypt stored payloads upon Q-Day. Immediate migration to NIST FIPS 203/204 is advised.
            </p>
          </div>
        </div>

        {/* Right Side CTA Button */}
        <Link
          href="/mosca"
          className="btn-pill-dark shrink-0 relative z-10 hover:border-white/30 transition-all"
        >
          <span>Mosca Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Executive Metrics Grid: 5 Analytical Instruments */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Left 3 cols: 4 Stat Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Critical */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-rose-500/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400">Critical Risk</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{criticalCount}</span>
                <span className="text-xs text-[#A6A6AD] ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">Broken by Shor's (RSA, ECC)</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#71717A] text-[11px]">Action</span>
              <span className="text-rose-400 font-semibold text-[11px] font-mono">1-Click Fix</span>
            </div>
          </div>

          {/* Card 2: High */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-amber-500/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">High Risk</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{highCount}</span>
                <span className="text-xs text-[#A6A6AD] ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">ECDH key exchanges & VPNs</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#71717A] text-[11px]">Target</span>
              <span className="text-amber-400 font-semibold text-[11px] font-mono">ML-KEM-768</span>
            </div>
          </div>

          {/* Card 3: Medium */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-purple-500/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400">Medium Risk</span>
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{mediumCount}</span>
                <span className="text-xs text-[#A6A6AD] ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">AES-128 weakened by Grover's</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#71717A] text-[11px]">Target</span>
              <span className="text-purple-300 font-semibold text-[11px] font-mono">AES-256</span>
            </div>
          </div>

          {/* Card 4: Safe */}
          <div className="nexus-card p-4 flex flex-col justify-between hover:border-emerald-500/30">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Quantum Safe</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">{safeCount}</span>
                <span className="text-xs text-[#A6A6AD] ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">AES-256 & SHA-256 primitives</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#71717A] text-[11px]">Status</span>
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

      {/* Quick Action Command Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/scan"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-white/25 hover:bg-[#121217] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:scale-105 transition-all">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Run Codebase Scan</h4>
              <p className="text-[11px] text-[#71717A]">Upload ZIP or scan demo repo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/remediation"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-white/25 hover:bg-[#121217] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:scale-105 transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AI Code Remediator</h4>
              <p className="text-[11px] text-[#71717A]">NIST PQC side-by-side Git diffs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/reports"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-white/25 hover:bg-[#121217] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:scale-105 transition-all">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">CycloneDX Reports</h4>
              <p className="text-[11px] text-[#71717A]">ECMA-424 JSON + Executive PDF</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Urgent Cryptographic Vulnerabilities Table */}
      <div className="nexus-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-white text-xs md:text-sm tracking-tight">
              Urgent Cryptographic Vulnerabilities ({criticalCount} Critical)
            </h3>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-semibold text-[#A6A6AD] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>All Assets ({totalAssets})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08080A]/90 text-[#71717A] uppercase text-[10px] font-semibold tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">File Location</th>
                <th className="py-2.5 px-4">QARS Risk</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#A6A6AD]">
              {criticalAssets.slice(0, 5).map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{asset.algorithm}</span>
                      <StatusBadge status={asset.quantum_status} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#71717A] font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
                      <span className="text-[#A6A6AD]">{asset.file}</span>
                      {asset.line > 0 && <span className="text-[#52525B]">:{asset.line}</span>}
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
                      className="btn-pill-dark text-[11px] py-1 px-3 hover:border-purple-500/40"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Remediate</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* liboqs PQC Proof Telemetry Card */}
      <div className="nexus-card p-3.5 border-emerald-500/20 bg-[#080B0D]/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-[0_0_20px_rgba(16,185,129,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[#71717A] text-[10px] block font-medium">
              Live NIST Post-Quantum Execution Proof (liboqs engine)
            </span>
            <span className="font-medium text-[#F5F5F5] text-xs font-mono">
              {pqcProof.kem_algo}: Encapsulation {pqcProof.kem_time_ms}ms ({pqcProof.kem_key_bytes} B) •{" "}
              {pqcProof.sig_algo}: Sign {pqcProof.sig_time_ms}ms ({pqcProof.sig_size_bytes} B)
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-semibold text-[10px] tracking-wider">
          {pqcProof.status}
        </span>
      </div>
    </div>
  );
}
