import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vy: number;
  radius: number;
  opacity: number;
  fadeSpeed: number;
}

const MOUSE_RADIUS = 120;
const REPEL_FORCE = 1.5;

export function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const createParticle = useCallback((w: number, h: number, bottom = false): Particle => ({
    x: Math.random() * w,
    y: bottom ? h + Math.random() * 30 : Math.random() * h,
    vy: -(0.03 + Math.random() * 0.08), // Ultra slow drift
    radius: 0.4 + Math.random() * 0.8, // 0.4-1.2px - barely visible
    opacity: 0,
    fadeSpeed: 0.001 + Math.random() * 0.002,
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 40 : 80;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => {
      const p = createParticle(w, h, false);
      p.opacity = Math.random() * 0.4;
      return p;
    });

    let lastTime = 0;
    const frameInterval = 1000 / (isMobile ? 30 : 60);

    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      if (delta < frameInterval) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp - (delta % frameInterval);

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mx > -1000;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle mouse repulsion (no lines, no flashes)
        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_FORCE;
            p.x += (dx / dist) * force * 0.3;
            p.y += (dy / dist) * force * 0.2;
          }
        }

        // Slow upward drift
        p.y += p.vy;

        // Gentle horizontal drift
        p.x += Math.sin(timestamp * 0.0001 + i) * 0.02;

        // Fade logic
        if (p.y > ch * 0.8) {
          p.opacity = Math.min(p.opacity + p.fadeSpeed * 2, 0.5);
        } else if (p.y < ch * 0.1) {
          p.opacity = Math.max(p.opacity - p.fadeSpeed * 3, 0);
        } else {
          p.opacity = Math.min(p.opacity + p.fadeSpeed, 0.5);
        }

        // Reset particle when it goes off screen
        if (p.y < -10 || p.opacity <= 0 || p.x < -50 || p.x > cw + 50) {
          particles[i] = createParticle(cw, ch, true);
        }

        // Draw particle (simple dot, NO lines)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [createParticle]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Base: Deep black */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Single focused radial glow behind title area */}
      <div 
        className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Canvas for micro-particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Very subtle grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
