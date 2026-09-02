"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

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
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    // Number of nodes based on screen size
    const nodeCount = Math.min(36, Math.max(16, Math.floor((width * height) / 45000)));
    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const initNodes = () => {
      nodes = [];
      packets = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1.2,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Initial packets
      for (let i = 0; i < 6; i++) {
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
        speed: 0.003 + Math.random() * 0.005,
      });
    };

    initNodes();

    // Radar scan position
    let radarY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Background Grid (Cryptographic coordinate mesh)
      const gridSize = 64;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.02)";
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

      // 2. Slow horizontal radar scan line
      if (!prefersReducedMotion) {
        radarY += 0.4;
        if (radarY > height) radarY = 0;
        const scanGrad = ctx.createLinearGradient(0, radarY - 60, 0, radarY);
        scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
        scanGrad.addColorStop(1, "rgba(56, 189, 248, 0.03)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, radarY - 60, width, 60);

        ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, radarY);
        ctx.lineTo(width, radarY);
        ctx.stroke();
      }

      // 3. Update & Draw Nodes
      const maxDistance = 170;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0) { node.x = 0; node.vx *= -1; }
          if (node.x > width) { node.x = width; node.vx *= -1; }
          if (node.y < 0) { node.y = 0; node.vy *= -1; }
          if (node.y > height) { node.y = height; node.vy *= -1; }

          node.pulsePhase += 0.02;
        }

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.12;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw Node glow & dot
        const pulse = Math.sin(node.pulsePhase) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.35 * pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.65 }}
      aria-hidden="true"
    />
  );
};
