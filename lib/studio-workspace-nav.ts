/** @deprecated Import from `@/lib/studio-nav` instead. */
export {
  CREATIVE_NAV_SECTIONS as STUDIO_SECTION_IDS,
  type CreativeSectionId as StudioSectionId,
  isCreativeSectionId as isStudioSectionId,
  navigateToCreativeSection as navigateToStudioSection,
  consumePendingCreativeSection as consumePendingStudioSection,
  buildCreativeNavItems,
  type CreativeNavFlags,
} from "@/lib/studio-nav/creative-nav";

export type { CreativeSectionId } from "@/lib/studio-nav/creative-nav";
