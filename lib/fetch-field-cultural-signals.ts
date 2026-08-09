import type { SupabaseClient } from "@supabase/supabase-js";

import {
  countClosingSoonOpportunities,
  countLiveOpportunities,
  countPublicCreatives,
  countPublicOrganisations,
  countRecords,
} from "@/lib/field-counts";
import { parsePublicPresence } from "@/lib/public-presence";

export type FieldCulturalSignalMetrics = {
  newRecords7d: number | null;
  verificationPending: number | null;
  transfersActive7d: number | null;
  closingSoon72h: number | null;
  newRecordsPrior7d: number | null;
  transfersPrior7d: number | null;
};

export type FieldClusterIntel = {
  records: {
    total: number | null;
    new7d: number | null;
    awaitingAttestation: number | null;
  };
  creatives: {
    total: number | null;
    recentlyActive7d: number | null;
  };
  organisations: {
    total: number | null;
    verifiedInstitutions: number | null;
  };
  opportunities: {
    live: number | null;
    closingSoon72h: number | null;
  };
};

export type FieldCulturalSignals = {
  snapshotAt: string;
  signals: FieldCulturalSignalMetrics;
  cluster: FieldClusterIntel;
};

const MS_DAY = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number, from = Date.now()): string {
  return new Date(from - days * MS_DAY).toISOString();
}

export function formatFieldSnapshotSync(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toISOString().slice(11, 19)} UTC`;
}

async function safeCount(
  label: string,
  fn: () => Promise<number | null>
): Promise<number | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[fetchFieldCulturalSignals] ${label}`, error);
    return null;
  }
}

async function countArtworksCreatedBetween(
  supabase: SupabaseClient,
  fromIso: string,
  toIso?: string
): Promise<number | null> {
  let query = supabase
    .from("artworks")
    .select("id", { count: "exact", head: true })
    .gte("created_at", fromIso);

  if (toIso) {
    query = query.lt("created_at", toIso);
  }

  const { count, error } = await query;
  if (error) throw error;
  return typeof count === "number" ? count : null;
}

async function countOwnershipEventsBetween(
  supabase: SupabaseClient,
  fromIso: string,
  toIso?: string
): Promise<number | null> {
  let query = supabase
    .from("ownership_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", fromIso);

  if (toIso) {
    query = query.lt("created_at", toIso);
  }

  const { count, error } = await query;
  if (error) throw error;
  return typeof count === "number" ? count : null;
}

/**
 * Bounded two-step lookup: artists with new artworks in the window, then a
 * presence check on just those artists. Row volume is small (7-day window).
 */
async function countRecentlyActiveCreatives(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<number | null> {
  const { data: artworks, error } = await supabase
    .from("artworks")
    .select("artist_id")
    .gte("created_at", sinceIso)
    .not("artist_id", "is", null);

  if (error) throw error;

  const artistIds = [
    ...new Set(
      (artworks ?? [])
        .map((row) => String((row as { artist_id: string | null }).artist_id ?? ""))
        .filter(Boolean)
    ),
  ];

  if (artistIds.length === 0) return 0;

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("id, slug, public_presence")
    .in("id", artistIds);

  if (artistsError) throw artistsError;

  const active = (artists ?? []).filter((row) => {
    const presence = parsePublicPresence(
      (row as { public_presence?: unknown }).public_presence
    );
    return presence.profile && String((row as { slug?: string }).slug ?? "").trim();
  });

  return active.length;
}

/** Live cultural signals + cluster intelligence from registry activity. */
export async function fetchFieldCulturalSignals(
  supabase: SupabaseClient,
  stats?: {
    records: number | null;
    creatives: number | null;
    organisations: number | null;
    opportunities: number | null;
  }
): Promise<FieldCulturalSignals> {
  const snapshotAt = new Date().toISOString();
  const now = new Date(snapshotAt);
  const since7d = isoDaysAgo(7, now.getTime());
  const since14d = isoDaysAgo(14, now.getTime());

  const haveStats = {
    records: typeof stats?.records === "number",
    creatives: typeof stats?.creatives === "number",
    organisations: typeof stats?.organisations === "number",
    opportunities: typeof stats?.opportunities === "number",
  };

  const [
    newRecords7d,
    newRecordsPrior7d,
    verificationPending,
    transfersActive7d,
    transfersPrior7d,
    closingSoon72h,
    recentlyActive7d,
    verifiedInstitutions,
    recordTotalFallback,
    creativesFallback,
    organisationsFallback,
    liveOpportunitiesFallback,
  ] = await Promise.all([
    safeCount("newRecords7d", () => countArtworksCreatedBetween(supabase, since7d)),
    safeCount("newRecordsPrior7d", () =>
      countArtworksCreatedBetween(supabase, since14d, since7d)
    ),
    safeCount("verificationPending", async () => {
      const { count, error } = await supabase
        .from("artworks")
        .select("id", { count: "exact", head: true })
        .in("verification_status", ["filed", "self_attested"]);
      if (error) throw error;
      return typeof count === "number" ? count : null;
    }),
    safeCount("transfersActive7d", () => countOwnershipEventsBetween(supabase, since7d)),
    safeCount("transfersPrior7d", () =>
      countOwnershipEventsBetween(supabase, since14d, since7d)
    ),
    safeCount("closingSoon72h", () => countClosingSoonOpportunities(supabase, now)),
    safeCount("recentlyActive7d", () => countRecentlyActiveCreatives(supabase, since7d)),
    safeCount("verifiedInstitutions", () =>
      countPublicOrganisations(supabase, { verifiedOnly: true })
    ),
    haveStats.records
      ? Promise.resolve(stats!.records)
      : safeCount("recordTotal", () => countRecords(supabase)),
    haveStats.creatives
      ? Promise.resolve(stats!.creatives)
      : safeCount("publicCreatives", () => countPublicCreatives(supabase)),
    haveStats.organisations
      ? Promise.resolve(stats!.organisations)
      : safeCount("publicOrganisations", () => countPublicOrganisations(supabase)),
    haveStats.opportunities
      ? Promise.resolve(stats!.opportunities)
      : safeCount("liveOpportunities", () => countLiveOpportunities(supabase, now)),
  ]);

  return {
    snapshotAt,
    signals: {
      newRecords7d,
      verificationPending,
      transfersActive7d,
      closingSoon72h,
      newRecordsPrior7d,
      transfersPrior7d,
    },
    cluster: {
      records: {
        total: recordTotalFallback,
        new7d: newRecords7d,
        awaitingAttestation: verificationPending,
      },
      creatives: {
        total: creativesFallback,
        recentlyActive7d,
      },
      organisations: {
        total: organisationsFallback,
        verifiedInstitutions,
      },
      opportunities: {
        live: liveOpportunitiesFallback,
        closingSoon72h,
      },
    },
  };
}
