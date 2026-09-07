"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScan } from "@/context/ScanContext";
import { ScanListItem } from "@/lib/types";
import {
  History,
  RefreshCw,
  FolderOpen,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type SortKey = "timestamp" | "target_name" | "critical_count" | "readiness_pct" | "mosca_status";
type SortDir = "asc" | "desc";

function MoscaBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "CRITICAL")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-semibold">
        <ShieldAlert className="w-3 h-3" />
        CRITICAL
      </span>
    );
  if (s === "HIGH")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-semibold">
        <AlertTriangle className="w-3 h-3" />
        HIGH
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
      <CheckCircle2 className="w-3 h-3" />
      SAFE
    </span>
  );
}

function ReadinessBadge({ pct }: { pct: number }) {
  const color =
    pct >= 70
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : pct >= 40
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold font-mono ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="w-3 h-3 text-[#C4BAA8] opacity-50" />;
  return dir === "asc" ? (
    <ChevronUp className="w-3 h-3 text-[#1C1917]" />
  ) : (
    <ChevronDown className="w-3 h-3 text-[#1C1917]" />
  );
}

export default function AuditHistoryPage() {
  const router = useRouter();
  const { allScans, isHistoryLoading, isBackendLive, refreshHistory, loadHistoricalScan } =
    useScan();

  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const visible = allScans
    .filter((s) => !deletedIds.has(s.scan_id))
    .slice()
    .sort((a, b) => {
      let av: string | number = (a as any)[sortKey] ?? "";
      let bv: string | number = (b as any)[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const handleLoad = async (item: ScanListItem) => {
    setLoadingId(item.scan_id);
    try {
      await loadHistoricalScan(item.scan_id);
      router.push("/dashboard");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (item: ScanListItem) => {
    if (!confirm(`Delete audit record for "${item.target_name}"?`)) return;
    setDeletingId(item.scan_id);
    try {
      const res = await fetch(`${API_BASE}/api/scans/${item.scan_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletedIds((prev) => new Set(prev).add(item.scan_id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const thClass =
    "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#78716C] cursor-pointer select-none hover:text-[#1C1917] transition-colors";

  const totalCritical = visible.filter((s) => (s.mosca_status || "").toUpperCase() === "CRITICAL").length;
  const avgReadiness =
    visible.length
      ? (visible.reduce((s, r) => s + r.readiness_pct, 0) / visible.length).toFixed(1)
      : null;
  const totalAssets = visible.reduce((s, r) => s + r.total_assets, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8E2D5] flex items-center justify-center shadow-2xs">
            <History className="w-5 h-5 text-[#78716C]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#1C1917] tracking-tight">Audit History</h1>
            <p className="text-xs text-[#78716C] mt-0.5">All cryptographic audits stored in the ECDAT database</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D5] text-[11px] shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${isBackendLive ? "bg-emerald-500" : "bg-[#8B5E34]"}`} />
            <span className="font-medium text-[#57534E]">{isBackendLive ? "Live" : "Offline — no history"}</span>
          </div>
          <button
            onClick={refreshHistory}
            disabled={isHistoryLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-semibold text-[#57534E] hover:bg-[#FAF7F2] hover:text-[#1C1917] transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isHistoryLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Audits", value: visible.length, icon: Database, color: "text-[#78716C]" },
          { label: "Critical Repos", value: totalCritical, icon: ShieldAlert, color: "text-red-600" },
          { label: "Avg. Readiness", value: avgReadiness ? `${avgReadiness}%` : "—", icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Assets Scanned", value: totalAssets, icon: Clock, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#E8E2D5] rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-xl font-extrabold text-[#1C1917] font-mono tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl shadow-2xs overflow-hidden">
        {isHistoryLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-[#78716C]">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm font-medium">Loading audit records…</p>
          </div>
        ) : !isBackendLive ? (
          <div className="py-20 flex flex-col items-center gap-3 text-[#A8A29E]">
            <Database className="w-8 h-8 opacity-40" />
            <p className="text-sm font-semibold text-[#78716C]">Backend offline</p>
            <p className="text-xs">Start the backend to see audit history.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-[#A8A29E]">
            <History className="w-8 h-8 opacity-40" />
            <p className="text-sm font-semibold text-[#78716C]">No audits yet</p>
            <p className="text-xs">Run a scan from the Codebase Scanner to populate history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-[#E8E2D5] bg-[#FAF7F2]">
                <tr>
                  {(
                    [
                      { key: "target_name", label: "Repository" },
                      { key: "timestamp", label: "Date" },
                      { key: "critical_count", label: "Critical" },
                      { key: "readiness_pct", label: "PQC Readiness" },
                      { key: "mosca_status", label: "Mosca" },
                    ] as { key: SortKey; label: string }[]
                  ).map(({ key, label }) => (
                    <th key={key} className={thClass} onClick={() => toggleSort(key)}>
                      <span className="flex items-center gap-1">
                        {label}
                        <SortIcon active={sortKey === key} dir={sortDir} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {visible.map((item) => {
                  const date = new Date(item.timestamp);
                  const dateStr = isNaN(date.getTime()) ? item.timestamp : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                  const timeStr = isNaN(date.getTime()) ? "" : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr key={item.scan_id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                          <span className="font-semibold text-[#1C1917] truncate max-w-[160px]" title={item.target_name}>
                            {item.target_name}
                          </span>
                        </div>
                        <div className="text-[9px] text-[#A8A29E] font-mono pl-5 mt-0.5 truncate">{item.scan_id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#1C1917]">{dateStr}</div>
                        <div className="text-[10px] text-[#A8A29E]">{timeStr}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.critical_count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold">
                            {item.critical_count} critical
                          </span>
                        ) : (
                          <span className="text-[#A8A29E]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ReadinessBadge pct={item.readiness_pct} />
                          <div className="flex-1 h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden w-16">
                            <div
                              className={`h-full rounded-full ${
                                item.readiness_pct >= 70 ? "bg-emerald-500" : item.readiness_pct >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(item.readiness_pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <MoscaBadge status={item.mosca_status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleLoad(item)}
                            disabled={loadingId === item.scan_id}
                            title="Load this scan into the dashboard"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1C1917] text-white text-[10px] font-semibold hover:bg-[#292524] transition-all disabled:opacity-50 shadow-2xs"
                          >
                            {loadingId === item.scan_id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FolderOpen className="w-3 h-3" />}
                            Load
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.scan_id}
                            title="Delete this audit record"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E2D5] text-[#78716C] text-[10px] font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            {deletingId === item.scan_id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {visible.length > 0 && (
          <div className="px-4 py-3 border-t border-[#F0EBE3] bg-[#FAF7F2] flex items-center justify-between">
            <span className="text-[10px] text-[#A8A29E]">
              {visible.length} record{visible.length !== 1 ? "s" : ""} · ECDAT Audit Database (SQLite)
            </span>
            <span className="text-[10px] text-[#A8A29E]">Click <strong>Load</strong> to inspect any past scan in the dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}
