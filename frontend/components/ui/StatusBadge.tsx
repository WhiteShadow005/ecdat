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
            className={`inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {text || "Broken (Shor's)"}
          </span>
        );
      case "WEAKENED":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {text || "Weakened (Grover's)"}
          </span>
        );
      case "SAFE":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
            className={`inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 font-medium uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Critical"}
          </span>
        );
      case "high":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-medium uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "High"}
          </span>
        );
      case "medium":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Medium"}
          </span>
        );
      case "safe":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Safe"}
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses} ${className}`}
    >
      {text || "Unknown"}
    </span>
  );
};
