import type { SupabaseClient } from "@supabase/supabase-js";

export type CollectorStats = {
  total_owned: number;
  verified_owned: number;
  claimed_owned: number;
  recorded_owned: number;
  first_activity_at: string | null;
};

function normalizeStats(raw: unknown): CollectorStats {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    total_owned: Number(o.total_owned ?? 0) || 0,
    verified_owned: Number(o.verified_owned ?? 0) || 0,
    claimed_owned: Number(o.claimed_owned ?? 0) || 0,
    recorded_owned: Number(o.recorded_owned ?? 0) || 0,
    first_activity_at:
      typeof o.first_activity_at === "string"
        ? o.first_activity_at
        : o.first_activity_at === null
          ? null
          : null,
  };
}

/** Server-side: latest ownership row per artwork for this user; RLS enforced in RPC. */
export async function getCollectorStats(
  supabase: SupabaseClient,
  userId: string
): Promise<CollectorStats | null> {
  const { data, error } = await supabase.rpc("get_collector_stats", {
    p_user_id: userId,
  });
  if (error) return null;
  return normalizeStats(data);
}
