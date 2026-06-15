import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreativePresenceGallery } from "@/lib/field-creative-presence";
import { getCollectorOwnedArtworkIds } from "@/lib/collector-portfolio";
import {
  fieldCollectorHref,
  fieldCreativeHref,
  fieldOrganisationHref,
} from "@/lib/field-nav";
import { fillMessage, translate, type MessageKey } from "@/lib/locale-messages";
import { parsePublicPresence } from "@/lib/public-presence";
import {
  buildCollectorProfileShareContext,
  buildCreativeProfileShareContext,
  buildOrganisationProfileShareContext,
  profileShareAbsoluteUrl,
  type ProfileShareContext,
  type ProfileShareLine,
} from "@/lib/profile-presence-summary";
import { loadCreativePracticeChips } from "@/lib/practices";
import { getSiteUrl } from "@/lib/site-url";

export type ProfileOgBundle = {
  context: ProfileShareContext;
  bio: string | null;
  indexable: boolean;
};

const OG_LANG = "en" as const;

function tOg(key: MessageKey): string {
  return translate(key, OG_LANG);
}

function formatShareLine(line: ProfileShareLine | null): string | null {
  if (!line) return null;
  const template = tOg(line.key);
  return line.params ? fillMessage(template, line.params) : template;
}

function truncateDescription(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function resolveProfileOgLines(context: ProfileShareContext) {
  const surfaceLabel = tOg(context.surfaceLabelKey);
  const trust = formatShareLine(context.trustLine);
  const footprint = formatShareLine(context.footprintLine);
  const secondary = formatShareLine(context.secondaryLine);
  const detail = [footprint, secondary, context.practiceLine].filter(Boolean).join(" · ");
  const summary = [trust, detail].filter(Boolean).join(" · ");
  const description = fillMessage(tOg("profile.presence.share.text"), {
    name: context.displayName,
    summary: summary || surfaceLabel,
  });

  return {
    surfaceLabel,
    trust,
    footprint,
    secondary,
    practice: context.practiceLine,
    detail,
    summary,
    description,
    title: `${context.displayName} · The Field`,
    alt: `${context.displayName} — ${summary || surfaceLabel}`,
  };
}

export function buildProfilePresenceMetadata(bundle: ProfileOgBundle): Metadata {
  const lines = resolveProfileOgLines(bundle.context);
  const canonicalUrl = profileShareAbsoluteUrl(bundle.context, getSiteUrl());
  const description = bundle.bio?.trim()
    ? truncateDescription(bundle.bio)
    : truncateDescription(lines.description);

  return {
    title: lines.title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: bundle.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: lines.title,
      description,
      url: canonicalUrl,
      siteName: "RROWM",
      type: "profile",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: lines.title,
      description,
    },
  };
}

type ArtistOgRow = {
  id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  verification_status: string | null;
  public_presence?: unknown;
  galleries:
    | {
        name: string | null;
        verified: boolean | null;
        slug: string | null;
        public_presence?: unknown;
      }
    | {
        name: string | null;
        verified: boolean | null;
        slug: string | null;
        public_presence?: unknown;
      }[]
    | null;
};

function resolveGalleryForOg(row: ArtistOgRow): CreativePresenceGallery | null {
  const raw = Array.isArray(row.galleries) ? row.galleries[0] : row.galleries;
  if (!raw?.name) return null;

  const orgPresence = parsePublicPresence(raw.public_presence);
  const slug = raw.slug?.trim() || null;
  const profilePublic = orgPresence.profile && Boolean(slug);

  return {
    name: raw.name.trim(),
    verified: Boolean(raw.verified),
    slug,
    profilePublic,
    href: profilePublic && slug ? fieldOrganisationHref(slug) : null,
  };
}

export async function loadCreativeProfileOgBundle(
  supabase: SupabaseClient,
  slug: string
): Promise<ProfileOgBundle | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data: artistRaw } = await supabase
    .from("artists")
    .select(
      `
      id,
      slug,
      display_name,
      bio,
      verification_status,
      public_presence,
      galleries(
        name,
        verified,
        slug,
        public_presence
      )
    `
    )
    .eq("slug", clean)
    .maybeSingle<ArtistOgRow>();

  if (!artistRaw) return null;

  const presence = parsePublicPresence(artistRaw.public_presence);
  if (!presence.profile) return null;

  const [{ count: verifiedWorkCount }, { count: total }] = await Promise.all([
    supabase
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .eq("artist_id", artistRaw.id)
      .eq("verification_status", "verified"),
    supabase
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .eq("artist_id", artistRaw.id),
  ]);

  const declaredPractices = await loadCreativePracticeChips(
    supabase,
    artistRaw.id,
    artistRaw.public_presence
  );

  const context = buildCreativeProfileShareContext({
    artist: {
      id: artistRaw.id,
      slug: artistRaw.slug,
      display_name: artistRaw.display_name?.trim() || "Creative",
      bio: artistRaw.bio,
      website: null,
      instagram: null,
      verification_status: artistRaw.verification_status,
    },
    gallery: resolveGalleryForOg(artistRaw),
    participationLayers: [],
    artworks: [],
    total: total ?? 0,
    verifiedWorkCount: verifiedWorkCount ?? 0,
    basePath: fieldCreativeHref(clean),
    q: "",
    sort: "newest",
    page: 1,
    status: "all",
    formKey: "",
    filterHint: null,
    showOrganisationSection: false,
    practices: [],
    declaredPractices,
    registryPractices: [],
    practiceExplorerHref: null,
    isProfileOwner: false,
    showOwnerPracticeGuidance: false,
    stewardshipItems: [],
    contextPanels: [],
  });

  return {
    context,
    bio: artistRaw.bio,
    indexable: presence.profile,
  };
}

export async function loadOrganisationProfileOgBundle(
  supabase: SupabaseClient,
  slug: string
): Promise<ProfileOgBundle | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data: galleryRaw } = await supabase
    .from("galleries")
    .select("id, name, slug, description, verified, public_presence")
    .eq("slug", clean)
    .maybeSingle<{
      id: string;
      name: string | null;
      slug: string;
      description: string | null;
      verified: boolean;
      public_presence?: unknown;
    }>();

  if (!galleryRaw) return null;

  const presence = parsePublicPresence(galleryRaw.public_presence);
  if (!presence.profile) return null;

  const { data: artistRows } = await supabase
    .from("artists")
    .select("id, shown_on_institutional_public")
    .eq("gallery_id", galleryRaw.id)
    .returns<Array<{ id: string; shown_on_institutional_public?: boolean | null }>>();

  const allArtistIds = (artistRows || []).map((row) => row.id);
  const representedCreatives = presence.ownership
    ? (artistRows || []).filter((row) => Boolean(row.shown_on_institutional_public))
    : [];

  let totalRecords = 0;
  let verifiedRecords = 0;

  if (allArtistIds.length > 0) {
    const [{ count: total }, { count: verified }] = await Promise.all([
      supabase
        .from("artwork_read_model")
        .select("id", { count: "exact", head: true })
        .in("artist_id", allArtistIds),
      supabase
        .from("artwork_read_model")
        .select("id", { count: "exact", head: true })
        .in("artist_id", allArtistIds)
        .eq("verification_status", "verified"),
    ]);
    totalRecords = total ?? 0;
    verifiedRecords = verified ?? 0;
  }

  const context = buildOrganisationProfileShareContext({
    organisation: {
      id: galleryRaw.id,
      slug: galleryRaw.slug,
      name: galleryRaw.name?.trim() || "Organisation",
      location: null,
      description: galleryRaw.description,
      websiteHref: null,
      verified: Boolean(galleryRaw.verified),
    },
    showRoster: false,
    showLocation: false,
    showDescription: false,
    participationLayers: [],
    representedCreatives: representedCreatives.map((row) => ({
      id: row.id,
      displayName: "Creative",
      slug: null,
      href: null,
      artistVerified: false,
      verifiedWorkCount: 0,
      totalWorkCount: 0,
    })),
    artworks: [],
    footprint: {
      totalRecords,
      verifiedRecords,
      certificateCount: 0,
      revokedCertificateCount: 0,
    },
    isProfileOwner: false,
    stewardshipItems: [],
    contextPanels: [],
  });

  return {
    context,
    bio: galleryRaw.description,
    indexable: presence.profile,
  };
}

export async function loadCollectorProfileOgBundle(
  supabase: SupabaseClient,
  slug: string
): Promise<ProfileOgBundle | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data: profile } = await supabase
    .from("collector_profiles")
    .select(
      "user_id, display_name, bio, is_public, public_presence, anonymous_on_public"
    )
    .eq("slug", clean)
    .maybeSingle<{
      user_id: string;
      display_name: string | null;
      bio: string | null;
      is_public: boolean;
      public_presence?: unknown;
      anonymous_on_public?: boolean | null;
    }>();

  if (!profile?.is_public) return null;

  const presence = parsePublicPresence(profile.public_presence);
  if (!presence.profile) return null;

  const anonymousPublic = Boolean(profile.anonymous_on_public);
  const displayTitle = anonymousPublic
    ? "Private collector"
    : profile.display_name?.trim() || "Collector";

  const ownedIds = await getCollectorOwnedArtworkIds(supabase, profile.user_id);
  let verifiedWorks = 0;

  if (ownedIds.length > 0) {
    const { count } = await supabase
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .in("id", ownedIds)
      .eq("verification_status", "verified");
    verifiedWorks = count ?? 0;
  }

  const context = buildCollectorProfileShareContext({
    slug: clean,
    profilePath: fieldCollectorHref(clean),
    displayTitle,
    location: null,
    bio: anonymousPublic ? null : profile.bio,
    anonymousPublic,
    showLocation: false,
    showOwnershipDetails: false,
    stats: null,
    stewardshipLines: [],
    footprint: {
      visibleWorks: ownedIds.length,
      verifiedWorks,
      certificateCount: 0,
      revokedCertificateCount: 0,
    },
    works: [],
  });

  return {
    context,
    bio: anonymousPublic ? null : profile.bio,
    indexable: !anonymousPublic,
  };
}

export type ProfileOgSealTier = "registered" | "verified" | "established" | "private";

export function profileOgSealTier(context: ProfileShareContext): ProfileOgSealTier {
  const key = context.trustLine.key;
  if (key.includes("private")) return "private";
  if (
    key.includes("established") ||
    key.includes("onFile") ||
    key === "field.organisation.verification.onFile"
  ) {
    return "established";
  }
  if (
    key.includes("footprint") ||
    key.includes("stewardship") ||
    key.includes("representedBy")
  ) {
    return "verified";
  }
  return "registered";
}
