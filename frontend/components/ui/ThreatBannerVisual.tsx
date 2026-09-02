"use client";

import React from "react";

export const ThreatBannerVisual: React.FC = () => {
  return (
    <div
      className="absolute right-4 sm:right-12 md:right-16 lg:right-24 top-0 bottom-0 w-[240px] sm:w-[280px] md:w-[320px] pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full object-contain object-center"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Warm Golden Bronze & Copper Gradients */}
          <linearGradient id="goldShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C28E58" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#D4A373" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8B5E34" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="goldOctagonFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#F5EBE0" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#E6CCB2" stopOpacity="0.85" />
          </linearGradient>

          <radialGradient id="goldAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C28E58" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#D4A373" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes slowBreathe {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.03); }
          }
          @keyframes spinRing {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .breathe-glow {
            animation: slowBreathe 6s ease-in-out infinite;
            transform-origin: 160px 100px;
          }
          .spin-orbit {
            animation: spinRing 50s linear infinite;
            transform-origin: 160px 100px;
          }
        `}</style>

        {/* Ambient Radial Glow */}
        <circle cx="160" cy="100" r="90" fill="url(#goldAmbientGlow)" className="breathe-glow" />

        {/* Radiating Circuit Lines & Nodes */}
        <g stroke="#C28E58" strokeWidth="0.85" strokeOpacity="0.3" fill="none">
          <line x1="60" y1="100" x2="105" y2="100" />
          <line x1="215" y1="100" x2="260" y2="100" />
          <line x1="160" y1="15" x2="160" y2="45" />
          <line x1="160" y1="155" x2="160" y2="185" />
          <line x1="90" y1="35" x2="115" y2="60" />
          <line x1="230" y1="35" x2="205" y2="60" />
          <line x1="90" y1="165" x2="115" y2="140" />
          <line x1="230" y1="165" x2="205" y2="140" />

          {/* Node dots */}
          <circle cx="60" cy="100" r="2" fill="#C28E58" fillOpacity="0.5" />
          <circle cx="260" cy="100" r="2" fill="#C28E58" fillOpacity="0.5" />
          <circle cx="90" cy="35" r="2" fill="#C28E58" fillOpacity="0.5" />
          <circle cx="230" cy="35" r="2" fill="#C28E58" fillOpacity="0.5" />
          <circle cx="90" cy="165" r="2" fill="#C28E58" fillOpacity="0.5" />
          <circle cx="230" cy="165" r="2" fill="#C28E58" fillOpacity="0.5" />
        </g>

        {/* Orbiting dashed ring */}
        <circle
          cx="160"
          cy="100"
          r="72"
          stroke="#C28E58"
          strokeWidth="1"
          strokeDasharray="4 8"
          strokeOpacity="0.25"
          fill="none"
          className="spin-orbit"
        />

        {/* Outer Shield / Octagon Shape */}
        <polygon
          points="160,35 212,54 222,108 194,152 160,165 126,152 98,108 108,54"
          fill="url(#goldOctagonFill)"
          stroke="#C28E58"
          strokeWidth="1.75"
          strokeOpacity="0.85"
        />

        {/* Inner Shield Bevel */}
        <polygon
          points="160,42 205,58 213,104 189,143 160,154 131,143 107,104 115,58"
          fill="none"
          stroke="#C28E58"
          strokeWidth="0.85"
          strokeDasharray="3 3"
          strokeOpacity="0.45"
        />

        {/* Center Digital Padlock Icon */}
        <g transform="translate(139, 78)">
          {/* Padlock Shackle */}
          <path
            d="M 11 16 V 10 C 11 4.5 16.5 0 21 0 C 25.5 0 31 4.5 31 10 V 16"
            fill="none"
            stroke="#8B5E34"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Padlock Body */}
          <rect
            x="5"
            y="14"
            width="32"
            height="26"
            rx="5"
            fill="url(#goldShieldGrad)"
            stroke="#6F441E"
            strokeWidth="1.2"
          />
          {/* Keyhole */}
          <circle cx="21" cy="24" r="2.8" fill="#FAF7F2" />
          <path d="M 20 25 L 19.5 32 L 22.5 32 L 22 25 Z" fill="#FAF7F2" />
        </g>
      </svg>
    </div>
  );
};
