import type { SupabaseClient } from "@supabase/supabase-js";

export type UserDataExport = {
  exported_at: string;
  user_id: string;
  profile: Record<string, unknown> | null;
  role_specific: Record<string, unknown> | null;
  activity_events: Record<string, unknown>[];
  owned_artworks: Record<string, unknown>[];
  certificates: Record<string, unknown>[];
  ownership_events: Record<string, unknown>[];
};

function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(",")),
  ].join("\n");
}

export async function buildUserDataExport(
  service: SupabaseClient,
  userId: string
): Promise<UserDataExport> {
  const { data: actor } = await service
    .from("actor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let roleSpecific: Record<string, unknown> | null = null;
  const role = actor?.role;

  if (role === "artist") {
    const { data } = await service.from("artists").select("*").eq("id", userId).maybeSingle();
    roleSpecific = data;
  } else if (role === "collector") {
    const { data } = await service
      .from("collector_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    roleSpecific = data;
  } else if (role === "gallery") {
    const { data: mem } = await service
      .from("gallery_users")
      .select("gallery_id, role")
      .eq("user_id", userId)
      .maybeSingle();
    if (mem?.gallery_id) {
      const { data: gal } = await service
        .from("galleries")
        .select("*")
        .eq("id", mem.gallery_id)
        .maybeSingle();
      roleSpecific = { membership: mem, gallery: gal };
    }
  }

  const { data: activity } = await service
    .from("activity_events")
    .select("id, type, message, artwork_id, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data: artworks } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, artist_id, current_owner_id, filing_gallery_id, created_at, image_url, year, medium"
    )
    .or(`artist_id.eq.${userId},current_owner_id.eq.${userId}`)
    .limit(2000);

  const artworkIds = (artworks ?? []).map((a) => a.id);

  let certificates: Record<string, unknown>[] = [];
  if (artworkIds.length > 0) {
    const { data: certs } = await service
      .from("certificates")
      .select("id, artwork_id, registry_id, status, issued_at, revoked_at")
      .in("artwork_id", artworkIds)
      .limit(2000);
    certificates = certs ?? [];
  }

  const { data: ownershipEvents } = await service
    .from("ownership_events")
    .select(
      "id, artwork_id, from_user_id, to_user_id, transfer_type, created_at, verified_at"
    )
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId},created_by.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(5000);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: actor,
    role_specific: roleSpecific,
    activity_events: activity ?? [],
    owned_artworks: artworks ?? [],
    certificates,
    ownership_events: ownershipEvents ?? [],
  };
}

export function buildExportBundle(exportData: UserDataExport): {
  json: string;
  csv: Record<string, string>;
} {
  const json = JSON.stringify(exportData, null, 2);
  const csv: Record<string, string> = {};
  if (exportData.activity_events.length) {
    csv["activity_events.csv"] = rowsToCsv(exportData.activity_events);
  }
  if (exportData.owned_artworks.length) {
    csv["artworks.csv"] = rowsToCsv(exportData.owned_artworks);
  }
  if (exportData.certificates.length) {
    csv["certificates.csv"] = rowsToCsv(exportData.certificates);
  }
  if (exportData.ownership_events.length) {
    csv["ownership_events.csv"] = rowsToCsv(exportData.ownership_events);
  }
  return { json, csv };
}
