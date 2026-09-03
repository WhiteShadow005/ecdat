"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function MoscaTimelineDiagram() {
  const [x, setX] = useState(15); // Data shelf life
  const [y, setY] = useState(4);  // Migration time
  const [z, setZ] = useState(7);  // Q-Day estimate

  const totalThreatTime = x + y;
  const isCritical = totalThreatTime > z;
  const breachWindow = isCritical ? totalThreatTime - z : 0;

  return (
    <div className="retro-card w-full space-y-5 p-5 md:p-6 border border-red-500/30 shadow-cyber-red">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Mosca's Theorem HNDL Visualizer
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Formula: X (Shelf Life) + Y (Migration) &gt; Z (Q-Day)
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isCritical
              ? "bg-red-950 text-red-300 border border-red-500/50 animate-pulse"
              : "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
          }`}
        >
          {isCritical ? "Active Threat" : "Safe Margin"}
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 space-y-1">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>X: Shelf Life</span>
            <span className="text-cyan-400 font-bold">{x} yrs</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 space-y-1">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>Y: Migration</span>
            <span className="text-purple-400 font-bold">{y} yrs</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 space-y-1">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>Z: Q-Day Horizon</span>
            <span className="text-yellow-400 font-bold">{z} yrs</span>
          </div>
          <input
            type="range"
            min="3"
            max="15"
            value={z}
            onChange={(e) => setZ(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Visual Timeline Comparison Bar */}
      <div className="space-y-2 font-mono text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">
              Required Security Horizon (X + Y = {totalThreatTime} Years)
            </span>
            <span className="text-red-400 font-bold">
              {isCritical ? `+${breachWindow}y Exposure Window` : "Covered"}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
            <div
              style={{ width: `${Math.min((x / 35) * 100, 70)}%` }}
              className="bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-black"
              title="Data Shelf Life"
            >
              X: {x}y
            </div>
            <div
              style={{ width: `${Math.min((y / 35) * 100, 30)}%` }}
              className="bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white"
              title="Migration Time"
            >
              Y: {y}y
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Quantum Computer Availability (Z = {z} Years / 2033)</span>
            <span className="text-yellow-400 font-bold">{z} Years</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
            <div
              style={{ width: `${Math.min((z / 35) * 100, 100)}%` }}
              className="bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-black"
            >
              Z: {z}y
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div
        className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
          isCritical
            ? "bg-red-950/60 border-red-500/40 text-red-200"
            : "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-[11px] leading-tight">
            {isCritical
              ? `Adversaries harvesting today can decrypt your data in ${2026 + z} with a ${breachWindow}-year vulnerability window.`
              : "Current migration timeline completes prior to estimated Q-Day."}
          </span>
        </div>

        <Link
          href="/mosca"
          className="shrink-0 text-[10px] font-bold underline flex items-center gap-1 text-white hover:text-cyan-300"
        >
          Open Simulator <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
