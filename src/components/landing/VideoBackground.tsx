import { useEffect, useState } from "react";

export function VideoBackground() {
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    const handleLeave = () => setMouse({ x: -9999, y: -9999 });
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const showSpotlight = mouse.x > -1000;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Base: Deep black */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Animated grid layer with radial fade mask */}
      <div
        className="absolute inset-0 animate-grid-pan"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 100%)',
        }}
      />

      {/* Secondary finer dot grid, slightly offset animation */}
      <div
        className="absolute inset-0 animate-grid-pan-slow"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(6, 182, 212, 0.05) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      />

      {/* Mouse spotlight – illuminates grid underneath */}
      {showSpotlight && (
        <div
          className="fixed pointer-events-none z-[1]"
          style={{
            left: mouse.x - 200,
            top: mouse.y - 200,
            width: 400,
            height: 400,
          }}
        >
          {/* Spotlight grid reveal */}
          <div
            className="absolute inset-0 animate-grid-pan"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.12) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, transparent 70%)',
            }}
          />
          {/* Soft glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
