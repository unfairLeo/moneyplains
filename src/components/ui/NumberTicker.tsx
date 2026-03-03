import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  locale?: string;
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 1.2,
  className = "",
  locale = "pt-BR",
}: NumberTickerProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(
        latest.toLocaleString(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      );
    });
    return unsubscribe;
  }, [springValue, locale, decimals]);

  return (
    <motion.span className={className}>
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}
