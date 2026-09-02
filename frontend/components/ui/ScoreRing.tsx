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

  // Color determination inspired by Nexus palette
  const getColor = () => {
    if (clampedPercentage >= 75) return { stroke: "#10b981", text: "text-emerald-600", bg: "#ecfdf5" };
    if (clampedPercentage >= 40) return { stroke: "#f59e0b", text: "text-amber-600", bg: "#fffbeb" };
    return { stroke: "#5347ce", text: "text-indigo-600", bg: "#eef2ff" };
  };

  const { stroke, text } = getColor();

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
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
            }}
          />
        </svg>

        {/* Central percentage reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-bold tracking-tight ${text}`}>
            {clampedPercentage.toFixed(1)}%
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            PQC Ready
          </span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="text-center mt-3">
          {label && <h4 className="text-sm font-semibold text-slate-800">{label}</h4>}
          {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};
