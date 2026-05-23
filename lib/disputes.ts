import type { SupabaseClient } from "@supabase/supabase-js";

export const DISPUTE_TARGET_TYPES = [
  "ownership",
  "artist",
  "gallery_relationship",
] as const;

export type DisputeTargetType = (typeof DISPUTE_TARGET_TYPES)[number];

export const DISPUTE_STATUSES = [
  "pending",
  "under_review",
  "resolved",
  "rejected",
] as const;

export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const ACTIVE_DISPUTE_STATUSES: DisputeStatus[] = [
  "pending",
  "under_review",
];

export function isDisputeTargetType(v: string): v is DisputeTargetType {
  return (DISPUTE_TARGET_TYPES as readonly string[]).includes(v);
}

export function isDisputeStatus(v: string): v is DisputeStatus {
  return (DISPUTE_STATUSES as readonly string[]).includes(v);
}

/** Server-side only: open disputes do not expose author on public pages. */
export async function hasActiveDispute(
  service: SupabaseClient,
  targetType: DisputeTargetType,
  targetId: string
): Promise<boolean> {
  const { count, error } = await service
    .from("disputes")
    .select("id", { count: "exact", head: true })
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .in("status", ACTIVE_DISPUTE_STATUSES);

  if (error) {
    console.warn("[disputes] hasActiveDispute", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

export async function hasAnyActiveDisputeForTargets(
  service: SupabaseClient,
  pairs: { targetType: DisputeTargetType; targetId: string }[]
): Promise<Record<string, boolean>> {
  const out: Record<string, boolean> = {};
  for (const p of pairs) {
    out[`${p.targetType}:${p.targetId}`] = false;
  }
  if (pairs.length === 0) return out;

  const byType = new Map<DisputeTargetType, string[]>();
  for (const p of pairs) {
    const list = byType.get(p.targetType) ?? [];
    list.push(p.targetId);
    byType.set(p.targetType, list);
  }

  for (const [targetType, ids] of byType) {
    const uniq = [...new Set(ids)];
    if (uniq.length === 0) continue;
    const { data, error } = await service
      .from("disputes")
      .select("target_id")
      .eq("target_type", targetType)
      .in("target_id", uniq)
      .in("status", ACTIVE_DISPUTE_STATUSES);
    if (error) {
      console.warn("[disputes] batch flags", error.message);
      continue;
    }
    const hit = new Set((data || []).map((r) => String(r.target_id)));
    for (const id of uniq) {
      out[`${targetType}:${id}`] = hit.has(id);
    }
  }
  return out;
}

export async function validateDisputeTarget(
  service: SupabaseClient,
  targetType: DisputeTargetType,
  targetId: string
): Promise<boolean> {
  if (!targetId || !/^[0-9a-f-]{36}$/i.test(targetId)) return false;
  switch (targetType) {
    case "ownership": {
      const { data } = await service
        .from("ownership_events")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();
      return Boolean(data?.id);
    }
    case "artist": {
      const { data } = await service
        .from("artists")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();
      return Boolean(data?.id);
    }
    case "gallery_relationship": {
      const { data } = await service
        .from("gallery_artist_invites")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();
      return Boolean(data?.id);
    }
    default:
      return false;
  }
}
