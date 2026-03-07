import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  layer: number; // 0=deep, 1=mid, 2=front for parallax
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create neural network nodes
    const count = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    nodesRef.current = Array.from({ length: count }, () => {
      const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
      const speed = 0.15 + layer * 0.1;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: 1 + layer * 0.8 + Math.random() * 1.2,
        pulsePhase: Math.random() * Math.PI * 2,
        layer,
      };
    });

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    const CONNECTION_DIST = 140;
    const MOUSE_BOOST_DIST = 200;

    const animate = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.x = Math.max(0, Math.min(canvas.width, n.x));
        n.y = Math.max(0, Math.min(canvas.height, n.y));
      }

      // Draw connections (synapses)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST);

            // Check mouse proximity for boost
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const dxM = midX - mouse.x;
            const dyM = midY - mouse.y;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM);
            const mouseBoost = distM < MOUSE_BOOST_DIST ? (1 - distM / MOUSE_BOOST_DIST) * 0.4 : 0;

            // Pulse effect along synapses
            const pulse = Math.sin(t * 3 + i * 0.5) * 0.5 + 0.5;
            const finalAlpha = alpha * (0.08 + pulse * 0.07 + mouseBoost);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(160, 84%, 45%, ${finalAlpha})`;
            ctx.lineWidth = 0.5 + mouseBoost * 2;
            ctx.stroke();

            // Traveling signal effect (data packets along synapses)
            if (alpha > 0.4 && pulse > 0.7) {
              const signalPos = (t * 2 + i * 0.3) % 1;
              const sx = a.x + (b.x - a.x) * signalPos;
              const sy = a.y + (b.y - a.y) * signalPos;
              ctx.beginPath();
              ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `hsla(160, 84%, 60%, ${alpha * 0.6})`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes (neurons)
      for (const n of nodes) {
        const pulse = Math.sin(t * 2 + n.pulsePhase) * 0.5 + 0.5;
        const dxM = n.x - mouse.x;
        const dyM = n.y - mouse.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        const mouseGlow = distM < MOUSE_BOOST_DIST ? (1 - distM / MOUSE_BOOST_DIST) : 0;

        const baseAlpha = 0.3 + n.layer * 0.1;
        const glowRadius = n.radius + pulse * 2 + mouseGlow * 4;

        // Outer glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius * 3);
        gradient.addColorStop(0, `hsla(160, 84%, 45%, ${(baseAlpha * 0.4 + mouseGlow * 0.3)})`);
        gradient.addColorStop(1, `hsla(160, 84%, 45%, 0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + mouseGlow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 84%, 50%, ${baseAlpha + pulse * 0.2 + mouseGlow * 0.4})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "hsl(var(--background))" }}
    />
  );
}
