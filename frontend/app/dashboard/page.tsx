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
      <div className="nexus-card p-4 md:p-5 border-rose-200 bg-rose-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase text-rose-700">
                Active HNDL Threat Detected
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 font-mono">
                X ({mosca.x}y) + Y ({mosca.y}y) &gt; Z ({mosca.z}y)
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-slate-900 mt-0.5">
              {breachYears.toFixed(0)}-Year Breach Window: Encrypted Traffic Decryptable by ~{qDayYear}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              Adversaries harvesting communications today can decrypt stored payloads upon Q-Day. Immediate migration to NIST FIPS 203/204 is advised.
            </p>
          </div>
        </div>

        <Link
          href="/mosca"
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-2xs"
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
          <div className="nexus-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-600">Critical Risk</span>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{criticalCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Broken by Shor's (RSA, ECC)</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Action</span>
              <span className="text-rose-600 font-semibold text-[11px]">1-Click Fix</span>
            </div>
          </div>

          {/* Card 2: High */}
          <div className="nexus-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-600">High Risk</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{highCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">ECDH key exchanges & VPNs</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Target</span>
              <span className="text-amber-600 font-semibold text-[11px]">ML-KEM-768</span>
            </div>
          </div>

          {/* Card 3: Medium */}
          <div className="nexus-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-yellow-600">Medium Risk</span>
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{mediumCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">AES-128 weakened by Grover's</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Target</span>
              <span className="text-yellow-600 font-semibold text-[11px]">AES-256</span>
            </div>
          </div>

          {/* Card 4: Safe */}
          <div className="nexus-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">Quantum Safe</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{safeCount}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Assets</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">AES-256 & SHA-256 primitives</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Status</span>
              <span className="text-emerald-600 font-semibold text-[11px]">NIST Compliant</span>
            </div>
          </div>
        </div>

        {/* Right 1 col: Quantum Readiness Gauge */}
        <div className="nexus-card p-4 flex flex-col items-center justify-center">
          <ScoreRing percentage={readinessPct} size={135} />
          <div className="mt-2 text-center">
            <span className="text-xs text-rose-600 font-semibold">
              {vulnerablePct}% Assets Vulnerable
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/scan"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Run Codebase Scan</h4>
              <p className="text-[11px] text-slate-500">Upload ZIP or scan demo repo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/remediation"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Code Remediator</h4>
              <p className="text-[11px] text-slate-500">NIST PQC side-by-side Git diffs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/reports"
          className="nexus-card p-3.5 flex items-center justify-between group hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">CycloneDX Reports</h4>
              <p className="text-[11px] text-slate-500">ECMA-424 JSON + Executive PDF</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Urgent Cryptographic Vulnerabilities Table */}
      <div className="nexus-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-xs md:text-sm">
              Urgent Cryptographic Vulnerabilities ({criticalCount} Critical)
            </h3>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>All Assets ({totalAssets})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">File Location</th>
                <th className="py-2.5 px-4">QARS Risk</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {criticalAssets.slice(0, 5).map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{asset.algorithm}</span>
                      <StatusBadge status={asset.quantum_status} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-800">{asset.file}</span>
                      {asset.line > 0 && <span className="text-slate-400">:{asset.line}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-rose-600">{asset.qars_score}/100</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    {asset.replacement}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/remediation?asset_id=${asset.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] transition-colors"
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
      <div className="nexus-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block font-medium">
              Live NIST Post-Quantum Execution Proof (liboqs engine)
            </span>
            <span className="font-semibold text-slate-800 text-xs">
              {pqcProof.kem_algo}: Encapsulation {pqcProof.kem_time_ms}ms ({pqcProof.kem_key_bytes} B) •{" "}
              {pqcProof.sig_algo}: Sign {pqcProof.sig_time_ms}ms ({pqcProof.sig_size_bytes} B)
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[10px]">
          {pqcProof.status}
        </span>
      </div>
    </div>
  );
}
