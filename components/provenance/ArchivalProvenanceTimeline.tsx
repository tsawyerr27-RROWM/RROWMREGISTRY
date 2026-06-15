"use client";

import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { ProvenanceChronologySection } from "@/components/provenance/ProvenanceChronologySection";

/** Public ledger chronology — evidence panels with milestone hierarchy. */
export function ArchivalProvenanceTimeline({
  bundle,
  registryId,
  artworkTitle,
}: {
  bundle: ArchivalProvenanceBundle;
  registryId: string;
  artworkTitle: string;
}) {
  return (
    <ProvenanceChronologySection
      bundle={bundle}
      registryId={registryId}
      artworkTitle={artworkTitle}
    />
  );
}
