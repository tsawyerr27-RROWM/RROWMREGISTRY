import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { fetchArtistArtworkList } from "@/lib/fetch-artist-artwork-list";
import { redirectIfPageOutOfRange } from "@/lib/redirect-registry-page";
import { PageNav } from "@/components/ui/PageNav";
import {
  parseListParams,
  REGISTRY_PAGE_SIZE,
  type ArtworkStatusFilter,
  type RegistrySort,
} from "@/lib/registry-list-params";
import { RegistryListPagination } from "@/components/Registry/RegistryListPagination";
import { RegistryListFilters } from "@/components/Registry/RegistryListFilters";
import { parsePublicPresence } from "@/lib/public-presence";

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ artist_id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { artist_id } = await params;
  const sp = await searchParams;
  const slugParam = artist_id.trim();

  const { q, sort, page, status } = parseListParams(sp);

  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? null;

  const { data: artist } = await supabase
    .from("artists")
    .select(`
      id,
      slug,
      display_name,
      bio,
      website,
      instagram,
      verification_status,
      public_presence,
      galleries(
        name,
        verified
      )
    `)
    .eq("slug", slugParam)
    .maybeSingle();

  if (!artist) notFound();

  const presence = parsePublicPresence(
    (artist as { public_presence?: unknown }).public_presence
  );
  const isOwner = viewerId != null && viewerId === artist.id;
  if (!presence.profile && !isOwner) notFound();

  const { artworks, total } = await fetchArtistArtworkList(supabase, {
    artistId: artist.id,
    q,
    sort: sort as RegistrySort,
    page,
    status: status as ArtworkStatusFilter,
  });

  const artistBasePath = `/artist/${encodeURIComponent(artist.slug)}`;
  redirectIfPageOutOfRange(artistBasePath, page, total, q, sort, status);

  const gallery = Array.isArray(artist.galleries)
    ? artist.galleries[0]
    : artist.galleries;

  const formKey = `${q}|${sort}|${status}`;

  const filterHint =
    status === "verified"
      ? "Verified only"
      : status === "pending"
        ? "Pending verification only"
        : null;

  return (
    <div className="min-h-screen rrowm-bg-page-warm pt-20 text-neutral-900">
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <PageNav
          backHref="/registry"
          crumbs={[
            { label: "Registry", href: "/registry" },
            { label: "Artist", href: `/artist/${encodeURIComponent(artist.slug)}` },
            { label: artist.display_name },
          ]}
        />
        {/* Hero */}
        <section className="max-w-3xl">
          <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-[3.25rem]">
            {artist.display_name}
          </h1>

          {artist.verification_status === "verified" && (
            <div className="mt-6">
              <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50/90 px-4 py-1.5 text-xs font-medium tracking-wide text-emerald-900">
                Verified on RROWM
              </span>
            </div>
          )}

          {artist.bio ? (
            <div className="mt-10 space-y-6 text-lg leading-[1.75] text-neutral-700">
              {artist.bio.split(/\n\n+/).map((para: string, i: number) => (
                <p key={i} className="whitespace-pre-wrap">
                  {para.trim()}
                </p>
              ))}
            </div>
          ) : null}

          {(artist.website || artist.instagram) && (
            <div className="mt-10 flex flex-wrap gap-8 text-sm">
              {artist.website ? (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                >
                  Website
                </a>
              ) : null}
              {artist.instagram ? (
                <a
                  href={`https://instagram.com/${String(artist.instagram).replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                >
                  Instagram
                </a>
              ) : null}
            </div>
          )}
        </section>

        {gallery && presence.ownership ? (
          <section className="mt-14 max-w-2xl">
            <div className="rounded-3xl border border-black/[0.06] bg-white/80 p-8 shadow-sm backdrop-blur-sm md:p-10">
              <h2 className="text-xl font-medium text-neutral-900">
                {gallery.name}
              </h2>
              {gallery.verified ? (
                <p className="mt-2 text-xs text-neutral-500">
                  Represented by a verified gallery on RROWM
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Works */}
        <section className="mt-20 md:mt-24">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
                Registered works
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
                Open a piece for the curated view; use the registry link for the
                verification record.
              </p>
            </div>
            {total > 0 ? (
              <p className="text-xs text-neutral-500">
                {total} {total === 1 ? "work" : "works"} matching
                {filterHint ? ` · ${filterHint}` : ""}
                {q.trim() ? ` · search “${q.trim()}”` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            <RegistryListFilters
              action={artistBasePath}
              q={q}
              sort={sort as RegistrySort}
              formKey={formKey}
              idPrefix="artist"
              showStatusFilter
              status={status as ArtworkStatusFilter}
            />
          </div>

          {total === 0 ? (
            <div className="mt-14 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
              <p className="text-sm text-neutral-600">
                {q.trim() || status !== "all"
                  ? "No works match your search or filters. Try clearing the search or setting status to “All works”."
                  : "No registered works are on file for this artist yet."}
              </p>
              <Link
                href="/registry"
                className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Browse the registry
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {artworks.map((artwork) => {
                  const isVerified = artwork.verification_status === "verified";
                  const yearMedium = [artwork.year, artwork.medium]
                    .filter(Boolean)
                    .join(" · ");
                  const artworkHref = `/artwork/${encodeURIComponent(artwork.registry_id)}`;
                  const registryHref = `/registry/${encodeURIComponent(artwork.registry_id)}`;

                  return (
                    <article
                      key={artwork.id}
                      className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/90 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-black/[0.08] hover:shadow-[0_28px_70px_-36px_rgba(0,0,0,0.25)]"
                    >
                      <Link
                        href={artworkHref}
                        className="relative block aspect-[4/5] overflow-hidden bg-neutral-100"
                      >
                        {artwork.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={artwork.image_url}
                            alt={artwork.title || "Artwork"}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                            No image
                          </div>
                        )}
                        <div className="absolute left-4 top-4">
                          {isVerified ? (
                            <span className="inline-flex rounded-full border border-emerald-200/90 bg-emerald-50/95 px-3 py-1 text-sm font-semibold text-emerald-900 backdrop-blur-sm">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-amber-200/90 bg-amber-50/95 px-3 py-1 text-sm font-semibold text-amber-950 backdrop-blur-sm">
                              Pending
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col p-6 md:p-7">
                        <h3 className="font-serif text-xl font-normal leading-snug text-neutral-950">
                          <Link
                            href={artworkHref}
                            className="transition hover:text-neutral-600"
                          >
                            {artwork.title}
                          </Link>
                        </h3>
                        {yearMedium ? (
                          <p className="mt-2 text-sm text-neutral-500">
                            {yearMedium}
                          </p>
                        ) : null}
                        <p className="mt-4 font-mono text-[11px] text-neutral-400">
                          {artwork.registry_id}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-black/[0.05] pt-5">
                          <Link
                            href={artworkHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
                          >
                            View artwork
                          </Link>
                          <Link
                            href={registryHref}
                            className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                          >
                            Registry record
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <RegistryListPagination
                basePath={artistBasePath}
                page={page}
                pageSize={REGISTRY_PAGE_SIZE}
                total={total}
                q={q}
                sort={sort}
                status={status}
              />
            </>
          )}
        </section>

        {/* Trust bridge */}
        <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-24 md:px-12">
          <p className="text-base leading-relaxed text-neutral-700">
            Discover works on the artwork pages, then confirm details on the
            public registry—the verification layer for each record.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/registry"
              className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Browse registry
            </Link>
            <Link
              href="/registry"
              className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Browse registry
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
