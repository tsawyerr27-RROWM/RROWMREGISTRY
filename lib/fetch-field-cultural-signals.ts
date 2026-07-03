import type { SupabaseClient } from "@supabase/supabase-js";

import { isOpportunityAcceptingResponses } from "@/lib/field-opportunity-params";
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

async function countClosingSoonBriefs(
  supabase: SupabaseClient,
  now: Date
): Promise<number | null> {
  const horizon = new Date(now.getTime() + 72 * MS_DAY);

  const { data, error } = await supabase
    .from("field_briefs")
    .select("id, opens_at, closes_at")
    .eq("visibility_state", "published")
    .eq("participation_mode", "open")
    .not("closes_at", "is", null)
    .gte("closes_at", now.toISOString())
    .lte("closes_at", horizon.toISOString());

  if (error) throw error;

  return (data ?? []).filter((row) =>
    isOpportunityAcceptingResponses({
      opensAt: (row as { opens_at: string | null }).opens_at,
      closesAt: (row as { closes_at: string | null }).closes_at,
      now,
    })
  ).length;
}

async function countPublicCreatives(supabase: SupabaseClient): Promise<number | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("id, slug, public_presence");

  if (error) throw error;

  return (data ?? []).filter((row) => {
    const presence = parsePublicPresence(
      (row as { public_presence?: unknown }).public_presence
    );
    return presence.profile && String((row as { slug?: string }).slug ?? "").trim();
  }).length;
}

async function countPublicOrganisations(supabase: SupabaseClient): Promise<{
  total: number | null;
  verifiedInstitutions: number | null;
}> {
  const { data, error } = await supabase
    .from("galleries")
    .select("id, slug, verified, public_presence");

  if (error) throw error;

  const publicRows = (data ?? []).filter((row) => {
    const presence = parsePublicPresence(
      (row as { public_presence?: unknown }).public_presence
    );
    return presence.profile && String((row as { slug?: string }).slug ?? "").trim();
  });

  return {
    total: publicRows.length,
    verifiedInstitutions: publicRows.filter(
      (row) => (row as { verified?: boolean }).verified === true
    ).length,
  };
}

async function countLiveOpportunities(
  supabase: SupabaseClient,
  now: Date
): Promise<number | null> {
  const { data, error } = await supabase
    .from("field_briefs")
    .select("id, opens_at, closes_at, galleries(verified)")
    .eq("visibility_state", "published")
    .eq("participation_mode", "open");

  if (error) throw error;

  return (data ?? []).filter((row) => {
    const gallery = Array.isArray(row.galleries) ? row.galleries[0] : row.galleries;
    if (!gallery || !(gallery as { verified?: boolean }).verified) return false;
    return isOpportunityAcceptingResponses({
      opensAt: (row as { opens_at: string | null }).opens_at,
      closesAt: (row as { closes_at: string | null }).closes_at,
      now,
    });
  }).length;
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

  let orgBundle: { total: number | null; verifiedInstitutions: number | null } = {
    total: null,
    verifiedInstitutions: null,
  };
  try {
    orgBundle = await countPublicOrganisations(supabase);
  } catch (error) {
    console.error("[fetchFieldCulturalSignals] organisations", error);
  }

  const [
    newRecords7d,
    newRecordsPrior7d,
    verificationPending,
    transfersActive7d,
    transfersPrior7d,
    closingSoon72h,
    recentlyActive7d,
    liveOpportunities,
    publicCreatives,
    recordTotal,
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
    safeCount("closingSoon72h", () => countClosingSoonBriefs(supabase, now)),
    safeCount("recentlyActive7d", () => countRecentlyActiveCreatives(supabase, since7d)),
    safeCount("liveOpportunities", () => countLiveOpportunities(supabase, now)),
    safeCount("publicCreatives", () => countPublicCreatives(supabase)),
    safeCount("recordTotal", async () => {
      if (typeof stats?.records === "number") return stats.records;
      const { count, error } = await supabase
        .from("artworks")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return typeof count === "number" ? count : null;
    }),
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
        total: recordTotal,
        new7d: newRecords7d,
        awaitingAttestation: verificationPending,
      },
      creatives: {
        total: stats?.creatives ?? publicCreatives,
        recentlyActive7d,
      },
      organisations: {
        total: stats?.organisations ?? orgBundle.total,
        verifiedInstitutions: orgBundle.verifiedInstitutions,
      },
      opportunities: {
        live: stats?.opportunities ?? liveOpportunities,
        closingSoon72h,
      },
    },
  };
}
