import { motion } from "framer-motion";

const auroraBlobs = [
  {
    className: "top-[-20%] left-[-15%] w-[800px] h-[800px]",
    color: "bg-emerald-500/[0.06]",
    animate: { x: [0, 80, -40, 0], y: [0, 60, -30, 0], scale: [1, 1.15, 0.95, 1] },
    duration: 35,
  },
  {
    className: "bottom-[-25%] right-[-20%] w-[900px] h-[900px]",
    color: "bg-blue-900/[0.08]",
    animate: { x: [0, -70, 50, 0], y: [0, -80, 40, 0], scale: [1, 0.9, 1.1, 1] },
    duration: 42,
  },
  {
    className: "top-[40%] left-[30%] w-[600px] h-[600px]",
    color: "bg-emerald-600/[0.04]",
    animate: { x: [0, -50, 30, 0], y: [0, 40, -50, 0], scale: [1, 1.08, 0.92, 1] },
    duration: 50,
  },
  {
    className: "top-[10%] right-[10%] w-[500px] h-[500px]",
    color: "bg-cyan-900/[0.05]",
    animate: { x: [0, 40, -60, 0], y: [0, -30, 50, 0], scale: [1, 0.95, 1.05, 1] },
    duration: 38,
  },
];

export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Base layer — deep dark background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Aurora blobs — extremely subtle, high blur, slow movement */}
      {auroraBlobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blob.className} ${blob.color} blur-[200px]`}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Very subtle grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
