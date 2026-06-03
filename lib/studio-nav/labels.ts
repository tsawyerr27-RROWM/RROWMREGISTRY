import type { MessageKey } from "@/lib/locale-messages";

import type { CollectorSectionId } from "@/lib/studio-nav/collector-nav";
import type { CreativeSectionId } from "@/lib/studio-nav/creative-nav";
import type { OrganisationSectionId } from "@/lib/studio-nav/organisation-nav";

export const CREATIVE_SECTION_LABEL_KEYS: Record<CreativeSectionId, MessageKey> =
  {
    Studio: "studio.nav.studio",
    Records: "studio.nav.records",
    Artworks: "studio.nav.artworks",
    Certificates: "studio.nav.certificates",
    Ownership: "studio.nav.ownership",
  };

export const ORGANISATION_SECTION_LABEL_KEYS: Record<
  OrganisationSectionId,
  MessageKey
> = {
  studio: "gallery.nav.studio",
  "record-depth": "gallery.nav.recordDepth",
  roster: "gallery.nav.roster",
  catalogue: "gallery.nav.catalogue",
  verification: "gallery.nav.verification",
  invitations: "gallery.nav.invitations",
};

export const COLLECTOR_SECTION_LABEL_KEYS: Record<CollectorSectionId, MessageKey> =
  {
    workspace: "collector.nav.workspace",
    works: "collector.nav.works",
    attention: "collector.nav.attention",
  };

/** @deprecated Use CREATIVE_SECTION_LABEL_KEYS */
export const STUDIO_SECTION_LABEL_KEYS = CREATIVE_SECTION_LABEL_KEYS;

/** @deprecated Use ORGANISATION_SECTION_LABEL_KEYS */
export const GALLERY_SECTION_LABEL_KEYS = ORGANISATION_SECTION_LABEL_KEYS;
