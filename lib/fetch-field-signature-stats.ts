import type { SupabaseClient } from "@supabase/supabase-js";

import {
  countLiveOpportunities,
  countPublicCreatives,
  countPublicOrganisations,
  countRecords,
} from "@/lib/field-counts";

export type FieldSignatureStats = {
  records: number | null;
  creatives: number | null;
  organisations: number | null;
  opportunities: number | null;
};

const EMPTY_STATS: FieldSignatureStats = {
  records: null,
  creatives: null,
  organisations: null,
  opportunities: null,
};

async function safeTotal(
  label: string,
  fn: () => Promise<number | null>
): Promise<number | null> {
  try {
    const total = await fn();
    return typeof total === "number" && Number.isFinite(total) ? total : null;
  } catch (error) {
    console.error(`[fetchFieldSignatureStats] ${label}`, error);
    return null;
  }
}

/**
 * Live counts aligned with existing Field explorer list semantics.
 * Uses HEAD count queries (see lib/field-counts.ts) rather than fetching
 * full explorer lists — only the numbers cross the wire.
 */
export async function fetchFieldSignatureStats(
  supabase: SupabaseClient
): Promise<FieldSignatureStats> {
  const now = new Date();

  const [records, creatives, organisations, opportunities] = await Promise.all([
    safeTotal("records", () => countRecords(supabase)),
    safeTotal("creatives", () => countPublicCreatives(supabase)),
    safeTotal("organisations", () => countPublicOrganisations(supabase)),
    safeTotal("opportunities", () => countLiveOpportunities(supabase, now)),
  ]);

  if (
    records === null &&
    creatives === null &&
    organisations === null &&
    opportunities === null
  ) {
    return EMPTY_STATS;
  }

  return { records, creatives, organisations, opportunities };
}
