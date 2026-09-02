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
    sm: "px-2 py-0.5 text-[10px] font-semibold rounded-full",
    md: "px-2.5 py-0.5 text-xs font-semibold rounded-full",
    lg: "px-3 py-1 text-sm font-semibold rounded-full",
  }[size];

  if (status) {
    switch (status) {
      case "BROKEN":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-[#FEF2F2] text-[#991B1B] border border-[#FEE2E2] shadow-2xs ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            {text || "Broken (Shor's)"}
          </span>
        );
      case "WEAKENED":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-[#FFFBEB] text-[#92400E] border border-[#FEF3C7] shadow-2xs ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            {text || "Weakened (Grover's)"}
          </span>
        );
      case "SAFE":
        return (
          <span
            className={`inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] shadow-2xs ${sizeClasses} ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
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
            className={`inline-flex items-center gap-1 bg-[#FEF2F2] text-[#991B1B] border border-[#FEE2E2] font-mono font-bold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Critical"}
          </span>
        );
      case "high":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-[#FFFBEB] text-[#92400E] border border-[#FEF3C7] font-mono font-bold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "High"}
          </span>
        );
      case "medium":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7] font-mono font-bold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Medium"}
          </span>
        );
      case "safe":
        return (
          <span
            className={`inline-flex items-center gap-1 bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] font-mono font-bold uppercase tracking-wide text-[10px] ${sizeClasses} ${className}`}
          >
            {text || "Safe"}
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center bg-[#F6F2EB] text-[#78716C] border border-[#E8E2D5] ${sizeClasses} ${className}`}
    >
      {text || "Unknown"}
    </span>
  );
};
