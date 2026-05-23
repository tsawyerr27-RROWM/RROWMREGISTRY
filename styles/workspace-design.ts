/**
 * Phase 12 — Premium workspace / studio visual system.
 * Restrained continuity environment: calm depth, silver continuity surfaces,
 * image-first cards, unified modals. Pair with classes in `app/globals.css`.
 */

import { depth, glass, motion, type } from "./system-design";

export const workspaceMotion = {
  ease: motion.ease,
  easeCss: motion.easeCss,
  durationMs: motion.durationStandardMs,
  durationModalMs: motion.durationModalMs,
  durationEnterMs: motion.durationEnterMs,
} as const;

/** Workspace page atmospheres */
export const workspaceAtmosphere = {
  /** Default signed-in wash — collector, institutional, account */
  environment: "ds-workspace-environment",
  /** Continuity: certificates, ownership ledger, provenance handoffs */
  silver: "ds-silver-environment",
  studio: "rrowm-grad-studio",
  artworks: "rrowm-grad-artworks",
  continuity: "rrowm-grad-continuity",
} as const;

/** Typography — Raleway UI + loaded serif for titles */
export const workspaceType = {
  pageTitle: `${type.titleSerifLg}`,
  sectionTitle:
    "font-serif text-2xl font-normal leading-[1.12] tracking-tight text-neutral-950 md:text-[1.65rem]",
  cardTitle:
    "font-serif text-lg font-normal leading-snug tracking-tight text-neutral-950 md:text-xl",
  cardArtist: "text-sm text-neutral-500",
  label: "text-sm font-medium text-neutral-700",
  meta: "text-sm text-neutral-500",
  metaQuiet: "text-xs leading-relaxed text-neutral-500",
  registryId: "font-mono text-[10px] tracking-wide text-neutral-400",
  navItem: "text-sm font-medium",
  navItemActive: "text-sm font-medium text-neutral-950",
  navItemIdle: "text-sm font-medium text-neutral-500",
} as const;

export const workspaceSpace = {
  sectionY: "py-16 md:py-20",
  stack: "space-y-10 md:space-y-12",
  cardPad: "p-5 md:p-6",
  grid: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
} as const;

/** Premium artwork card — image-first, minimal surface */
export const workspaceCard = {
  link: "ws-artwork-card group relative block overflow-hidden rounded-2xl border border-neutral-900/[0.06] bg-white/60 shadow-[0_24px_64px_-40px_rgba(15,23,42,0.14)] backdrop-blur-[6px] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_32px_72px_-38px_rgba(15,23,42,0.16)]",
  media: "relative aspect-[4/3] w-full overflow-hidden bg-neutral-100/80",
  mediaImg:
    "h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]",
  surface: "px-5 pb-5 pt-4",
  reveal:
    "border-t border-neutral-900/[0.06] bg-white/50 px-5 py-4 opacity-100 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100",
  pill:
    "inline-flex rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-600 ring-1 ring-neutral-900/[0.06]",
  pillVerified:
    "inline-flex rounded-full bg-neutral-900/[0.04] px-2 py-0.5 text-[10px] font-medium text-neutral-800 ring-1 ring-neutral-900/[0.06]",
} as const;

/** Floating panels — account, settings, workspace sections */
export const workspacePanel = {
  shell:
    "rounded-2xl border border-neutral-900/[0.06] bg-white/55 p-6 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-7 md:p-8",
  title: workspaceType.sectionTitle,
  description: "mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500",
  body: "mt-8",
} as const;

/** Modal presets — use with ModalShell `tone` */
export const workspaceModal = {
  overlay: `${glass.liquidBackdrop} backdrop-blur-xl ${depth.className.modalBackdrop} fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ease-out sm:p-6 md:p-8`,
  overlaySilver:
    "ws-modal-backdrop-silver backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ease-out sm:p-6 md:p-8",
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
