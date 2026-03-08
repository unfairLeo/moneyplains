import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  baseVy: number;
  vy: number;
  vx: number;
  radius: number;
  opacity: number;
  fadeSpeed: number;
}

const CONNECTION_DIST = 100;
const MOUSE_RADIUS = 150;
const REPEL_FORCE = 2.5;

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const createParticle = useCallback((w: number, h: number, bottom = false): Particle => ({
    x: Math.random() * w,
    y: bottom ? h + Math.random() * 40 : Math.random() * h,
    baseVy: -(0.15 + Math.random() * 0.35),
    vy: -(0.15 + Math.random() * 0.35),
    vx: 0,
    radius: 0.5 + Math.random() * 1.2,
    opacity: 0,
    fadeSpeed: 0.003 + Math.random() * 0.005,
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
    const count = isMobile ? 30 : 60;
    const w = window.innerWidth;
    const h = window.innerHeight;

    particlesRef.current = Array.from({ length: count }, () => {
      const p = createParticle(w, h, false);
      p.opacity = Math.random() * 0.5;
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

        // Mouse repulsion
        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force * 0.5;
          }
        }

        // Apply velocity with damping
        p.vx *= 0.92;
        p.vy = p.vy * 0.92 + p.baseVy * 0.08;
        p.x += p.vx;
        p.y += p.vy;

        // Fade logic
        if (p.y > ch * 0.7) {
          p.opacity = Math.min(p.opacity + p.fadeSpeed * 2, 0.6);
        } else if (p.y < ch * 0.15) {
          p.opacity = Math.max(p.opacity - p.fadeSpeed * 3, 0);
        } else {
          p.opacity = Math.min(p.opacity + p.fadeSpeed, 0.6);
        }

        // Reset
        if (p.y < -10 || (p.y < ch * 0.1 && p.opacity <= 0) || p.x < -50 || p.x > cw + 50) {
          particles[i] = createParticle(cw, ch, true);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections near mouse
      if (mouseActive) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const dxA = a.x - mx;
          const dyA = a.y - my;
          const distA = Math.sqrt(dxA * dxA + dyA * dyA);
          if (distA > MOUSE_RADIUS) continue;

          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dxB = b.x - mx;
            const dyB = b.y - my;
            if (Math.abs(dxB) > MOUSE_RADIUS || Math.abs(dyB) > MOUSE_RADIUS) continue;
            const distB = Math.sqrt(dxB * dxB + dyB * dyB);
            if (distB > MOUSE_RADIUS) continue;

            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              const alpha = (1 - dist / CONNECTION_DIST) * 0.25 * Math.min(a.opacity, b.opacity);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
