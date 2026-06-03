/**
 * RROWM design system — single source of truth for aesthetic tokens.
 * Visual/interaction only. Maps to CSS variables and utility classes in `app/globals.css`.
 */

/** Page & surface neutrals (align with :root in globals.css) */
export const color = {
  base: "#fafcfd",
  baseSoft: "#ffffff",
  baseMid: "#f4f8fb",
  baseDeep: "#eef3f7",
  ink: "#171717",
  /** Prefer over pure black for UI */
  inkSoft: "#262626",
} as const;

/**
 * Stacking: use `depth.className` entries and matching rules in globals.css for z-index.
 * Avoid embedding CSS variables in Tailwind arbitrary z utilities. Numeric values are for JS-only logic.
 */
export const depth = {
  cssVarBase: "--ds-z-base",
  cssVarContent: "--ds-z-content",
  cssVarFloating: "--ds-z-floating",
  cssVarModalBackdrop: "--ds-z-modal-backdrop",
  cssVarModal: "--ds-z-modal",
  className: {
    content: "ds-z-content",
    floating: "ds-z-floating",
    modalBackdrop: "ds-z-modal-backdrop",
    modal: "ds-z-modal",
  },
  content: 10,
  floating: 50,
  modalBackdrop: 100,
  modal: 110,
} as const;

/** Glass utility class names (defined in globals.css) */
export const glass = {
  soft: "glass-soft",
  strong: "glass-strong",
  overlay: "glass-overlay",
  /** Sharp-edged frosted panels (modals, cards) */
  liquid: "liquid-glass",
  liquidDark: "liquid-glass-dark",
  liquidBackdrop: "liquid-glass-backdrop",
  liquidInset: "liquid-glass-inset",
  liquidInsetDark: "liquid-glass-inset-dark",
  liquidClose: "liquid-glass-close",
  liquidCloseDark: "liquid-glass-close-dark",
  liquidTile: "liquid-glass-tile",
  liquidTileDark: "liquid-glass-tile-dark",
  /** Phase 12 — rounded premium panels (workspace + modals) */
  liquidPremium: "liquid-glass-premium",
  liquidDarkPremium: "liquid-glass-dark-premium",
  liquidSilver: "liquid-glass-silver",
  liquidInsetPremium: "liquid-glass-inset-premium",
  liquidTilePremium: "liquid-glass-tile-premium",
  /** Extra lift on modal panels — pairs with premium/silver/dark glass */
  modalPanel: "rrowm-modal-panel",
} as const;

/** Surface roles — semantic class names */
export const surface = {
  baseLayer: "rrowm-bg-page",
  elevated: "glass-strong",
  interactive: "rrowm-surface-interactive",
  /** Full-bleed editorial page wash */
  pageEnvironment: "ds-page-environment",
  /** Phase 12 — premium workspace wash */
  workspaceEnvironment: "ds-workspace-environment",
  silverEnvironment: "ds-silver-environment",
  warmVertical: "rrowm-bg-page-warm",
  /** Solid panel — minimal chrome, no glass (see `rrowm-panel-quiet` in globals.css) */
  panelQuiet: "rrowm-panel-quiet",
  sectionPad: "rrowm-section-pad",
  stackGap: "rrowm-stack-gap",
} as const;

/** Unified motion — subtle fade + shadow; avoid bouncy / large translation */
export const motion = {
  ease: [0.22, 1, 0.36, 1] as const,
  easeCss: "cubic-bezier(0.22, 1, 0.36, 1)",
  durationEnterMs: 420,
  durationModalMs: 280,
  durationQuickMs: 220,
  durationStandardMs: 240,
  durationFadeMs: 180,
  classTransition: "rrowm-ds-transition",
} as const;

/** Vertical rhythm — section-scale spacing */
export const space = {
  sectionY: "py-28 md:py-36",
  sectionYLoose: "py-32 md:py-40",
  blockGap: "gap-14 md:gap-20",
  /** Horizontal gutters when not using `Container` */
  gutter: "px-6 md:px-10",
} as const;

/** Typography — serif for titles; sans for UI chrome */
export const type = {
  /** UI chrome — navigation, labels, dense controls */
  uiSans: "text-sm font-normal text-neutral-600",
  h2: "text-[1.75rem] font-semibold tracking-[-0.02em] text-neutral-950 md:text-[2rem] md:leading-snug",
  /** Section / page titles — prefer over sans h2 for editorial surfaces */
  titleSerifLg:
    "font-serif text-3xl font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-4xl",
  titleSerifHero:
    "font-serif text-5xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-6xl xl:text-7xl",
  lede: "text-[15px] leading-[1.8] text-neutral-600 md:text-base md:leading-[1.85]",
  bodyNarrow: "max-w-2xl",
  bodyMeasure: "max-w-xl",
} as const;

/** Registry-first language — import in UI copy where appropriate */
export const copy = {
  registry: "Registry",
  publicRegistry: "Public registry",
  record: "Registry record",
  verifiedRecord: "Verified record",
  catalogue: "Catalogue",
} as const;

/**
 * Role context classes — add on layout roots; accents are subtle (borders / focus only).
 * Gallery: structured / operational. Collector: calm. Artist: balanced.
 */
export const role = {
  gallery: "rrowm-context-gallery",
  collector: "rrowm-context-collector",
  artist: "rrowm-context-artist",
} as const;

/** Primary / secondary control feel — minimal; no lift on hover */
export const control = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_8px_28px_-22px_rgba(0,0,0,0.35)] transition rrowm-ds-transition hover:bg-neutral-800 hover:shadow-[0_12px_36px_-24px_rgba(0,0,0,0.38)]",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-black/[0.08] bg-white/90 px-7 py-3.5 text-sm font-medium text-neutral-800 transition rrowm-ds-transition hover:border-black/[0.12] hover:bg-white",
  quietLink:
    "border-b border-neutral-900/15 pb-0.5 text-sm font-medium text-neutral-900/75 transition rrowm-ds-transition hover:border-neutral-900/35 hover:text-neutral-900",
} as const;

/**
 * Landing / About — longer tonal transitions, soft press, archival focus rings.
 * Does not replace `control` app-wide; use only on narrative marketing surfaces.
 */
export const narrativeControl = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_32px_-24px_rgba(0,0,0,0.38)] transition-[transform,opacity,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-neutral-800/95 hover:shadow-[0_14px_44px_-28px_rgba(0,0,0,0.42)] active:scale-[0.992] active:shadow-[0_8px_26px_-22px_rgba(0,0,0,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)]",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-neutral-900/[0.09] bg-white/[0.92] px-7 py-3.5 text-sm font-medium text-neutral-800 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] transition-[transform,opacity,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/[0.12] hover:bg-white active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)]",
  quietLink:
    "border-b border-neutral-900/14 pb-0.5 text-sm font-medium text-neutral-900/78 transition-[border-color,color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/38 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)] rounded-sm",
  ctaInline:
    "border-b border-neutral-900/18 pb-0.5 text-neutral-900 transition-[border-color,color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/42 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)] rounded-sm",
  ctaMuted:
    "border-b border-transparent pb-0.5 text-neutral-600 transition-[border-color,color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-500/30 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)] rounded-sm",
} as const;
