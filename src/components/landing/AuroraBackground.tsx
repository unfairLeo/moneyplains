import { motion } from "framer-motion";

const blobs = [
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
    className: "top-[25%] left-[35%] w-[600px] h-[600px] bg-emerald-400/[0.08] blur-[220px]",
    animate: { x: [0, 50, -70, 0], y: [0, -60, 80, 0], scale: [1, 1.08, 0.92, 1] },
    duration: 25,
  },
  {
    className: "top-[60%] right-[20%] w-[400px] h-[400px] bg-blue-900/[0.06] blur-[160px]",
    animate: { x: [0, -40, 30, 0], y: [0, 50, -30, 0], scale: [1, 1.05, 0.97, 1] },
    duration: 30,
  },
];

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {blobs.map((blob, i) => (
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
    </div>
  );
}
