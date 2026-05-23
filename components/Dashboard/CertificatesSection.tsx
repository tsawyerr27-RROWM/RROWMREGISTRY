import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { WorkspaceRecordCard } from "@/components/Studio/WorkspaceRecordCard";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import { workspace } from "@/styles/workspace-design";

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
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-2 ring-emerald-200/80 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-[3px] rounded-full border border-emerald-200/60" />
      <span className="relative text-base font-semibold text-emerald-800/90">
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
          tone="light"
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
                className={studioFilterSelectClass("light")}
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
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-neutral-50/90 px-8 py-12 text-center text-sm text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          No certificates match your search or filter.
        </div>
      ) : null}

      {!noMatches && filteredCertificates.length > 0 ? (
        <div className={workspace.space.grid}>
          {filteredCertificates.map((artwork) => (
            <WorkspaceRecordCard
              key={artwork.id}
              title={artwork.title}
              subtitle={
                [artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                "—"
              }
              imageUrl={artwork.image_url}
              imagePlaceholder="Registry record"
              accentBorderClass="border-l-emerald-500/50"
              onClick={() => onArtworkClick(artwork)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onArtworkClick(artwork);
                }
              }}
              titleAsButton
              onTitleClick={() => onArtworkClick(artwork)}
              reveal={
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <CertificateSeal />
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">
                        Verified
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-500">
                        Registry certificate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
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
                    {artwork.registry_id ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCertificateOverview(String(artwork.registry_id));
                        }}
                        className="shrink-0 rounded-xl bg-emerald-900 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-800"
                      >
                        Open →
                      </button>
                    ) : null}
                  </div>
                </>
              }
            />
          ))}
        </div>
      ) : isTrulyEmpty ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-white via-emerald-50/30 to-neutral-50/90 px-10 py-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95)] md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent"
            aria-hidden
          />
          <div className="mx-auto mt-2 flex justify-center">
            <CertificateSeal className="h-14 w-14" />
          </div>
          <p className="mt-8 text-sm font-semibold text-emerald-800/80">
            Registry certificates
          </p>
          <h3 className="mt-3 font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.65rem]">
            No verified certificates yet
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
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
