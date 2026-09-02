"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { CryptoAsset } from "@/lib/types";

interface RiskBarProps {
  assets: CryptoAsset[];
}

export const RiskBar: React.FC<RiskBarProps> = ({ assets }) => {
  // Aggregate findings by language
  const languageMap = new Map<
    string,
    { language: string; broken: number; weakened: number; safe: number; total: number }
  >();

  assets.forEach((a) => {
    const lang = a.language.charAt(0).toUpperCase() + a.language.slice(1);
    if (!languageMap.has(lang)) {
      languageMap.set(lang, { language: lang, broken: 0, weakened: 0, safe: 0, total: 0 });
    }
    const entry = languageMap.get(lang)!;
    entry.total += 1;
    if (a.quantum_status === "BROKEN") entry.broken += 1;
    else if (a.quantum_status === "WEAKENED") entry.weakened += 1;
    else entry.safe += 1;
  });

  const chartData = Array.from(languageMap.values()).sort((a, b) => b.total - a.total);

  return (
    <div className="nexus-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white">
          Vulnerability Distribution by Asset Type & Language
        </h4>
        <span className="text-xs text-slate-400">
          Grouped by Stack
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.05)" vertical={false} />
            <XAxis
              dataKey="language"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "rgba(56, 189, 248, 0.12)" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "rgba(56, 189, 248, 0.12)" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#07111F] border border-slate-800 p-3 rounded-xl shadow-xl text-xs font-mono">
                      <p className="font-bold text-white mb-1.5">{label}</p>
                      {payload.map((p: any) => (
                        <div
                          key={p.name}
                          className="flex justify-between gap-4 py-0.5"
                          style={{ color: p.color }}
                        >
                          <span className="capitalize">{p.name}:</span>
                          <span className="font-bold">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-slate-300 capitalize mr-3 font-medium">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="broken"
              name="Broken (Shor's)"
              stackId="a"
              fill="#ef4444"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="weakened"
              name="Weakened (Grover's)"
              stackId="a"
              fill="#f59e0b"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="safe"
              name="Quantum Safe"
              stackId="a"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
