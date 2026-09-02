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
        <div className="h-64 relative nexus-card p-4 flex items-center justify-center bg-white border-[#E8E2D5]">
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
                    stroke="#FFFFFF"
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
                      <div className="bg-white border border-[#E8E2D5] p-2.5 rounded-xl shadow-lg text-xs">
                        <p className="font-bold text-[#1C1917]">{item.name}</p>
                        <p style={{ color: item.color }} className="font-semibold mt-0.5 font-mono">
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
            <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
              Cryptographic Threat Distribution (Click to filter)
            </h4>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs font-semibold text-[#8B5E34] hover:underline"
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
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#FAF7F2] border-[#C28E58] shadow-md"
                      : "bg-white border-[#E8E2D5] hover:border-[#D5CBB9]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xl font-extrabold text-[#1C1917] font-mono">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1C1917] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#78716C] mt-0.5 font-mono">
                    {((item.value / assets.length) * 100).toFixed(1)}% of total
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Matrix / Treemap-Style Grid */}
      <div className="nexus-card p-5 bg-white border-[#E8E2D5]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-[#1C1917]">
            Quantum Threat Matrix ({filteredAssets.length} Assets)
          </h4>
          <span className="text-xs text-[#78716C]">
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
                className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isBroken
                    ? "bg-[#FEF2F2] border-[#FEE2E2] hover:border-[#FECACA] shadow-2xs"
                    : isWeakened
                    ? "bg-[#FFFBEB] border-[#FEF3C7] hover:border-[#FDE68A] shadow-2xs"
                    : "bg-[#F0FDF4] border-[#DCFCE7] hover:border-[#BBF7D0] shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase text-[#78716C]">
                      {asset.language}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                        isBroken
                          ? "bg-white text-[#991B1B] border border-[#FECACA]"
                          : isWeakened
                          ? "bg-white text-[#92400E] border border-[#FDE68A]"
                          : "bg-white text-[#166534] border border-[#BBF7D0]"
                      }`}
                    >
                      {asset.qars_score} QARS
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#1C1917] truncate font-mono">
                    {asset.algorithm}
                  </p>
                </div>
                <p className="text-[11px] font-mono text-[#78716C] truncate mt-2">
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
