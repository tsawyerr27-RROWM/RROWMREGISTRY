import type { SupabaseClient } from "@supabase/supabase-js";

import type { RightsLicenseRow } from "@/lib/rights-licenses";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type RightsParticipantLabel = {
  userId: string;
  label: string;
  role: "licensor" | "licensee";
};

export type PublicRightsLicenseView = {
  id: string;
  status: RightsLicenseRow["status"];
  usage_type: RightsLicenseRow["usage_type"];
  territory: string;
  exclusivity: RightsLicenseRow["exclusivity"];
  starts_at: string;
  ends_at: string | null;
  licensee_label: string;
  licensor_label: string;
};

const PUBLIC_REGISTRY_STATUSES = new Set<RightsLicenseRow["status"]>([
  "active",
  "expired",
  "revoked",
]);

export function isRightsLicensePubliclyVisible(
  license: Pick<RightsLicenseRow, "status">
): boolean {
  return PUBLIC_REGISTRY_STATUSES.has(license.status);
}

export function filterPublicRightsLicenses(
  licenses: RightsLicenseRow[]
): RightsLicenseRow[] {
  return licenses.filter(isRightsLicensePubliclyVisible);
}

export async function resolveRightsParticipantLabels(
  service: SupabaseClient,
  userIds: string[],
  artistUserId?: string | null,
  artistDisplayName?: string | null
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const ids = [...new Set(userIds.map((id) => String(id ?? "").trim()).filter(Boolean))];
  if (ids.length === 0) return out;

  const artistId = String(artistUserId ?? "").trim();
  const artistName = String(artistDisplayName ?? "").trim() || "Artist";

  for (const id of ids) {
    if (artistId && id === artistId) {
      out.set(id, artistName);
    }
  }

  const remaining = ids.filter((id) => !out.has(id));
  if (remaining.length === 0) return out;

  const { data: artists, error: artistError } = await service
    .from("artists")
    .select("id, display_name")
    .in("id", remaining);
  if (artistError) warnSupabaseRpc("rights participant artists", artistError);
  for (const row of artists ?? []) {
    const id = String((row as { id?: string }).id ?? "").trim();
    const name = String((row as { display_name?: string }).display_name ?? "").trim();
    if (id && name) out.set(id, name);
  }

  const afterArtists = remaining.filter((id) => !out.has(id));
  if (afterArtists.length > 0) {
    const { data: collectors, error: collectorError } = await service
      .from("collector_profiles")
      .select("user_id, display_name, slug, is_public")
      .in("user_id", afterArtists);
    if (collectorError) warnSupabaseRpc("rights participant collectors", collectorError);
    for (const row of collectors ?? []) {
      const id = String((row as { user_id?: string }).user_id ?? "").trim();
      const name = String((row as { display_name?: string }).display_name ?? "").trim();
      const isPublic = Boolean((row as { is_public?: boolean }).is_public);
      if (id && name && isPublic) out.set(id, name);
    }
  }

  const afterCollectors = remaining.filter((id) => !out.has(id));
  if (afterCollectors.length > 0) {
    const { data: staffRows, error: staffError } = await service
      .from("gallery_users")
      .select("user_id, galleries(name)")
      .in("user_id", afterCollectors);
    if (staffError) warnSupabaseRpc("rights participant gallery staff", staffError);
    for (const row of staffRows ?? []) {
      const id = String((row as { user_id?: string }).user_id ?? "").trim();
      const galleryRaw = (row as { galleries?: unknown }).galleries;
      const gallery = Array.isArray(galleryRaw)
        ? (galleryRaw[0] as { name?: string } | undefined)
        : (galleryRaw as { name?: string } | null | undefined);
      const name = String(gallery?.name ?? "").trim();
      if (id && name) out.set(id, name);
    }
  }

  for (const id of ids) {
    if (!out.has(id)) out.set(id, "Licensed participant");
  }

  return out;
}

export function toPublicRightsLicenseView(
  license: RightsLicenseRow,
  labels: Map<string, string>
): PublicRightsLicenseView {
  return {
    id: license.id,
    status: license.status,
    usage_type: license.usage_type,
    territory: license.territory,
    exclusivity: license.exclusivity,
    starts_at: license.starts_at,
    ends_at: license.ends_at,
    licensee_label:
      labels.get(license.licensee_user_id) ?? "Licensed participant",
    licensor_label:
      labels.get(license.licensor_user_id) ?? "Licensed participant",
  };
}

export function canViewerAccessStudioRightsLedger(viewerUserId: string | null): boolean {
  return Boolean(String(viewerUserId ?? "").trim());
}
