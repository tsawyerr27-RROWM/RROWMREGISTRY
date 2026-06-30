"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useLandingMotion } from "@/hooks/useLandingMotion";
import { landingEase, landingEaseStamp, landingMotion } from "@/styles/landing-redesign";

const viewport = { once: true, margin: "-8% 0px -6% 0px", amount: 0.12 } as const;

type RevealVariant = "default" | "file" | "stamp" | "append";

const VARIANTS: Record<
  RevealVariant,
  { initial: Record<string, number>; animate: Record<string, number>; ease: readonly number[]; duration: number }
> = {
  default: {
    initial: { opacity: 0, y: landingMotion.revealY },
    animate: { opacity: 1, y: 0 },
    ease: landingEase,
    duration: landingMotion.revealDuration,
  },
  file: {
    initial: { opacity: 0, x: -28, rotate: -0.6 },
    animate: { opacity: 1, x: 0, rotate: 0 },
    ease: landingEase,
    duration: landingMotion.revealDuration,
  },
  stamp: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    ease: landingEaseStamp,
    duration: 1.1,
  },
  append: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    ease: landingEase,
    duration: 1.15,
  },
};

export function LandingReveal({
  children,
  className = "",
  delay = 0,
  id,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  variant?: RevealVariant;
}) {
  const { motionEnabled } = useLandingMotion();
  const preset = VARIANTS[variant];
  const shellClass = className ? ` ${className}` : "";

  if (!motionEnabled) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={`transform-gpu will-change-transform${shellClass}`}
      initial={preset.initial}
      whileInView={preset.animate}
      viewport={viewport}
      transition={{
        duration: preset.duration,
        delay,
        ease: preset.ease,
      }}
    >
      {children}
    </motion.div>
  );
}
