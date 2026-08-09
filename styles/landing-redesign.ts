/** Landing — museum archive × editorial × urban infrastructure */

export const landingEase = [0.16, 1, 0.3, 1] as const;
export const landingEaseStamp = [0.22, 1, 0.36, 1] as const;

export const landingMotion = {
  ease: landingEase,
  easeStamp: landingEaseStamp,
  revealDuration: 1.2,
  revealY: 12,
  heroDuration: 1.45,
  stagger: 0.09,
  driftDuration: 18,
} as const;

/** Horizontal gutter padding only — for full-bleed surfaces (e.g. footer) that manage their own width */
export const landingGutterXClass =
  "px-6 md:px-10 lg:px-[max(2rem,calc((100vw-72rem)/2+1.5rem))]";

export const landingLayout = {
  gutter: `mx-auto w-full ${landingGutterXClass}`,
  gutterX: landingGutterXClass,
  sectionY: "py-28 md:py-36 lg:py-40",
  sectionYTight: "py-24 md:py-32",
  scrollAnchor: "scroll-mt-24",
} as const;

export const landingAccents = {
  cobalt: "var(--landing-cobalt)",
  lime: "var(--landing-lime)",
  ember: "var(--landing-ember)",
} as const;

export const landingType = {
  display:
    "font-[var(--font-landing-display)] font-normal tracking-[-0.03em]",
  kinetic:
    "font-[var(--font-landing-display)] font-light tracking-[-0.04em]",
  label:
    "text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--landing-charcoal-muted)]",
  signal:
    "font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-[var(--landing-cobalt)]",
  meta:
    "font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--landing-charcoal-muted)]",
  registryId:
    "font-mono text-[11px] font-normal tracking-[0.1em] text-[var(--landing-charcoal-muted)]",
  body: "font-[var(--font-landing-sans)] text-[15px] leading-[1.75] text-[var(--landing-charcoal-muted)] md:text-base",
  lead: "font-[var(--font-landing-sans)] text-[17px] leading-[1.65] text-[var(--landing-charcoal-soft)] md:text-lg md:leading-[1.7]",
} as const;
