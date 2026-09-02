"use client";

import React, { useState, useMemo } from "react";
import { useScan } from "@/context/ScanContext";
import { CryptoAsset } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Layers,
  Search,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const { scanData } = useScan();
  const assets = scanData.assets || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery === "" ||
        asset.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.replacement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.language.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || asset.quantum_status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || asset.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assets, searchQuery, statusFilter, typeFilter]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-white" />
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight font-display">
              Cryptographic Inventory (CBOM)
            </h1>
          </div>
          <p className="text-xs text-[#A6A6AD] mt-0.5">
            ECMA-424 standardized catalog of discovered algorithms, keys, certificates, and TLS ciphers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/reports"
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CycloneDX</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="nexus-card p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search algorithm or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0D11] border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-white/25 transition-colors font-mono"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#71717A] font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0D0D11] border border-white/10 rounded-full px-3 py-1 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/25 font-mono"
              >
                <option value="ALL">All ({assets.length})</option>
                <option value="BROKEN">Broken (Shor's)</option>
                <option value="WEAKENED">Weakened (Grover's)</option>
                <option value="SAFE">Quantum Safe</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#71717A] font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#0D0D11] border border-white/10 rounded-full px-3 py-1 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/25 font-mono"
              >
                <option value="ALL">All Types</option>
                <option value="algorithm">Algorithm</option>
                <option value="certificate">Certificate</option>
                <option value="key">Key</option>
                <option value="protocol">Protocol</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1.5 border-t border-white/[0.06]">
          <span>
            Showing <strong className="text-white font-mono">{filteredAssets.length}</strong> of {assets.length} components
          </span>
          {(statusFilter !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main CBOM Data Table */}
      <div className="nexus-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08080A]/90 text-[#71717A] uppercase text-[10px] font-semibold tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Quantum Status</th>
                <th className="py-2.5 px-4">QARS</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#A6A6AD]">
              {filteredAssets.map((asset) => {
                const isExpanded = expandedRow === asset.id;
                return (
                  <React.Fragment key={asset.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : asset.id)}
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        isExpanded ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white font-mono">{asset.algorithm}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#18181E] text-[#A6A6AD] border border-white/10 font-mono uppercase">
                            {asset.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#A6A6AD]">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
                          <span className="truncate max-w-xs">{asset.file}</span>
                          {asset.line > 0 && <span className="text-[#52525B]">:{asset.line}</span>}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={asset.quantum_status} size="sm" />
                      </td>

                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            asset.qars_score >= 80
                              ? "text-rose-400"
                              : asset.qars_score >= 40
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {asset.qars_score}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-emerald-400 font-mono">{asset.replacement}</div>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {asset.remediation && (
                            <Link
                              href={`/remediation?asset_id=${asset.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-pill-dark text-[11px] py-1 px-2.5 hover:border-purple-500/40"
                            >
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span>Fix</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            className="p-1 text-[#71717A] hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Finding Detail Row */}
                    {isExpanded && (
                      <tr className="bg-[#0A0A0D]/90">
                        <td colSpan={6} className="p-3.5 border-b border-white/[0.06]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div>
                                <span className="text-[#71717A] text-[11px] font-medium">Attack Vector:</span>
                                <p className="text-rose-400 font-medium text-[11px] mt-0.5 font-mono">{asset.attack_vector}</p>
                              </div>
                              <div>
                                <span className="text-[#71717A] text-[11px] font-medium">NIST Specification:</span>
                                <p className="text-emerald-400 font-medium text-[11px] mt-0.5 font-mono">{asset.nist_standard}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[#71717A] text-[11px] font-medium">Code Snippet:</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(asset.id, asset.code_snippet);
                                  }}
                                  className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                                >
                                  {copiedId === asset.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-2.5 bg-[#070709] border border-white/[0.06] text-[#F5F5F5] font-mono text-[11px] rounded-xl overflow-x-auto">
                                {asset.code_snippet}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
