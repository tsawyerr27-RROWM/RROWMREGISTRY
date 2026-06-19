import type { SupabaseClient } from "@supabase/supabase-js";

export const DEAL_PARTICIPANT_FALLBACK = "Participant";

export async function resolveDealParticipantDisplayName(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const uid = String(userId ?? "").trim();
  if (!uid) return DEAL_PARTICIPANT_FALLBACK;

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", uid)
    .maybeSingle();

  const role = String((actor as { role?: string } | null)?.role ?? "")
    .toLowerCase()
    .trim();

  if (role === "artist") {
    const { data: artist } = await supabase
      .from("artists")
      .select("display_name, full_name")
      .eq("id", uid)
      .maybeSingle();
    const name =
      String((artist as { display_name?: string } | null)?.display_name ?? "").trim() ||
      String((artist as { full_name?: string } | null)?.full_name ?? "").trim();
    if (name) return name;
  }

  if (role === "collector") {
    const { data: collector } = await supabase
      .from("collector_profiles")
      .select("display_name")
      .eq("user_id", uid)
      .maybeSingle();
    const name = String(
      (collector as { display_name?: string } | null)?.display_name ?? ""
    ).trim();
    if (name) return name;
  }

  if (role === "gallery") {
    const { data: membership } = await supabase
      .from("gallery_users")
      .select("galleries(name)")
      .eq("user_id", uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const galleryRaw = (membership as { galleries?: unknown } | null)?.galleries;
    const gallery = Array.isArray(galleryRaw)
      ? (galleryRaw[0] as { name?: string } | undefined)
      : (galleryRaw as { name?: string } | null | undefined);
    const name = String(gallery?.name ?? "").trim();
    if (name) return name;
  }

  return DEAL_PARTICIPANT_FALLBACK;
}

export async function resolveDealParticipantLabels(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Record<string, string>> {
  const ids = [...new Set(userIds.map((id) => String(id ?? "").trim()).filter(Boolean))];
  const entries = await Promise.all(
    ids.map(async (id) => [id, await resolveDealParticipantDisplayName(supabase, id)] as const)
  );
  return Object.fromEntries(entries);
}

export function counterpartyUserIdForDeal(
  viewerUserId: string,
  deal: {
    participant_a_user_id?: string | null;
    participant_b_user_id?: string | null;
  }
): string | null {
  const viewer = String(viewerUserId ?? "").trim();
  const a = String(deal.participant_a_user_id ?? "").trim();
  const b = String(deal.participant_b_user_id ?? "").trim();
  if (!viewer) return null;
  if (viewer === a) return b || null;
  if (viewer === b) return a || null;
  return null;
}
