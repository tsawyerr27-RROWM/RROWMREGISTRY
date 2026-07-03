/**
 * Field signature — canonical discovery surface primitives.
 * Museum archive × financial terminal × cultural intelligence rail.
 */

import { fieldV2Scope } from "./field-v2";
import { v2Motion } from "./rrowm-v2";

export const fieldSignatureScope = `${fieldV2Scope} field-signature` as const;

export const fieldSignatureSurfaces = {
  darkHero: "field-signature-dark-hero",
  paperTransition: "field-signature-paper-transition",
  terminalStrip: "field-signature-terminal-strip",
  clusterSlab: "field-signature-cluster-slab",
  signalLine: "field-signature-signal-line",
  signalCanvas: "field-signature-signal-canvas",
  archiveRail: "field-signature-archive-rail",
  archiveNav: "field-signature-archive-nav",
} as const;

export const fieldSignatureMotion = {
  subtleSignalPulse: "field-signature-motion-subtle-pulse",
  slabReveal: "field-signature-motion-slab-reveal",
  terminalCountReveal: "field-signature-motion-terminal-count",
  nodePulse: "field-signature-motion-node-pulse",
  className: {
    subtleSignalPulse: "field-signature-motion-subtle-pulse",
    slabReveal: "field-signature-motion-slab-reveal",
    terminalCountReveal: "field-signature-motion-terminal-count",
    nodePulse: "field-signature-motion-node-pulse",
  },
} as const;

export const fieldSignatureTypography = {
  heroDisplay:
    "field-signature-type-hero font-serif text-[clamp(2.5rem,7vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.025em] text-[var(--field-signature-hero-ink)]",
  terminalMono:
    "field-signature-type-terminal font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--field-signature-terminal-ink)]",
  coord:
    "field-signature-type-coord font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-[var(--field-signature-coord-ink)]",
  slabMeta:
    "field-signature-type-slab-meta font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]",
  slabClassificationRail:
    "field-signature-type-slab-classification font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--v2-ink-soft)]",
  slabIndex:
    "field-signature-type-slab-index font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--v2-ink-muted)]",
  slabTitle:
    "field-signature-type-slab-title font-serif text-xl font-normal leading-snug tracking-tight text-[var(--v2-ink)] md:text-2xl",
  slabDescriptor:
    "field-signature-type-slab-desc text-sm leading-relaxed text-[var(--v2-ink-soft)]",
  archiveRailTitle:
    "field-signature-type-archive-title font-serif text-2xl font-normal tracking-tight text-[var(--v2-ink)] md:text-[1.75rem]",
  archiveSearchLabel:
    "field-signature-type-archive-label font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--v2-ink-muted)]",
  archivePrompt:
    "field-signature-type-archive-prompt shrink-0 font-mono text-sm text-[var(--v2-ink-muted)]",
  archiveSearchInput:
    "field-signature-archive-search__input min-w-0 flex-1 bg-transparent font-mono text-sm text-[var(--v2-ink)] placeholder:text-[var(--v2-cool-grey)] focus:outline-none",
  archiveSearchSubmit:
    "field-signature-archive-search__submit shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--v2-ink)] transition hover:text-[var(--v2-cobalt-signal)]",
  archiveNavLink:
    "field-signature-archive-nav__link font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--v2-ink-muted)] no-underline transition hover:text-[var(--v2-ink)]",
} as const;

export const fieldSignatureSignals = {
  records: "field-signature-signal--records",
  creatives: "field-signature-signal--creatives",
  opportunities: "field-signature-signal--opportunities",
  organisations: "field-signature-signal--organisations",
} as const;

export const fieldSignature = {
  scope: fieldSignatureScope,
  surfaces: fieldSignatureSurfaces,
  motion: fieldSignatureMotion,
  type: fieldSignatureTypography,
  signals: fieldSignatureSignals,
  reveal: v2Motion.revealSlow,
} as const;
