import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const staticBlobs = [
  {
    className: "top-[-15%] left-[-10%] w-[700px] h-[700px] bg-emerald-500/[0.12] blur-[180px]",
    animate: { x: [0, 100, -50, 0], y: [0, 70, -40, 0], scale: [1, 1.1, 0.95, 1] },
    duration: 22,
  },
  {
    className: "bottom-[-20%] right-[-10%] w-[650px] h-[650px] bg-green-900/[0.15] blur-[200px]",
    animate: { x: [0, -80, 60, 0], y: [0, -90, 50, 0], scale: [1, 0.9, 1.05, 1] },
    duration: 28,
  },
  {
    className: "top-[60%] right-[20%] w-[400px] h-[400px] bg-blue-900/[0.06] blur-[160px]",
    animate: { x: [0, -40, 30, 0], y: [0, 50, -30, 0], scale: [1, 1.05, 0.97, 1] },
    duration: 30,
  },
];

const springConfig = { damping: 60, stiffness: 30, mass: 2 };

export function AuroraBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useMotionValue(-9999);
  const cursorY = useMotionValue(-9999);

  // Aurora blob follows mouse with heavy spring
  const auroraX = useSpring(mouseX, springConfig);
  const auroraY = useSpring(mouseY, springConfig);

  // Cursor glow follows precisely with lighter spring
  const glowX = useSpring(cursorX, { damping: 30, stiffness: 200, mass: 0.5 });
  const glowY = useSpring(cursorY, { damping: 30, stiffness: 200, mass: 0.5 });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleMouse = (e: MouseEvent) => {
      // Aurora offset: center the blob around cursor
      mouseX.set(e.clientX - window.innerWidth * 0.5);
      mouseY.set(e.clientY - window.innerHeight * 0.4);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
      cursorX.set(-9999);
      cursorY.set(-9999);
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY, cursorX, cursorY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {/* Static aurora blobs */}
      {staticBlobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blob.className}`}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mouse-tracking aurora blob */}
      {!isMobile && (
        <motion.div
          className="absolute top-[30%] left-[40%] w-[550px] h-[550px] rounded-full bg-emerald-400/[0.10] blur-[220px]"
          style={{ x: auroraX, y: auroraY }}
        />
      )}

      {/* Cursor glow */}
      {!isMobile && (
        <motion.div
          className="fixed w-[300px] h-[300px] rounded-full bg-green-500/[0.05] blur-[80px]"
          style={{
            x: glowX,
            y: glowY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      )}
    </div>
  );
}
