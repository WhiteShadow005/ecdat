"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CryptoAsset } from "@/lib/types";

interface HeatmapProps {
  assets: CryptoAsset[];
  onSelectAsset?: (asset: CryptoAsset) => void;
}

export const Heatmap: React.FC<HeatmapProps> = ({ assets, onSelectAsset }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Group assets by status
  const brokenCount = assets.filter((a) => a.quantum_status === "BROKEN").length;
  const weakenedCount = assets.filter((a) => a.quantum_status === "WEAKENED").length;
  const safeCount = assets.filter((a) => a.quantum_status === "SAFE").length;

  const data = [
    { name: "Broken (Shor's Threat)", value: brokenCount, color: "#ef4444", status: "BROKEN" },
    { name: "Weakened (Grover's Threat)", value: weakenedCount, color: "#f59e0b", status: "WEAKENED" },
    { name: "Quantum Safe", value: safeCount, color: "#10b981", status: "SAFE" },
  ];

  const filteredAssets = activeFilter
    ? assets.filter((a) => a.quantum_status === activeFilter)
    : assets;

  return (
    <div className="space-y-6">
      {/* Visual Chart Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Pie / Donut Chart */}
        <div className="h-64 relative nexus-card p-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry) =>
                  setActiveFilter(activeFilter === entry.status ? null : entry.status)
                }
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={activeFilter && activeFilter !== entry.status ? 0.35 : 1}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg text-xs">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p style={{ color: item.color }} className="font-semibold mt-0.5">
                          {item.value} Assets (
                          {((item.value / assets.length) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Stats & Interactive Filter Pills */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cryptographic Threat Distribution (Click to filter)
            </h4>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.map((item) => {
              const isSelected = activeFilter === item.status;
              return (
                <button
                  key={item.name}
                  onClick={() =>
                    setActiveFilter(isSelected ? null : item.status)
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-500 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xl font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {((item.value / assets.length) * 100).toFixed(1)}% of total
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Matrix / Treemap-Style Grid */}
      <div className="nexus-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900">
            Quantum Threat Matrix ({filteredAssets.length} Assets)
          </h4>
          <span className="text-xs text-slate-500">
            Click an algorithm block to inspect details
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredAssets.map((asset) => {
            const isBroken = asset.quantum_status === "BROKEN";
            const isWeakened = asset.quantum_status === "WEAKENED";
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset && onSelectAsset(asset)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-xs flex flex-col justify-between ${
                  isBroken
                    ? "bg-rose-50/60 border-rose-200/80 hover:border-rose-300 hover:bg-rose-50"
                    : isWeakened
                    ? "bg-amber-50/60 border-amber-200/80 hover:border-amber-300 hover:bg-amber-50"
                    : "bg-emerald-50/60 border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {asset.language}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isBroken
                          ? "bg-rose-100 text-rose-700"
                          : isWeakened
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {asset.qars_score} QARS
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {asset.algorithm}
                  </p>
                </div>
                <p className="text-[11px] font-mono text-slate-500 truncate mt-2">
                  {asset.file.split("/").pop()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
