import type { SupabaseClient } from "@supabase/supabase-js";

/** Server-side vault permission flags using SECURITY DEFINER RPCs + auth.uid(). */
export async function getCollectorVaultFlags(
  supabase: SupabaseClient,
  artworkId: string
): Promise<{ canView: boolean; canWrite: boolean }> {
  const [{ data: v }, { data: w }] = await Promise.all([
    supabase.rpc("user_can_view_collector_vault", { p_artwork_id: artworkId }),
    supabase.rpc("user_can_write_collector_vault", { p_artwork_id: artworkId }),
  ]);
  return {
    canView: v === true,
    canWrite: w === true,
  };
}
