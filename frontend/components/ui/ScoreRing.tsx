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

  // Color gradient determination for warm luxury palette matching screenshot
  const getGradient = () => {
    if (clampedPercentage >= 75) return { id: "safeGrad", stroke: "#15803D", glow: "rgba(21, 128, 61, 0.2)" };
    if (clampedPercentage >= 40) return { id: "warnGrad", stroke: "#D97706", glow: "rgba(217, 119, 6, 0.2)" };
    return { id: "bronzeGrad", stroke: "#8B5E34", glow: "rgba(139, 94, 52, 0.15)" };
  };

  const { id } = getGradient();

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5E34" />
              <stop offset="60%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#C28E58" />
            </linearGradient>
            <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EDE7DC"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${id})`}
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

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1C1917] font-mono">
            {clampedPercentage.toFixed(1)}%
          </span>
          <span className="text-[9px] font-bold text-[#78716C] tracking-wider uppercase mt-1 px-2.5 py-0.5 rounded-full bg-[#F6F2EB] border border-[#E8E2D5]">
            PQC Ready
          </span>
        </div>
      </div>

      {label && (
        <div className="text-center mt-3 space-y-0.5">
          <p className="text-xs font-bold text-[#1C1917]">{label}</p>
          {sublabel && <p className="text-[11px] text-[#78716C]">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};
