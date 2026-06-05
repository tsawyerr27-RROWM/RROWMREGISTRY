import Link from "next/link";

import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import { ParticipationLayersStrip } from "@/components/Registry/ParticipationLayersStrip";
import { RegistryListFilters } from "@/components/Registry/RegistryListFilters";
import { RegistryListPagination } from "@/components/Registry/RegistryListPagination";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { CreativePresencePageData } from "@/lib/field-creative-presence";
import { fieldVerifyHref, fieldVerifyRecordHref } from "@/lib/field-nav";
import {
  artworkCardParticipationLabel,
} from "@/lib/representation-language";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";

type Props = {
  data: CreativePresencePageData;
};

export function CreativePresenceView({ data }: Props) {
  const {
    artist,
    gallery,
    participationLayers,
    artworks,
    total,
    verifiedWorkCount,
    basePath,
    q,
    sort,
    page,
    status,
    formKey,
    filterHint,
    showOrganisationSection,
    practices,
  } = data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          Creative
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-[3.25rem]">
          {artist.display_name}
        </h1>

        <div className="mt-8 max-w-2xl rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Registry evidence
          </p>
          {verifiedWorkCount > 0 || total > 0 ? (
            <p className="mt-2 text-sm text-neutral-700">
              {verifiedWorkCount > 0 ? (
                <>
                  <span className="font-medium">{verifiedWorkCount}</span> verified{" "}
                  {verifiedWorkCount === 1 ? "work" : "works"} on file
                </>
              ) : null}
              {verifiedWorkCount > 0 && total > 0 ? " · " : null}
              {total > 0 ? (
                <>
                  <span className="font-medium">{total}</span>{" "}
                  {total === 1 ? "work" : "works"} in public footprint
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">
              No registered works are on file for this Creative yet.
            </p>
          )}
          {practices.length > 0 ? (
            <div className="mt-4">
              <FieldCreativePracticeChips practices={practices} />
            </div>
          ) : null}
          {participationLayers.length > 0 ? (
            <div className="mt-5 border-t border-neutral-900/[0.05] pt-5">
              <ParticipationLayersStrip
                layers={participationLayers}
                variant="light"
                showFootnote={false}
              />
            </div>
          ) : null}
        </div>

        {artist.bio ? (
          <div className="mt-10 space-y-6 text-lg leading-[1.75] text-neutral-700">
            {artist.bio.split(/\n\n+/).map((para, i) => (
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

      {gallery && showOrganisationSection ? (
        <section className="mt-14 max-w-2xl">
          <div className="rounded-3xl border border-black/[0.06] bg-white/80 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Organisation
            </p>
            <h2 className="mt-2 text-xl font-medium text-neutral-900">
              {gallery.href ? (
                <Link
                  href={gallery.href}
                  className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                >
                  {gallery.name}
                </Link>
              ) : (
                gallery.name
              )}
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              {gallery.verified
                ? "Institution-linked representation on file"
                : "Institutional representation on file"}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mt-20 md:mt-24">
        <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <InfoTooltip text="Open a piece for the curated view; use the registry link for the continuity record on file." />
            <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
              Registry footprint
            </h2>
          </div>
          {total > 0 || verifiedWorkCount > 0 ? (
            <p className="text-xs text-neutral-500">
              {total > 0 ? (
                <>
                  {total} {total === 1 ? "work" : "works"} matching
                  {filterHint ? ` · ${filterHint}` : ""}
                  {q.trim() ? ` · search “${q.trim()}”` : ""}
                </>
              ) : null}
              {verifiedWorkCount > 0 ? (
                <>
                  {total > 0 ? " · " : ""}
                  {verifiedWorkCount} verified on file
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <RegistryListFilters
            action={basePath}
            q={q}
            sort={sort}
            formKey={formKey}
            idPrefix="field-creative"
            showStatusFilter
            status={status}
          />
        </div>

        {total === 0 ? (
          <div className="mt-14 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm md:px-12">
            <p className="text-sm text-neutral-600">
              {q.trim() || status !== "all"
                ? "No works match your search or filters. Try clearing the search or setting status to “All works”."
                : "No registered works are on file for this Creative yet."}
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
                const verifyHref = fieldVerifyRecordHref(artwork.registry_id);

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
                        <span className="inline-flex max-w-[calc(100%-2rem)] rounded-full border border-neutral-200/90 bg-white/95 px-3 py-1 text-[11px] font-medium leading-tight text-neutral-800 backdrop-blur-sm">
                          {artworkCardParticipationLabel({
                            institutionLinked: Boolean(gallery),
                            artistConfirmed: isVerified,
                          })}
                        </span>
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
                        <p className="mt-2 text-sm text-neutral-500">{yearMedium}</p>
                      ) : null}
                      <p className="mt-4 font-mono text-[11px] text-neutral-400">
                        {artwork.registry_id}
                      </p>

                      <div className="mt-6 flex flex-col gap-2 border-t border-black/[0.05] pt-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={registryHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
                          >
                            Registry record
                          </Link>
                          <Link
                            href={artworkHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                          >
                            View artwork
                          </Link>
                        </div>
                        <Link
                          href={verifyHref}
                          className="text-center text-[11px] font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-2 hover:decoration-emerald-900/50"
                        >
                          Check verification
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <RegistryListPagination
              basePath={basePath}
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

      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-24 md:px-12">
        <p className="text-base leading-relaxed text-neutral-700">
          Each work links to its Registry record — the continuity layer where
          verification status and provenance are on file.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/registry"
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Browse registry
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Verify a Registry record
          </Link>
        </div>
      </section>
    </main>
  );
}
