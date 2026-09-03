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

      // Layer 1: Base Warm Ivory/Parchment Atmosphere
      ctx.fillStyle = "#F5F0E8";
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Subtle Flowing Warm Luxury Gradients
      waveTime += 0.003;

      // Soft Golden/Bronze Glowing Aura
      const gradAura = ctx.createRadialGradient(
        width * 0.6 + Math.sin(waveTime * 0.5) * 50,
        height * 0.3 + Math.cos(waveTime * 0.4) * 35,
        60,
        width * 0.6,
        height * 0.3,
        width * 0.55
      );
      gradAura.addColorStop(0, "rgba(217, 160, 100, 0.04)");
      gradAura.addColorStop(0.5, "rgba(240, 230, 215, 0.03)");
      gradAura.addColorStop(1, "rgba(245, 240, 232, 0)");

      ctx.fillStyle = gradAura;
      ctx.fillRect(0, 0, width, height);

      // Layer 3: Faint Coordinate Mesh
      const gridSize = 80;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
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

      // Layer 4: Interconnected Nodes & Hex Matrix Particles
      const maxDistance = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.045;
            ctx.strokeStyle = `rgba(180, 130, 70, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 130, 70, 0.18)";
        ctx.fill();
      }

      // Moving Data Packets along connections
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

          ctx.fillStyle = "rgba(194, 142, 88, 0.55)";
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
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
