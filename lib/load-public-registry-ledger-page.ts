import type { SupabaseClient } from "@supabase/supabase-js";

import {
  PublicRegistryRecordView,
} from "@/components/Registry/PublicRegistryRecordView";
import { getCurrentOwner } from "@/lib/get-current-owner";
import {
  latestOwnershipSystemStatus,
} from "@/lib/ownership-ledger";
import { getArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import { getProvenanceInsights } from "@/lib/provenance-insights";
import { fieldRecordHref } from "@/lib/field-nav";
import { registryLedgerHref } from "@/lib/registry-nav";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type PublicRegistryLedgerPageData = {
  artwork: {
    id: string;
    title: string | null;
    registry_id: string;
    year: string | number | null;
    medium: string | null;
    dimensions: string | null;
    description: string | null;
    image_url: string | null;
    verification_status: string | null;
    verification_hash: string | null;
    timeline_hash: string | null;
    is_locked: boolean | null;
  };
  artistName: string;
  artistSlug: string | null;
  verificationGalleryName: string | null;
  edition: {
    is_unique: boolean | null;
    edition_number: number | null;
    edition_total: number | null;
  } | null;
  hasCertificate: boolean;
  certRevoked: boolean;
  revokedReason: string | null;
  ownershipStatus: ReturnType<typeof latestOwnershipSystemStatus>;
  currentOwner: {
    slug: string | null;
    display_name: string | null;
    user_id: string | null;
    verification_status: string | null;
  };
  sessionUserId: string | null;
  provenanceBundle: Awaited<ReturnType<typeof getArchivalProvenanceBundle>>;
  provenanceInsights: Awaited<ReturnType<typeof getProvenanceInsights>>;
  shareUrl: string;
  claimReturnPath: string;
};

export async function loadPublicRegistryLedgerPageData(
  supabase: SupabaseClient,
  registryId: string
): Promise<PublicRegistryLedgerPageData | null> {
  const cleanId = registryId.trim();

  const { data: authData } = await supabase.auth.getUser();
  const sessionUser = authData?.user ?? null;

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      `
    id,
    title,
    registry_id,
      year,
      medium,
      dimensions,
      description,
      image_url,
    verification_status,
    timeline_hash,
      verification_hash,
      artist_id,
      is_locked,
      created_at
    `
    )
    .eq("registry_id", cleanId)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("registry artwork", artworkError);
  if (!artwork) return null;

  const { data: extras, error: extrasError } = await supabase
    .from("artworks")
    .select("edition_number, edition_total, is_unique")
    .eq("id", artwork.id)
    .maybeSingle();
  if (extrasError) warnSupabaseRpc("registry extras", extrasError);

  const { data: artist } = await supabase
    .from("artists")
    .select("id, display_name, full_name, slug")
    .eq("id", artwork.artist_id)
    .maybeSingle();

  const artistName =
    artist?.display_name?.trim() ||
    artist?.full_name?.trim() ||
    "Registered artist";

  const { data: certRows, error: certRpcError } = await supabase.rpc(
    "get_certificate_public_status_single",
    { p_artwork_id: artwork.id }
  );
  if (certRpcError) warnSupabaseRpc("registry cert RPC", certRpcError);

  type CertPublic = {
    has_certificate: boolean;
    revoked: boolean;
    revoked_reason: string | null;
  };
  const certificate = (certRows?.[0] ?? null) as CertPublic | null;

  const { data: ownershipRows } = await supabase
    .from("ownership_events")
    .select("*")
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: true });

  const latestOwnershipRow =
    ownershipRows && ownershipRows.length > 0
      ? (ownershipRows[ownershipRows.length - 1] as Record<string, unknown>)
      : null;
  const latestOwnershipStatus = latestOwnershipSystemStatus(latestOwnershipRow);
  const currentOwner = await getCurrentOwner(supabase, artwork.id);

  let verificationRows: Record<string, unknown>[] = [];
  const { data: verData, error: verErr } = await supabase
    .from("verification_events")
    .select("*")
    .eq("artwork_id", artwork.id)
    .order("created_at", { ascending: true });
  if (!verErr && verData) verificationRows = verData;

  let verificationGalleryName: string | null = null;
  try {
    const latest = [...verificationRows].reverse().find((r) => {
      const m = String((r as { verification_method?: string }).verification_method || "")
        .toLowerCase()
        .trim();
      return m === "gallery" && Boolean((r as { verified_by_gallery_id?: string }).verified_by_gallery_id);
    });
    const gid = latest
      ? ((latest as { verified_by_gallery_id?: string }).verified_by_gallery_id as
          | string
          | null)
      : null;
    if (gid) {
      const { data: g } = await supabase
        .from("galleries")
        .select("name")
        .eq("id", gid)
        .maybeSingle<{ name: string | null }>();
      verificationGalleryName = g?.name?.trim() || null;
    }
  } catch {
    // ignore
  }

  const certRevoked = Boolean(certificate?.revoked);
  const hasCertificate = Boolean(certificate?.has_certificate);

  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const shareUrl = `${siteBase}${fieldRecordHref(artwork.registry_id)}`;
  const claimReturnPath = registryLedgerHref(artwork.registry_id);

  const provenanceBundle = await getArchivalProvenanceBundle({
    supabase,
    artwork: {
      id: artwork.id,
      registry_id: artwork.registry_id,
      title: artwork.title,
      artist_id: artwork.artist_id,
      created_at: artwork.created_at,
    },
    artistName,
  });

  const provenanceInsights = await getProvenanceInsights({
    supabase,
    artworkId: artwork.id,
    artworkCreatedAt: artwork.created_at,
  });

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      registry_id: artwork.registry_id,
      year: artwork.year,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      description: artwork.description,
      image_url: artwork.image_url,
      verification_status: artwork.verification_status,
      verification_hash: artwork.verification_hash,
      timeline_hash: artwork.timeline_hash,
      is_locked: artwork.is_locked,
    },
    artistName,
    artistSlug: artist?.slug ?? null,
    verificationGalleryName,
    edition:
      extrasError || !extras
        ? null
        : {
            is_unique: extras.is_unique,
            edition_number: extras.edition_number,
            edition_total: extras.edition_total,
          },
    hasCertificate,
    certRevoked,
    revokedReason: certificate?.revoked_reason ?? null,
    ownershipStatus: latestOwnershipStatus,
    currentOwner: {
      slug: currentOwner.slug,
      display_name: currentOwner.display_name,
      user_id: currentOwner.user_id,
      verification_status: currentOwner.verification_status,
    },
    sessionUserId: sessionUser?.id ?? null,
    provenanceBundle,
    provenanceInsights,
    shareUrl,
    claimReturnPath,
  };
}

export { PublicRegistryRecordView };
