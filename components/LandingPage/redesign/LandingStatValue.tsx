"use client";

import { motion, useReducedMotion } from "framer-motion";

import { formatLandingStat } from "@/lib/landing-public-stats";
import { landingEase } from "@/styles/landing-redesign";

export function LandingStatValue({
  value,
  loading,
  className = "",
}: {
  value: number | null;
  loading?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const display = loading || value == null ? "-" : formatLandingStat(value);

  return (
    <motion.span
      className={className}
      key={display}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: landingEase }}
    >
      {display}
    </motion.span>
  );
}
