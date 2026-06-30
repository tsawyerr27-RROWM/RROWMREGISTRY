/**
 * RROWM v2 — platform design system primitives.
 * Museum archive × editorial × urban infrastructure.
 *
 * Maps to CSS custom properties and utility classes in `app/globals.css`.
 * Apply scope: `className={rrowmV2.scope}` on a root, or use token class names directly.
 *
 * Do not embed one-off Tailwind shadow/radius soup — compose from these exports.
 */

/** Scope class — opt-in v2 token context on any surface tree */
export const rrowmV2Scope = "rrowm-v2" as const;

/* —— Color tokens (CSS var references) —— */

export const v2Color = {
  white: "var(--v2-white)",
  nearBlack: "var(--v2-near-black)",
  coolGrey: "var(--v2-cool-grey)",
  graphite: "var(--v2-graphite)",
  cobaltSignal: "var(--v2-cobalt-signal)",
  cobaltSignalDim: "var(--v2-cobalt-signal-dim)",
  limePulse: "var(--v2-lime-pulse)",
  limePulseDim: "var(--v2-lime-pulse-dim)",
  emberStamp: "var(--v2-ember-stamp)",
  emberStampDim: "var(--v2-ember-stamp-dim)",
  violetSignal: "var(--v2-violet-signal)",
  violetSignalDim: "var(--v2-violet-signal-dim)",
  amberException: "var(--v2-amber-exception)",
  amberExceptionDim: "var(--v2-amber-exception-dim)",
  sealInk: "var(--v2-seal-ink)",
  sealBorder: "var(--v2-seal-border)",
  glassLight: "var(--v2-glass-light)",
  glassDark: "var(--v2-glass-dark)",
  border: "var(--v2-border)",
  borderStrong: "var(--v2-border-strong)",
  ink: "var(--v2-ink)",
  inkMuted: "var(--v2-ink-muted)",
  inkSoft: "var(--v2-ink-soft)",
} as const;

/** Raw hex — JS-only (charts, canvas, OG images) */
export const v2ColorRaw = {
  white: "#ffffff",
  nearBlack: "#0a0a0a",
  coolGrey: "#737373",
  graphite: "#262626",
  cobaltSignal: "#1a4bff",
  limePulse: "#b8ff2e",
  emberStamp: "#e85d1a",
  violetSignal: "#5c4fcf",
  amberException: "#c88719",
  sealInk: "#1a1a1a",
} as const;

/* —— Shadows —— */

export const v2Shadow = {
  paper: "var(--v2-shadow-paper)",
  glassFloat: "var(--v2-shadow-glass-float)",
  cinematic: "var(--v2-shadow-cinematic)",
  className: {
    paper: "v2-shadow-paper",
    glassFloat: "v2-shadow-glass-float",
    cinematic: "v2-shadow-cinematic",
  },
} as const;

/* —— Radius —— */

export const v2Radius = {
  card: "var(--v2-radius-card)",
  pill: "var(--v2-radius-pill)",
  modal: "var(--v2-radius-modal)",
  className: {
    card: "v2-radius-card",
    pill: "v2-radius-pill",
    modal: "v2-radius-modal",
  },
} as const;

/* —— Motion —— */

export const v2Ease = {
  out: "var(--v2-ease-out)",
  stamp: "var(--v2-ease-stamp)",
  cinematic: "var(--v2-ease-cinematic)",
} as const;

/** Framer Motion / JS animation tuples */
export const v2EaseBezier = {
  out: [0.16, 1, 0.3, 1] as const,
  stamp: [0.22, 1, 0.36, 1] as const,
  cinematic: [0.12, 1, 0.28, 1] as const,
};

export const v2Motion = {
  revealSlow: {
    duration: 1.2,
    ease: v2EaseBezier.out,
    y: 12,
  },
  ledgerAppend: {
    duration: 1.15,
    ease: v2EaseBezier.out,
    y: 24,
  },
  modalFloat: {
    duration: 0.45,
    ease: v2EaseBezier.stamp,
    y: 8,
    scale: 0.98,
  },
  hoverSubtle: {
    duration: 0.55,
    ease: v2EaseBezier.out,
    y: -1,
  },
  className: {
    revealSlow: "v2-motion-reveal-slow",
    ledgerAppend: "v2-motion-ledger-append",
    modalFloat: "v2-motion-modal-float",
    hoverSubtle: "v2-motion-hover-subtle",
  },
} as const;

/* —— Surfaces (utility class names) —— */

export const v2Surface = {
  paper: "v2-surface-paper",
  glassLight: "v2-surface-glass-light",
  glassDark: "v2-surface-glass-dark",
  archiveSheet: "v2-surface-archive-sheet",
  signalLine: "v2-surface-signal-line",
} as const;

/** Accent signal utilities — use sparingly (~5–8% of UI) */
export const v2Signal = {
  cobalt: "v2-signal-cobalt",
  lime: "v2-signal-lime",
  ember: "v2-signal-ember",
  violet: "v2-signal-violet",
  amber: "v2-signal-amber",
  seal: "v2-signal-seal",
  cobaltBar: "v2-signal-bar v2-signal-bar--cobalt",
  limeBar: "v2-signal-bar v2-signal-bar--lime",
  emberBar: "v2-signal-bar v2-signal-bar--ember",
  violetBar: "v2-signal-bar v2-signal-bar--violet",
  amberBar: "v2-signal-bar v2-signal-bar--amber",
  sealBar: "v2-signal-bar v2-signal-bar--seal",
} as const;

/** Typography hooks — pair with landing/editorial font variables */
export const v2Type = {
  display: "v2-type-display",
  body: "v2-type-body",
  label: "v2-type-label",
  signal: "v2-type-signal",
  mono: "v2-type-mono",
} as const;

/** CTA primitives */
export const v2Cta = {
  primary: "v2-cta-primary",
  secondary: "v2-cta-secondary",
  primaryOnDark: "v2-cta-primary v2-cta-primary--on-dark",
  secondaryOnDark: "v2-cta-secondary v2-cta-secondary--on-dark",
} as const;

export { semanticMotion } from "./semantic-motion";

export { consequenceFeedback } from "./consequence-feedback";

export const rrowmV2 = {
  scope: rrowmV2Scope,
  color: v2Color,
  colorRaw: v2ColorRaw,
  shadow: v2Shadow,
  radius: v2Radius,
  ease: v2Ease,
  easeBezier: v2EaseBezier,
  motion: v2Motion,
  surface: v2Surface,
  signal: v2Signal,
  type: v2Type,
  cta: v2Cta,
} as const;

export type RrowmV2Surface = keyof typeof v2Surface;
export type RrowmV2Motion = keyof typeof v2Motion.className;

/** Compose surface + shadow + radius for cards without utility soup */
export function v2CardSurface(
  variant: "paper" | "glassLight" | "glassDark" | "archive" = "paper"
): string {
  const surface =
    variant === "archive"
      ? v2Surface.archiveSheet
      : variant === "glassLight"
        ? v2Surface.glassLight
        : variant === "glassDark"
          ? v2Surface.glassDark
          : v2Surface.paper;
  return `${surface} ${v2Radius.className.card} ${v2Shadow.className.paper}`;
}

export function v2ModalSurface(dark = false): string {
  return `${dark ? v2Surface.glassDark : v2Surface.glassLight} ${v2Radius.className.modal} ${v2Shadow.className.cinematic} ${v2Motion.className.modalFloat}`;
}
