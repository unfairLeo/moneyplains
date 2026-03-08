import { useState, useEffect, useCallback } from "react";

export function VideoBackground() {
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) return;

    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    const handleLeave = () => setMouse({ x: -9999, y: -9999 });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {/* Layer 1 — Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/fundo-oceano.mp4"
      />

      {/* Layer 2 — Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Layer 3 — Cursor lantern (desktop only) */}
      {!isMobile && mouse.x > -1000 && (
        <div
          className="absolute w-[400px] h-[400px] rounded-full pointer-events-none mix-blend-screen"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            transform: `translate(${mouse.x - 200}px, ${mouse.y - 200}px)`,
            transition: "transform 0.08s linear",
          }}
        />
      )}
    </div>
  );
}
