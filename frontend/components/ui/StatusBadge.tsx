"use client";

import React from "react";
import { QuantumStatus, CriticalityTier } from "@/lib/types";

interface StatusBadgeProps {
  status?: QuantumStatus;
  criticality?: CriticalityTier;
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  criticality,
  text,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-md",
    md: "px-2.5 py-1 text-xs font-medium rounded-lg",
    lg: "px-3 py-1.5 text-sm font-semibold rounded-lg",
  }[size];

  if (status) {
    switch (status) {
      case "BROKEN":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-rose-950/40 text-rose-300 border border-rose-800/60 shadow-[0_0_8px_rgba(244,63,94,0.15)] ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {text || "Broken (Shor's)"}
          </span>
        );
      case "WEAKENED":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-amber-950/40 text-amber-300 border border-amber-800/60 ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {text || "Weakened (Grover's)"}
          </span>
        );
      case "SAFE":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.15)] ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {text || "Quantum Safe"}
          </span>
        );
    }
  }

  if (criticality) {
    switch (criticality) {
      case "critical":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-rose-950/40 text-rose-300 border border-rose-800/60 font-mono font-semibold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Critical"}
          </span>
        );
      case "high":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-800/60 font-mono font-semibold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "High"}
          </span>
        );
      case "medium":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-yellow-950/40 text-yellow-300 border border-yellow-800/60 font-mono font-semibold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Medium"}
          </span>
        );
      case "safe":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-mono font-semibold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Safe"}
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center bg-slate-900 text-slate-400 border border-slate-800 ${sizeClasses} ${className}`}
    >
      {text || "Unknown"}
    </span>
  );
};
