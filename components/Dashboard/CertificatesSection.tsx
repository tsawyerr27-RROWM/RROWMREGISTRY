import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";

export type CertificatesListFilter = "all" | "with_image" | "without_image";

type CertificatesSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  certificatesFilter: CertificatesListFilter;
  onCertificatesFilterChange: (value: CertificatesListFilter) => void;
  filteredCertificates: any[];
  /** Total before search/filter — for empty vs no matches */
  totalCertificateCount: number;
  /** Same as Artworks: opens artwork detail modal */
  onArtworkClick: (artwork: any) => void;
  /** Opens certificate overview (verify-style summary) */
  onOpenCertificateOverview: (registryId: string) => void;
  onRegisterClick: () => void;
};

function CertificateSeal({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/25 via-emerald-600/15 to-slate-900/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-2 ring-emerald-400/35 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-[3px] rounded-full border border-emerald-300/25" />
      <span className="relative text-lg font-semibold text-emerald-100/95">
        ✓
      </span>
    </div>
  );
}

export function CertificatesSection({
  searchQuery,
  onSearchChange,
  certificatesFilter,
  onCertificatesFilterChange,
  filteredCertificates,
  totalCertificateCount,
  onArtworkClick,
  onOpenCertificateOverview,
  onRegisterClick,
}: CertificatesSectionProps) {
  const isTrulyEmpty = totalCertificateCount === 0;
  const noMatches =
    totalCertificateCount > 0 && filteredCertificates.length === 0;

  return (
    <div className="space-y-12">
      {!isTrulyEmpty ? (
        <StudioSearchRow
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search certificates…"
          aside={
            <>
              <label className="sr-only" htmlFor="certificates-filter">
                Filter certificates
              </label>
              <select
                id="certificates-filter"
                value={certificatesFilter}
                onChange={(e) =>
                  onCertificatesFilterChange(
                    e.target.value as CertificatesListFilter
                  )
                }
                className={studioFilterSelectClass("dark")}
              >
                <option value="all">All certificates</option>
                <option value="with_image">With artwork image</option>
                <option value="without_image">Without image</option>
              </select>
            </>
          }
        />
      ) : null}

      {noMatches ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-white/[0.04] to-transparent px-8 py-12 text-center text-sm text-white/80 shadow-[inset_0_1px_0_0_rgba(52,211,153,0.12)] backdrop-blur-sm">
          No certificates match your search or filter.
        </div>
      ) : null}

      {!noMatches && filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((artwork) => (
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
              className="group relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.07] border-l-[5px] border-l-emerald-500/55 bg-gradient-to-br from-emerald-950/25 via-white/[0.04] to-slate-950/40 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] ring-1 ring-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:ring-emerald-400/20"
              onClick={() => onArtworkClick(artwork)}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                aria-hidden
              />

              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950">
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.12),transparent_55%)]">
                    <svg
                      className="h-14 w-14 text-emerald-400/25"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={0.75}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-white/35">
                      Registry record
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-3">
                  <CertificateSeal />
                  <div>
                    <p className="text-sm font-semibold text-emerald-200/80">
                      Verified
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55">
                      Registry certificate
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                <div>
                  <h3 className="font-serif text-[1.2rem] font-normal leading-snug tracking-tight text-white">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArtworkClick(artwork);
                      }}
                      className="text-left hover:text-emerald-100/95 hover:underline decoration-emerald-400/40 underline-offset-4"
                    >
                      {artwork.title}
                    </button>
                  </h3>
                  <p className="mt-2 text-sm text-white/65">
                    {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <div className="min-w-0">
                    {artwork.registry_id ? (
                      <span className="inline-block max-w-full truncate rounded-lg bg-black/25 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-emerald-100/80 ring-1 ring-emerald-500/20">
                        {artwork.registry_id}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/35">
                        No record ID
                      </span>
                    )}
                  </div>
                  {artwork.registry_id ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCertificateOverview(String(artwork.registry_id));
                      }}
                      className="shrink-0 rounded-xl bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold text-emerald-50 ring-1 ring-emerald-400/25 transition hover:bg-emerald-500/25"
                    >
                      Open →
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isTrulyEmpty ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/35 via-slate-950/40 to-slate-950/80 px-10 py-14 text-center shadow-[inset_0_1px_0_0_rgba(52,211,153,0.1)] md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            aria-hidden
          />
          <div className="mx-auto mt-2 flex justify-center">
            <CertificateSeal className="mx-auto h-14 w-14" />
          </div>
          <p className="mt-8 text-sm font-semibold text-emerald-300/70">
            Registry certificates
          </p>
          <h3 className="mt-3 font-serif text-2xl font-normal tracking-tight text-white md:text-[1.65rem]">
            No verified certificates yet
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
            When a work is verified, its certificate appears here as a permanent
            record you can open and share.
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
