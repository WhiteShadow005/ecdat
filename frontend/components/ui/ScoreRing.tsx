"use client";

import React from "react";

interface ScoreRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  percentage,
  size = 170,
  strokeWidth = 12,
  label = "Quantum Readiness",
  sublabel = "NIST PQC Baseline",
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Color determination for SOC dark palette
  const getColor = () => {
    if (clampedPercentage >= 75) return { stroke: "#10b981", text: "text-emerald-400", glow: "rgba(16, 185, 129, 0.4)" };
    if (clampedPercentage >= 40) return { stroke: "#f59e0b", text: "text-amber-400", glow: "rgba(245, 158, 11, 0.4)" };
    return { stroke: "#38bdf8", text: "text-sky-400", glow: "rgba(56, 189, 248, 0.4)" };
  };

  const { stroke, text, glow } = getColor();

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(56, 189, 248, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Central percentage reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-bold tracking-tight font-mono ${text}`}>
            {clampedPercentage.toFixed(1)}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-mono">
            PQC Ready
          </span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="text-center mt-3">
          {label && <h4 className="text-xs font-semibold text-slate-200">{label}</h4>}
          {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};
