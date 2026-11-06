"use client";

import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  color: string;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const gridRevealRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);

  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

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
      ringX: width / 2,
      ringY: height / 2,
      active: false,
    };

    const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#A855F7"];
    const particleCount = Math.min(55, Math.floor((width * height) / 24000));
    const particles: Particle[] = [];
    const trail: TrailPoint[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let lastTrailTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      const now = performance.now();
      if (now - lastTrailTime > 16) {
        const dx = e.clientX - mouse.x;
        const dy = e.clientY - mouse.y;
        const speed = Math.hypot(dx, dy);
        if (speed > 2) {
          trail.push({
            x: e.clientX,
            y: e.clientY,
            alpha: Math.min(0.55, speed / 45),
            size: Math.min(4, Math.max(1.5, speed / 12)),
            color: speed > 22 ? "#10B981" : "#8B5CF6",
          });
          if (trail.length > 22) trail.shift();
        }
        lastTrailTime = now;
      }

      // Check if hovering a clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, select, textarea, [role="button"]'
        );
        setIsHoveringInteractive(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    let tick = 0;
    const render = () => {
      tick += 1;

      // Smooth interpolation for spotlight and tactical cursor ring
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;
      mouse.ringX += (mouse.targetX - mouse.ringX) * 0.22;
      mouse.ringY += (mouse.targetY - mouse.ringY) * 0.22;

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `
          radial-gradient(650px circle at ${mouse.x}px ${mouse.y}px, rgba(139, 92, 246, 0.13), rgba(6, 182, 212, 0.05) 40%, transparent 75%)
        `;
      }

      if (gridRevealRef.current) {
        gridRevealRef.current.style.maskImage = `radial-gradient(340px circle at ${mouse.x}px ${mouse.y}px, black 0%, transparent 100%)`;
        gridRevealRef.current.style.webkitMaskImage = `radial-gradient(340px circle at ${mouse.x}px ${mouse.y}px, black 0%, transparent 100%)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${mouse.ringX}px, ${mouse.ringY}px, 0)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouse.targetX}px, ${mouse.targetY}px, 0)`;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw subtle mouse trail sparks
      for (let i = trail.length - 1; i >= 0; i--) {
        const pt = trail[i];
        pt.alpha *= 0.91;
        pt.size *= 0.97;
        if (pt.alpha <= 0.02) {
          trail.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & draw particles + radar connections to mouse
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        // Subtle tactical radar attraction/orbit when near cursor
        if (mouse.active && dist < 190 && dist > 1) {
          const force = (190 - dist) / 190;
          p.x -= (dx / dist) * force * 0.55;
          p.y -= (dy / dist) * force * 0.55;

          // Draw radar lock line to cursor
          ctx.save();
          ctx.strokeStyle =
            dist < 95
              ? `rgba(16, 185, 129, ${(1 - dist / 190) * 0.35})`
              : `rgba(139, 92, 246, ${(1 - dist / 190) * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.restore();
        }

        // Connect nearby particles slightly
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pDist = Math.hypot(pdx, pdy);
          if (pDist < 110) {
            ctx.save();
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - pDist / 110) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }

        const pulse =
          Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.2 + 0.8;

        ctx.save();
        ctx.globalAlpha = p.alpha * pulse;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = dist < 160 ? 10 : 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Ambient Background Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* Slow-drifting ambient glow orbs */}
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[130px] animate-pulse" />
        <div
          className="absolute top-1/3 -right-40 h-[460px] w-[460px] rounded-full bg-cyan-500/8 blur-[130px] animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "6s" }}
        />
        <div
          className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[140px] animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "7s" }}
        />

        {/* Base subtle cyber grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Interactive Mouse-Revealed Hunter Tactical Grid */}
        <div
          ref={gridRevealRef}
          className="absolute inset-0 opacity-30 transition-opacity duration-300"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(139, 92, 246, 0.35) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.28) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
          }}
        />

        {/* Dynamic Mouse Spotlight Glow */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 transition-opacity duration-300"
        />

        {/* Interactive Particle & Radar Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Tactical Hunter Cursor Reticle (Desktop Only) */}
      <div
        ref={cursorRingRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`relative flex items-center justify-center rounded-full border transition-all duration-200 ${
            isClicking
              ? "h-6 w-6 border-emerald-400 bg-emerald-400/15 scale-90"
              : isHoveringInteractive
              ? "h-11 w-11 border-emerald-400/70 bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "h-8 w-8 border-primary/45 bg-transparent"
          }`}
        >
          {/* Tactical crosshair ticks on the cursor ring */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-[1.5px] bg-emerald-400/80" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-[1.5px] bg-emerald-400/80" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-[1.5px] bg-primary/80" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-[1.5px] bg-primary/80" />
        </div>
      </div>

      {/* Center Micro Dot */}
      <div
        ref={cursorDotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHoveringInteractive
              ? "h-2 w-2 bg-emerald-400 shadow-[0_0_10px_#10B981]"
              : "h-1.5 w-1.5 bg-primary/80 shadow-[0_0_8px_#8B5CF6]"
          }`}
        />
      </div>
    </>
  );
}
