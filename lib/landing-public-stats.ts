import type { SupabaseClient } from "@supabase/supabase-js";

import { tryCreateSupabaseServiceClient } from "@/lib/supabase-service-role";

export type LandingPublicStats = {
  worksRegistered: number;
  artistsOnboarded: number;
  valueFilings: number;
  provenanceEvents: number;
  fetchedAt: string;
};

const EMPTY_STATS: LandingPublicStats = {
  worksRegistered: 0,
  artistsOnboarded: 0,
  valueFilings: 0,
  provenanceEvents: 0,
  fetchedAt: new Date().toISOString(),
};

async function exactCount(
  client: SupabaseClient,
  table: string
): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.warn(`[landing-public-stats] ${table}`, error.message);
    return 0;
  }

  return count ?? 0;
}

export async function fetchLandingPublicStats(): Promise<LandingPublicStats> {
  const client = tryCreateSupabaseServiceClient();
  if (!client) return { ...EMPTY_STATS, fetchedAt: new Date().toISOString() };

  const [worksRegistered, artistsOnboarded, valueFilings, provenanceEvents] =
    await Promise.all([
      exactCount(client, "artworks"),
      exactCount(client, "artists"),
      exactCount(client, "value_events"),
      exactCount(client, "provenance_events"),
    ]);

  return {
    worksRegistered,
    artistsOnboarded,
    valueFilings,
    provenanceEvents,
    fetchedAt: new Date().toISOString(),
  };
}

export function formatLandingStat(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return new Intl.NumberFormat("en-US").format(value);
}
