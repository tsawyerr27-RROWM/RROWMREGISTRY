import { useMemo } from "react";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import {
  type StudioArtworksAccentId,
  studioArtworksAccentTheme,
} from "@/lib/studio-artworks-accent";

export type ArtworksListFilter =
  | "all"
  | "verified"
  | "unverified"
  | "priced"
  | "unpriced";

type ArtworksSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  artworksFilter: ArtworksListFilter;
  onArtworksFilterChange: (value: ArtworksListFilter) => void;
  onRegisterClick: () => void;
  filteredArtworks: any[];
  /** Total artworks before search filter — drives true empty vs no matches */
  totalArtworkCount: number;
  onArtworkClick: (artwork: any) => void;
  onAddValueEventClick: (artwork: any) => void;
  /** Accent for left rail + hairline (from account → `artists.studio_artworks_accent`) */
  studioArtworksAccent?: StudioArtworksAccentId;
};

function StudioWorkMark({
  className = "",
  markWrap,
  markIcon,
}: {
  className?: string;
  markWrap: string;
  markIcon: string;
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${markWrap} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ${className}`}
      aria-hidden
    >
      <svg
        className={`h-4 w-4 ${markIcon}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h8M8 16h5"
        />
      </svg>
    </div>
  );
}

export function ArtworksSection({
  searchQuery,
  onSearchChange,
  artworksFilter,
  onArtworksFilterChange,
  onRegisterClick,
  filteredArtworks,
  totalArtworkCount,
  onArtworkClick,
  onAddValueEventClick,
  studioArtworksAccent = "violet",
}: ArtworksSectionProps) {
  const accent = useMemo(
    () => studioArtworksAccentTheme(studioArtworksAccent),
    [studioArtworksAccent]
  );
  const isTrulyEmpty = totalArtworkCount === 0;
  const noSearchMatches =
    totalArtworkCount > 0 && filteredArtworks.length === 0;

  return (
    <div className="space-y-12">
      {!isTrulyEmpty ? (
        <StudioSearchRow
          tone="light"
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search artworks…"
          aside={
            <>
              <label className="sr-only" htmlFor="artworks-filter">
                Filter artworks
              </label>
              <select
                id="artworks-filter"
                value={artworksFilter}
                onChange={(e) =>
                  onArtworksFilterChange(e.target.value as ArtworksListFilter)
                }
                className={studioFilterSelectClass("light")}
              >
                <option value="all">All works</option>
                <option value="verified">Verified only</option>
                <option value="unverified">Not verified</option>
                <option value="priced">With declared value</option>
                <option value="unpriced">No declared value</option>
              </select>
            </>
          }
        />
      ) : null}

      {noSearchMatches ? (
        <div
          className={`rounded-2xl border border-neutral-300/90 bg-gradient-to-br from-white via-neutral-50/90 ${accent.noMatchTo} px-8 py-12 text-center text-sm text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_24px_-12px_rgba(0,0,0,0.06)]`}
        >
          No works match your search or filter.
        </div>
      ) : null}

      {!noSearchMatches && filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onArtworkClick(artwork);
                }
              }}
              className={`group relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-200/90 border-l-[5px] ${accent.borderLeft} bg-gradient-to-br from-white via-neutral-50/80 ${accent.cardGradientTo} shadow-[0_20px_50px_-28px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300/95 ${accent.hoverShadow} ${accent.hoverRing}`}
              onClick={() => onArtworkClick(artwork)}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent ${accent.hairline} to-transparent`}
                aria-hidden
              />

              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100/90">
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center gap-2 ${accent.placeholderRadial}`}
                  >
                    <svg
                      className={`h-14 w-14 ${accent.placeholderIcon}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={0.75}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-neutral-500">
                      No image on file
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <StudioWorkMark
                    markWrap={accent.markWrap}
                    markIcon={accent.markIcon}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white/95 drop-shadow-sm">
                      Studio catalog
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/80 drop-shadow-sm">
                      Work record
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                <div>
                  <h3 className="font-serif text-[1.2rem] font-normal leading-snug tracking-tight text-neutral-950">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArtworkClick(artwork);
                      }}
                      className={`text-left ${accent.titleHover}`}
                    >
                      {artwork.title}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm leading-snug text-neutral-600">
                    {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {artwork.verification_status === "verified" ? (
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                      title="Verified on the record."
                    >
                      <span aria-hidden>✓</span>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/90">
                      Not verified
                    </span>
                  )}
                </div>

                {artwork.latest_value != null &&
                !Number.isNaN(Number(artwork.latest_value)) ? (
                  <div className="rounded-xl border border-neutral-200/90 bg-white/80 px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                    <p className="text-sm font-semibold text-neutral-500">
                      Latest declared value
                    </p>
                    <p
                      className="mt-1 text-lg font-semibold tabular-nums text-neutral-900"
                      title="Latest declared amount on file."
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: artwork.latest_currency || "USD",
                      }).format(artwork.latest_value)}
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-shrink-0 items-center justify-between gap-3 border-t border-neutral-200/80 pt-4">
                  <div className="min-w-0">
                    {artwork.registry_id ? (
                      <span className="inline-block max-w-full truncate rounded-lg bg-neutral-100/90 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-neutral-800 ring-1 ring-neutral-200/90">
                        {artwork.registry_id}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">
                        No record ID
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddValueEventClick(artwork);
                    }}
                    className={`shrink-0 rounded-xl ${accent.recordBtn}`}
                  >
                    Record value
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isTrulyEmpty ? (
        <div
          className={`relative overflow-hidden rounded-2xl border border-neutral-200/95 bg-gradient-to-b from-white ${accent.emptyVia} to-neutral-50/90 px-10 py-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)] md:px-16 md:py-16`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accent.emptyHairline} to-transparent`}
            aria-hidden
          />
          <div className="mx-auto flex justify-center">
            <StudioWorkMark
              className="h-12 w-12 rounded-xl"
              markWrap={accent.markWrap}
              markIcon={accent.markIcon}
            />
          </div>
          <p
            className={`mt-8 text-sm font-semibold ${accent.emptyLabel}`}
          >
            Studio catalog
          </p>
          <h3 className="mt-3 font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.65rem]">
            No works recorded yet
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
            Register your first piece to start its registry record, value
            history, and provenance trail.
          </p>
          <div className="mt-10 flex justify-center">
            <ExperienceEmptyStateButton
              label="Register artwork"
              onClick={onRegisterClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
