import { createSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCertificatePublicStatusByArtworkIds } from "@/lib/fetch-certificate-public-status-map";
import { fetchVerifiedArtworkList } from "@/lib/fetch-verified-artwork-list";
import { redirectIfPageOutOfRange } from "@/lib/redirect-registry-page";
import {
  parseListParams,
  type RegistrySort,
} from "@/lib/registry-list-params";
import {
  RegistryExplorerContent,
  type RegistryExplorerArtwork,
} from "@/components/Registry/RegistryExplorerContent";
import { RegistryExplorerHero } from "@/components/Registry/RegistryExplorerHero";

export const dynamic = "force-dynamic";

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  created_at: string;
  artists:
    | { display_name: string | null; slug: string | null }
    | { display_name: string | null; slug: string | null }[]
    | null;
};

export default async function RegistryExplorer({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { q, sort, page } = parseListParams(sp);

  const supabase = await createSupabaseServerClient();

  const { artworks: rawArtworks, total } = await fetchVerifiedArtworkList(
    supabase,
    {
      q,
      sort: sort as RegistrySort,
      page,
    }
  );

  const artworks = rawArtworks as ArtworkRow[];

  redirectIfPageOutOfRange("/registry", page, total, q, sort);

  const artworkIds = artworks.map((a) => a.id);
  const certByArtwork =
    artworkIds.length > 0
      ? await fetchCertificatePublicStatusByArtworkIds(supabase, artworkIds)
      : new Map<string, { revoked: boolean }>();

  const explorerArtworks: RegistryExplorerArtwork[] = artworks.map((artwork) => {
    const artist = Array.isArray(artwork.artists)
      ? artwork.artists[0]
      : artwork.artists;
    const cert = certByArtwork.get(artwork.id);
    let cert_status: RegistryExplorerArtwork["cert_status"] = "verified";
    if (cert?.revoked) cert_status = "revoked";
    else if (!cert) cert_status = "none";

    return {
      id: artwork.id,
      title: artwork.title,
      registry_id: artwork.registry_id,
      image_url: artwork.image_url,
      created_at: artwork.created_at,
      artist_display_name: artist?.display_name ?? null,
      artist_slug: artist?.slug ?? null,
      cert_status,
    };
  });

  const formKey = `${q}|${sort}`;

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-16 text-neutral-900 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <RegistryExplorerHero searchQuery={q} />

        <RegistryExplorerContent
          artworks={explorerArtworks}
          total={total}
          q={q}
          sort={sort as RegistrySort}
          page={page}
          formKey={formKey}
        />
      </main>
    </div>
  );
}
