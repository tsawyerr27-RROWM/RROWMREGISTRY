import { createSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCertificatePublicStatusByArtworkIds } from "@/lib/fetch-certificate-public-status-map";
import { fetchVerifiedArtworkList } from "@/lib/fetch-verified-artwork-list";
import { redirectIfPageOutOfRange } from "@/lib/redirect-registry-page";
import {
  parseListParams,
  REGISTRY_PAGE_SIZE,
  type RegistrySort,
} from "@/lib/registry-list-params";
import { RegistryListPagination } from "@/components/Registry/RegistryListPagination";
import { RegistryListFilters } from "@/components/Registry/RegistryListFilters";
import { RegistryExplorerHero } from "@/components/Registry/RegistryExplorerHero";
import { PageNav } from "@/components/ui/PageNav";
import Link from "next/link";

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

  function certificateStatusLabel(artworkId: string) {
    const c = certByArtwork.get(artworkId);
    if (!c) return "Verified";
    if (c.revoked) return "Revoked";
    return "Verified";
  }

  const formKey = `${q}|${sort}`;

  return (
    <div className="ds-page-environment relative min-h-screen pb-28 pt-16 text-neutral-900 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
        aria-hidden
      />
      <main className="relative mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <PageNav crumbs={[{ label: "Registry" }]} />

        <RegistryExplorerHero
          searchQuery={q}
          headline="Browse verified records"
          lede={
            <>
              Explore artworks registered with RROWM. Open a record for the
              authoritative verification layer; use the artwork page for a curated
              presentation.
            </>
          }
          trustNote={
            <>
              Only verified works appear in this index. Certificate documents are
              not exposed on the public grid—sign in to view a full certificate
              where available.
            </>
          }
        />

        <div className="mt-10">
          <RegistryListFilters
            action="/registry"
            q={q}
            sort={sort as RegistrySort}
            formKey={formKey}
            variant="explorer"
          />
        </div>

        {!artworks.length ? (
          <div className="mt-12 rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/80 to-neutral-50/50 px-8 py-14 text-center shadow-[0_20px_50px_-38px_rgba(15,23,42,0.14)] sm:px-10 sm:py-16">
            <p className="text-sm font-semibold text-emerald-800/75">
              Registry
            </p>
            <h2 className="mt-4 font-serif text-2xl font-normal tracking-tight text-neutral-950">
              No records to show
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.65] text-neutral-600">
              {q.trim()
                ? "No verified artworks match your search. Try different keywords or clear the search."
                : "No verified artworks yet. Check back once records are published."}
            </p>
            {q.trim() ? (
              <Link
                href="/registry"
                className="mt-8 inline-flex items-center rounded-full border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
              >
                Clear search
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <section className="mt-14 border-t border-neutral-900/[0.06] pt-14 md:mt-16 md:pt-16">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]">
                    Verified records
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
                    Each entry links to the immutable registry record for this
                    artwork.
                  </p>
                </div>
                <p className="text-sm text-neutral-600">
                  Page {page}
                </p>
              </div>

              <ul className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-10">
                {artworks.map((artwork) => {
                  const artist = Array.isArray(artwork.artists)
                    ? artwork.artists[0]
                    : artwork.artists;
                  const title = (artwork.title || "").trim() || "Untitled";

                  return (
                    <li key={artwork.id}>
                      <article className="liquid-glass-tile group flex flex-col overflow-hidden transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5">
                        <div className="relative aspect-[4/5] w-full bg-neutral-100/80">
                          {artwork.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={artwork.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                              No image on file
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-6 md:p-7">
                          <p className="text-sm font-medium text-neutral-600">
                            Registry ID
                          </p>
                          <p className="mt-1.5 font-mono text-[11px] tracking-tight text-neutral-600">
                            {artwork.registry_id}
                          </p>
                          <h3 className="mt-4 font-serif text-lg font-normal leading-snug tracking-tight text-neutral-950 transition group-hover:text-neutral-900">
                            {title}
                          </h3>
                          {artist?.slug ? (
                            <Link
                              href={`/artist/${artist.slug}`}
                              className="mt-2 text-sm text-neutral-600 transition hover:text-neutral-900 hover:underline"
                            >
                              {artist.display_name}
                            </Link>
                          ) : (
                            <p className="mt-2 text-sm text-neutral-600">
                              {artist?.display_name ?? "—"}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-400">
                            Added{" "}
                            {new Date(artwork.created_at).toLocaleDateString()}
                          </p>
                          <p className="mt-3 text-xs text-neutral-600">
                            <span className="text-neutral-400">
                              Certificate status:
                            </span>{" "}
                            <span className="font-medium text-neutral-900">
                              {certificateStatusLabel(artwork.id)}
                            </span>
                          </p>
                          <div className="mt-6 flex flex-col gap-2">
                            <Link
                              href={`/registry/${encodeURIComponent(artwork.registry_id)}`}
                              className="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                            >
                              View registry record
                            </Link>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs">
                              <Link
                                href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                                className="font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                              >
                                Verify certificate
                              </Link>
                              <Link
                                href={`/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`}
                                className="text-neutral-600 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                              >
                                View certificate (login required)
                              </Link>
                              <Link
                                href={`/artwork/${encodeURIComponent(artwork.registry_id)}`}
                                className="text-neutral-500 underline decoration-neutral-300 underline-offset-[0.35em] transition hover:text-neutral-900 hover:decoration-neutral-500"
                              >
                                Artwork page
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>

            <RegistryListPagination
              basePath="/registry"
              page={page}
              pageSize={REGISTRY_PAGE_SIZE}
              total={total}
              q={q}
              sort={sort}
            />
          </>
        )}
      </main>
    </div>
  );
}
