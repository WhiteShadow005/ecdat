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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-900" />
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              Cryptographic Inventory (CBOM)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
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
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search algorithm or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="ALL">All ({assets.length})</option>
                <option value="BROKEN">Broken (Shor's)</option>
                <option value="WEAKENED">Weakened (Grover's)</option>
                <option value="SAFE">Quantum Safe</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="ALL">All Types</option>
                <option value="asymmetric">Asymmetric</option>
                <option value="symmetric">Symmetric</option>
                <option value="hash">Hash</option>
                <option value="certificate">Certificate</option>
                <option value="protocol">Protocol</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredAssets.length}</strong> of {assets.length} components
          </span>
          {(statusFilter !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="text-slate-600 hover:text-slate-900 font-semibold"
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
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Algorithm & Type</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Quantum Status</th>
                <th className="py-2.5 px-4">QARS</th>
                <th className="py-2.5 px-4">NIST Replacement</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAssets.map((asset) => {
                const isExpanded = expandedRow === asset.id;
                return (
                  <React.Fragment key={asset.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : asset.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isExpanded ? "bg-slate-50/70" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900">{asset.algorithm}</div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono uppercase">
                            {asset.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{asset.file}</span>
                          {asset.line > 0 && <span className="text-slate-400">:{asset.line}</span>}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={asset.quantum_status} size="sm" />
                      </td>

                      <td className="py-2.5 px-4">
                        <span
                          className={`font-bold ${
                            asset.qars_score >= 80
                              ? "text-rose-600"
                              : asset.qars_score >= 40
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {asset.qars_score}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{asset.replacement}</div>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {asset.remediation && (
                            <Link
                              href={`/remediation?asset_id=${asset.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] inline-flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Fix</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600"
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
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-3.5 border-b border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5">
                              <div>
                                <span className="text-slate-400 text-[11px] font-medium">Attack Vector:</span>
                                <p className="text-slate-800 font-medium text-[11px] mt-0.5">{asset.attack_vector}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[11px] font-medium">NIST Specification:</span>
                                <p className="text-slate-700 text-[11px] mt-0.5">{asset.nist_standard}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[11px] font-medium">Code Snippet:</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(asset.id, asset.code_snippet);
                                  }}
                                  className="text-[10px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
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
                              <pre className="p-2.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto">
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
