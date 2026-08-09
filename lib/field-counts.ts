import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Database-side count queries for the Field signature surface.
 *
 * These replace fetch-everything-filter-in-JS counting: each helper issues a
 * single HEAD request with `count: "exact"` so only the number crosses the
 * wire. Semantics mirror the Field explorer lists:
 *
 * - "public" creatives/organisations = `public_presence.profile !== false`
 *   (null column or missing key counts as public — see parsePublicPresence)
 *   AND a non-empty slug.
 * - "live" opportunities = published, open participation, verified gallery,
 *   and currently accepting responses (opens_at/closes_at window).
 */

const MS_HOUR = 60 * 60 * 1000;

/** PostgREST filter matching parsePublicPresence().profile !== false */
const PRESENCE_PROFILE_PUBLIC_OR =
  "public_presence->>profile.is.null,public_presence->>profile.neq.false";

function assertCount(count: number | null, error: { message: string } | null): number | null {
  if (error) throw error;
  return typeof count === "number" ? count : null;
}

export async function countRecords(supabase: SupabaseClient): Promise<number | null> {
  const { count, error } = await supabase
    .from("artworks")
    .select("id", { count: "exact", head: true });
  return assertCount(count, error);
}

export async function countPublicCreatives(
  supabase: SupabaseClient
): Promise<number | null> {
  const { count, error } = await supabase
    .from("artists")
    .select("id", { count: "exact", head: true })
    .not("slug", "is", null)
    .neq("slug", "")
    .or(PRESENCE_PROFILE_PUBLIC_OR);
  return assertCount(count, error);
}

export async function countPublicOrganisations(
  supabase: SupabaseClient,
  opts: { verifiedOnly?: boolean } = {}
): Promise<number | null> {
  let query = supabase
    .from("galleries")
    .select("id", { count: "exact", head: true })
    .not("slug", "is", null)
    .neq("slug", "")
    .or(PRESENCE_PROFILE_PUBLIC_OR);
  if (opts.verifiedOnly) {
    query = query.eq("verified", true);
  }
  const { count, error } = await query;
  return assertCount(count, error);
}

/** Published, open-participation briefs from verified galleries, currently accepting responses. */
export async function countLiveOpportunities(
  supabase: SupabaseClient,
  now: Date
): Promise<number | null> {
  const iso = now.toISOString();
  const { count, error } = await supabase
    .from("field_briefs")
    .select("id, galleries!inner(verified)", { count: "exact", head: true })
    .eq("visibility_state", "published")
    .eq("participation_mode", "open")
    .eq("galleries.verified", true)
    .or(`opens_at.is.null,opens_at.lte.${iso}`)
    .or(`closes_at.is.null,closes_at.gte.${iso}`);
  return assertCount(count, error);
}

/** Open briefs whose response window closes within the next 72 HOURS. */
export async function countClosingSoonOpportunities(
  supabase: SupabaseClient,
  now: Date
): Promise<number | null> {
  const horizon = new Date(now.getTime() + 72 * MS_HOUR);
  const iso = now.toISOString();
  const { count, error } = await supabase
    .from("field_briefs")
    .select("id", { count: "exact", head: true })
    .eq("visibility_state", "published")
    .eq("participation_mode", "open")
    .not("closes_at", "is", null)
    .gte("closes_at", iso)
    .lte("closes_at", horizon.toISOString())
    .or(`opens_at.is.null,opens_at.lte.${iso}`);
  return assertCount(count, error);
}
