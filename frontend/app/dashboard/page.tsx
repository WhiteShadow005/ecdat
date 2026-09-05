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
  BrainCircuit,
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
      {/* Top Banner: Mosca Theorem HNDL Active Alert or System Ready */}
      {totalAssets === 0 ? (
        <div className="nexus-card p-6 border-[#E8E2D5] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shrink-0 shadow-2xs">
              <ShieldAlert className="w-6 h-6 text-[#8B5E34] stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E34] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  SYSTEM READY FOR DISCOVERY
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1C1917] mt-0.5">Awaiting Codebase Archive</h2>
              <p className="text-xs text-[#57534E] mt-0.5">
                No active scan loaded. Upload a repository ZIP archive to discover cryptographic primitives, calculate QARS scores, and evaluate Mosca's inequality.
              </p>
            </div>
          </div>
          <Link href="/scan" prefetch={true} className="btn-primary shrink-0">
            <Zap className="w-4 h-4" />
            Scan Codebase
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="nexus-card p-5 border-[#E8E2D5] bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs relative overflow-hidden">
          {/* Holographic Security Shield & Padlock Visual */}
          <ThreatBannerVisual />

          {/* Left Side Content */}
          <div className="flex items-start gap-4 relative z-10 max-w-2xl">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shrink-0 shadow-2xs">
              <ShieldAlert className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  ACTIVE HNDL THREAT DETECTED
                </span>
                <span className="text-[#A8A29E]">•</span>
                <span className="text-xs text-[#57534E] font-mono">
                  X ({mosca.x}y) + Y ({mosca.y}y) &gt; Z ({mosca.z}y)
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-[#1C1917] mt-1 tracking-tight">
                {breachYears.toFixed(0)}-Year Breach Window: Encrypted Traffic Decryptable by ~{qDayYear}
              </h2>
              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                Adversaries harvesting communications today can decrypt stored payloads upon Q-Day. Immediate migration to NIST FIPS 203/204 is advised.
              </p>
            </div>
          </div>

          {/* Right Side CTA Button */}
          <Link
            href="/mosca"
            prefetch={true}
            className="btn-secondary shrink-0 relative z-10 shadow-2xs"
          >
            <span>Mosca Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Executive Metrics Grid: 5 Analytical Instruments */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        {/* Card 1: Critical */}
        <div className="nexus-card p-4 flex flex-col justify-between hover:border-[#D5CBB9]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917]">Critical Risk</span>
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">{criticalCount}</span>
              <span className="text-xs text-[#78716C] ml-1.5 font-medium">Assets</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">Broken by Shor's (RSA, ECC)</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
            <span className="text-[#78716C] text-[11px]">Action</span>
            <span className="text-[#1C1917] font-bold text-[11px] font-mono flex items-center gap-1">
              1-Click Fix <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: High */}
        <div className="nexus-card p-4 flex flex-col justify-between hover:border-[#D5CBB9]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917]">High Risk</span>
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">{highCount}</span>
              <span className="text-xs text-[#78716C] ml-1.5 font-medium">Assets</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">ECDH key exchanges & VPNs</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
            <span className="text-[#78716C] text-[11px]">Target</span>
            <span className="text-[#1C1917] font-bold text-[11px] font-mono">ML-KEM-768</span>
          </div>
        </div>

        {/* Card 3: Medium */}
        <div className="nexus-card p-4 flex flex-col justify-between hover:border-[#D5CBB9]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917]">Medium Risk</span>
              <span className="w-2 h-2 rounded-full bg-[#8B5E34]" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">{mediumCount}</span>
              <span className="text-xs text-[#78716C] ml-1.5 font-medium">Assets</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">AES-128 weakened by Grover's</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
            <span className="text-[#78716C] text-[11px]">Target</span>
            <span className="text-[#1C1917] font-bold text-[11px] font-mono">AES-256</span>
          </div>
        </div>

        {/* Card 4: Safe */}
        <div className="nexus-card p-4 flex flex-col justify-between hover:border-[#D5CBB9]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917]">Quantum Safe</span>
              <span className="w-2 h-2 rounded-full bg-[#57534E]" />
            </div>
            <div className="mt-2.5">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">{safeCount}</span>
              <span className="text-xs text-[#78716C] ml-1.5 font-medium">Assets</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">AES-256 & SHA-256 primitives</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
            <span className="text-[#78716C] text-[11px]">Status</span>
            <span className="text-[#1C1917] font-bold text-[11px]">NIST Compliant</span>
          </div>
        </div>

        {/* Card 5: Quantum Readiness Gauge */}
        <div className="nexus-card p-4 flex flex-col items-center justify-between">
          <ScoreRing percentage={readinessPct} size={115} strokeWidth={9} />
          <div className="mt-2 text-center space-y-0.5">
            <p className="text-xs font-bold text-[#1C1917]">Quantum Readiness</p>
            <p className="text-[10px] text-[#78716C]">NIST PQC Baseline</p>
            <p className="text-[11px] text-[#1C1917] font-semibold font-mono pt-1">
              {vulnerablePct}% Assets Vulnerable
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Command Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/scan"
          prefetch={true}
          className="nexus-card p-4 flex items-center justify-between group hover:border-[#D5CBB9] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] group-hover:border-[#D5CBB9] transition-all">
              <Zap className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C1917]">Run Codebase Scan</h4>
              <p className="text-[11px] text-[#78716C]">Upload repository archive for analysis</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#1C1917] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/remediation"
          prefetch={true}
          className="nexus-card p-4 flex items-center justify-between group hover:border-[#D5CBB9] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] group-hover:border-[#D5CBB9] transition-all">
              <BrainCircuit className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C1917]">AI Code Remediator</h4>
              <p className="text-[11px] text-[#78716C]">NIST PQC side-by-side Git diffs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#1C1917] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/reports"
          prefetch={true}
          className="nexus-card p-4 flex items-center justify-between group hover:border-[#D5CBB9] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] group-hover:border-[#D5CBB9] transition-all">
              <Download className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C1917]">CycloneDX Reports</h4>
              <p className="text-[11px] text-[#78716C]">ECMA-424 JSON + Executive PDF</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#1C1917] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Urgent Cryptographic Vulnerabilities Table */}
      <div className="nexus-card overflow-hidden border-[#E8E2D5] bg-white shadow-2xs">
        <div className="p-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#991B1B]" />
            <h3 className="font-bold text-[#1C1917] text-xs md:text-sm tracking-tight">
              Urgent Cryptographic Vulnerabilities ({criticalCount} Critical)
            </h3>
          </div>
          <Link
            href="/inventory"
            prefetch={true}
            className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] flex items-center gap-1 transition-colors"
          >
            <span>All Assets ({totalAssets})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#78716C] uppercase text-[10px] font-bold tracking-wider border-b border-[#E8E2D5]">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">File Location</th>
                <th className="py-2.5 px-4">QARS Risk</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]/80 text-[#57534E]">
              {criticalAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#78716C]">
                    No cryptographic vulnerabilities currently detected. Upload a codebase archive on the{" "}
                    <Link href="/scan" prefetch={true} className="text-[#8B5E34] underline font-bold">
                      Scanner Page
                    </Link>{" "}
                    to run analysis.
                  </td>
                </tr>
              ) : (
                criticalAssets.slice(0, 5).map((asset) => {
                  const displayPath = asset.file
                    ? asset.file.replace(/^.*\/extracted\/[^\/]+\//, "")
                    : "Unknown File";
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1C1917] font-mono">{asset.algorithm}</span>
                          <StatusBadge status={asset.quantum_status} size="sm" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#57534E] font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                          <span className="text-[#1C1917]">{displayPath}</span>
                          {asset.line > 0 && <span className="text-[#78716C]">:{asset.line}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1C1917] font-mono">{asset.qars_score}/100</span>
                      </td>
                      <td className="py-3 px-4 text-[#1C1917] font-semibold font-mono text-xs">
                        {asset.replacement}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/remediation?asset_id=${asset.id}`}
                          prefetch={true}
                          className="btn-pill-light text-[11px] py-1 px-3"
                        >
                          <BrainCircuit className="w-3 h-3 text-[#C28E58]" />
                          <span>Remediate</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* liboqs PQC Proof Telemetry Card */}
      <div className="nexus-card p-3.5 border-[#E8E2D5] bg-white flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center text-[#1C1917] shrink-0">
            <Cpu className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[#78716C] text-[10px] block font-semibold">
              Live NIST Post-Quantum Execution Proof (liboqs engine)
            </span>
            <span className="font-semibold text-[#1C1917] text-xs font-mono">
              {pqcProof.kem_algo}: Encapsulation {pqcProof.kem_time_ms}ms ({pqcProof.kem_key_bytes} B) •{" "}
              {pqcProof.sig_algo}: Sign {pqcProof.sig_time_ms}ms ({pqcProof.sig_size_bytes} B)
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#1C1917] font-mono font-bold text-[10px] tracking-wider flex items-center gap-1.5 shadow-2xs">
          <span>{pqcProof.status}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        </span>
      </div>
    </div>
  );
}
