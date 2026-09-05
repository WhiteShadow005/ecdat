"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface LandingFooterProps {
  buttonText?: string;
  buttonHref?: string;
  leftText?: string;
  rightText?: string;
}

export function LandingFooter({
  buttonText = "Launch Dashboard",
  buttonHref = "/dashboard",
  leftText = "Built for NTRO • SIH 2026",
  rightText = "NIST FIPS 203/204 • CycloneDX 1.6",
}: LandingFooterProps) {
  return (
    <footer className="subpage-footer-bar">
      {/* Left Info */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-white/80" />
        <span className="font-mono text-xs text-white/70">{leftText}</span>
      </div>

      {/* Center CTA Button */}
      <Link
        href={buttonHref}
        prefetch={true}
        className="cta-btn text-xs font-bold"
        style={{ marginTop: 0 }}
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline-block" />
      </Link>

      {/* Right Info */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="font-mono text-xs text-white/70">{rightText}</span>
      </div>
    </footer>
  );
}
