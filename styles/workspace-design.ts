/**
 * Phase 12 — Premium workspace / studio visual system.
 * Restrained continuity environment: calm depth, silver continuity surfaces,
 * image-first cards, unified modals. Pair with classes in `app/globals.css`.
 */

import { depth, glass, motion } from "./system-design";

export const workspaceMotion = {
  ease: motion.ease,
  easeCss: motion.easeCss,
  durationMs: motion.durationStandardMs,
  durationModalMs: motion.durationModalMs,
  durationEnterMs: motion.durationEnterMs,
} as const;

/** Workspace page atmospheres */
export const workspaceAtmosphere = {
  /** Default signed-in wash — uses global v2 environment layer */
  environment: "rrowm-app-shell",
  /** Continuity: certificates, ownership ledger, provenance handoffs */
  silver: "rrowm-zone-registry ds-silver-environment",
  studio: "rrowm-app-shell",
  artworks: "rrowm-app-shell",
  continuity: "rrowm-zone-registry rrowm-grad-continuity",
} as const;

/** Typography — Cormorant display + Inter UI + mono registry metadata */
export const workspaceType = {
  pageTitle: "v2-type-display text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--v2-ink)] md:text-[2.35rem]",
  sectionTitle:
    "v2-type-display text-[1.75rem] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--v2-ink)] md:text-[1.85rem]",
  cardTitle:
    "v2-type-display text-lg font-normal leading-snug tracking-[-0.01em] text-[var(--v2-ink)] md:text-xl",
  cardArtist: "v2-type-body text-[15px]",
  label: "text-[14px] font-medium text-[var(--v2-ink-muted)]",
  meta: "v2-type-body text-[15px]",
  metaQuiet: "v2-type-mono text-[13px]",
  registryId: "v2-type-mono",
  navItem: "v2-type-label text-[11px] tracking-[0.2em]",
  navItemActive: "v2-type-label text-[11px] tracking-[0.2em] text-[var(--v2-near-black)]",
  navItemIdle: "v2-type-label text-[11px] tracking-[0.2em] text-[var(--v2-cool-grey)]",
} as const;

export const workspaceSpace = {
  sectionY: "py-20 md:py-28",
  stack: "space-y-12 md:space-y-16",
  cardPad: "p-6 md:p-7",
  grid: "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3",
} as const;

/** Premium artwork card — archival catalogue sheet */
export const workspaceCard = {
  link: "studio-catalogue-sheet v2-motion-hover-subtle group relative block cursor-pointer overflow-hidden pl-3",
  media: "studio-catalogue-sheet__media relative aspect-[4/5] w-full overflow-hidden bg-[var(--v2-cool-grey)]/8",
  mediaImg:
    "h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]",
  surface: "px-4 pb-4 pt-4",
  reveal:
    "border-t border-[var(--v2-border)] bg-white/70 px-4 py-4 flex flex-col gap-4",
  pill:
    "inline-flex rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-[var(--v2-ink-muted)] ring-1 ring-[var(--v2-border)]",
  pillVerified:
    "inline-flex rounded-full bg-[var(--v2-cobalt-signal-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--v2-ink)] ring-1 ring-[var(--v2-border)]",
} as const;

/** Floating panels — account, settings, workspace sections */
export const workspacePanel = {
  shell: "v2-surface-paper v2-radius-card p-7 sm:p-8 md:p-9",
  title: workspaceType.sectionTitle,
  description: "mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500",
  body: "mt-10",
} as const;

/** Modal presets — use with ModalShell `tone` */
export const workspaceModal = {
  overlay: `${glass.liquidBackdrop} backdrop-blur-xl ${depth.className.modalBackdrop} fixed inset-0 flex flex-col items-center overflow-y-auto overscroll-y-contain px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(4.5rem+env(safe-area-inset-top,0px))] transition-opacity duration-300 ease-out sm:px-6 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:px-8 md:pt-[calc(5rem+env(safe-area-inset-top,0px))]`,
  overlaySilver:
    "ws-modal-backdrop-silver backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex flex-col items-center overflow-y-auto overscroll-y-contain px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(4.5rem+env(safe-area-inset-top,0px))] transition-opacity duration-300 ease-out sm:px-6 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:px-8 md:pt-[calc(5rem+env(safe-area-inset-top,0px))]",
  panelSize: "w-full max-w-lg p-8 md:max-w-xl md:p-10",
  panelGlassLight: `${glass.liquidPremium} ${glass.modalPanel}`,
  panelGlassDark: `${glass.liquidDarkPremium} ${glass.modalPanel}`,
  panelGlassSilver: `${glass.liquidSilver} ${glass.modalPanel}`,
  /** @deprecated Use panelGlassLight + panelSize via ModalShell */
  panelLight: `w-full max-w-lg ${glass.liquidPremium} ${glass.modalPanel} rrowm-modal-surface p-8 md:max-w-xl md:p-10`,
  panelDark: `w-full max-w-lg ${glass.liquidDarkPremium} ${glass.modalPanel} rrowm-modal-surface p-8 text-white md:max-w-xl md:p-10`,
  panelSilver: `w-full max-w-lg ${glass.liquidSilver} ${glass.modalPanel} rrowm-modal-surface p-8 md:max-w-xl md:p-10`,
  closeLight:
    "liquid-glass-close absolute right-4 top-4 z-10 rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-600 transition duration-300 ease-out hover:text-neutral-900 sm:right-5 sm:top-5",
  closeDark:
    "liquid-glass-close-dark absolute right-4 top-4 z-10 rounded-xl px-3.5 py-2 text-xs font-medium text-white/75 transition duration-300 ease-out hover:text-white sm:right-5 sm:top-5",
  closeSilver:
    "liquid-glass-close-silver absolute right-4 top-4 z-10 rounded-xl px-3.5 py-2 text-xs font-medium text-neutral-600 transition duration-300 ease-out hover:text-neutral-900 sm:right-5 sm:top-5",
  field: `${glass.liquidInsetPremium} !rounded-xl mt-3 w-full border-0 px-4 py-3.5 text-sm text-neutral-900 outline-none`,
} as const;

export const workspaceNav = {
  item: "group relative w-full text-left transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  label: "flex items-center gap-2.5",
  underline:
    "absolute -bottom-2 left-0 h-px rounded-full bg-neutral-900 transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  dot: "inline-flex h-1.5 w-1.5 rounded-full bg-amber-500/80",
} as const;

export const workspace = {
  motion: workspaceMotion,
  atmosphere: workspaceAtmosphere,
  type: workspaceType,
  space: workspaceSpace,
  card: workspaceCard,
  panel: workspacePanel,
  modal: workspaceModal,
  nav: workspaceNav,
} as const;
