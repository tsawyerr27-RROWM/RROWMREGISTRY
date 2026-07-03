import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchCreativeExplorerList } from "@/lib/fetch-creative-explorer-list";
import { fetchFieldOpportunitiesList } from "@/lib/fetch-field-opportunities-list";
import { fetchOrganisationExplorerList } from "@/lib/fetch-organisation-explorer-list";
import { fetchRecordExplorerList } from "@/lib/fetch-record-explorer-list";
import { parseFieldOpportunityListParams } from "@/lib/field-opportunity-params";

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
  fn: () => Promise<{ total: number }>
): Promise<number | null> {
  try {
    const { total } = await fn();
    return typeof total === "number" && Number.isFinite(total) ? total : null;
  } catch (error) {
    console.error(`[fetchFieldSignatureStats] ${label}`, error);
    return null;
  }
}

/** Live counts aligned with existing Field explorer list semantics. */
export async function fetchFieldSignatureStats(
  supabase: SupabaseClient
): Promise<FieldSignatureStats> {
  const [records, creatives, organisations, opportunities] = await Promise.all([
    safeTotal("records", () =>
      fetchRecordExplorerList(supabase, {
        q: "",
        sort: "recent",
        page: 1,
        creative: "",
        organisation: "",
        practice: "",
        trust: "all",
        certificate: "all",
      })
    ),
    safeTotal("creatives", () =>
      fetchCreativeExplorerList(supabase, {
        q: "",
        sort: "name_asc",
        page: 1,
        practice: "",
        verified: "all",
      })
    ),
    safeTotal("organisations", () =>
      fetchOrganisationExplorerList(supabase, {
        q: "",
        sort: "name_asc",
        page: 1,
        location: "",
        verified: "all",
        represented: "all",
      })
    ),
    safeTotal("opportunities", () =>
      fetchFieldOpportunitiesList(
        supabase,
        parseFieldOpportunityListParams({ window: "open" })
      )
    ),
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
