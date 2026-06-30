/**
 * RROWM semantic motion — registry events move with meaning.
 * Museum archive × Bloomberg terminal × cinematic editorial.
 *
 * See `.cursor/rules/rrowm-semantic-signals.mdc`
 */

import type { Transition } from "framer-motion";

import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";

import { v2EaseBezier } from "./rrowm-v2";

export type SemanticMotionPreset =
  | "registryLockIn"
  | "valuationPulse"
  | "saleFlash"
  | "transferSweep"
  | "sealStamp"
  | "correctionReveal";

/** Registry semantic event → motion preset */
export const SEMANTIC_MOTION_BY_EVENT: Record<
  RegistrySemanticEvent,
  SemanticMotionPreset
> = {
  registration: "registryLockIn",
  valuation: "valuationPulse",
  sale: "saleFlash",
  transfer: "transferSweep",
  certification: "sealStamp",
  correction: "correctionReveal",
};

/** CSS custom property durations (seconds) — mirrored in globals.css */
export const SEMANTIC_MOTION_DURATION_S: Record<SemanticMotionPreset, number> = {
  registryLockIn: 1,
  valuationPulse: 1.25,
  saleFlash: 0.8,
  transferSweep: 1.2,
  sealStamp: 0.6,
  correctionReveal: 1.35,
};

const SEMANTIC_MOTION_CSS: Record<SemanticMotionPreset, string> = {
  registryLockIn: "v2-semantic-motion--registry-lock-in",
  valuationPulse: "v2-semantic-motion--valuation-pulse",
  saleFlash: "v2-semantic-motion--sale-flash",
  transferSweep: "v2-semantic-motion--transfer-sweep",
  sealStamp: "v2-semantic-motion--seal-stamp",
  correctionReveal: "v2-semantic-motion--correction-reveal",
};

export const semanticMotionBaseClass = "v2-semantic-motion" as const;

export function semanticMotionPresetForEvent(
  event: RegistrySemanticEvent
): SemanticMotionPreset {
  return SEMANTIC_MOTION_BY_EVENT[event];
}

export function semanticMotionClass(preset: SemanticMotionPreset): string {
  return `${semanticMotionBaseClass} ${SEMANTIC_MOTION_CSS[preset]}`;
}

export function semanticMotionClassForEvent(
  event: RegistrySemanticEvent
): string {
  return semanticMotionClass(semanticMotionPresetForEvent(event));
}

export type SemanticMotionVariant = {
  initial: Record<string, number>;
  animate: Record<string, number | number[]>;
};

/** Framer Motion variant tuples — weighted ease-out, no spring */
export function semanticMotionVariants(
  preset: SemanticMotionPreset
): SemanticMotionVariant {
  switch (preset) {
    case "registryLockIn":
      return {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
      };
    case "valuationPulse":
      return {
        initial: { opacity: 0.78 },
        animate: { opacity: [0.78, 1, 0.92, 1] },
      };
    case "saleFlash":
      return {
        initial: { opacity: 0 },
        animate: { opacity: [0, 1, 0.96, 1] },
      };
    case "transferSweep":
      return {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
      };
    case "sealStamp":
      return {
        initial: { opacity: 0, scale: 1.04 },
        animate: { opacity: 1, scale: 1 },
      };
    case "correctionReveal":
      return {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
      };
    default:
      return {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
      };
  }
}

export function semanticMotionFramerTransition(
  preset: SemanticMotionPreset,
  reducedMotion: boolean
): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }
  const ease = preset === "sealStamp" ? v2EaseBezier.stamp : v2EaseBezier.out;
  return {
    duration: SEMANTIC_MOTION_DURATION_S[preset],
    ease,
  };
}

export type SemanticMotionFramerProps = {
  initial: false | Record<string, number>;
  animate?: Record<string, number | number[]>;
  transition: Transition;
};

/** Spread onto `motion.*` for state-driven transitions */
export function semanticMotionFramerProps(
  preset: SemanticMotionPreset,
  reducedMotion: boolean
): SemanticMotionFramerProps {
  if (reducedMotion) {
    return { initial: false, transition: { duration: 0 } };
  }
  const variants = semanticMotionVariants(preset);
  return {
    initial: variants.initial,
    animate: variants.animate,
    transition: semanticMotionFramerTransition(preset, false),
  };
}

/** Compose with v2 motion class names — semantic append replaces generic ledger append */
export const semanticMotion = {
  base: semanticMotionBaseClass,
  class: semanticMotionClass,
  forEvent: semanticMotionClassForEvent,
  presetForEvent: semanticMotionPresetForEvent,
  variants: semanticMotionVariants,
  framerProps: semanticMotionFramerProps,
  duration: SEMANTIC_MOTION_DURATION_S,
} as const;
