"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  char?: string;
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

const HEX_CHARS = ["01", "7F", "A8", "9C", "F2", "3B", "D4", "E0", "PQC", "FIPS", "203", "204"];

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener("resize", handleResize);

    const nodeCount = Math.min(32, Math.max(14, Math.floor((width * height) / 50000)));
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let waveTime = 0;

    const initElements = () => {
      nodes = [];
      packets = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.4 + 1.0,
          pulsePhase: Math.random() * Math.PI * 2,
          char: Math.random() > 0.65 ? HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)] : undefined,
        });
      }

      for (let i = 0; i < 5; i++) {
        createPacket();
      }
    };

    const createPacket = () => {
      if (nodes.length < 2) return;
      const fromNode = Math.floor(Math.random() * nodes.length);
      let toNode = Math.floor(Math.random() * nodes.length);
      while (toNode === fromNode) {
        toNode = Math.floor(Math.random() * nodes.length);
      }
      packets.push({
        fromNode,
        toNode,
        progress: 0,
        speed: 0.0025 + Math.random() * 0.004,
      });
    };

    initElements();

    let radarY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Layer 1: Base Dark Velvet Atmosphere
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Subtle Flowing Atmospheric Wave Ribbons (matching Overview page landscape)
      waveTime += 0.004;

      // Atmospheric Violet-Pink Glowing Aura
      const gradAura = ctx.createRadialGradient(
        width * 0.55 + Math.sin(waveTime * 0.7) * 60,
        height * 0.35 + Math.cos(waveTime * 0.5) * 40,
        50,
        width * 0.55,
        height * 0.35,
        width * 0.6
      );
      gradAura.addColorStop(0, "rgba(168, 85, 247, 0.055)");
      gradAura.addColorStop(0.35, "rgba(244, 114, 182, 0.035)");
      gradAura.addColorStop(0.7, "rgba(129, 140, 248, 0.025)");
      gradAura.addColorStop(1, "rgba(5, 5, 5, 0)");

      ctx.fillStyle = gradAura;
      ctx.fillRect(0, 0, width, height);

      // Subtle Atmospheric Sine Wave 1 (Dusky Violet Wave)
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      for (let x = 0; x <= width; x += 30) {
        const y =
          height * 0.52 +
          Math.sin(x * 0.0022 + waveTime) * 45 +
          Math.cos(x * 0.004 + waveTime * 0.6) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const waveGrad1 = ctx.createLinearGradient(0, height * 0.4, 0, height);
      waveGrad1.addColorStop(0, "rgba(168, 85, 247, 0.022)");
      waveGrad1.addColorStop(0.5, "rgba(244, 114, 182, 0.015)");
      waveGrad1.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = waveGrad1;
      ctx.fill();

      // Subtle Atmospheric Sine Wave 2 (Deep Purple/Indigo Horizon)
      ctx.beginPath();
      ctx.moveTo(0, height * 0.68);
      for (let x = 0; x <= width; x += 40) {
        const y =
          height * 0.68 +
          Math.sin(x * 0.0018 - waveTime * 0.8) * 35 +
          Math.sin(x * 0.0035 + waveTime * 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const waveGrad2 = ctx.createLinearGradient(0, height * 0.6, 0, height);
      waveGrad2.addColorStop(0, "rgba(129, 140, 248, 0.025)");
      waveGrad2.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = waveGrad2;
      ctx.fill();

      // Layer 3: Faint Coordinate Mesh & Cryptographic Matrix
      const gridSize = 72;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Slow radar beam sweep
      if (!prefersReducedMotion) {
        radarY += 0.4;
        if (radarY > height) radarY = 0;

        const radarGrad = ctx.createLinearGradient(0, radarY - 60, 0, radarY);
        radarGrad.addColorStop(0, "rgba(168, 85, 247, 0)");
        radarGrad.addColorStop(1, "rgba(168, 85, 247, 0.025)");
        ctx.fillStyle = radarGrad;
        ctx.fillRect(0, radarY - 60, width, 60);

        ctx.strokeStyle = "rgba(168, 85, 247, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, radarY);
        ctx.lineTo(width, radarY);
        ctx.stroke();
      }

      // Layer 4: Interconnected Nodes & Hex Matrix Particles
      const maxDistance = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.065;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
        ctx.fill();
      }

      // 4. Data Packets traveling across connections
      if (!prefersReducedMotion) {
        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          const n1 = nodes[p.fromNode];
          const n2 = nodes[p.toNode];

          if (!n1 || !n2) {
            packets.splice(i, 1);
            continue;
          }

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > maxDistance * 1.5) {
            packets.splice(i, 1);
            createPacket();
            continue;
          }

          p.progress += p.speed;
          if (p.progress >= 1) {
            packets.splice(i, 1);
            createPacket();
            continue;
          }

          const px = n1.x + dx * p.progress;
          const py = n1.y + dy * p.progress;

          // Packet glow
          ctx.fillStyle = "rgba(129, 140, 248, 0.7)";
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
      {/* Subtle Film Grain Noise Texture Layer matching Overview brand */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "4px 4px",
        }}
      />
    </div>
  );
};
