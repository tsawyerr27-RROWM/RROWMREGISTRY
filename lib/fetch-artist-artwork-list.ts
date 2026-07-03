import type { SupabaseClient } from "@supabase/supabase-js";
import {
  REGISTRY_PAGE_SIZE,
  type ArtworkStatusFilter,
  type RegistrySort,
  sortToOrder,
} from "@/lib/registry-list-params";

const SELECT_ARTIST_ARTWORKS = `
  id,
  title,
  registry_id,
  image_url,
  verification_status,
  year,
  medium,
  created_at
`;

/**
 * All works for an artist in public.artworks, with optional search, verification filter, sort, pagination.
 */
export async function fetchArtistArtworkList(
  supabase: SupabaseClient,
  args: {
    artistId: string;
    q: string;
    sort: RegistrySort;
    page: number;
    status: ArtworkStatusFilter;
  }
) {
  const { artistId, q, sort, page, status } = args;
  const { column, ascending } = sortToOrder(sort);
  const from = (page - 1) * REGISTRY_PAGE_SIZE;
  const to = from + REGISTRY_PAGE_SIZE - 1;

  let query = supabase
    .from("artworks")
    .select(SELECT_ARTIST_ARTWORKS, { count: "exact" })
    .eq("artist_id", artistId);

  if (status === "verified") {
    query = query.eq("verification_status", "verified");
  } else if (status === "self_attested") {
    query = query.eq("verification_status", "self_attested");
  } else if (status === "filed") {
    query = query.or(
      "verification_status.eq.filed,verification_status.eq.unverified,verification_status.eq.pending,verification_status.is.null"
    );
  }

  const term = q.trim().replace(/,/g, " ");
  if (term) {
    const p = `%${term}%`;
    query = query.or(`title.ilike.${p},registry_id.ilike.${p}`);
  }

  query = query.order(column, { ascending, nullsFirst: false });
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[fetchArtistArtworkList]", error.message);
    return { artworks: [] as any[], total: 0 };
  }

  return {
    artworks: data ?? [],
    total: count ?? 0,
  };
}
