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

  // Color gradient determination for quiet-luxury quantum palette
  const getGradient = () => {
    if (clampedPercentage >= 75) return { id: "safeGrad", stroke: "#10b981", glow: "rgba(16, 185, 129, 0.35)" };
    if (clampedPercentage >= 40) return { id: "warnGrad", stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)" };
    return { id: "violetGrad", stroke: "#a855f7", glow: "rgba(168, 85, 247, 0.4)" };
  };

  const { id, stroke, glow } = getGradient();

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
            <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Gradient Progress Arc */}
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
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 8px ${glow})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F5] font-mono">
            {clampedPercentage.toFixed(1)}%
          </span>
          <span className="text-[10px] font-semibold text-[#A6A6AD] tracking-widest uppercase mt-0.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            PQC Ready
          </span>
        </div>
      </div>

      {label && (
        <div className="text-center mt-3">
          <p className="text-xs font-semibold text-[#F5F5F5]">{label}</p>
          {sublabel && <p className="text-[11px] text-[#71717A] mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};
