"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function Home() {
  const [stats, setStats] = useState([
    { target: 120, suffix: "ms", decimals: 0, current: "0ms", label: "AST Scan Latency", icon: "<" },
    { target: 99.99, suffix: "%", decimals: 2, current: "0.00%", label: "Detection Accuracy", icon: "%" },
    { target: 2033, suffix: "", decimals: 0, current: "0", label: "Mosca Q-Day Horizon", icon: "*" },
    { target: 15, suffix: "+", decimals: 0, current: "0+", label: "NIST PQC Standards", icon: "#" },
  ]);
  const statsRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

    const animateCountUp = (index: number) => {
      const { target, suffix, decimals } = stats[index];
      const duration = 1500 + index * 80;
      const startDelay = 480 + index * 90;

      setTimeout(() => {
        let startTimestamp: number | null = null;

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const elapsed = timestamp - startTimestamp;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);
          const currentValue = easedProgress * target;

          setStats((prev) => {
            const next = [...prev];
            next[index].current = currentValue.toFixed(decimals) + suffix;
            return next;
          });

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setStats((prev) => {
              const next = [...prev];
              next[index].current = target.toFixed(decimals) + suffix;
              return next;
            });
          }
        };

        window.requestAnimationFrame(step);
      }, startDelay);
    };

    if ("IntersectionObserver" in window && statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !animatedRef.current) {
              animatedRef.current = true;
              stats.forEach((_, i) => animateCountUp(i));
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(statsRef.current);
      return () => observer.disconnect();
    } else {
      stats.forEach((_, i) => animateCountUp(i));
    }
  }, []);

  return (
    <>
      {/* Full-Viewport Universal Video Background */}
      <div className="bg">
        <video className="bg-video" autoPlay muted loop playsInline>
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
            className="cta-btn anim"
            style={{ "--d": "0.4s" } as React.CSSProperties}
          >
            Launch Dashboard
          </Link>
        </main>

        {/* 3) Stats Footer */}
        <footer ref={statsRef} className="stats">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="stat-item anim"
              style={{ "--d": `${0.5 + idx * 0.08}s` } as React.CSSProperties}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.current}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </footer>
      </div>
    </>
  );
}
