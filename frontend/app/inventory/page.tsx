"use client";

import React, { useState, useMemo } from "react";
import { useScan } from "@/context/ScanContext";
import { CryptoAsset } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Layers,
  Search,
  FileCode,
  BrainCircuit,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1C1917]" />
            <h1 className="text-lg md:text-xl font-bold text-[#1C1917] tracking-tight font-display">
              Cryptographic Inventory (CBOM)
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
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
      <div className="nexus-card p-3.5 space-y-3 bg-white border-[#E8E2D5] shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search algorithm or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C28E58] transition-colors font-mono"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#78716C] font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-full px-3 py-1 text-xs text-[#1C1917] focus:outline-none focus:border-[#C28E58] font-mono"
              >
                <option value="ALL">All ({assets.length})</option>
                <option value="BROKEN">Broken (Shor's)</option>
                <option value="WEAKENED">Weakened (Grover's)</option>
                <option value="SAFE">Quantum Safe</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#78716C] font-semibold">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-full px-3 py-1 text-xs text-[#1C1917] focus:outline-none focus:border-[#C28E58] font-mono"
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
        <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1.5 border-t border-[#E8E2D5]">
          <span>
            Showing <strong className="text-[#1C1917] font-mono">{filteredAssets.length}</strong> of {assets.length} components
          </span>
          {(statusFilter !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="text-[#8B5E34] hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main CBOM Data Table */}
      <div className="nexus-card overflow-hidden bg-white border-[#E8E2D5] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#78716C] uppercase text-[10px] font-bold tracking-wider border-b border-[#E8E2D5]">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Quantum Status</th>
                <th className="py-2.5 px-4">QARS</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]/80 text-[#57534E]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#78716C]">
                    No cryptographic components found. Upload a repository archive to populate inventory.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                const isExpanded = expandedRow === asset.id;
                return (
                  <React.Fragment key={asset.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : asset.id)}
                      className={`hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer ${
                        isExpanded ? "bg-[#FAF7F2]/80" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-[#1C1917] font-mono">{asset.algorithm}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#57534E] border border-[#E8E2D5] font-mono uppercase">
                            {asset.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#57534E]">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                          <span className="truncate max-w-xs">{asset.file}</span>
                          {asset.line > 0 && <span className="text-[#78716C]">:{asset.line}</span>}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={asset.quantum_status} size="sm" />
                      </td>

                      <td className="py-2.5 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            asset.qars_score >= 80
                              ? "text-[#991B1B]"
                              : asset.qars_score >= 40
                              ? "text-[#92400E]"
                              : "text-[#166534]"
                          }`}
                        >
                          {asset.qars_score}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#166534] font-mono">{asset.replacement}</div>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {asset.remediation && (
                            <Link
                              href={`/remediation?asset_id=${asset.id}`}
                              prefetch={true}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-pill-light text-[11px] py-1 px-2.5"
                            >
                              <BrainCircuit className="w-3 h-3 text-[#C28E58]" />
                              <span>Fix</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            className="p-1 text-[#78716C] hover:text-[#1C1917]"
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
                      <tr className="bg-[#FAF7F2]">
                        <td colSpan={6} className="p-3.5 border-b border-[#E8E2D5]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div>
                                <span className="text-[#78716C] text-[11px] font-semibold">Attack Vector:</span>
                                <p className="text-[#991B1B] font-semibold text-[11px] mt-0.5 font-mono">{asset.attack_vector}</p>
                              </div>
                              <div>
                                <span className="text-[#78716C] text-[11px] font-semibold">NIST Specification:</span>
                                <p className="text-[#166534] font-semibold text-[11px] mt-0.5 font-mono">{asset.nist_standard}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[#78716C] text-[11px] font-semibold">Code Snippet:</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(asset.id, asset.code_snippet);
                                  }}
                                  className="text-[10px] text-[#8B5E34] hover:underline flex items-center gap-1 font-bold"
                                >
                                  {copiedId === asset.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-2.5 bg-white border border-[#E8E2D5] text-[#1C1917] font-mono text-[11px] rounded-xl overflow-x-auto shadow-2xs">
                                {asset.code_snippet}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
