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
    <div className="nexus-card p-5 space-y-5">
      {/* Alert Header Box */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
          isCritical
            ? "bg-rose-50/70 border-rose-200"
            : isNear
            ? "bg-amber-50/70 border-amber-200"
            : "bg-emerald-50/70 border-emerald-200"
        }`}
      >
        {isCritical ? (
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : isNear ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        )}

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wide ${
                isCritical
                  ? "text-rose-700"
                  : isNear
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              {isCritical
                ? "Active HNDL Threat"
                : isNear
                ? "Elevated Migration Risk"
                : "Quantum-Safe Margin"}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              X + Y ({sumXY}y) {isCritical ? ">" : "≤"} Z ({z}y)
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            {isCritical
              ? `${breachYears.toFixed(1)} Year Harvest Now, Decrypt Later Exposure Window`
              : "Zero Exposure Window — Migration Completes Before Q-Day"}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
            {isCritical
              ? `Adversaries harvesting encrypted network traffic today will possess quantum decryption capabilities by ~${qDayYear}, exposing secrets before the required ${x}-year data secrecy expires.`
              : `Migration is scheduled to finish by ~${migrationEndYear}, maintaining data confidentiality before estimated Q-Day in ~${qDayYear}.`}
          </p>
        </div>
      </div>

      {/* Visual Horizontal Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Current Year: <strong className="text-slate-900">{currentYear}</strong></span>
          <span>Estimated Q-Day: <strong className="text-rose-600 font-semibold">{qDayYear}</strong> (in {z} yrs)</span>
        </div>

        {/* Timeline Bar Track */}
        <div className="relative w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex items-center border border-slate-200">
          {/* Safe Window */}
          <div
            className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-semibold px-2"
            style={{ width: `${getPct(Math.min(sumXY, z))}%` }}
          >
            Safe Migration
          </div>

          {/* Breach Window if Critical */}
          {isCritical && (
            <div
              className="h-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold px-2 relative overflow-hidden"
              style={{ width: `${getPct(sumXY) - getPct(z)}%` }}
            >
              Breach ({breachYears.toFixed(1)}y)
            </div>
          )}

          {/* Remaining timeline track */}
          <div className="flex-1 h-full bg-slate-100" />

          {/* Marker: Q-Day */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-20"
            style={{ left: `${getPct(z)}%` }}
          />

          {/* Marker: Migration End */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-10"
            style={{ left: `${getPct(y)}%` }}
          />
        </div>

        {/* Milestone Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Shelf Life (X)</span>
            <span className="font-bold text-slate-900 text-sm">{x} Years</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Migration Time (Y)</span>
            <span className="font-bold text-indigo-600 text-sm">{y} Years</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Q-Day Horizon (Z)</span>
            <span className="font-bold text-rose-600 text-sm">{z} Years</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Breach Window</span>
            <span
              className={`font-bold text-sm ${
                isCritical ? "text-rose-600" : "text-emerald-600"
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
