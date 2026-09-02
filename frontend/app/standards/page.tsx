"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Shield, Hourglass } from "lucide-react";

export default function StandardsPage() {
  const standards = [
    {
      code: "FIPS 203",
      name: "ML-KEM-768",
      type: "Module-Lattice Key Encapsulation",
      replaces: "RSA-2048/3072, ECDH, Diffie-Hellman",
      stat: "0.04 ms",
      security: "NIST Security Level 3 (128-bit quantum)",
    },
    {
      code: "FIPS 204",
      name: "ML-DSA-65",
      type: "Module-Lattice Digital Signatures",
      replaces: "RSA Signatures, ECDSA (secp256r1/k1)",
      stat: "0.12 ms",
      security: "NIST Primary Signature Standard",
    },
    {
      code: "FIPS 205",
      name: "SLH-DSA",
      type: "Stateless Hash-Based Signatures",
      replaces: "Legacy DSA & Ultra-Long-Term Signatures",
      stat: "Hash-Based",
      security: "SPHINCS+ Math (Lattice-Independent)",
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
                <i className="fa-solid fa-file-contract" />
              </div>
            </div>
            <div className="avatar-ring avatar-3">
              <div className="avatar-inner">
                <i className="fa-solid fa-lock" />
              </div>
            </div>
            <div className="trust-pill">
              <span className="trust-text">NIST PQC & ECMA-424 Specifications</span>
            </div>
          </div>

          <h1 className="dot-headline text-3xl sm:text-5xl md:text-6xl text-white">
            NIST PQC Standards
          </h1>

          <p className="subhead text-white/90 font-sans">
            NIST FIPS 203/204/205 post-quantum standards and quantum cryptanalysis threat equations.
          </p>
        </div>

        {/* 3 Standards Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
          {standards.map((s) => (
            <div key={s.code} className="retro-card p-4 sm:p-4.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-black">
                  {s.code}
                </span>
                <span className="text-xs text-white/90 font-mono font-semibold">{s.stat}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{s.name}</h3>
                <p className="text-xs text-white/70 font-sans mt-0.5">{s.type}</p>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-1 font-mono text-[11px]">
                <div className="text-white/80">Replaces: {s.replaces}</div>
                <div className="text-white/60 text-[10px]">{s.security}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 2 Threat Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-xs">
          <div className="retro-card p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Shield className="w-4 h-4 text-white/80" />
              <span>Shor's Algorithm (Polynomial Time Threat)</span>
            </div>
            <p className="text-white/75 text-xs leading-relaxed font-sans">
              Solves discrete logarithms and integer factorization in O((log N)³), rendering all classical RSA, ECC, and Diffie-Hellman keys completely decryptable upon Q-Day.
            </p>
          </div>

          <div className="retro-card p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Hourglass className="w-4 h-4 text-white/80" />
              <span>Grover's Algorithm (Quadratic Speedup)</span>
            </div>
            <p className="text-white/75 text-xs leading-relaxed font-sans">
              Provides O(√N) database search speedup, effectively halving symmetric key lengths. AES-128 drops to 64-bit security; upgrading to AES-256 remains fully quantum-safe.
            </p>
          </div>
        </div>
      </div>

      {/* 3) Bottom Footer */}
      <LandingFooter buttonText="Launch Dashboard" buttonHref="/dashboard" />
    </div>
  );
}
