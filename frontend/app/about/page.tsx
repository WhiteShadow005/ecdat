"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Shield } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    { name: "Shaurya Pratap Singh", role: "Tech Lead — Core Backend", focus: "Python AST, cryptoscan, QARS scoring & Mosca engine" },
    { name: "Ojasya Rajput", role: "Backend Dev 2 — Exports & AI", focus: "CycloneDX 1.6 CBOM, Gemini LLM & PDF reports" },
    { name: "Arnav Gupta", role: "Frontend Lead", focus: "Next.js 14 SOC dashboard, Mosca timeline & diff viewer" },
    { name: "Mehek Sharma", role: "Pitch Deck & Strategy Lead", focus: "Problem framing, evaluator Q&A & national security impact" },
    { name: "Jashanpreet Singh", role: "Pitch Deck Technical Lead", focus: "System architecture, NIST PQC standards & Q&A defense" },
    { name: "Sahil Sharma", role: "QA & Testbench Lead", focus: "Vulnerable repo testbed & schema verification" },
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
                <i className="fa-solid fa-medal" />
              </div>
            </div>
            <div className="avatar-ring avatar-3">
              <div className="avatar-inner">
                <i className="fa-solid fa-flag" />
              </div>
            </div>
            <div className="trust-pill">
              <span className="trust-text">Smart India Hackathon 2026 • NTRO</span>
            </div>
          </div>

          <h1 className="dot-headline text-3xl sm:text-5xl md:text-6xl text-white">
            Team ECDAT & Mission
          </h1>

          <p className="subhead text-white/90 font-sans">
            Built for National Technical Research Organisation (NTRO, Prime Minister's Office - India).
          </p>
        </div>

        {/* Mission Banner */}
        <div className="retro-card w-full p-4 font-sans text-xs space-y-1.5 border border-white/20">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Shield className="w-4 h-4 text-white/90" />
            <span>National Security Mission: Defending Indian Infrastructure Against HNDL</span>
          </div>
          <p className="text-white/80 leading-relaxed text-xs">
            ECDAT delivers an automated discovery engine, mathematical Mosca threat modeling, and 1-click NIST PQC migration for defense organizations and critical infrastructure.
          </p>
        </div>

        {/* 6 Team Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
          {teamMembers.map((m) => (
            <div key={m.name} className="retro-card p-3.5 space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{m.name}</h4>
                  <span className="text-[10px] text-white/70 block font-mono">{m.role}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/60 leading-snug pt-1.5 border-t border-white/10 font-sans">
                {m.focus}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3) Bottom Footer */}
      <LandingFooter buttonText="Launch Console" buttonHref="/dashboard" />
    </div>
  );
}
