import type { SupabaseClient } from "@supabase/supabase-js";

import { fieldOrganisationHref } from "@/lib/field-nav";
import { parsePublicPresence } from "@/lib/public-presence";
import { tryCreateSupabaseServiceClient } from "@/lib/supabase-service-role";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type CreativeRepresentationSummary = {
  organisationName: string;
  organisationSlug: string | null;
  organisationHref: string | null;
  organisationVerified: boolean;
};

export async function loadActiveCreativeRepresentation(
  supabase: SupabaseClient,
  artistUserId: string
): Promise<CreativeRepresentationSummary | null> {
  const { data, error } = await supabase
    .from("representation_relationships")
    .select(
      "gallery_id, galleries(name, slug, verified, public_presence)"
    )
    .eq("artist_user_id", artistUserId)
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) warnSupabaseRpc("creative active representation", error);
  if (!data?.gallery_id) return null;

  const galleryRaw = (data as { galleries?: unknown }).galleries;
  const gallery = Array.isArray(galleryRaw)
    ? (galleryRaw[0] as Record<string, unknown> | undefined)
    : (galleryRaw as Record<string, unknown> | null | undefined);

  const name = String(gallery?.name ?? "").trim();
  if (!name) return null;

  const slug = String(gallery?.slug ?? "").trim() || null;
  const presence = parsePublicPresence(gallery?.public_presence);
  const href = slug && presence.profile ? fieldOrganisationHref(slug) : null;

  return {
    organisationName: name,
    organisationSlug: slug,
    organisationHref: href,
    organisationVerified: Boolean(gallery?.verified),
  };
}

export async function countArtistExhibitions(
  supabase: SupabaseClient,
  artistUserId: string
): Promise<number> {
  const { data: artworkRows, error: artworkError } = await supabase
    .from("artworks")
    .select("id")
    .eq("artist_id", artistUserId);

  if (artworkError) {
    warnSupabaseRpc("artist exhibition artworks", artworkError);
    return 0;
  }

  const artworkIds = (artworkRows ?? [])
    .map((row) => String((row as { id?: string }).id ?? "").trim())
    .filter(Boolean);

  if (artworkIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("provenance_events")
    .select("id", { count: "exact", head: true })
    .in("artwork_id", artworkIds)
    .eq("kind", "evidence")
    .filter("metadata->>category", "eq", "exhibition");

  if (error) {
    warnSupabaseRpc("artist exhibition count", error);
    return 0;
  }

  return count ?? 0;
}

export async function countOrganisationExhibitions(
  supabase: SupabaseClient,
  artistUserIds: string[]
): Promise<number> {
  const ids = artistUserIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) return 0;

  const { data: artworkRows, error: artworkError } = await supabase
    .from("artworks")
    .select("id")
    .in("artist_id", ids);

  if (artworkError) {
    warnSupabaseRpc("organisation exhibition artworks", artworkError);
    return 0;
  }

  const artworkIds = (artworkRows ?? [])
    .map((row) => String((row as { id?: string }).id ?? "").trim())
    .filter(Boolean);

  if (artworkIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("provenance_events")
    .select("id", { count: "exact", head: true })
    .in("artwork_id", artworkIds)
    .eq("kind", "evidence")
    .filter("metadata->>category", "eq", "exhibition");

  if (error) {
    warnSupabaseRpc("organisation exhibition count", error);
    return 0;
  }

  return count ?? 0;
}

export async function countActiveRepresentedArtists(
  supabase: SupabaseClient,
  galleryId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("representation_relationships")
    .select("id", { count: "exact", head: true })
    .eq("gallery_id", galleryId)
    .eq("status", "active");

  if (error) {
    warnSupabaseRpc("organisation represented artists count", error);
    return 0;
  }

  return count ?? 0;
}

export async function countCreativeActiveLicenses(
  _supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const clean = String(userId ?? "").trim();
  if (!clean) return 0;

  const service = tryCreateSupabaseServiceClient();
  if (!service) return 0;

  const { count, error } = await service
    .from("rights_licenses")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .or(`licensor_user_id.eq.${clean},licensee_user_id.eq.${clean}`);

  if (error) {
    warnSupabaseRpc("creative active licenses count", error);
    return 0;
  }

  return count ?? 0;
}

export async function countOrganisationActiveRightsAgreements(
  _supabase: SupabaseClient,
  galleryId: string
): Promise<number> {
  const clean = String(galleryId ?? "").trim();
  if (!clean) return 0;

  const service = tryCreateSupabaseServiceClient();
  if (!service) return 0;

  const { data: staffRows, error: staffError } = await service
    .from("gallery_users")
    .select("user_id")
    .eq("gallery_id", clean);

  if (staffError) {
    warnSupabaseRpc("organisation rights gallery staff", staffError);
    return 0;
  }

  const staffIds = (staffRows ?? [])
    .map((row) => String((row as { user_id?: string }).user_id ?? "").trim())
    .filter(Boolean);

  const { data: artistRows, error: artistError } = await service
    .from("representation_relationships")
    .select("artist_user_id")
    .eq("gallery_id", clean)
    .eq("status", "active");

  if (artistError) {
    warnSupabaseRpc("organisation rights represented artists", artistError);
    return 0;
  }

  const artistIds = (artistRows ?? [])
    .map((row) => String((row as { artist_user_id?: string }).artist_user_id ?? "").trim())
    .filter(Boolean);

  const participantIds = [...new Set([...staffIds, ...artistIds])];
  if (participantIds.length === 0) return 0;

  const orClause = participantIds
    .flatMap((id) => [
      `licensor_user_id.eq.${id}`,
      `licensee_user_id.eq.${id}`,
    ])
    .join(",");

  const { count, error } = await service
    .from("rights_licenses")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .or(orClause);

  if (error) {
    warnSupabaseRpc("organisation active rights agreements count", error);
    return 0;
  }

  return count ?? 0;
}

export async function resolveOrganisationDealCounterparty(
  supabase: SupabaseClient,
  organisationSlug: string
): Promise<{ userId: string; label: string; galleryId: string | null } | null> {
  const { data, error } = await supabase.rpc("resolve_field_deal_counterparty", {
    p_role: "organisation",
    p_slug: organisationSlug,
  });

  if (error) {
    warnSupabaseRpc("resolve organisation deal counterparty", error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const userId = String((row as { user_id?: string } | null)?.user_id ?? "").trim();
  if (!userId) return null;

  return {
    userId,
    label: String((row as { display_label?: string }).display_label ?? "").trim() || "Organisation",
    galleryId: String((row as { gallery_id?: string }).gallery_id ?? "").trim() || null,
  };
}
