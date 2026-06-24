/**
 * PR-DESIGN.1 / 1.1 — RROWM premium visual language (global design system).
 * Surface-first: mostly white canvas, color lives in floating blocks.
 * Pair with CSS utilities in `app/globals.css`.
 */

export type RrowmZone = "field" | "registry" | "studio" | "economic";

export type RrowmFloatingBlockSize = "default" | "compact" | "hero";

/** Near-white zone canvases — subtle mood, not obvious tint (PR-DESIGN.1.1) */
export const rrowmZonePalette = {
  field: {
    background: "#FCFBF9",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    accent: "#C8922D",
    secondary: "#5C4A32",
    border: "rgba(185, 145, 90, 0.14)",
  },
  registry: {
    background: "#FCFBF8",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    accent: "#8B6B3E",
    secondary: "#54483A",
    border: "rgba(110, 85, 55, 0.12)",
  },
  studio: {
    background: "#FAFAF8",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    accent: "#4D5B8A",
    secondary: "#2E3448",
    border: "rgba(80, 90, 120, 0.10)",
  },
  economic: {
    background: "#FCFAF7",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    accent: "#A97A50",
    secondary: "#3D465C",
    highlight: "#7A4B32",
    border: "rgba(169, 122, 80, 0.14)",
  },
} as const;

/** CSS class names — set zone tokens on ancestors; surfaces inherit via custom properties */
export const rrowmZoneClass: Record<RrowmZone, string> = {
  field: "rrowm-zone-field",
  registry: "rrowm-zone-registry",
  studio: "rrowm-zone-studio",
  economic: "rrowm-zone-economic",
};

/** Warm diffuse elevation — avoid cool grey SaaS shadows */
export const rrowmShadow = {
  sm: "shadow-[0_8px_20px_rgba(40,25,10,0.05)]",
  md: "shadow-[0_12px_30px_rgba(40,25,10,0.06)]",
  lg: "shadow-[0_20px_48px_rgba(40,25,10,0.08)]",
  xl: "shadow-[0_28px_64px_rgba(40,25,10,0.10)]",
  insetPaper: "shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
  card: "shadow-[0_12px_30px_rgba(40,25,10,0.06)]",
  cardHover:
    "shadow-[0_20px_48px_rgba(40,25,10,0.09)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
} as const;

/** Signature floating block — primary premium surface primitive */
export const rrowmFloatingBlock = {
  base: "rrowm-floating-block",
  compact: "rrowm-floating-block rrowm-floating-block--compact",
  hero: "rrowm-floating-block rrowm-floating-block--hero",
  interactive: "rrowm-floating-block rrowm-floating-block--interactive",
} as const;

export function rrowmFloatingBlockClass(
  size: RrowmFloatingBlockSize = "default",
  interactive = false
): string {
  const parts = ["rrowm-floating-block"];
  if (size === "compact") parts.push("rrowm-floating-block--compact");
  if (size === "hero") parts.push("rrowm-floating-block--hero");
  if (interactive) parts.push("rrowm-floating-block--interactive");
  return parts.join(" ");
}

/**
 * Surface hierarchy — floating blocks on white canvas.
 * Level 0 = zone background (`.rrowm-zone-*`)
 */
export const rrowmSurface = {
  l1: "rrowm-floating-block rrowm-floating-block--section",
  l2: "rrowm-floating-block rrowm-floating-block--interactive",
  l3: "rrowm-floating-block rrowm-floating-block--compact",
} as const;

/** Section card — opportunities / deal editor panels */
export function economicSectionCard(className = ""): string {
  return `${rrowmSurface.l1} p-6 md:p-8 ${className}`.trim();
}

/** Sticky editor header — airy white, not tinted band */
export const rrowmEditorHeader =
  "sticky top-[calc(5rem+env(safe-area-inset-top,0px))] z-20 -mx-1 mb-8 border-b border-neutral-900/[0.06] bg-white/90 px-1 pb-4 backdrop-blur-md";

/** Premium primary button — weightier, warm shadow */
export const rrowmButton = {
  primary:
    "inline-flex items-center justify-center rounded-xl border border-[color:color-mix(in_srgb,var(--rrowm-zone-secondary)_25%,transparent)] bg-[color:var(--rrowm-zone-secondary)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_28px_rgba(40,25,10,0.14)] transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_36px_rgba(40,25,10,0.18)] hover:brightness-[1.03] active:scale-[0.99] disabled:opacity-50",
  primaryEconomic:
    "inline-flex items-center justify-center rounded-xl border border-neutral-900/[0.10] bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_22px_rgba(25,20,10,0.10)] transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-neutral-800 hover:shadow-[0_12px_28px_rgba(25,20,10,0.12)] active:scale-[0.99] disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center rounded-xl border border-[color:var(--rrowm-zone-border)] bg-[color:var(--rrowm-zone-elevated)] px-5 py-2.5 text-sm font-medium text-[color:var(--rrowm-zone-secondary)] shadow-[0_4px_14px_rgba(40,25,10,0.04)] transition-[background-color,border-color,box-shadow] duration-300 hover:bg-white hover:shadow-[0_8px_22px_rgba(40,25,10,0.07)] disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-[color:color-mix(in_srgb,var(--rrowm-zone-surface)_70%,white)] hover:text-neutral-950 disabled:opacity-50",
} as const;

/** Tab pill — rich selected state with tonal fill */
export const rrowmTab = {
  list: "flex flex-wrap gap-2",
  base: "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-[background-color,color,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  active:
    "border border-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_22%,transparent)] bg-white text-[color:var(--rrowm-zone-secondary)] shadow-[0_4px_14px_rgba(25,20,10,0.05)]",
  idle:
    "border border-neutral-900/[0.06] bg-white/80 text-neutral-600 hover:border-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_18%,transparent)] hover:bg-white hover:text-neutral-800",
  activeDark:
    "border border-[color:var(--rrowm-zone-secondary)] bg-[color:var(--rrowm-zone-secondary)] text-white shadow-[0_8px_22px_rgba(40,25,10,0.12)]",
  idleDark:
    "border border-[color:var(--rrowm-zone-border)] bg-[color:var(--rrowm-zone-elevated)] text-neutral-600 hover:bg-white hover:text-neutral-800",
} as const;

export function rrowmTabClass(active: boolean, variant: "tonal" | "dark" = "tonal"): string {
  const state = active
    ? variant === "dark"
      ? rrowmTab.activeDark
      : rrowmTab.active
    : variant === "dark"
      ? rrowmTab.idleDark
      : rrowmTab.idle;
  return `${rrowmTab.base} ${state}`;
}

/** Luxurious badge fills — subtle tint + thin border */
export const rrowmBadge = {
  base: "inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
  muted:
    "border border-[color:var(--rrowm-zone-border)] bg-[color:color-mix(in_srgb,var(--rrowm-zone-surface)_80%,white)] text-[color:var(--rrowm-zone-secondary)]",
  accent:
    "border border-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_10%,var(--rrowm-zone-elevated))] text-[color:color-mix(in_srgb,var(--rrowm-zone-secondary)_90%,black)]",
  success:
    "border border-emerald-900/12 bg-[color:color-mix(in_srgb,#ecfdf5_70%,var(--rrowm-zone-elevated))] text-emerald-950",
  warning:
    "border border-amber-900/12 bg-[color:color-mix(in_srgb,#fffbeb_75%,var(--rrowm-zone-elevated))] text-amber-950",
  danger:
    "border border-red-900/12 bg-[color:color-mix(in_srgb,#fef2f2_75%,var(--rrowm-zone-elevated))] text-red-900",
  strong:
    "border border-[color:color-mix(in_srgb,var(--rrowm-zone-secondary)_20%,transparent)] bg-[color:var(--rrowm-zone-secondary)] text-white",
} as const;

/** Field portfolio / presence — floating on white canvas */
export const rrowmFieldCard = {
  portfolio: `group flex flex-col overflow-hidden ${rrowmFloatingBlock.interactive}`,
  prestige: `${rrowmFloatingBlock.base} p-6 md:p-8`,
  metaBand: `${rrowmFloatingBlock.compact} px-4 py-3`,
  empty: `${rrowmFloatingBlock.base} px-8 py-14 text-center md:px-12`,
} as const;

/** Registry trust / ledger surfaces */
export const rrowmRegistrySurface = {
  trustPanel: `${rrowmFloatingBlock.hero} p-8 md:p-10`,
  trustCompact: `${rrowmFloatingBlock.base} p-6 md:p-7`,
  chronology: `${rrowmFloatingBlock.compact} p-5`,
} as const;

/** Studio workspace panels */
export const rrowmStudioSurface = {
  panel: `${rrowmFloatingBlock.base} p-7 sm:p-8 md:p-9`,
  card: `${rrowmFloatingBlock.compact} p-6`,
  heroSlab: `${rrowmFloatingBlock.hero} overflow-hidden`,
  metricCapsule: `${rrowmFloatingBlock.compact} p-4`,
} as const;

/** Economic editor — opportunities + deals */
export const rrowmEconomicSurface = {
  section: economicSectionCard(),
  listPanel: `${rrowmFloatingBlock.base} min-h-0 p-6 sm:p-7 md:p-8`,
  /** Compact top strip — folder tabs + horizontal deal selector */
  dealSelectorStrip: `${rrowmFloatingBlock.compact} p-4 md:p-5`,
  stickyHeader: rrowmEditorHeader,
  input:
    "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-[0_2px_8px_rgba(25,20,10,0.03)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_20%,transparent)]",
  actionBar:
    "sticky bottom-0 z-10 border-t border-neutral-900/[0.06] bg-white/88 px-7 py-4 shadow-[0_-10px_36px_rgba(25,20,10,0.07)] backdrop-blur-md md:px-9",
} as const;

/** Deal workspace — negotiation ledger + reference panels */
export const rrowmDealSurface = {
  workspace: `${rrowmFloatingBlock.hero} overflow-hidden`,
  header: "border-b border-neutral-900/[0.06] px-7 py-6 md:px-9 lg:px-11",
  /** Full-width manuscript ledger — generous horizontal breathing room */
  ledger: `${rrowmSurface.l1} min-h-0 p-7 md:p-10 lg:px-12 lg:py-11`,
  ledgerEventMajor: `${rrowmFloatingBlock.base} px-6 py-6 md:px-8 md:py-7`,
  ledgerEventTerminal: `${rrowmFloatingBlock.hero} px-6 py-6 md:px-8 md:py-7`,
  ledgerEventMinor: `${rrowmFloatingBlock.compact} px-5 py-3.5 md:ml-10 md:max-w-[42rem]`,
  /** Compact reference cards below the ledger */
  referencePanel: `${rrowmFloatingBlock.compact} p-4 md:p-5`,
  sidePanel: `${rrowmFloatingBlock.base} p-5`,
  correspondence: `${rrowmFloatingBlock.compact} p-6 md:p-7`,
  /** Sticky status actions — sits below deal header, above ledger */
  actionBar:
    "sticky top-0 z-10 border-b border-neutral-900/[0.06] bg-white/88 px-7 py-4 shadow-[0_10px_36px_rgba(25,20,10,0.07)] backdrop-blur-md md:px-9 lg:px-11",
} as const;

/** Registry record sections */
export const rrowmRegistrySection = {
  discovery: `${rrowmFloatingBlock.compact} px-4 py-3`,
  artworkFrame: `${rrowmFloatingBlock.hero} overflow-hidden`,
  metadata: `${rrowmFloatingBlock.base} px-5 py-5 md:px-6 md:py-6`,
  ownership: `${rrowmFloatingBlock.compact} px-5 py-5 md:px-6`,
  section: `${rrowmSurface.l1} p-6 md:p-8`,
  provenance: `${rrowmSurface.l1} p-6 md:p-9`,
  certificate: `${rrowmFloatingBlock.hero} p-8 md:p-9`,
  verification: `${rrowmFloatingBlock.base} p-8`,
  insight: `${rrowmFloatingBlock.compact} px-5 py-4`,
} as const;

export const rrowmTheme = {
  zone: rrowmZonePalette,
  zoneClass: rrowmZoneClass,
  shadow: rrowmShadow,
  surface: rrowmSurface,
  floatingBlock: rrowmFloatingBlock,
  button: rrowmButton,
  tab: rrowmTab,
  badge: rrowmBadge,
  field: rrowmFieldCard,
  registry: rrowmRegistrySurface,
  registrySection: rrowmRegistrySection,
  studio: rrowmStudioSurface,
  economic: rrowmEconomicSurface,
  deal: rrowmDealSurface,
} as const;

export type RrowmTheme = typeof rrowmTheme;
