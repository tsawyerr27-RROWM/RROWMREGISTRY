/**
 * Marketing / narrative pages (Home, About) — shared rhythm, gutters, and motion.
 * Single source for scroll-reveal timing and section spacing so pages feel one system.
 */

import { motion as dsMotion } from "./system-design";

export const narrativeEase = dsMotion.ease;
export const narrativeEaseCss = dsMotion.easeCss;

/** Scroll-reveal duration (seconds) — calm, legible; matches MotionReveal */
export const NARRATIVE_REVEAL_DURATION_S = 0.72;

/** About / reflective surfaces — slightly slower, lower energy */
export const NARRATIVE_REVEAL_REFLECTIVE_DURATION_S = 0.96;

/** Initial Y offset (px) for scroll reveals */
export const NARRATIVE_REVEAL_Y = 8;

export const NARRATIVE_REVEAL_REFLECTIVE_Y = 11;

/** Shell fade-in when the page mounts */
export const NARRATIVE_PAGE_ENTER_DURATION_S = 0.85;
export const NARRATIVE_PAGE_ENTER_Y = 8;

/** About — slightly longer shell enter (quieter arrival than landing). */
export const NARRATIVE_PAGE_ENTER_ABOUT_DURATION_S = 0.98;

/** scroll-margin for in-page anchors (with layout scroll-padding-top) */
export const narrativeScrollAnchorClass = "scroll-mt-8";

/**
 * Max-width container + horizontal gutters — matches hero, ink chapters, About.
 */
export const narrativeGutterClass =
  "mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]";

/** Vertical padding for primary narrative sections */
export const narrativeSectionPadYClass = "py-28 md:py-40";

/** Landing — even, tighter rhythm between atmospheric bands */
export const narrativeSectionPadYTightClass = "py-14 md:py-20";

/**
 * First content band after full-viewport hero — positive spacing only (no negative overlap).
 */
export const narrativePostHeroTopClass = "pt-14 md:pt-[4.25rem]";

/** Space between About intro block and first narrative section */
export const narrativeAfterIntroGapClass = "mt-14 md:mt-20";

/** About — extra decompression before principles */
export const narrativeAboutReflectiveGapClass = "mt-14 md:mt-[4.75rem]";

export const narrativeLayout = {
  ease: narrativeEase,
  scrollAnchor: narrativeScrollAnchorClass,
  gutter: narrativeGutterClass,
  sectionPadY: narrativeSectionPadYClass,
  sectionPadYTight: narrativeSectionPadYTightClass,
  postHeroTop: narrativePostHeroTopClass,
  afterIntroGap: narrativeAfterIntroGapClass,
  aboutReflectiveGap: narrativeAboutReflectiveGapClass,
} as const;
