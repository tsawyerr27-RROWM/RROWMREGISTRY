import type { SupabaseClient } from "@supabase/supabase-js";

import { registryLedgerHref } from "@/lib/registry-nav";
import {
  filterPublicRightsLicenses,
  resolveRightsParticipantLabels,
  toPublicRightsLicenseView,
  type PublicRightsLicenseView,
} from "@/lib/rights-publicity";
import {
  mapRightsLicenseRow,
  type RightsLicenseRow,
  type RightsLicenseStatus,
} from "@/lib/rights-licenses";
import {
  licenseMatchesStudioTab,
  type StudioRightsTabId,
} from "@/lib/rights-summary";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type RightsLedgerLicenseView = {
  id: string;
  deal_id: string | null;
  artwork_id: string;
  artwork_title: string | null;
  registry_id: string | null;
  registry_href: string | null;
  status: RightsLicenseStatus;
  usage_type: RightsLicenseRow["usage_type"];
  territory: string;
  exclusivity: RightsLicenseRow["exclusivity"];
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
  licensor_user_id: string;
  licensee_user_id: string;
  licensor_label: string;
  licensee_label: string;
  created_at: string;
};

export type RightsLedgerGrouped = {
  active: PublicRightsLicenseView[];
  expired: PublicRightsLicenseView[];
  revoked: PublicRightsLicenseView[];
};

export const STUDIO_RIGHTS_HREF = "/studio/rights";

export function studioRightsHref(highlightLicenseId?: string | null): string {
  const id = String(highlightLicenseId ?? "").trim();
  if (!id) return STUDIO_RIGHTS_HREF;
  return `${STUDIO_RIGHTS_HREF}?license=${encodeURIComponent(id)}`;
}

export function registryRightsLedgerHref(registryId: string): string {
  return `${registryLedgerHref(registryId)}#rights-ledger`;
}

const RIGHTS_SELECT =
  "id, created_at, updated_at, deal_id, artwork_id, licensor_user_id, licensee_user_id, status, usage_type, territory, exclusivity, starts_at, ends_at, notes, metadata";

export async function listRightsLicensesForArtwork(
  service: SupabaseClient,
  artworkId: string
): Promise<RightsLicenseRow[]> {
  const clean = String(artworkId ?? "").trim();
  if (!clean) return [];

  const { data, error } = await service
    .from("rights_licenses")
    .select(RIGHTS_SELECT)
    .eq("artwork_id", clean)
    .order("starts_at", { ascending: false });

  if (error) {
    warnSupabaseRpc("rights licenses by artwork", error);
    return [];
  }

  return (data ?? [])
    .map((row) => mapRightsLicenseRow(row as Record<string, unknown>))
    .filter(Boolean) as RightsLicenseRow[];
}

export async function listRightsLicensesForUser(
  service: SupabaseClient,
  userId: string
): Promise<RightsLicenseRow[]> {
  const clean = String(userId ?? "").trim();
  if (!clean) return [];

  const { data, error } = await service
    .from("rights_licenses")
    .select(RIGHTS_SELECT)
    .or(`licensor_user_id.eq.${clean},licensee_user_id.eq.${clean}`)
    .order("starts_at", { ascending: false });

  if (error) {
    warnSupabaseRpc("rights licenses by user", error);
    return [];
  }

  return (data ?? [])
    .map((row) => mapRightsLicenseRow(row as Record<string, unknown>))
    .filter(Boolean) as RightsLicenseRow[];
}

export function groupPublicRightsLicenses(
  licenses: PublicRightsLicenseView[]
): RightsLedgerGrouped {
  const active: PublicRightsLicenseView[] = [];
  const expired: PublicRightsLicenseView[] = [];
  const revoked: PublicRightsLicenseView[] = [];

  for (const license of licenses) {
    if (license.status === "active") active.push(license);
    else if (license.status === "expired") expired.push(license);
    else if (license.status === "revoked") revoked.push(license);
  }

  return { active, expired, revoked };
}

export function filterStudioRightsLicenses(
  licenses: RightsLedgerLicenseView[],
  tab: StudioRightsTabId
): RightsLedgerLicenseView[] {
  return licenses.filter((license) => licenseMatchesStudioTab(license, tab));
}

async function loadArtworkMetaMap(
  service: SupabaseClient,
  artworkIds: string[]
): Promise<Map<string, { title: string | null; registry_id: string | null }>> {
  const ids = [...new Set(artworkIds.map((id) => id.trim()).filter(Boolean))];
  const out = new Map<string, { title: string | null; registry_id: string | null }>();
  if (ids.length === 0) return out;

  const { data, error } = await service
    .from("artworks")
    .select("id, title, registry_id")
    .in("id", ids);

  if (error) {
    warnSupabaseRpc("rights ledger artwork meta", error);
    return out;
  }

  for (const row of data ?? []) {
    const id = String((row as { id?: string }).id ?? "").trim();
    if (!id) continue;
    out.set(id, {
      title: String((row as { title?: string }).title ?? "").trim() || null,
      registry_id:
        String((row as { registry_id?: string }).registry_id ?? "").trim() || null,
    });
  }

  return out;
}

export async function enrichRightsLicensesForStudio(
  service: SupabaseClient,
  licenses: RightsLicenseRow[],
  viewerUserId: string
): Promise<RightsLedgerLicenseView[]> {
  if (licenses.length === 0) return [];

  const artworkMeta = await loadArtworkMetaMap(
    service,
    licenses.map((license) => license.artwork_id)
  );

  const participantIds = licenses.flatMap((license) => [
    license.licensor_user_id,
    license.licensee_user_id,
  ]);
  const labels = await resolveRightsParticipantLabels(service, participantIds);

  return licenses.map((license) => {
    const meta = artworkMeta.get(license.artwork_id);
    const registryId = meta?.registry_id ?? null;
    const licensorLabel = labels.get(license.licensor_user_id) ?? "Licensor";
    const licenseeLabel = labels.get(license.licensee_user_id) ?? "Licensee";

    return {
      id: license.id,
      deal_id: license.deal_id,
      artwork_id: license.artwork_id,
      artwork_title: meta?.title ?? null,
      registry_id: registryId,
      registry_href: registryId ? registryRightsLedgerHref(registryId) : null,
      status: license.status,
      usage_type: license.usage_type,
      territory: license.territory,
      exclusivity: license.exclusivity,
      starts_at: license.starts_at,
      ends_at: license.ends_at,
      notes: license.notes,
      licensor_user_id: license.licensor_user_id,
      licensee_user_id: license.licensee_user_id,
      licensor_label:
        license.licensor_user_id === viewerUserId ? "You" : licensorLabel,
      licensee_label:
        license.licensee_user_id === viewerUserId ? "You" : licenseeLabel,
      created_at: license.created_at,
    };
  });
}

export async function loadPublicArtworkRightsLedger(
  service: SupabaseClient,
  args: {
    artworkId: string;
    artistUserId?: string | null;
    artistDisplayName?: string | null;
  }
): Promise<RightsLedgerGrouped> {
  const licenses = filterPublicRightsLicenses(
    await listRightsLicensesForArtwork(service, args.artworkId)
  );

  const labels = await resolveRightsParticipantLabels(
    service,
    licenses.flatMap((license) => [
      license.licensor_user_id,
      license.licensee_user_id,
    ]),
    args.artistUserId,
    args.artistDisplayName
  );

  const views = licenses.map((license) =>
    toPublicRightsLicenseView(license, labels)
  );

  return groupPublicRightsLicenses(views);
}

export async function loadStudioRightsLedger(
  service: SupabaseClient,
  userId: string
): Promise<RightsLedgerLicenseView[]> {
  const licenses = await listRightsLicensesForUser(service, userId);
  return enrichRightsLicensesForStudio(service, licenses, userId);
}
