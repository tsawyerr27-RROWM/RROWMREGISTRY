import type { SupabaseClient } from "@supabase/supabase-js";

import {
  categoryLabelEnglish,
  resolveShareableMilestone,
  type ProvenanceMilestoneShareContext,
  type ShareableMilestoneCategory,
} from "@/lib/provenance-share";
import {
  getArchivalProvenanceBundle,
  type ArchivalTimelineEvent,
} from "@/lib/provenance-timeline";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type ProvenanceMilestoneOgBundle = {
  context: ProvenanceMilestoneShareContext;
};

function eventTitleForOg(event: ArchivalTimelineEvent): string {
  return event.displayTitle.trim() || "Chronology milestone";
}

function participantForOg(event: ArchivalTimelineEvent): string | null {
  return event.participantLabel?.trim() || null;
}

export async function loadProvenanceMilestoneOgBundle(
  supabase: SupabaseClient,
  registryId: string,
  eventId: string
): Promise<ProvenanceMilestoneOgBundle> {
  const cleanRegistry = registryId.trim();
  const cleanEvent = eventId.trim();

  const restricted = (partial?: Partial<ProvenanceMilestoneShareContext>) =>
    ({
      context: {
        registryId: cleanRegistry || "-",
        eventId: cleanEvent || "-",
        artworkTitle: "Work on file",
        eventTitle: "Provenance milestone",
        participantContext: null,
        eventDate: new Date().toISOString(),
        category: "creation" as ShareableMilestoneCategory,
        publicity: "restricted" as const,
        ...partial,
      },
    }) satisfies ProvenanceMilestoneOgBundle;

  if (!cleanRegistry || !cleanEvent) {
    return restricted();
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("id, title, registry_id, artist_id, created_at, verification_status")
    .eq("registry_id", cleanRegistry)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("provenance milestone og artwork", artworkError);
  if (!artwork?.id) return restricted();

  let artistName: string | null = null;
  if (artwork.artist_id) {
    const { data: artist } = await supabase
      .from("artists")
      .select("display_name, full_name")
      .eq("id", artwork.artist_id)
      .maybeSingle();
    artistName =
      artist?.display_name?.trim() || artist?.full_name?.trim() || null;
  }

  const bundle = await getArchivalProvenanceBundle({
    supabase,
    artwork: {
      id: artwork.id,
      registry_id: artwork.registry_id,
      title: artwork.title,
      artist_id: artwork.artist_id,
      created_at: artwork.created_at,
      verification_status: artwork.verification_status,
    },
    artistName,
  });

  const event = bundle.events.find((ev) => ev.key === cleanEvent);
  if (!event) return restricted({ registryId: cleanRegistry });

  const category = resolveShareableMilestone(event);
  if (!category) {
    return restricted({
      registryId: cleanRegistry,
      eventId: cleanEvent,
    });
  }

  return {
    context: {
      registryId: cleanRegistry,
      eventId: cleanEvent,
      artworkTitle: String(artwork.title || "").trim() || "Work on file",
      eventTitle: eventTitleForOg(event),
      participantContext: participantForOg(event),
      eventDate: event.dateIso,
      category,
      publicity: "full",
    },
  };
}

export function milestoneOgCategoryLabel(
  context: ProvenanceMilestoneShareContext
): string {
  if (context.publicity === "restricted") {
    return "Provenance milestone";
  }
  return categoryLabelEnglish(context.category);
}
