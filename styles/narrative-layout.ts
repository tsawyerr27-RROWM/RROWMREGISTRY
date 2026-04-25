/**
 * Marketing / narrative pages (Home, About) — shared rhythm, gutters, and motion.
 * Single source for scroll-reveal timing and section spacing so pages feel one system.
 */

import { motion as dsMotion } from "./system-design";

export const narrativeEase = dsMotion.ease;
export const narrativeEaseCss = dsMotion.easeCss;

/** Scroll-reveal duration (seconds) — calm, legible; matches MotionReveal */
export const NARRATIVE_REVEAL_DURATION_S = 0.72;

/** Initial Y offset (px) for scroll reveals */
export const NARRATIVE_REVEAL_Y = 8;

/** Shell fade-in when the page mounts */
export const NARRATIVE_PAGE_ENTER_DURATION_S = 0.85;
export const NARRATIVE_PAGE_ENTER_Y = 8;

/** scroll-margin for in-page anchors (with layout scroll-padding-top) */
export const narrativeScrollAnchorClass = "scroll-mt-8";

/**
 * Max-width container + horizontal gutters — matches hero, ink chapters, About.
 */
export const narrativeGutterClass =
  "mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]";

/** Vertical padding for primary narrative sections */
export const narrativeSectionPadYClass = "py-24 md:py-36";

/**
 * First content band after full-viewport hero — positive spacing only (no negative overlap).
 */
export const narrativePostHeroTopClass = "pt-16 md:pt-24";

/** Space between About intro block and first narrative section */
export const narrativeAfterIntroGapClass = "mt-10 md:mt-16";

export const narrativeLayout = {
  ease: narrativeEase,
  scrollAnchor: narrativeScrollAnchorClass,
  gutter: narrativeGutterClass,
  sectionPadY: narrativeSectionPadYClass,
  postHeroTop: narrativePostHeroTopClass,
  afterIntroGap: narrativeAfterIntroGapClass,
} as const;
