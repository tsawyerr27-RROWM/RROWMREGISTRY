import type { SupabaseClient } from "@supabase/supabase-js";

import {
  certificateStatusMapToCollectorRecord,
  fetchCertificatePublicStatusByArtworkIds,
} from "@/lib/fetch-certificate-public-status-map";
import { collectorTemporalPresenceLines } from "@/lib/archival-temporal";
import {
  getCollectorOwnedArtworkIds,
  sortPortfolioRows,
} from "@/lib/collector-portfolio";
import type { CollectorStats } from "@/lib/collector-stats";
import { getCollectorStats } from "@/lib/collector-stats";
import {
  formatHeldByLine,
  getCurrentOwnersByArtworkId,
} from "@/lib/get-current-owner";
import {
  latestOwnershipSystemStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import { fieldRecordHref } from "@/lib/field-nav";
import { parsePublicPresence } from "@/lib/public-presence";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type CollectorPresenceWork = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  artistName: string | null;
  recordVerified: boolean;
  hasCertificate: boolean;
  certificateRevoked: boolean;
  ownershipLabel: string;
  ownershipClassName: string;
  heldLine: string | null;
  recordHref: string;
};

export type CollectorPresenceFootprint = {
  visibleWorks: number;
  verifiedWorks: number;
  certificateCount: number;
  revokedCertificateCount: number;
};

export type CollectorPresencePageData = {
  displayTitle: string;
  location: string | null;
  bio: string | null;
  anonymousPublic: boolean;
  showLocation: boolean;
  showOwnershipDetails: boolean;
  stats: CollectorStats | null;
  stewardshipLines: string[];
  footprint: CollectorPresenceFootprint;
  works: CollectorPresenceWork[];
};

type CollectorProfileRow = {
  user_id: string;
  display_name: string | null;
  slug: string;
  location: string | null;
  bio: string | null;
  is_public: boolean;
  public_presence?: unknown;
  anonymous_on_public?: boolean | null;
};

type ArtworkReadRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
  latest_transfer_at: string | null;
  created_at: string | null;
};

export async function loadCollectorPresencePageData(
  supabase: SupabaseClient,
  slug: string
): Promise<CollectorPresencePageData | null> {
  const cleanSlug = slug.trim();
  if (!cleanSlug) return null;

  const { data: profile, error: profileError } = await supabase
    .from("collector_profiles")
    .select(
      "user_id, display_name, slug, location, bio, is_public, public_presence, anonymous_on_public"
    )
    .eq("slug", cleanSlug)
    .maybeSingle<CollectorProfileRow>();

  if (profileError) warnSupabaseRpc("field collector profile", profileError);
  if (!profile) return null;

  if (!profile.is_public) return null;

  const presence = parsePublicPresence(profile.public_presence);
  if (!presence.profile) return null;

  const anonymousPublic = Boolean(profile.anonymous_on_public);
  const displayTitle = anonymousPublic
    ? "Private collector"
    : profile.display_name?.trim() || "Collector";

  const locationLine =
    presence.location && profile.location?.trim() && !anonymousPublic
      ? profile.location.trim()
      : null;

  const bio =
    profile.bio?.trim() && !anonymousPublic ? profile.bio.trim() : null;

  const stats = await getCollectorStats(supabase, profile.user_id);
  const stewardshipLines = collectorTemporalPresenceLines(
    stats
      ? {
          total_owned: stats.total_owned,
          verified_owned: stats.verified_owned,
        }
      : null
  );

  const ownedIds = await getCollectorOwnedArtworkIds(supabase, profile.user_id);

  if (ownedIds.length === 0) {
    return {
      displayTitle,
      location: locationLine,
      bio,
      anonymousPublic,
      showLocation: presence.location,
      showOwnershipDetails: presence.ownership,
      stats,
      stewardshipLines,
      footprint: {
        visibleWorks: 0,
        verifiedWorks: 0,
        certificateCount: 0,
        revokedCertificateCount: 0,
      },
      works: [],
    };
  }

  const { data: artRows, error: artError } = await supabase
    .from("artwork_read_model")
    .select(
      "id, title, registry_id, image_url, artist_id, verification_status, latest_transfer_at, created_at"
    )
    .in("id", ownedIds)
    .returns<ArtworkReadRow[]>();

  if (artError) warnSupabaseRpc("field collector artworks", artError);

  const list = (artRows ?? []).filter((row) => Boolean(row.registry_id?.trim()));
  const artistIds = [
    ...new Set(list.map((row) => row.artist_id).filter(Boolean)),
  ] as string[];

  const artistNameById: Record<string, string> = {};
  if (artistIds.length > 0) {
    const { data: artists } = await supabase
      .from("artists")
      .select("id, display_name, full_name")
      .in("id", artistIds);

    for (const artist of artists ?? []) {
      artistNameById[String(artist.id)] =
        artist.display_name?.trim() || artist.full_name?.trim() || "Creative";
    }
  }

  const certStatusMap = await fetchCertificatePublicStatusByArtworkIds(
    supabase,
    ownedIds
  );
  const certMap = certificateStatusMapToCollectorRecord(certStatusMap);
  const ownersByArt = await getCurrentOwnersByArtworkId(supabase, ownedIds);

  const visibleRows: ArtworkReadRow[] = [];
  for (const row of list) {
    const owner = ownersByArt[row.id];
    if (!owner?.user_id || owner.user_id !== profile.user_id) continue;
    if (owner.verification_status !== "verified") continue;
    visibleRows.push(row);
  }

  const sortedRows = sortPortfolioRows(visibleRows, "activity");

  let certificateCount = 0;
  let revokedCertificateCount = 0;
  let verifiedWorks = 0;

  const works: CollectorPresenceWork[] = sortedRows.map((row) => {
    const registryId = row.registry_id!.trim();
    const recordVerified =
      String(row.verification_status || "").toLowerCase() === "verified";
    if (recordVerified) verifiedWorks += 1;

    const cert = certMap[row.id];
    const hasCertificate = Boolean(cert?.has_certificate);
    const certificateRevoked = Boolean(cert?.revoked);
    if (hasCertificate) {
      certificateCount += 1;
      if (certificateRevoked) revokedCertificateCount += 1;
    }

    const ownerRow = ownersByArt[row.id];
    const ownBadge = ownershipStatusBadge(
      latestOwnershipSystemStatus({
        to_user_id: ownerRow?.user_id ?? null,
        verification_status: ownerRow?.verification_status ?? null,
      } as Record<string, unknown>),
      "light"
    );

    const heldLine = presence.ownership
      ? formatHeldByLine({
          owner: ownersByArt[row.id],
          viewerUserId: null,
        })
      : null;

    const artistName =
      presence.ownership && row.artist_id
        ? artistNameById[row.artist_id] ?? null
        : null;

    return {
      id: row.id,
      title: row.title,
      registry_id: registryId,
      image_url: row.image_url,
      artistName,
      recordVerified,
      hasCertificate,
      certificateRevoked,
      ownershipLabel: ownBadge.label,
      ownershipClassName: ownBadge.className,
      heldLine,
      recordHref: fieldRecordHref(registryId),
    };
  });

  return {
    displayTitle,
    location: locationLine,
    bio,
    anonymousPublic,
    showLocation: presence.location,
    showOwnershipDetails: presence.ownership,
    stats,
    stewardshipLines,
    footprint: {
      visibleWorks: works.length,
      verifiedWorks,
      certificateCount,
      revokedCertificateCount,
    },
    works,
  };
}

export async function loadCollectorPresenceMetadata(
  supabase: SupabaseClient,
  slug: string
): Promise<{ title: string; bio: string | null; indexable: boolean } | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data } = await supabase
    .from("collector_profiles")
    .select(
      "display_name, bio, is_public, public_presence, anonymous_on_public"
    )
    .eq("slug", clean)
    .maybeSingle<{
      display_name: string | null;
      bio: string | null;
      is_public: boolean;
      public_presence?: unknown;
      anonymous_on_public?: boolean | null;
    }>();

  if (!data?.is_public) return null;

  const presence = parsePublicPresence(data.public_presence);
  if (!presence.profile) return null;

  const anonymousPublic = Boolean(data.anonymous_on_public);
  const title = anonymousPublic
    ? "Private collector"
    : data.display_name?.trim() || "Collector";

  return {
    title,
    bio: anonymousPublic ? null : data.bio,
    indexable: !anonymousPublic,
  };
}
