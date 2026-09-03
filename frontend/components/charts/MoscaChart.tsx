"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface MoscaChartProps {
  x: number; // Shelf Life (years)
  y: number; // Migration Time (years)
  z: number; // Q-Day (years)
  currentYear?: number;
}

export const MoscaChart: React.FC<MoscaChartProps> = ({
  x,
  y,
  z,
  currentYear = 2026,
}) => {
  const sumXY = x + y;
  const isCritical = sumXY > z;
  const isNear = Math.abs(sumXY - z) <= 1;
  const breachYears = Math.max(0, sumXY - z);
  const qDayYear = currentYear + z;
  const migrationEndYear = currentYear + y;
  const totalTimelineSpan = Math.max(35, Math.ceil(Math.max(sumXY, z, 20) * 1.2));

  const getPct = (years: number) => Math.min(100, (years / totalTimelineSpan) * 100);

  return (
    <div className="nexus-card p-5 space-y-5 bg-white border-[#E8E2D5]">
      {/* Alert Header Box */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
          isCritical
            ? "bg-[#FEF2F2] border-[#FEE2E2]"
            : isNear
            ? "bg-[#FFFBEB] border-[#FEF3C7]"
            : "bg-[#F0FDF4] border-[#DCFCE7]"
        }`}
      >
        {isCritical ? (
          <ShieldAlert className="w-5 h-5 text-[#991B1B] shrink-0 mt-0.5" />
        ) : isNear ? (
          <AlertTriangle className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
        )}

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wide font-mono ${
                isCritical
                  ? "text-[#991B1B]"
                  : isNear
                  ? "text-[#92400E]"
                  : "text-[#166534]"
              }`}
            >
              {isCritical
                ? "Active HNDL Threat"
                : isNear
                ? "Elevated Migration Risk"
                : "Quantum-Safe Margin"}
            </span>
            <span className="text-[#A8A29E] text-xs">•</span>
            <span className="text-xs text-[#57534E] font-medium font-mono">
              X + Y ({sumXY}y) {isCritical ? ">" : "≤"} Z ({z}y)
            </span>
          </div>

          <h3 className="text-sm font-bold text-[#1C1917]">
            {isCritical
              ? `${breachYears.toFixed(1)} Year Harvest Now, Decrypt Later Exposure Window`
              : "Zero Exposure Window — Migration Completes Before Q-Day"}
          </h3>

          <p className="text-xs text-[#57534E] leading-relaxed pt-0.5">
            {isCritical
              ? `Adversaries harvesting encrypted network traffic today will possess quantum decryption capabilities by ~${qDayYear}, exposing secrets before the required ${x}-year data secrecy expires.`
              : `Migration is scheduled to finish by ~${migrationEndYear}, maintaining data confidentiality before estimated Q-Day in ~${qDayYear}.`}
          </p>
        </div>
      </div>

      {/* Visual Horizontal Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#57534E] font-medium">
          <span>Current Year: <strong className="text-[#1C1917] font-mono">{currentYear}</strong></span>
          <span>Estimated Q-Day: <strong className="text-[#991B1B] font-bold font-mono">{qDayYear}</strong> (in {z} yrs)</span>
        </div>

        {/* Timeline Bar Track */}
        <div className="relative w-full h-8 bg-[#F5F0E8] rounded-xl overflow-hidden flex items-center border border-[#E8E2D5]">
          {/* Safe Window */}
          <div
            className="h-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-semibold px-2 font-mono"
            style={{ width: `${getPct(Math.min(sumXY, z))}%` }}
          >
            Safe Migration
          </div>

          {/* Breach Window if Critical */}
          {isCritical && (
            <div
              className="h-full bg-[#DC2626] flex items-center justify-center text-[10px] text-white font-bold px-2 relative overflow-hidden font-mono"
              style={{ width: `${getPct(sumXY) - getPct(z)}%` }}
            >
              Breach ({breachYears.toFixed(1)}y)
            </div>
          )}

          {/* Remaining timeline track */}
          <div className="flex-1 h-full bg-[#F5F0E8]" />

          {/* Marker: Q-Day */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#991B1B] z-20"
            style={{ left: `${getPct(z)}%` }}
          />

          {/* Marker: Migration End */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#C28E58] z-10"
            style={{ left: `${getPct(y)}%` }}
          />
        </div>

        {/* Milestone Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#E8E2D5]">
            <span className="text-[#78716C] block text-[11px]">Shelf Life (X)</span>
            <span className="font-bold text-[#1C1917] text-sm font-mono">{x} Years</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#E8E2D5]">
            <span className="text-[#78716C] block text-[11px]">Migration Time (Y)</span>
            <span className="font-bold text-[#8B5E34] text-sm font-mono">{y} Years</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#E8E2D5]">
            <span className="text-[#78716C] block text-[11px]">Q-Day Horizon (Z)</span>
            <span className="font-bold text-[#991B1B] text-sm font-mono">{z} Years</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#E8E2D5]">
            <span className="text-[#78716C] block text-[11px]">Breach Window</span>
            <span
              className={`font-bold text-sm font-mono ${
                isCritical ? "text-[#991B1B]" : "text-[#166534]"
              }`}
            >
              {isCritical ? `+${breachYears.toFixed(1)} Years` : "0 (Protected)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
