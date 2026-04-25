"use client";

import { ProvenanceTimeline } from "@/components/provenance/ProvenanceTimeline";
import type { ProvenanceTimelineRow } from "@/lib/get-public-provenance";

/** Legacy entry point — forces public presentation. Prefer `ProvenanceTimeline` with `viewContext`. */
export function PublicProvenanceTimeline({ entries }: { entries: ProvenanceTimelineRow[] }) {
  return <ProvenanceTimeline viewContext="public" entries={entries} />;
}
