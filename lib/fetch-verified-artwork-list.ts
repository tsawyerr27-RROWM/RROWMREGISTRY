import type { SupabaseClient } from "@supabase/supabase-js";
import {
  REGISTRY_PAGE_SIZE,
  type RegistrySort,
  sortToOrder,
} from "@/lib/registry-list-params";
import { fieldSearchIlikePattern } from "@/lib/field-search-contract";

const SELECT_ARTWORKS = `
  id,
  title,
  registry_id,
  image_url,
  created_at,
  artists!artworks_artist_id_fkey(
    display_name,
    slug
  )
`;

/**
 * Verified artworks only, with optional title/registry_id search and pagination.
 * `q` is sanitized for PostgREST `or()` (commas removed).
 * Reads public.artworks (source of truth for verification_status).
 */
export async function fetchVerifiedArtworkList(
  supabase: SupabaseClient,
  args: { q: string; sort: RegistrySort; page: number }
) {
  const { q, sort, page } = args;
  const { column, ascending } = sortToOrder(sort);
  const from = (page - 1) * REGISTRY_PAGE_SIZE;
  const to = from + REGISTRY_PAGE_SIZE - 1;

  let query = supabase
    .from("artworks")
    .select(SELECT_ARTWORKS, { count: "exact" })
    .eq("verification_status", "verified");

  const p = fieldSearchIlikePattern(q);
  if (p) {
    query = query.or(`title.ilike.${p},registry_id.ilike.${p}`);
  }

  query = query.order(column, { ascending, nullsFirst: false });
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[fetchVerifiedArtworkList]", error.message);
    return { artworks: [] as any[], total: 0 };
  }

  return {
    artworks: data ?? [],
    total: count ?? 0,
  };
}
