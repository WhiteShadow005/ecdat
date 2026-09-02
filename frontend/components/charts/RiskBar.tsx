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
    <div className="nexus-card p-5 bg-white border-[#E8E2D5]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[#1C1917]">
          Vulnerability Distribution by Asset Type & Language
        </h4>
        <span className="text-xs text-[#78716C]">
          Grouped by Stack
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D5" vertical={false} />
            <XAxis
              dataKey="language"
              stroke="#78716C"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E8E2D5" }}
            />
            <YAxis
              stroke="#78716C"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E8E2D5" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-[#E8E2D5] p-3 rounded-2xl shadow-lg text-xs font-mono">
                      <p className="font-bold text-[#1C1917] mb-1.5">{label}</p>
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
                <span className="text-xs text-[#57534E] capitalize mr-3 font-semibold">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="broken"
              name="Broken (Shor's)"
              stackId="a"
              fill="#DC2626"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="weakened"
              name="Weakened (Grover's)"
              stackId="a"
              fill="#D97706"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="safe"
              name="Quantum Safe"
              stackId="a"
              fill="#15803D"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
