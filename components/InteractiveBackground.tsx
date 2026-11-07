"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number; // Depth layer: 0.15 (far) to 1.0 (near)
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  isFlare: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  color: string;
  active: boolean;
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nebulaLayerRef = useRef<HTMLDivElement | null>(null);
  const mouseNebulaRef = useRef<HTMLDivElement | null>(null);

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
      lastX: width / 2,
      lastY: height / 2,
      active: false,
    };

    const starColors = [
      "#FFFFFF",
      "#E2E8F0",
      "#86EFAC", // Emerald star
      "#4ADE80", // Neon green star
      "#A5F3FC", // Cosmic cyan
      "#C4B5FD", // Nebula violet
    ];

    const starCount = Math.min(220, Math.max(120, Math.floor((width * height) / 9500)));
    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const stardust: Stardust[] = [];

    for (let i = 0; i < starCount; i++) {
      const z = 0.15 + Math.pow(Math.random(), 1.4) * 0.85;
      const isFlare = z > 0.82 && Math.random() < 0.35;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: isFlare ? 1.8 + Math.random() * 1.1 : 0.5 + z * 1.3,
        baseAlpha: 0.25 + z * 0.65,
        twinkleSpeed: 0.012 + Math.random() * 0.035,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        isFlare,
      });
    }

    const spawnShootingStar = (startX?: number, startY?: number) => {
      const angle = (Math.PI / 6) + (Math.random() * Math.PI) / 8; // Diagonal trajectory
      const speed = 11 + Math.random() * 7;
      const colors = ["#4ADE80", "#38BDF8", "#FFFFFF", "#A7F3D0"];
      shootingStars.push({
        x: startX ?? Math.random() * width * 0.85,
        y: startY ?? Math.random() * height * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 85 + Math.random() * 65,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        active: true,
      });
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let lastDustTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      const now = performance.now();
      if (now - lastDustTime > 20) {
        const dx = e.clientX - mouse.lastX;
        const dy = e.clientY - mouse.lastY;
        const speed = Math.hypot(dx, dy);
        if (speed > 3) {
          stardust.push({
            x: e.clientX + (Math.random() - 0.5) * 14,
            y: e.clientY + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 0.6 - dx * 0.02,
            vy: (Math.random() - 0.5) * 0.6 - dy * 0.02,
            size: Math.random() * 2 + 0.8,
            alpha: Math.min(0.75, speed / 35),
            color: Math.random() > 0.4 ? "#4ADE80" : "#A5F3FC",
          });
          if (stardust.length > 38) stardust.shift();
        }
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
        lastDustTime = now;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Spawn a shooting star near click position
      spawnShootingStar(
        Math.max(20, e.clientX - 120),
        Math.max(20, e.clientY - 80)
      );
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);

    let tick = 0;
    const render = () => {
      tick += 1;

      // Smooth cosmic camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const offsetX = (mouse.x - width / 2) / (width / 2);
      const offsetY = (mouse.y - height / 2) / (height / 2);

      if (nebulaLayerRef.current) {
        nebulaLayerRef.current.style.transform = `translate3d(${-offsetX * 26}px, ${-offsetY * 26}px, 0) scale(1.06)`;
      }

      if (mouseNebulaRef.current) {
        mouseNebulaRef.current.style.background = `
          radial-gradient(560px circle at ${mouse.x}px ${mouse.y}px, rgba(34, 197, 94, 0.11), rgba(56, 189, 248, 0.05) 40%, rgba(124, 58, 237, 0.03) 65%, transparent 80%)
        `;
      }

      // Periodically launch random shooting stars across the universe
      if (Math.random() < 0.007 && shootingStars.length < 3) {
        spawnShootingStar();
      }

      ctx.clearRect(0, 0, width, height);

      // Draw & update multi-depth universe stars
      const nearMouseStars: { x: number; y: number; dist: number }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Slow cosmic drift
        s.x -= 0.08 * s.z;
        s.y -= 0.03 * s.z;
        if (s.x < -30) s.x = width + 30;
        if (s.y < -30) s.y = height + 30;

        // 3D Parallax based on mouse position & star depth (z)
        let drawX = s.x - offsetX * 45 * s.z;
        let drawY = s.y - offsetY * 45 * s.z;

        if (drawX < 0) drawX += width;
        if (drawX > width) drawX -= width;
        if (drawY < 0) drawY += height;
        if (drawY > height) drawY -= height;

        const dx = drawX - mouse.x;
        const dy = drawY - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (mouse.active && dist < 165 && s.z > 0.4) {
          nearMouseStars.push({ x: drawX, y: drawY, dist });
        }

        const twinkle =
          Math.sin(tick * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
        const proximityBoost =
          mouse.active && dist < 170 ? (1 - dist / 170) * 0.45 : 0;
        const alpha = Math.min(1, s.baseAlpha * twinkle + proximityBoost);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        if (s.isFlare || proximityBoost > 0.2) {
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        ctx.arc(
          drawX,
          drawY,
          s.radius * (1 + proximityBoost * 0.5),
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw 4-point cosmic flare spikes on bright foreground stars
        if (s.isFlare || proximityBoost > 0.28) {
          const flareLen = (s.radius * 3.8) * (1 + proximityBoost);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.7;
          ctx.globalAlpha = alpha * 0.55;
          ctx.beginPath();
          ctx.moveTo(drawX - flareLen, drawY);
          ctx.lineTo(drawX + flareLen, drawY);
          ctx.moveTo(drawX, drawY - flareLen);
          ctx.lineTo(drawX, drawY + flareLen);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw subtle cosmic constellation lines between stars near the cursor
      if (nearMouseStars.length > 1) {
        ctx.save();
        for (let i = 0; i < nearMouseStars.length; i++) {
          for (let j = i + 1; j < nearMouseStars.length; j++) {
            const a = nearMouseStars[i];
            const b = nearMouseStars[j];
            const pairDist = Math.hypot(a.x - b.x, a.y - b.y);
            if (pairDist < 115) {
              const lineAlpha =
                (1 - pairDist / 115) *
                (1 - Math.max(a.dist, b.dist) / 165) *
                0.28;
              ctx.strokeStyle = `rgba(74, 222, 128, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Draw & update cosmic stardust trail from mouse movement
      for (let i = stardust.length - 1; i >= 0; i--) {
        const d = stardust[i];
        d.x += d.vx;
        d.y += d.vy;
        d.alpha *= 0.94;
        if (d.alpha < 0.02) {
          stardust.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw & update shooting stars / meteors
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.x += st.vx;
        st.y += st.vy;
        st.alpha -= 0.016;

        if (st.alpha <= 0 || st.x > width + 150 || st.y > height + 150) {
          shootingStars.splice(i, 1);
          continue;
        }

        const speed = Math.hypot(st.vx, st.vy);
        const tailX = st.x - (st.vx / speed) * st.length;
        const tailY = st.y - (st.vy / speed) * st.length;

        const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        grad.addColorStop(0, st.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.globalAlpha = st.alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing meteor head
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(st.x, st.y, 2.2, 0, Math.PI * 2);
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
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Parallax Deep Universe Nebulae & Galaxy Clouds */}
      <div
        ref={nebulaLayerRef}
        className="absolute -inset-16 transition-transform duration-100 ease-out"
      >
        {/* Emerald Nebula Cloud */}
        <div className="absolute -top-36 left-1/4 h-[560px] w-[680px] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" />
        {/* Deep Space Violet/Indigo Galaxy Core */}
        <div
          className="absolute top-1/3 -right-32 h-[540px] w-[580px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "7s" }}
        />
        {/* Cosmic Cyan/Green Stardust Cloud */}
        <div
          className="absolute -bottom-44 left-10 h-[520px] w-[620px] rounded-full bg-teal-500/9 blur-[155px] animate-pulse"
          style={{ animationDelay: "4s", animationDuration: "8s" }}
        />
        {/* Subtle Milky Way Diagonal Glow */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 90% 35% at 50% 45%, rgba(16, 185, 129, 0.08), rgba(79, 70, 229, 0.05) 55%, transparent 85%)",
            transform: "rotate(-18deg)",
          }}
        />
      </div>

      {/* Interactive Cosmic Cursor Nebula */}
      <div ref={mouseNebulaRef} className="absolute inset-0" />

      {/* 3D Starfield, Constellations & Shooting Stars Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
