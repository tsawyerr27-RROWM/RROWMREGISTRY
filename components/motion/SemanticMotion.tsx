"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";
import {
  semanticMotionClass,
  semanticMotionFramerProps,
  semanticMotionPresetForEvent,
  type SemanticMotionPreset,
} from "@/styles/semantic-motion";

type ElementTag = "div" | "li" | "article" | "section";

const TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  section: motion.section,
} as const;

type SemanticMotionProps = {
  preset?: SemanticMotionPreset;
  event?: RegistrySemanticEvent;
  as?: ElementTag;
  className?: string;
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  motionKey?: string;
};

function resolvePreset(
  preset: SemanticMotionPreset | undefined,
  event: RegistrySemanticEvent | undefined
): SemanticMotionPreset {
  if (preset) return preset;
  if (event) return semanticMotionPresetForEvent(event);
  return "registryLockIn";
}

/**
 * Semantic registry motion wrapper.
 * CSS keyframes for append surfaces; Framer for keyed state transitions when `motionKey` is set.
 */
export function SemanticMotion({
  preset,
  event,
  as = "div",
  className = "",
  children,
  delay = 0,
  style,
  motionKey,
}: SemanticMotionProps) {
  const reduced = useReducedMotion() ?? false;
  const resolved = resolvePreset(preset, event);
  const cssClass = semanticMotionClass(resolved);
  const Tag = TAGS[as];

  const delayStyle: CSSProperties | undefined =
    delay > 0 || style
      ? { ...style, ...(delay > 0 ? { animationDelay: `${delay}s` } : {}) }
      : style;

  if (reduced) {
    const Static = as;
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  if (motionKey) {
    const framer = semanticMotionFramerProps(resolved, false);
    return (
      <Tag
        key={motionKey}
        className={`${cssClass} ${className}`.trim()}
        style={delayStyle}
        initial={framer.initial === false ? false : framer.initial}
        animate={framer.animate}
        transition={{
          ...framer.transition,
          delay,
        }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={`${cssClass} ${className}`.trim()}
      style={delayStyle}
      initial={false}
    >
      {children}
    </Tag>
  );
}
