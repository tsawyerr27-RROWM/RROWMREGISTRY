import type { SupabaseClient } from "@supabase/supabase-js";

import { getCanonicalOwner, getCanonicalOwners } from "@/lib/canonical-ownership-engine";
import { normalizeVerificationStatus } from "@/lib/ownership-ledger";
import { OWNERSHIP_EVENT_HOLDER_WITH_STATUS_SELECT } from "@/lib/ownership-events-schema";

export type CurrentOwnerIdentity = {
  user_id: string | null;
  display_name: string | null;
  slug: string | null;
  is_public: boolean;
  verification_status: "recorded" | "claimed" | "verified";
};

type LatestOwnershipRow = {
  artwork_id: string;
  to_user_id: string | null;
  verification_status: string | null;
  created_at: string | null;
  id: string | number | null;
};

type CollectorProfileRow = {
  user_id: string;
  display_name: string | null;
  slug: string;
  is_public: boolean;
};

function emptyIdentity(
  verification_status: CurrentOwnerIdentity["verification_status"]
): CurrentOwnerIdentity {
  return {
    user_id: null,
    display_name: null,
    slug: null,
    is_public: false,
    verification_status,
  };
}

function applyExposureRule(args: {
  user_id: string | null;
  verification_status: CurrentOwnerIdentity["verification_status"];
  profile: CollectorProfileRow | null;
}): CurrentOwnerIdentity {
  const { user_id, verification_status, profile } = args;
  if (!user_id) return emptyIdentity(verification_status);
  const is_public = Boolean(profile?.is_public);
  const canExpose =
    verification_status === "verified" && is_public && Boolean(profile?.slug);

  return {
    user_id,
    display_name: canExpose ? profile?.display_name ?? null : null,
    slug: canExpose ? profile?.slug ?? null : null,
    is_public,
    verification_status,
  };
}

async function loadLatestStatusRow(
  supabase: SupabaseClient,
  artworkId: string
): Promise<LatestOwnershipRow | null> {
  const { data, error } = await supabase
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_HOLDER_WITH_STATUS_SELECT)
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle<LatestOwnershipRow>();

  if (error || !data) return null;
  return data;
}

/** Public owner identity — holder from ledger; profile exposure rules unchanged. */
export async function getCurrentOwner(
  supabase: SupabaseClient,
  artworkId: string
): Promise<CurrentOwnerIdentity> {
  const canonical = await getCanonicalOwner(supabase, artworkId);
  const latest = await loadLatestStatusRow(supabase, artworkId);

  if (!latest && !canonical.userId) {
    return emptyIdentity("recorded");
  }

  const verification_status = normalizeVerificationStatus(
    latest?.verification_status
  );
  const user_id = canonical.userId;

  if (!user_id) return emptyIdentity(verification_status);

  const { data: profile } =
    verification_status === "verified"
      ? await supabase
          .from("collector_profiles")
          .select("user_id, display_name, slug, is_public")
          .eq("user_id", user_id)
          .maybeSingle<CollectorProfileRow>()
      : { data: null as CollectorProfileRow | null };

  return applyExposureRule({
    user_id,
    verification_status,
    profile: profile ?? null,
  });
}

/** Batch public owner identities — ledger holder authority. */
export async function getCurrentOwnersByArtworkId(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<Record<string, CurrentOwnerIdentity>> {
  const out: Record<string, CurrentOwnerIdentity> = {};
  for (const id of artworkIds) out[id] = emptyIdentity("recorded");
  if (artworkIds.length === 0) return out;

  const canonicalByArt = await getCanonicalOwners(supabase, artworkIds);

  const { data: all } = await supabase
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_HOLDER_WITH_STATUS_SELECT)
    .in("artwork_id", artworkIds)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .returns<LatestOwnershipRow[]>();

  const latestByArt = new Map<string, LatestOwnershipRow>();
  for (const row of all || []) {
    const aid = row.artwork_id ? String(row.artwork_id) : "";
    if (!aid || latestByArt.has(aid)) continue;
    latestByArt.set(aid, row);
  }

  const holderIds = new Set<string>();
  const stByArt = new Map<string, CurrentOwnerIdentity["verification_status"]>();
  const uidByArt = new Map<string, string>();

  for (const aid of artworkIds) {
    const latest = latestByArt.get(aid) || null;
    const canonical = canonicalByArt[aid];
    const st = normalizeVerificationStatus(latest?.verification_status);
    stByArt.set(aid, st);
    const uid = canonical?.userId ?? null;
    if (!uid) continue;
    uidByArt.set(aid, uid);
    if (st === "verified") holderIds.add(uid);
  }

  const profilesByUserId: Record<string, CollectorProfileRow> = {};
  const holderList = [...holderIds];
  if (holderList.length) {
    const { data: profiles } = await supabase
      .from("collector_profiles")
      .select("user_id, display_name, slug, is_public")
      .in("user_id", holderList)
      .returns<CollectorProfileRow[]>();
    for (const p of profiles || []) profilesByUserId[p.user_id] = p;
  }

  for (const aid of artworkIds) {
    const st = stByArt.get(aid) || "recorded";
    const uid = uidByArt.get(aid) || null;
    const profile = uid ? profilesByUserId[uid] ?? null : null;
    out[aid] = applyExposureRule({
      user_id: uid,
      verification_status: st,
      profile,
    });
  }

  return out;
}

export function heldByCredibilityClass(owner: CurrentOwnerIdentity): string {
  if (!owner.user_id) {
    return "text-neutral-500 font-normal";
  }
  if (owner.verification_status === "verified") {
    return "text-neutral-900 font-medium";
  }
  if (owner.verification_status === "claimed") {
    return "text-neutral-600 font-normal";
  }
  return "text-neutral-500 font-normal";
}

export function formatHeldByLine(args: {
  owner: CurrentOwnerIdentity;
  viewerUserId?: string | null;
}): string {
  const { owner, viewerUserId } = args;
  if (owner.user_id && viewerUserId && owner.user_id === viewerUserId) {
    return "You hold this work";
  }
  if (!owner.user_id) return "Unassigned";
  if (owner.verification_status !== "verified") {
    return owner.verification_status === "claimed"
      ? "Ownership claimed"
      : "Ownership recorded";
  }
  if (owner.slug && owner.display_name) return `Held by ${owner.display_name}`;
  return "Private collection";
}
