"use client";

import React from "react";

export const ThreatBannerVisual: React.FC = () => {
  return (
    <div
      className="absolute right-8 sm:right-20 md:right-28 lg:right-44 top-0 bottom-0 w-[340px] sm:w-[400px] md:w-[460px] pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Subtle soft edge fading masks */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c1626] via-transparent to-transparent w-28 z-10" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0c1626]/80 via-transparent to-transparent w-16 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1626]/70 via-transparent to-[#0c1626]/70 z-10" />

      {/* SVG Holographic Security Shield & Dual-Tone Lock */}
      <svg
        viewBox="0 0 420 250"
        className="w-full h-full object-contain object-center opacity-95"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Dual-Tone Cyber Gradient (Crimson Left -> Electric Cyan/Violet Right) */}
          <linearGradient id="shieldCyberGrad" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fb7185" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#818cf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="faintCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          {/* Radial Ambient Glows */}
          <radialGradient id="redAmbientGlow" cx="40%" cy="52%" r="48%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#f43f5e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blueAmbientGlow" cx="62%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Filters for holographic neon sheen */}
          <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          @keyframes slowBreathe {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.04); }
          }
          @keyframes sweepScan {
            0% { transform: translateY(-120px); opacity: 0; }
            20% { opacity: 0.7; }
            80% { opacity: 0.7; }
            100% { transform: translateY(140px); opacity: 0; }
          }
          @keyframes spinRing {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulseKeyhole {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 7px #38bdf8); }
          }
          @keyframes packetFlow1 {
            0% { stroke-dashoffset: 80; }
            100% { stroke-dashoffset: 0; }
          }
          .breathe-glow {
            animation: slowBreathe 6s ease-in-out infinite;
            transform-origin: 210px 125px;
          }
          .scan-line {
            animation: sweepScan 5s ease-in-out infinite;
          }
          .spin-orbit {
            animation: spinRing 40s linear infinite;
            transform-origin: 210px 125px;
          }
          .keyhole-glow {
            animation: pulseKeyhole 3.5s ease-in-out infinite;
            transform-origin: 210px 132px;
          }
          .packet-dash {
            stroke-dasharray: 6 18;
            animation: packetFlow1 3s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .breathe-glow, .scan-line, .spin-orbit, .keyhole-glow, .packet-dash {
              animation: none !important;
            }
          }
        `}</style>

        {/* 1. Ambient Background Light Flares */}
        <circle cx="170" cy="135" r="120" fill="url(#redAmbientGlow)" className="breathe-glow" />
        <circle cx="250" cy="115" r="135" fill="url(#blueAmbientGlow)" className="breathe-glow" />

        {/* 2. Background Digital Grid & Circuit Topology Lines */}
        <g stroke="url(#faintCircuitGrad)" strokeWidth="1" opacity="0.75" fill="none">
          {/* Circuit branch lines */}
          <path d="M 20,70 L 90,70 L 125,110 L 155,110" />
          <path d="M 50,180 L 110,180 L 145,140 L 170,140" />
          <path d="M 265,90 L 295,90 L 335,60" />
          <path d="M 265,160 L 300,160 L 340,195" />
          <path d="M 210,25 L 210,5" />
          <path d="M 210,225 L 210,245" />

          {/* Animated data packet traveling dashes */}
          <path d="M 20,70 L 90,70 L 125,110 L 155,110" stroke="#f43f5e" strokeWidth="1.5" className="packet-dash" />
          <path d="M 265,90 L 295,90 L 335,60" stroke="#38bdf8" strokeWidth="1.5" className="packet-dash" />
          <path d="M 50,180 L 110,180 L 145,140 L 170,140" stroke="#fb7185" strokeWidth="1.5" className="packet-dash" />
        </g>

        {/* Circuit Node Points */}
        <g fill="#38bdf8" opacity="0.9">
          <circle cx="20" cy="70" r="2.2" fill="#f43f5e" />
          <circle cx="90" cy="70" r="1.5" fill="#f43f5e" />
          <circle cx="50" cy="180" r="2.2" fill="#fb7185" />
          <circle cx="110" cy="180" r="1.5" fill="#fb7185" />
          <circle cx="335" cy="60" r="2.5" fill="#818cf8" />
          <circle cx="340" cy="195" r="2.5" fill="#38bdf8" />
          <circle cx="295" cy="90" r="1.5" fill="#38bdf8" />
          <circle cx="300" cy="160" r="1.5" fill="#818cf8" />
        </g>

        {/* 3. Concentric Orbit / Security Radar Rings */}
        <g stroke="url(#shieldCyberGrad)" fill="none" opacity="0.45" className="spin-orbit">
          <circle cx="210" cy="125" r="105" strokeWidth="1" strokeDasharray="4 12" />
          <circle cx="210" cy="125" r="82" strokeWidth="1" strokeDasharray="2 8" opacity="0.55" />
          <circle cx="210" cy="125" r="128" strokeWidth="0.75" strokeDasharray="8 24" opacity="0.35" />
        </g>

        {/* 4. Center Holographic Shield & Padlock (Anchor: x=210, y=125) */}
        <g filter="url(#cyberGlow)">
          {/* Outer Holographic Shield Outline */}
          <path
            d="M 210,32 C 265,32 288,58 288,112 C 288,168 245,202 210,218 C 175,202 132,168 132,112 C 132,58 155,32 210,32 Z"
            fill="none"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="2.4"
          />

          {/* Inner Faceted Shield Outline */}
          <path
            d="M 210,44 C 254,44 273,66 273,112 C 273,158 238,187 210,201 C 182,187 147,158 147,112 C 147,66 166,44 210,44 Z"
            fill="rgba(10, 20, 36, 0.45)"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.85"
          />

          {/* Subtle Shield Center Divider / Quantum Boundary */}
          <line
            x1="210"
            y1="44"
            x2="210"
            y2="201"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity="0.5"
          />

          {/* Padlock Shackle */}
          <path
            d="M 196,112 L 196,96 C 196,88 202,82 210,82 C 218,82 224,88 224,96 L 224,112"
            fill="none"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Padlock Body */}
          <rect
            x="188"
            y="110"
            width="44"
            height="36"
            rx="7"
            fill="rgba(7, 17, 31, 0.85)"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="2"
          />

          {/* Padlock Inner Geometric Core */}
          <rect
            x="193"
            y="115"
            width="34"
            height="26"
            rx="4"
            fill="none"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.6"
          />

          {/* Illuminated Keyhole with Pulse Glow */}
          <g className="keyhole-glow">
            <circle cx="210" cy="124" r="3.5" fill="#38bdf8" />
            <polygon points="208.5,125 211.5,125 213,136 207,136" fill="#38bdf8" />
          </g>
        </g>

        {/* 5. Scanning Beam Overlay across Shield */}
        <g clipPath="url(#shieldClip)">
          <clipPath id="shieldClip">
            <path d="M 210,32 C 265,32 288,58 288,112 C 288,168 245,202 210,218 C 175,202 132,168 132,112 C 132,58 155,32 210,32 Z" />
          </clipPath>
          <rect
            x="130"
            y="30"
            width="160"
            height="50"
            fill="url(#scanBeamGrad)"
            className="scan-line"
          />
        </g>

        {/* 6. Floating Ambient Quantum Particles */}
        <g opacity="0.8">
          <circle cx="160" cy="95" r="1.3" fill="#f43f5e" />
          <circle cx="175" cy="165" r="1.5" fill="#f43f5e" />
          <circle cx="255" cy="80" r="1.5" fill="#38bdf8" />
          <circle cx="268" cy="145" r="1.3" fill="#818cf8" />
          <circle cx="210" cy="22" r="1.5" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};
