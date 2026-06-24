"use client";

import { useEffect, useRef } from "react";

/**
 * CyberGridBackground — fixed full-screen background with grid + glow + matrix rain.
 * Pure canvas, very performant.
 */
export function CyberGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Matrix columns
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);
    const chars =
      "01ABCDEFabcdef0123456789hashcatMOTλΣΔ#@$%&*".split("");

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -100);
    };
    window.addEventListener("resize", resize);

    let last = 0;
    const fps = 18; // slow matrix for ambience
    const interval = 1000 / fps;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < interval) return;
      last = t;

      ctx.fillStyle = "rgba(11, 15, 25, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Alternating subtle color
        if (Math.random() > 0.985) {
          ctx.fillStyle = "rgba(0, 255, 136, 0.55)";
        } else if (Math.random() > 0.5) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.30)";
        } else {
          ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
        }
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0F19]">
      {/* Grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40" />
      {/* Radial glow */}
      <div className="absolute inset-0 cyber-radial-glow" />
      {/* Matrix canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-30"
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(11,15,25,0.85) 100%)",
        }}
      />
    </div>
  );
}
