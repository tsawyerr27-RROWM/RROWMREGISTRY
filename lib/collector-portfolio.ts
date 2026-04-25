import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Artwork IDs where the user is the effective current holder per latest
 * ownership_events row (to_user_id / to_owner_id).
 */
export async function getCollectorOwnedArtworkIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data: mentions, error: mErr } = await supabase
    .from("ownership_events")
    .select("artwork_id")
    .or(`to_user_id.eq.${userId},to_owner_id.eq.${userId}`);

  if (mErr || !mentions?.length) return [];

  const candidateIds = [
    ...new Set(
      mentions
        .map((m) => (m.artwork_id ? String(m.artwork_id) : ""))
        .filter(Boolean)
    ),
  ];
  if (candidateIds.length === 0) return [];

  const { data: allEv, error: eErr } = await supabase
    .from("ownership_events")
    .select("artwork_id, to_user_id, to_owner_id, created_at, id")
    .in("artwork_id", candidateIds)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (eErr || !allEv?.length) return [];

  const latestByArt = new Map<
    string,
    {
      artwork_id: string;
      to_user_id: string | null;
      to_owner_id: string | null;
      created_at: string | null;
      id: string | null;
    }
  >();

  for (const row of allEv) {
    const aid = row.artwork_id ? String(row.artwork_id) : "";
    if (!aid || latestByArt.has(aid)) continue;
    latestByArt.set(aid, row);
  }

  const owned: string[] = [];
  for (const [aid, row] of latestByArt) {
    const uid = row.to_user_id ?? row.to_owner_id;
    if (uid && String(uid) === userId) owned.push(aid);
  }
  return owned;
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
