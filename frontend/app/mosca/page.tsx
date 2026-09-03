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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-[#1C1917]" />
            <h1 className="text-lg md:text-xl font-bold text-[#1C1917] tracking-tight font-display">
              Mosca HNDL Timeline Simulator
            </h1>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5">
            Model Harvest Now, Decrypt Later exposure windows based on Michele Mosca's Theorem (X + Y &gt; Z).
          </p>
        </div>

        <div className="text-xs font-mono text-[#57534E] bg-white px-3.5 py-1.5 rounded-full border border-[#E8E2D5] shadow-2xs">
          Formula: <strong className="text-[#1C1917]">X (Shelf Life) + Y (Migration) &gt; Z (Q-Day)</strong>
        </div>
      </div>

      {/* Preset Sector Selectors */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">
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
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#FAF7F2] border-[#C28E58] shadow-md"
                    : "bg-white border-[#E8E2D5] hover:border-[#D5CBB9] text-[#57534E] shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-bold ${isSelected ? "text-[#1C1917]" : "text-[#1C1917]"}`}>
                    {preset.label}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected ? "bg-white text-[#8B5E34] border border-[#C28E58]" : "bg-[#FAF7F2] text-[#78716C] border border-[#E8E2D5]"
                    }`}
                  >
                    X:{preset.x}y Y:{preset.y}y
                  </span>
                </div>
                <p
                  className={`text-[11px] line-clamp-1 ${
                    isSelected ? "text-[#57534E]" : "text-[#78716C]"
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
      <div className="nexus-card p-5 space-y-4 bg-white border-[#E8E2D5] shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C28E58]" />
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider font-mono">
              Custom Variable Simulation
            </h3>
          </div>
          <span className="text-[11px] text-[#78716C] font-semibold font-mono">
            Adjust variables to calculate custom breach exposure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider X */}
          <div className="space-y-1.5 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E2D5]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#57534E]">
                X — Data Shelf Life
              </span>
              <span className="font-bold text-[#1C1917] font-mono">{x} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-[#8B5E34] cursor-pointer"
            />
            <span className="text-[10px] text-[#78716C] block font-mono">Required secret confidentiality period</span>
          </div>

          {/* Slider Y */}
          <div className="space-y-1.5 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E2D5]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#57534E]">
                Y — Migration Time
              </span>
              <span className="font-bold text-[#8B5E34] font-mono">{y} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full accent-[#8B5E34] cursor-pointer"
            />
            <span className="text-[10px] text-[#78716C] block font-mono">Time to re-engineer to NIST PQC</span>
          </div>

          {/* Slider Z */}
          <div className="space-y-1.5 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E2D5]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#57534E]">
                Z — Q-Day Horizon
              </span>
              <span className="font-bold text-[#991B1B] font-mono">{z} Years</span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              value={z}
              onChange={(e) => setZ(Number(e.target.value))}
              className="w-full accent-[#DC2626] cursor-pointer"
            />
            <span className="text-[10px] text-[#78716C] block font-mono">Years until adversary deploys CRQC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
