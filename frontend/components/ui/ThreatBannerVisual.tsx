"use client";

import React from "react";

export const ThreatBannerVisual: React.FC = () => {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] md:w-[560px] pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Dark gradient mask: fades out toward the left so text has 100% clarity */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c1626] via-[#0c1626]/70 to-transparent w-44 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1626]/80 via-transparent to-[#0c1626]/80 z-10" />

      {/* SVG Holographic Security Shield & Dual-Tone Lock */}
      <svg
        viewBox="0 0 420 250"
        className="w-full h-full object-contain object-right opacity-85"
        preserveAspectRatio="xMaxYMid meet"
      >
        <defs>
          {/* Dual-Tone Cyber Gradient (Crimson Left -> Electric Cyan/Violet Right) */}
          <linearGradient id="shieldCyberGrad" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#fb7185" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#818cf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="faintCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          {/* Radial Ambient Glows */}
          <radialGradient id="redAmbientGlow" cx="42%" cy="52%" r="45%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blueAmbientGlow" cx="68%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Filters for holographic neon sheen */}
          <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          @keyframes slowBreathe {
            0%, 100% { opacity: 0.65; transform: scale(1); }
            50% { opacity: 0.95; transform: scale(1.03); }
          }
          @keyframes sweepScan {
            0% { transform: translateY(-120px); opacity: 0; }
            20% { opacity: 0.6; }
            80% { opacity: 0.6; }
            100% { transform: translateY(140px); opacity: 0; }
          }
          @keyframes spinRing {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulseKeyhole {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 6px #38bdf8); }
          }
          @keyframes packetFlow1 {
            0% { stroke-dashoffset: 80; }
            100% { stroke-dashoffset: 0; }
          }
          .breathe-glow {
            animation: slowBreathe 6s ease-in-out infinite;
            transform-origin: 290px 125px;
          }
          .scan-line {
            animation: sweepScan 5s ease-in-out infinite;
          }
          .spin-orbit {
            animation: spinRing 40s linear infinite;
            transform-origin: 290px 125px;
          }
          .keyhole-glow {
            animation: pulseKeyhole 3.5s ease-in-out infinite;
            transform-origin: 290px 132px;
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
        <circle cx="250" cy="135" r="120" fill="url(#redAmbientGlow)" className="breathe-glow" />
        <circle cx="325" cy="115" r="140" fill="url(#blueAmbientGlow)" className="breathe-glow" />

        {/* 2. Background Digital Grid & Circuit Topology Lines */}
        <g stroke="url(#faintCircuitGrad)" strokeWidth="1" opacity="0.65" fill="none">
          {/* Circuit branch lines */}
          <path d="M 60,70 L 150,70 L 190,110 L 230,110" />
          <path d="M 110,180 L 170,180 L 210,140 L 240,140" />
          <path d="M 340,90 L 370,90 L 400,60" />
          <path d="M 340,160 L 375,160 L 410,195" />
          <path d="M 290,25 L 290,5" />
          <path d="M 290,225 L 290,245" />

          {/* Animated data packet traveling dashes */}
          <path d="M 60,70 L 150,70 L 190,110 L 230,110" stroke="#f43f5e" strokeWidth="1.5" className="packet-dash" />
          <path d="M 340,90 L 370,90 L 400,60" stroke="#38bdf8" strokeWidth="1.5" className="packet-dash" />
          <path d="M 110,180 L 170,180 L 210,140 L 240,140" stroke="#fb7185" strokeWidth="1.5" className="packet-dash" />
        </g>

        {/* Circuit Node Points */}
        <g fill="#38bdf8" opacity="0.85">
          <circle cx="60" cy="70" r="2" fill="#f43f5e" />
          <circle cx="150" cy="70" r="1.5" fill="#f43f5e" />
          <circle cx="110" cy="180" r="2" fill="#fb7185" />
          <circle cx="170" cy="180" r="1.5" fill="#fb7185" />
          <circle cx="400" cy="60" r="2.5" fill="#818cf8" />
          <circle cx="410" cy="195" r="2.5" fill="#38bdf8" />
          <circle cx="370" cy="90" r="1.5" fill="#38bdf8" />
          <circle cx="375" cy="160" r="1.5" fill="#818cf8" />
        </g>

        {/* 3. Concentric Orbit / Security Radar Rings */}
        <g stroke="url(#shieldCyberGrad)" fill="none" opacity="0.4" className="spin-orbit">
          <circle cx="290" cy="125" r="105" strokeWidth="1" strokeDasharray="4 12" />
          <circle cx="290" cy="125" r="82" strokeWidth="1" strokeDasharray="2 8" opacity="0.5" />
          <circle cx="290" cy="125" r="128" strokeWidth="0.75" strokeDasharray="8 24" opacity="0.3" />
        </g>

        {/* 4. Center Holographic Shield & Padlock (Anchor: x=290, y=125) */}
        <g filter="url(#cyberGlow)">
          {/* Outer Holographic Shield Outline */}
          <path
            d="M 290,32 C 345,32 368,58 368,112 C 368,168 325,202 290,218 C 255,202 212,168 212,112 C 212,58 235,32 290,32 Z"
            fill="none"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="2.2"
          />

          {/* Inner Faceted Shield Outline */}
          <path
            d="M 290,44 C 334,44 353,66 353,112 C 353,158 318,187 290,201 C 262,187 227,158 227,112 C 227,66 246,44 290,44 Z"
            fill="rgba(10, 20, 36, 0.45)"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* Subtle Shield Center Divider / Quantum Boundary */}
          <line
            x1="290"
            y1="44"
            x2="290"
            y2="201"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity="0.5"
          />

          {/* Padlock Shackle */}
          <path
            d="M 276,112 L 276,96 C 276,88 282,82 290,82 C 298,82 304,88 304,96 L 304,112"
            fill="none"
            stroke="url(#shieldCyberGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Padlock Body */}
          <rect
            x="268"
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
            x="273"
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
            <circle cx="290" cy="124" r="3.5" fill="#38bdf8" />
            <polygon points="288.5,125 291.5,125 293,136 287,136" fill="#38bdf8" />
          </g>
        </g>

        {/* 5. Scanning Beam Overlay across Shield */}
        <g clipPath="url(#shieldClip)">
          <clipPath id="shieldClip">
            <path d="M 290,32 C 345,32 368,58 368,112 C 368,168 325,202 290,218 C 255,202 212,168 212,112 C 212,58 235,32 290,32 Z" />
          </clipPath>
          <rect
            x="210"
            y="30"
            width="160"
            height="50"
            fill="url(#scanBeamGrad)"
            className="scan-line"
          />
        </g>

        {/* 6. Floating Ambient Quantum Particles */}
        <g opacity="0.75">
          <circle cx="240" cy="95" r="1.2" fill="#f43f5e" />
          <circle cx="255" cy="165" r="1.5" fill="#f43f5e" />
          <circle cx="335" cy="80" r="1.5" fill="#38bdf8" />
          <circle cx="348" cy="145" r="1.2" fill="#818cf8" />
          <circle cx="290" cy="22" r="1.5" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};
