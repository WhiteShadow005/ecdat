"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function ArchitecturePage() {
  const layers = [
    {
      num: "01",
      name: "Discovery & Extraction",
      desc: "AST traversal, CSNP cryptoscan, X.509 cert analysis & TLS config inspection.",
      bullets: ["Python & Java AST", "Go Binaries & Regex", "X.509 & OpenSSH"],
    },
    {
      num: "02",
      name: "Quantum Risk Scoring",
      desc: "QARS 0–100 composite engine & Mosca Theorem (X + Y > Z) timeline calculator.",
      bullets: ["Weakness Factor (40)", "Exposure Factor (25)", "Mosca Threat (15)"],
    },
    {
      num: "03",
      name: "CryptoSense™ AI Engine",
      desc: "On-premise CodeBERT wrapper detection & 1-click NIST PQC Git diff remediator.",
      bullets: ["Dynamic Cipher AST", "FIPS 203/204 Diffs", "liboqs Test Vectors"],
    },
    {
      num: "04",
      name: "Compliance & Exporters",
      desc: "CycloneDX 1.6 ECMA-424 CBOM JSON, WeasyPrint PDF reports & SOC Dashboard.",
      bullets: ["CycloneDX 1.6 JSON", "Executive PDF Briefs", "Real-Time SOC Grid"],
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
                <i className="fa-solid fa-layer-group" />
              </div>
            </div>
            <div className="avatar-ring avatar-2">
              <div className="avatar-inner">
                <i className="fa-solid fa-microchip" />
              </div>
            </div>
            <div className="avatar-ring avatar-3">
              <div className="avatar-inner">
                <i className="fa-solid fa-network-wired" />
              </div>
            </div>
            <div className="trust-pill">
              <span className="trust-text">4-Layer Modular System Pipeline</span>
            </div>
          </div>

          <h1 className="dot-headline text-3xl sm:text-5xl md:text-6xl text-white">
            Pipeline Architecture
          </h1>

          <p className="subhead text-white/90 font-sans">
            End-to-end architecture: Ingestion → Scoring → AI Remediation → CycloneDX 1.6 CBOM.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 w-full">
          {layers.map((l) => (
            <div key={l.num} className="retro-card p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-black">
                    L{l.num}
                  </span>
                  <span className="text-[10px] text-white/60 font-mono uppercase font-bold">Stage 0{l.num}</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{l.name}</h3>
                <p className="text-xs text-white/75 leading-relaxed font-sans">{l.desc}</p>
              </div>

              <div className="pt-2.5 border-t border-white/10 space-y-1.5 font-mono text-[11px] text-white/80">
                {l.bullets.map((b) => (
                  <div key={b} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3) Bottom Footer */}
      <LandingFooter buttonText="Launch Dashboard" buttonHref="/dashboard" />
    </div>
  );
}
