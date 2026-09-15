"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Eagerly prefetch all main destination routes into browser memory
    const prefetchRoutes = [
      "/dashboard",
      "/scan",
      "/inventory",
      "/heatmap",
      "/mosca",
      "/remediation",
      "/reports",
      "/history",
      "/features",
      "/architecture",
      "/standards",
      "/about",
    ];
    prefetchRoutes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {}
    });
  }, [router]);

  return (
    <>
      {/* Full-Viewport Universal Video Background */}
      <div className="bg">
        <video className="bg-video" autoPlay muted loop playsInline preload="metadata">
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Strict Single-Viewport Landing Page */}
      <div className="page">
        {/* 1) Header */}
        <LandingHeader />

        {/* 2) Hero Center */}
        <main className="hero">
          {/* Trust Row */}
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
              <span className="trust-text">Built for NTRO • SIH 2026</span>
            </div>
          </div>

          {/* Headline (Retro Dot-Matrix Display Font) */}
          <h1 className="headline">
            <span className="headline-line line-1">Post-Quantum</span>
            <span className="headline-line line-2">Cryptographic Defense</span>
          </h1>

          {/* Subhead */}
          <p className="subhead anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            Automated cryptographic discovery, Mosca HNDL threat assessment, and 1-click
            NIST PQC migration for enterprise codebases and infrastructure.
          </p>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/dashboard")}
            onPointerDown={() => router.prefetch("/dashboard")}
            className="cta-btn anim"
            style={{ "--d": "0.4s" } as React.CSSProperties}
          >
            Launch Dashboard
          </Link>
        </main>
      </div>
    </>
  );
}
