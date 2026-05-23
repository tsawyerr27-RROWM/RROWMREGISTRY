import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArtistTemporalAnchor } from "@/lib/archival-temporal";

export async function fetchArtistTemporalAnchor(
  supabase: SupabaseClient,
  artistId: string
): Promise<ArtistTemporalAnchor> {
  const [{ count }, earliestRes] = await Promise.all([
    supabase
      .from("artworks")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId),
    supabase
      .from("artworks")
      .select("created_at")
      .eq("artist_id", artistId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const raw = earliestRes.data?.created_at;
  const earliestWorkYear =
    raw != null && !Number.isNaN(new Date(String(raw)).getTime())
      ? new Date(String(raw)).getFullYear()
      : null;

  return { earliestWorkYear, worksOnFile: count ?? 0 };
}
