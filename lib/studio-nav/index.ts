export type { StudioNavTranslate } from "@/lib/studio-nav/types";

export {
  CREATIVE_SECTION_LABEL_KEYS,
  ORGANISATION_SECTION_LABEL_KEYS,
  COLLECTOR_SECTION_LABEL_KEYS,
  STUDIO_SECTION_LABEL_KEYS,
  GALLERY_SECTION_LABEL_KEYS,
} from "@/lib/studio-nav/labels";

export {
  PERSONAL_ARCHIVE_NAV_ITEM,
  appendPersonalArchiveNavItem,
} from "@/lib/studio-nav/personal-archive";

export {
  CREATIVE_NAV_SECTIONS,
  STUDIO_SECTION_IDS,
  type CreativeSectionId,
  type StudioSectionId,
  type CreativeNavFlags,
  buildCreativeNavItems,
  isCreativeSectionId,
  isStudioSectionId,
  navigateToCreativeSection,
  navigateToStudioSection,
  consumePendingCreativeSection,
  consumePendingStudioSection,
  primeCreativeSectionFromUrlQuery,
} from "@/lib/studio-nav/creative-nav";

export {
  COLLECTOR_NAV_SECTIONS,
  COLLECTOR_SECTION_IDS,
  type CollectorSectionId,
  type CollectorNavFlags,
  buildCollectorNavItems,
  isCollectorSectionId,
  navigateToCollectorSection,
  consumePendingCollectorSection,
} from "@/lib/studio-nav/collector-nav";

export {
  ORGANISATION_NAV_SECTIONS,
  GALLERY_SECTION_IDS,
  type OrganisationSectionId,
  type GallerySectionId,
  type OrganisationNavFlags,
  buildOrganisationNavItems,
  isOrganisationSectionId,
  isGallerySectionId,
  navigateToOrganisationSection,
  navigateToGallerySection,
  consumePendingOrganisationSection,
  consumePendingGallerySection,
} from "@/lib/studio-nav/organisation-nav";
