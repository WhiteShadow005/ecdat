"use client";

import React, { useState } from "react";
import { useScan } from "@/context/ScanContext";
import { mockMoscaPresets } from "@/lib/mock_data";
import { MoscaChart } from "@/components/charts/MoscaChart";
import { Hourglass, Sliders } from "lucide-react";

export default function MoscaPage() {
  const { scanData } = useScan();
  const defaultMosca = scanData.mosca || { x: 15, y: 4, z: 7 };

  const [selectedPreset, setSelectedPreset] = useState<string>("Defense & Tactical Systems");
  const [x, setX] = useState<number>(defaultMosca.x || 15);
  const [y, setY] = useState<number>(defaultMosca.y || 4);
  const [z, setZ] = useState<number>(defaultMosca.z || 7);

  const handleApplyPreset = (preset: typeof mockMoscaPresets[0]) => {
    setSelectedPreset(preset.name);
    setX(preset.x);
    setY(preset.y);
    setZ(preset.z);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-slate-900" />
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              Mosca HNDL Timeline Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model Harvest Now, Decrypt Later exposure windows based on Michele Mosca's Theorem (X + Y &gt; Z).
          </p>
        </div>

        <div className="text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          Formula: <strong className="text-slate-900 font-mono">X (Shelf Life) + Y (Migration) &gt; Z (Q-Day)</strong>
        </div>
      </div>

      {/* Preset Sector Selectors */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Industry Sector Profiles:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockMoscaPresets.map((preset) => {
            const isSelected = selectedPreset === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {preset.label}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    X:{preset.x}y Y:{preset.y}y
                  </span>
                </div>
                <p
                  className={`text-[11px] line-clamp-1 ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Timeline Visualization Component */}
      <MoscaChart x={x} y={y} z={z} />

      {/* Sliders & Parameter Tuning */}
      <div className="nexus-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Custom Variable Simulation
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Adjust variables to calculate custom breach exposure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider X */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                X — Data Shelf Life
              </span>
              <span className="font-bold text-slate-900">{x} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Required secret confidentiality period</span>
          </div>

          {/* Slider Y */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Y — Migration Time
              </span>
              <span className="font-bold text-indigo-600">{y} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Time to re-engineer to NIST PQC</span>
          </div>

          {/* Slider Z */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Z — Q-Day Horizon
              </span>
              <span className="font-bold text-rose-600">{z} Years</span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              value={z}
              onChange={(e) => setZ(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Years until adversary deploys CRQC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
