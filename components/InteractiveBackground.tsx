"use client";

import React, { useEffect, useRef } from "react";

type FloaterKind = "discount" | "gamepad" | "key" | "tag" | "ember";

interface FloaterItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number; // 0.3 to 1.0 for 3D parallax
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  kind: FloaterKind;
  label: string;
  highlight: number; // 0 to 1 when mouse is near
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const DISCOUNT_LABELS = [
  "-50%",
  "-75%",
  "-85%",
  "-90%",
  "KEY",
  "R$",
  "STEAM",
  "-60%",
  "LOW",
  "+XP",
];

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientGlowRef = useRef<HTMLDivElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
      lastX: width / 2,
      lastY: height / 2,
      active: false,
    };

    const kinds: FloaterKind[] = [
      "discount",
      "gamepad",
      "key",
      "tag",
      "ember",
      "ember",
    ];
    const itemCount = Math.min(44, Math.max(24, Math.floor((width * height) / 36000)));
    const items: FloaterItem[] = [];
    const ripples: ClickRipple[] = [];

    for (let i = 0; i < itemCount; i++) {
      const kind = kinds[i % kinds.length];
      const depth = 0.35 + Math.random() * 0.65;
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25 * depth,
        vy: (-0.18 - Math.random() * 0.32) * depth, // Gently rising like deals/loot
        depth,
        size: (kind === "ember" ? 3 : 14) * (0.7 + depth * 0.5),
        rotation: (Math.random() - 0.5) * 0.5,
        vRot: (Math.random() - 0.5) * 0.004,
        alpha: (kind === "ember" ? 0.32 : 0.11) * depth,
        kind,
        label: DISCOUNT_LABELS[i % DISCOUNT_LABELS.length],
        highlight: 0,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.vx = e.clientX - mouse.lastX;
      mouse.vy = e.clientY - mouse.lastY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 8,
        maxRadius: 220,
        alpha: 0.35,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);

    // Helper functions to draw thematic gaming icons on canvas
    const drawGamepad = (c: CanvasRenderingContext2D, s: number) => {
      c.beginPath();
      c.roundRect(-s, -s * 0.65, s * 2, s * 1.3, s * 0.45);
      c.stroke();
      // D-pad cross
      c.beginPath();
      c.moveTo(-s * 0.55, 0);
      c.lineTo(-s * 0.2, 0);
      c.moveTo(-s * 0.375, -s * 0.18);
      c.lineTo(-s * 0.375, s * 0.18);
      c.stroke();
      // Action buttons
      c.beginPath();
      c.arc(s * 0.42, -s * 0.1, s * 0.09, 0, Math.PI * 2);
      c.arc(s * 0.25, s * 0.1, s * 0.09, 0, Math.PI * 2);
      c.fill();
    };

    const drawKeyIcon = (c: CanvasRenderingContext2D, s: number) => {
      // Key bow (ring)
      c.beginPath();
      c.arc(-s * 0.45, 0, s * 0.42, 0, Math.PI * 2);
      c.stroke();
      // Key shaft & teeth
      c.beginPath();
      c.moveTo(-s * 0.03, 0);
      c.lineTo(s * 0.85, 0);
      c.lineTo(s * 0.85, s * 0.32);
      c.moveTo(s * 0.52, 0);
      c.lineTo(s * 0.52, s * 0.26);
      c.stroke();
    };

    const drawPriceTag = (c: CanvasRenderingContext2D, s: number) => {
      c.beginPath();
      c.moveTo(-s * 0.85, -s * 0.5);
      c.lineTo(s * 0.25, -s * 0.5);
      c.lineTo(s * 0.85, 0);
      c.lineTo(s * 0.25, s * 0.5);
      c.lineTo(-s * 0.85, s * 0.5);
      c.closePath();
      c.stroke();
      // Tag hole
      c.beginPath();
      c.arc(-s * 0.5, 0, s * 0.12, 0, Math.PI * 2);
      c.fill();
    };

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;

      // Parallax offset relative to screen center
      const offsetX = (mouse.x - width / 2) / (width / 2);
      const offsetY = (mouse.y - height / 2) / (height / 2);

      if (ambientGlowRef.current) {
        ambientGlowRef.current.style.background = `
          radial-gradient(620px circle at ${mouse.x}px ${mouse.y}px, rgba(34, 197, 94, 0.10), rgba(16, 185, 129, 0.03) 45%, transparent 75%)
        `;
      }

      if (gridLayerRef.current) {
        gridLayerRef.current.style.transform = `translate3d(${-offsetX * 18}px, ${-offsetY * 18}px, 0)`;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw click shockwave ripples (like activating a deal pulse)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.08;
        r.alpha *= 0.93;
        if (r.alpha < 0.01) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = `rgba(34, 197, 94, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Update & draw floating gaming/deal elements
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        it.x += it.vx;
        it.y += it.vy;
        it.rotation += it.vRot;

        // Parallax render position
        const drawX = it.x - offsetX * 28 * it.depth;
        const drawY = it.y - offsetY * 28 * it.depth;

        // Wrap around edges smoothly
        if (it.y < -50) {
          it.y = height + 40;
          it.x = Math.random() * width;
        }
        if (it.y > height + 50) it.y = -40;
        if (it.x < -50) it.x = width + 40;
        if (it.x > width + 50) it.x = -40;

        // React to mouse proximity (gentle breeze + emerald illumination)
        const dx = drawX - mouse.x;
        const dy = drawY - mouse.y;
        const dist = Math.hypot(dx, dy);
        const interactRadius = 185;

        if (mouse.active && dist < interactRadius && dist > 1) {
          const proximity = 1 - dist / interactRadius;
          it.highlight += (proximity - it.highlight) * 0.18;
          // Gentle push from cursor + subtle mouse breeze
          it.x += (dx / dist) * proximity * 0.9 + mouse.vx * 0.015 * it.depth;
          it.y += (dy / dist) * proximity * 0.9 + mouse.vy * 0.015 * it.depth;
        } else {
          it.highlight *= 0.94;
        }

        const activeAlpha = Math.min(0.65, it.alpha + it.highlight * 0.35);
        const scale = 1 + it.highlight * 0.25;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(it.rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = activeAlpha;

        const color = it.highlight > 0.2 ? "#4ADE80" : "#22C55E";
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.4;

        if (it.highlight > 0.15) {
          ctx.shadowColor = "#22C55E";
          ctx.shadowBlur = 12 * it.highlight;
        }

        if (it.kind === "ember") {
          ctx.beginPath();
          ctx.arc(0, 0, it.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (it.kind === "gamepad") {
          drawGamepad(ctx, it.size);
        } else if (it.kind === "key") {
          drawKeyIcon(ctx, it.size);
        } else if (it.kind === "tag") {
          drawPriceTag(ctx, it.size);
        } else if (it.kind === "discount") {
          // Pill badge with discount text (-75%, KEY, R$, etc.)
          const w = it.size * 2.5;
          const h = it.size * 1.25;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 5);
          ctx.stroke();
          ctx.font = `700 ${Math.round(it.size * 0.72)}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(it.label, 0, 0.5);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Deep Emerald Predator Ambient Nebulae */}
      <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-emerald-500/8 blur-[140px]" />
      <div className="absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full bg-green-500/6 blur-[140px]" />
      <div className="absolute -bottom-48 left-1/3 h-[520px] w-[520px] rounded-full bg-emerald-600/8 blur-[150px]" />

      {/* 3D Parallax Gaming Grid */}
      <div
        ref={gridLayerRef}
        className="absolute -inset-12 opacity-[0.045] transition-transform duration-75 ease-out"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.65) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.65) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Soft Emerald Mouse Glow */}
      <div ref={ambientGlowRef} className="absolute inset-0" />

      {/* Floating Deals, Keys, Gamepads & Embers Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
