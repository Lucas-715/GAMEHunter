"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number; // Depth layer: 0.2 (far) to 1.0 (near)
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
      "#F8FAFC",
      "#4ADE80", // Emerald Star
      "#86EFAC", // Mint Star
      "#38BDF8", // Cosmic Cyan
      "#C084FC", // Nebula Violet
      "#FDE047", // Gold Supergiant
    ];

    const starCount = Math.min(280, Math.max(160, Math.floor((width * height) / 7000)));
    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const stardust: Stardust[] = [];

    for (let i = 0; i < starCount; i++) {
      const z = 0.2 + Math.pow(Math.random(), 1.2) * 0.8;
      const isFlare = z > 0.72 && Math.random() < 0.42;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: isFlare ? 2.0 + Math.random() * 1.4 : 0.8 + z * 1.6,
        baseAlpha: 0.45 + z * 0.55,
        twinkleSpeed: 0.018 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        isFlare,
      });
    }

    const spawnShootingStar = (startX?: number, startY?: number) => {
      const angle = Math.PI / 6 + (Math.random() * Math.PI) / 7;
      const speed = 12 + Math.random() * 8;
      const colors = ["#4ADE80", "#38BDF8", "#FFFFFF", "#C084FC"];
      shootingStars.push({
        x: startX ?? Math.random() * width * 0.85,
        y: startY ?? Math.random() * height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 110 + Math.random() * 80,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    // Spawn initial shooting stars right away
    spawnShootingStar(width * 0.2, height * 0.15);
    setTimeout(() => spawnShootingStar(width * 0.55, height * 0.1), 700);

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
      if (now - lastDustTime > 14) {
        const dx = e.clientX - mouse.lastX;
        const dy = e.clientY - mouse.lastY;
        const speed = Math.hypot(dx, dy);
        if (speed > 1.5) {
          const dustColors = ["#4ADE80", "#38BDF8", "#C084FC", "#FFFFFF"];
          for (let k = 0; k < 2; k++) {
            stardust.push({
              x: e.clientX + (Math.random() - 0.5) * 18,
              y: e.clientY + (Math.random() - 0.5) * 18,
              vx: (Math.random() - 0.5) * 0.9 - dx * 0.025,
              vy: (Math.random() - 0.5) * 0.9 - dy * 0.025,
              size: Math.random() * 2.6 + 1.0,
              alpha: Math.min(0.9, speed / 22 + 0.3),
              color: dustColors[Math.floor(Math.random() * dustColors.length)],
            });
          }
          if (stardust.length > 65) stardust.splice(0, stardust.length - 65);
        }
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
        lastDustTime = now;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      spawnShootingStar(
        Math.max(20, e.clientX - 140),
        Math.max(20, e.clientY - 90)
      );
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);

    let tick = 0;
    const render = () => {
      tick += 1;

      // Smooth cosmic camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const offsetX = (mouse.x - width / 2) / (width / 2);
      const offsetY = (mouse.y - height / 2) / (height / 2);

      if (nebulaLayerRef.current) {
        nebulaLayerRef.current.style.transform = `translate3d(${-offsetX * 38}px, ${-offsetY * 38}px, 0) scale(1.08)`;
      }

      if (mouseNebulaRef.current) {
        mouseNebulaRef.current.style.background = `
          radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(34, 197, 94, 0.18), rgba(56, 189, 248, 0.09) 38%, rgba(168, 85, 247, 0.06) 65%, transparent 82%)
        `;
      }

      // Periodically launch shooting stars across the universe
      if (Math.random() < 0.016 && shootingStars.length < 4) {
        spawnShootingStar();
      }

      ctx.clearRect(0, 0, width, height);

      // Draw & update multi-depth universe stars
      const nearMouseStars: { x: number; y: number; dist: number }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Slow cosmic rotation/drift
        s.x -= 0.12 * s.z;
        s.y -= 0.04 * s.z;
        if (s.x < -30) s.x = width + 30;
        if (s.y < -30) s.y = height + 30;

        // Strong 3D Parallax based on mouse position & star depth (z)
        let drawX = s.x - offsetX * 68 * s.z;
        let drawY = s.y - offsetY * 68 * s.z;

        if (drawX < 0) drawX += width;
        if (drawX > width) drawX -= width;
        if (drawY < 0) drawY += height;
        if (drawY > height) drawY -= height;

        const dx = drawX - mouse.x;
        const dy = drawY - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (mouse.active && dist < 210 && s.z > 0.35) {
          nearMouseStars.push({ x: drawX, y: drawY, dist });
        }

        const twinkle =
          Math.sin(tick * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
        const proximityBoost =
          mouse.active && dist < 210 ? (1 - dist / 210) * 0.55 : 0;
        const alpha = Math.min(1, s.baseAlpha * twinkle + proximityBoost);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        if (s.isFlare || proximityBoost > 0.15) {
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        ctx.arc(
          drawX,
          drawY,
          s.radius * (1 + proximityBoost * 0.65),
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw 4-point cosmic flare spikes on bright foreground stars
        if (s.isFlare || proximityBoost > 0.22) {
          const flareLen = s.radius * 4.5 * (1 + proximityBoost);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.9;
          ctx.globalAlpha = alpha * 0.7;
          ctx.beginPath();
          ctx.moveTo(drawX - flareLen, drawY);
          ctx.lineTo(drawX + flareLen, drawY);
          ctx.moveTo(drawX, drawY - flareLen);
          ctx.lineTo(drawX, drawY + flareLen);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw dynamic cosmic constellation lines between stars near the cursor
      if (nearMouseStars.length > 0) {
        ctx.save();
        for (let i = 0; i < nearMouseStars.length; i++) {
          const a = nearMouseStars[i];
          // Connect closest stars directly to cursor
          if (a.dist < 140) {
            const cursorAlpha = (1 - a.dist / 140) * 0.35;
            ctx.strokeStyle = `rgba(74, 222, 128, ${cursorAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }

          for (let j = i + 1; j < nearMouseStars.length; j++) {
            const b = nearMouseStars[j];
            const pairDist = Math.hypot(a.x - b.x, a.y - b.y);
            if (pairDist < 135) {
              const lineAlpha =
                (1 - pairDist / 135) *
                (1 - Math.max(a.dist, b.dist) / 210) *
                0.48;
              ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
              ctx.lineWidth = 1.0;
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
        ctx.shadowBlur = 10;
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
        st.alpha -= 0.014;

        if (st.alpha <= 0 || st.x > width + 180 || st.y > height + 180) {
          shootingStars.splice(i, 1);
          continue;
        }

        const speed = Math.hypot(st.vx, st.vy);
        const tailX = st.x - (st.vx / speed) * st.length;
        const tailY = st.y - (st.vy / speed) * st.length;

        const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        grad.addColorStop(0, st.color);
        grad.addColorStop(0.4, "rgba(56, 189, 248, 0.5)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.globalAlpha = st.alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing meteor head
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(st.x, st.y, 2.8, 0, Math.PI * 2);
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
        <div className="absolute -top-28 left-1/4 h-[600px] w-[720px] rounded-full bg-emerald-500/20 blur-[140px] animate-pulse" />
        {/* Deep Space Violet/Indigo Galaxy Core */}
        <div
          className="absolute top-1/4 -right-24 h-[580px] w-[640px] rounded-full bg-purple-600/20 blur-[145px] animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "7s" }}
        />
        {/* Cosmic Cyan Stardust Cloud */}
        <div
          className="absolute -bottom-36 left-10 h-[560px] w-[660px] rounded-full bg-cyan-500/18 blur-[145px] animate-pulse"
          style={{ animationDelay: "4s", animationDuration: "8s" }}
        />
        {/* Milky Way Diagonal Cosmic Band */}
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background:
              "radial-gradient(ellipse 95% 38% at 50% 45%, rgba(16, 185, 129, 0.16), rgba(99, 102, 241, 0.12) 50%, transparent 85%)",
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
