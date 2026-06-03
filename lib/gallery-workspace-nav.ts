/** @deprecated Import from `@/lib/studio-nav` instead. */
export {
  ORGANISATION_NAV_SECTIONS as GALLERY_SECTION_IDS,
  type OrganisationSectionId as GallerySectionId,
  isOrganisationSectionId as isGallerySectionId,
  navigateToOrganisationSection as navigateToGallerySection,
  consumePendingOrganisationSection as consumePendingGallerySection,
  buildOrganisationNavItems,
  type OrganisationNavFlags,
} from "@/lib/studio-nav/organisation-nav";

export type { OrganisationSectionId } from "@/lib/studio-nav/organisation-nav";
