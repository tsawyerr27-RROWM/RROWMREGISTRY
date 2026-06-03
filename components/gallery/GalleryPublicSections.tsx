import Link from "next/link";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtistTierBadge } from "@/components/artist/ArtistTierBadge";
import type { ArtistTier } from "@/lib/artist-tier";

type ArtistRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  slug: string | null;
  tier?: ArtistTier;
};

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
};

type Props = {
  showRoster: boolean;
  artists: ArtistRow[];
  artworks: ArtworkRow[];
  artistNameById: Record<string, string>;
};

function artistInitial(name: string) {
  const c = name.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

export function GalleryPublicSections({
  showRoster,
  artists,
  artworks,
  artistNameById,
}: Props) {
  const verifiedCount = artworks.filter(
    (w) => String(w.verification_status || "").toLowerCase() === "verified"
  ).length;

  return (
    <>
      {showRoster ? (
        <section className="mt-16 lg:mt-20" aria-labelledby="gallery-roster-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-900/[0.08] pb-6">
            <div>
              <InfoTooltip text="Artists with an institution-linked association on file. Presence follows representation and chronology participation, not promotion." />
              <h2
                id="gallery-roster-heading"
                className="font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-3xl"
              >
                Represented participants
              </h2>
            </div>
            {artists.length > 0 ? (
              <span className="tabular-nums text-sm text-neutral-400">
                {artists.length} {artists.length === 1 ? "name" : "names"}
              </span>
            ) : null}
          </div>

          {artists.length === 0 ? (
            <div className="mt-10 rounded-[1.25rem] border border-dashed border-neutral-900/15 bg-gradient-to-br from-neutral-50/90 to-white/60 px-8 py-14 text-center shadow-[0_20px_50px_-38px_rgba(15,23,42,0.1)] sm:px-12">
              <p className="font-serif text-xl text-neutral-800">No represented participants on file yet</p>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
                When associations are filed, represented artists appear here with links to
                their catalogue profiles.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {artists.map((a) => {
                const label =
                  a.display_name?.trim() || a.full_name?.trim() || "Artist";
                return (
                  <li key={a.id}>
                    <div className="group flex h-full gap-4 rounded-xl border border-neutral-900/[0.07] bg-white/70 p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12 hover:bg-white hover:shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)]">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200/90 font-serif text-lg text-neutral-600 ring-1 ring-black/[0.05]"
                        aria-hidden
                      >
                        {artistInitial(label)}
                      </div>
                      <div className="min-w-0 flex-1">
                        {a.slug ? (
                          <Link
                            href={`/artist/${encodeURIComponent(a.slug)}`}
                            className="font-medium text-neutral-950 underline decoration-neutral-300/80 underline-offset-[6px] transition group-hover:decoration-neutral-500"
                          >
                            {label}
                          </Link>
                        ) : (
                          <span className="font-medium text-neutral-950">{label}</span>
                        )}
                        {a.tier ? (
                          <div className="mt-2 space-y-1">
                            <ArtistTierBadge tier={a.tier} />
                            {a.tier === "disputed" ? (
                              <p className="text-[11px] leading-snug text-neutral-600">
                                This record is under review.
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        <p className="mt-2 text-[12px] text-neutral-400">
                          {a.slug ? "Catalogue profile" : "Profile not yet on file"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-16 lg:mt-24" aria-labelledby="gallery-catalogue-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-900/[0.08] pb-6">
          <div>
            <InfoTooltip text="Works attributed to represented participants. Each record carries its own chronology and current catalogue listing. Continuity deepens as filings accrue." />
            <h2
              id="gallery-catalogue-heading"
              className="font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-3xl"
            >
              Represented works
            </h2>
          </div>
          {artworks.length > 0 ? (
            <div className="text-right">
              <span className="tabular-nums text-sm text-neutral-400">
                {artworks.length} {artworks.length === 1 ? "work" : "works"}
              </span>
              {verifiedCount > 0 ? (
                <p className="mt-1 text-[11px] text-neutral-500">
                  {verifiedCount} with verified listing on file
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {artworks.length === 0 ? (
          <div className="mt-10 rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/90 to-neutral-50/50 px-8 py-14 shadow-[0_24px_56px_-36px_rgba(15,23,42,0.14)] sm:px-10 sm:py-16">
            <h3 className="font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
              No represented works on file yet
            </h3>
            <p className="mt-4 max-w-lg text-[15px] leading-[1.65] text-neutral-600">
              When artists register works under this gallery, they will appear here with images and
              registry IDs.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((w) => {
              const href = w.registry_id
                ? `/artwork/${encodeURIComponent(w.registry_id)}`
                : null;
              const title = (w.title || "").trim() || "Untitled";
              const artistLabel =
                (w.artist_id && artistNameById[w.artist_id]) || null;
              const isVerified =
                String(w.verification_status || "").toLowerCase() === "verified";

              return (
                <li key={w.id}>
                  <article className="group overflow-hidden rounded-[1.125rem] border border-neutral-900/[0.07] bg-white/80 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12 hover:shadow-[0_20px_50px_-28px_rgba(15,23,42,0.2)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200/80">
                      {w.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.image_url}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[13px] text-neutral-400">
                          No image
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
                      <div className="absolute right-3 top-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
                            isVerified
                              ? "bg-neutral-950/80 text-white/95"
                              : "bg-black/45 text-white/90"
                          }`}
                        >
                          {isVerified ? "Verified listing" : "On file"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 px-4 py-4 sm:px-5">
                      {href ? (
                        <Link
                          href={href}
                          className="font-serif text-lg font-normal leading-snug text-neutral-950 underline decoration-neutral-300/90 underline-offset-[5px] transition group-hover:decoration-neutral-500"
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className="font-serif text-lg font-normal text-neutral-950">{title}</p>
                      )}
                      {artistLabel ? (
                        <p className="text-[13px] text-neutral-500">{artistLabel}</p>
                      ) : null}
                      {w.registry_id ? (
                        <p className="font-mono text-[10px] tracking-tight text-neutral-400">
                          {w.registry_id}
                        </p>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
