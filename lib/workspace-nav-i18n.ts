import type { MessageKey } from "@/lib/locale-messages";
import type { StudioSectionId } from "@/lib/studio-workspace-nav";
import type { GallerySectionId } from "@/lib/gallery-workspace-nav";
import type { CollectorSectionId } from "@/lib/collector-workspace-nav";

export const STUDIO_SECTION_LABEL_KEYS: Record<StudioSectionId, MessageKey> = {
  Studio: "studio.nav.studio",
  Records: "studio.nav.records",
  Artworks: "studio.nav.artworks",
  Certificates: "studio.nav.certificates",
  Ownership: "studio.nav.ownership",
};

export const GALLERY_SECTION_LABEL_KEYS: Record<GallerySectionId, MessageKey> = {
  studio: "gallery.nav.studio",
  "record-depth": "gallery.nav.recordDepth",
  roster: "gallery.nav.roster",
  catalogue: "gallery.nav.catalogue",
  verification: "gallery.nav.verification",
  invitations: "gallery.nav.invitations",
};

export const COLLECTOR_SECTION_LABEL_KEYS: Record<CollectorSectionId, MessageKey> = {
  workspace: "collector.nav.workspace",
  works: "collector.nav.works",
  attention: "collector.nav.attention",
};
