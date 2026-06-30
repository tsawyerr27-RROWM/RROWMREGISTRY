import type { SupabaseClient } from "@supabase/supabase-js";

import { getOwnedArtworkIds } from "@/lib/canonical-ownership-engine";

/**
 * Artwork IDs where the user is the effective current holder per latest
 * ownership_events row (to_user_id). Prefers the security-definer RPC used by
 * registry; falls back to the JS engine only when the RPC is unavailable.
 */
export async function getCollectorOwnedArtworkIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const { data, error } = await supabase.rpc(
    "list_collector_owned_artwork_ids",
    { p_user_id: uid }
  );

  if (!error && Array.isArray(data)) {
    return data.map((id) => String(id)).filter(Boolean);
  }

  if (error) {
    console.warn(
      "[collector-portfolio] list_collector_owned_artwork_ids",
      error.message
    );
  }

  return getOwnedArtworkIds(supabase, uid);
}

export function sortPortfolioRows<
  T extends {
    id: string;
    latest_transfer_at?: string | null;
    created_at?: string | null;
    latest_value?: number | null;
  },
>(rows: T[], mode: "activity" | "value"): T[] {
  const out = [...rows];
  if (mode === "value") {
    out.sort((a, b) => {
      const va = Number(a.latest_value ?? 0);
      const vb = Number(b.latest_value ?? 0);
      return vb - va;
    });
    return out;
  }
  out.sort((a, b) => {
    const ta = new Date(
      a.latest_transfer_at || a.created_at || 0
    ).getTime();
    const tb = new Date(
      b.latest_transfer_at || b.created_at || 0
    ).getTime();
    return tb - ta;
  });
  return out;
}
