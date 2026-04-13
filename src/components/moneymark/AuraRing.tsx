import { motion } from "framer-motion";

interface AuraRingProps {
  delay: number;
  size: number;
  color: string;
  duration: number;
}

export function AuraRing({ delay, size, color, duration }: AuraRingProps) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(30px)",
      }}
      animate={{
        scale: [1, 1.15, 0.95, 1.1, 1],
        rotate: [0, 90, 180, 270, 360],
        opacity: [0.3, 0.6, 0.35, 0.55, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}
