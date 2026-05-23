import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import { PageNav } from "@/components/ui/PageNav";
import { parsePublicPresence } from "@/lib/public-presence";
import { GalleryPublicHero } from "@/components/gallery/GalleryPublicHero";
import { GalleryPublicSections } from "@/components/gallery/GalleryPublicSections";

export const dynamic = "force-dynamic";

type GalleryRow = {
  id: string;
  name: string | null;
  slug: string;
  location: string | null;
  description: string | null;
  website_url: string | null;
  verified: boolean;
  subscription_status: string | null;
  public_presence?: unknown;
};

type ArtistRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  slug: string | null;
};

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const clean = slug.trim();
  if (!clean) return { title: "Gallery · RROWM Registry" };

  const supabase = await createSupabaseServerClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("name, description, public_presence")
    .eq("slug", clean)
    .maybeSingle<{
      name: string | null;
      description: string | null;
      public_presence?: unknown;
    }>();

  if (!gallery) {
    return { title: "Gallery · RROWM Registry" };
  }

  const presence = parsePublicPresence(gallery.public_presence);
  if (!presence.profile) {
    return { title: "Gallery · RROWM Registry", robots: { index: false, follow: false } };
  }

  const name = gallery.name?.trim() || "Institutional gallery";
  const desc = gallery.description?.trim();
  const summary =
    desc && desc.length > 0
      ? desc.length > 160
        ? `${desc.slice(0, 157)}…`
        : desc
      : `Public gallery profile for ${name} on the RROWM registry.`;

  return {
    title: `${name} · RROWM Registry`,
    description: summary,
    openGraph: {
      title: `${name} · RROWM`,
      description: summary,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} · RROWM`,
      description: summary,
    },
  };
}

export default async function PublicGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clean = slug.trim();
  if (!clean) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: gallery, error: gErr } = await supabase
    .from("galleries")
    .select(
      "id, name, slug, location, description, website_url, verified, subscription_status, public_presence"
    )
    .eq("slug", clean)
    .maybeSingle<GalleryRow>();

  if (gErr) warnSupabaseRpc("public gallery", gErr);
  if (!gallery) notFound();

  const presence = parsePublicPresence(gallery.public_presence);
  if (!presence.profile) notFound();

  const displayName = gallery.name?.trim() || "Institutional studio";

  const { data: artists } = await supabase
    .from("artists")
    .select("id, display_name, full_name, slug")
    .eq("gallery_id", gallery.id)
    .returns<ArtistRow[]>();

  const artistList = artists || [];
  const artistIds = artistList.map((a) => a.id).filter(Boolean);

  const artistNameById: Record<string, string> = {};
  for (const a of artistList) {
    artistNameById[a.id] =
      a.display_name?.trim() || a.full_name?.trim() || "Artist";
  }

  let artworks: ArtworkRow[] = [];
  if (artistIds.length) {
    const { data: art, error: artErr } = await supabase
      .from("artwork_read_model")
      .select(
        "id, title, registry_id, image_url, artist_id, verification_status"
      )
      .in("artist_id", artistIds)
      .order("created_at", { ascending: false })
      .returns<ArtworkRow[]>();
    if (artErr) warnSupabaseRpc("gallery artworks", artErr);
    artworks = art || [];
  }

  const verifiedWorks = artworks.filter(
    (w) => String(w.verification_status || "").toLowerCase() === "verified"
  ).length;

  const locationLine =
    presence.location && gallery.location?.trim() ? gallery.location.trim() : null;

  const description = gallery.description?.trim() || null;

  const websiteRaw = gallery.website_url?.trim();
  const websiteHref = websiteRaw
    ? websiteRaw.startsWith("http")
      ? websiteRaw
      : `https://${websiteRaw}`
    : null;

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-16 text-neutral-900 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <PageNav backHref="/registry" />

        <GalleryPublicHero
          name={displayName}
          verified={gallery.verified}
          locationLine={locationLine}
          description={description}
          websiteHref={websiteHref}
          stats={{
            artists: artistList.length,
            works: artworks.length,
            verifiedWorks,
          }}
        />

        <GalleryPublicSections
          showRoster={presence.ownership}
          artists={artistList}
          artworks={artworks}
          artistNameById={artistNameById}
        />
      </main>
    </div>
  );
}
