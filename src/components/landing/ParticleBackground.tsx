import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vy: number;
  radius: number;
  opacity: number;
  fadeSpeed: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dprRef = useRef(1);

  const createParticle = useCallback((w: number, h: number, startFromBottom = false): Particle => ({
    x: Math.random() * w,
    y: startFromBottom ? h + Math.random() * 40 : Math.random() * h,
    vy: -(0.15 + Math.random() * 0.35),
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
    dprRef.current = dpr;

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

    // Fewer particles on mobile
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 25 : 50;
    const w = window.innerWidth;
    const h = window.innerHeight;

    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(w, h, false)
    );
    // Stagger initial opacity so they don't all appear at once
    particlesRef.current.forEach((p) => {
      p.opacity = Math.random() * 0.5;
    });

    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;

        // Fade in then out
        if (p.y > ch * 0.7) {
          p.opacity = Math.min(p.opacity + p.fadeSpeed * 2, 0.6);
        } else if (p.y < ch * 0.15) {
          p.opacity = Math.max(p.opacity - p.fadeSpeed * 3, 0);
        } else {
          p.opacity = Math.min(p.opacity + p.fadeSpeed, 0.6);
        }

        // Reset when off screen or fully faded at top
        if (p.y < -10 || (p.y < ch * 0.1 && p.opacity <= 0)) {
          particles[i] = createParticle(cw, ch, true);
        }

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
