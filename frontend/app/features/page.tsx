"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  FileCode,
  Sparkles,
  ShieldAlert,
  Hourglass,
  FileSpreadsheet,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Multi-Engine Discovery",
      desc: "Deep AST traversal and binary regex parsing across Python, Java, Go, X.509 certificates and TLS configs.",
      icon: FileCode,
      badge: "AST Engine",
      link: "/scan",
    },
    {
      title: "Gemini AI Semantic Detection",
      desc: "LLM semantic scanner detects hidden crypto wrappers, custom primitives and dynamic cipher instances.",
      icon: Sparkles,
      badge: "Gemini AI",
      link: "/remediation",
    },
    {
      title: "QARS 0–100 Risk Engine",
      desc: "Standardized quantum risk score combining weakness, exposure, criticality, and threat factors for audit priority.",
      icon: ShieldAlert,
      badge: "Risk 0-100",
      link: "/heatmap",
    },
    {
      title: "Mosca HNDL Simulator",
      desc: "Mathematical timeline engine modeling Harvest Now, Decrypt Later exposure windows via X + Y > Z.",
      icon: Hourglass,
      badge: "Threat Model",
      link: "/mosca",
    },
    {
      title: "1-Click AI Code Remediator",
      desc: "Generates production-ready side-by-side Git diff patches upgrading RSA/ECDSA to NIST FIPS 203/204.",
      icon: Zap,
      badge: "1-Click Fix",
      link: "/remediation",
    },
    {
      title: "CycloneDX 1.6 CBOM Exporter",
      desc: "Exports ECMA-424 standardized JSON, executive PDF compliance reports, and CSV cryptographic inventories.",
      icon: FileSpreadsheet,
      badge: "Compliance",
      link: "/reports",
    },
  ];

  return (
    <div className="subpage-viewport">
      {/* Video Background with Scoped Contrast Overlay */}
      <div className="bg bg-subpage-overlay">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* 1) Top Header */}
      <LandingHeader />

      {/* 2) Centered Content Flow */}
      <div className="subpage-content-flow">
        {/* Title */}
        <div className="subpage-center">
          <div className="trust-row anim" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <div className="avatar-ring avatar-1">
              <div className="avatar-inner">
                <i className="fa-solid fa-shield-halved" />
              </div>
            </div>
            <div className="avatar-ring avatar-2">
              <div className="avatar-inner">
                <i className="fa-solid fa-microchip" />
              </div>
            </div>
            <div className="avatar-ring avatar-3">
              <div className="avatar-inner">
                <i className="fa-solid fa-lock" />
              </div>
            </div>
            <div className="trust-pill">
              <span className="trust-text">6 Post-Quantum Security Capabilities</span>
            </div>
          </div>

          <h1 className="dot-headline text-3xl sm:text-5xl md:text-6xl text-white">
            Core Capabilities
          </h1>

          <p className="subhead text-white/90 font-sans">
            Automated cryptographic discovery, Mosca threat modeling, and 1-click NIST PQC migration.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 w-full">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                href={f.link}
                className="retro-card p-4 sm:p-4.5 flex flex-col justify-between group hover:border-white/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 uppercase">
                      {f.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-white/75 font-sans mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-white/70 group-hover:text-white">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3) Bottom Footer */}
      <LandingFooter buttonText="Launch Dashboard" buttonHref="/dashboard" />
    </div>
  );
}
