import Link from "next/link";
import { resolveArtworkOwnerId } from "@/lib/resolve-artwork-owner-id";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";

type LatestOwner = {
  transfer_type?: string | null;
  to_name?: string | null;
  to_user_id?: string | null;
  to_type?: string | null;
};

function currentHolderLabel(
  artwork: Record<string, unknown>,
  userId: string | undefined
): string {
  const latest = artwork.__latest_owner as LatestOwner | undefined;

  if (latest?.to_name) {
    return latest.to_type
      ? `${latest.to_name} (${latest.to_type})`
      : latest.to_name;
  }
  if (latest?.to_user_id) {
    if (latest.to_user_id === userId) return "You";
    return `Collector (${latest.to_user_id.slice(0, 6)}…)`;
  }

  const oid = resolveArtworkOwnerId(artwork);
  if (!oid) return "Unassigned";
  if (oid === userId) return "You";
  return `Collector (${oid.slice(0, 6)}…)`;
}

function latestEventIsSale(artwork: Record<string, unknown>): boolean {
  const latest = artwork.__latest_owner as LatestOwner | undefined;
  const t = String(latest?.transfer_type || "").toLowerCase();
  return (
    t === "sale" ||
    t === "auction" ||
    t === "primary_sale" ||
    t === "secondary_sale"
  );
}

function holderIsYou(
  artwork: Record<string, unknown>,
  userId: string | undefined
): boolean {
  if (!userId) return false;
  const latest = artwork.__latest_owner as LatestOwner | undefined;
  if (latest?.to_user_id && String(latest.to_user_id) === String(userId))
    return true;
  return resolveArtworkOwnerId(artwork) === userId;
}

type OwnershipSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: "all" | "needs_transfer" | "sold" | "owned_by_you";
  onFilterChange: (value: "all" | "needs_transfer" | "sold" | "owned_by_you") => void;
  filterCounts: {
    all: number;
    needs_transfer: number;
    sold: number;
    owned_by_you: number;
  };
  filteredArtworks: Record<string, unknown>[];
  /** Rows matching ownership + artwork filters before search — empty vs no-match */
  totalOwnershipCount: number;
  onArtworkClick: (artwork: Record<string, unknown>) => void;
  onRegisterClick: () => void;
  userId: string | undefined;
  saleSignals?: Record<
    string,
    { value_event_id: string; value_type: string; created_at: string }
  >;
};

function TransferDots({ count }: { count: number }) {
  const n = Math.max(0, Math.min(count, 6));
  if (n <= 0) {
    return (
      <span className="text-xs text-white/40">No transfers yet</span>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-1"
      title={`${count} transfer${count === 1 ? "" : "s"} on the ledger`}
    >
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-white/50 to-white/25 shadow-sm ring-1 ring-white/20" />
          {i < n - 1 ? (
            <span
              className="mx-0.5 h-px w-2.5 bg-gradient-to-r from-white/30 to-white/10"
              aria-hidden
            />
          ) : null}
        </span>
      ))}
      {count > n ? (
        <span className="text-[11px] font-medium tabular-nums text-white/45">
          +{count - n}
        </span>
      ) : null}
    </div>
  );
}

export function OwnershipSection({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  filterCounts,
  filteredArtworks,
  totalOwnershipCount,
  onArtworkClick,
  onRegisterClick,
  userId,
  saleSignals,
}: OwnershipSectionProps) {
  const isTrulyEmpty = totalOwnershipCount === 0;
  const noMatches =
    totalOwnershipCount > 0 && filteredArtworks.length === 0;

  return (
    <div className="space-y-12">
      {!isTrulyEmpty ? (
        <StudioSearchRow
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search by title…"
          aside={
            <>
              <label className="sr-only" htmlFor="ownership-filter">
                Filter ownership records
              </label>
              <select
                id="ownership-filter"
                value={filter}
                onChange={(e) =>
                  onFilterChange(
                    e.target.value as
                      | "all"
                      | "needs_transfer"
                      | "sold"
                      | "owned_by_you"
                  )
                }
                className={studioFilterSelectClass("dark")}
              >
                <option value="all">{`All records (${filterCounts.all})`}</option>
                <option value="needs_transfer">{`Needs transfer (${filterCounts.needs_transfer})`}</option>
                <option value="sold">{`Sold (${filterCounts.sold})`}</option>
                <option value="owned_by_you">{`Held by you (${filterCounts.owned_by_you})`}</option>
              </select>
            </>
          }
        />
      ) : null}

      {noMatches ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-8 py-12 text-center text-sm text-white/75 backdrop-blur-sm">
          No ownership records match your search or filter.
        </div>
      ) : null}

      {!noMatches && filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork, idx) => {
            const artworkIdRaw = (artwork as { id?: unknown }).id;
            const artworkId =
              artworkIdRaw != null ? String(artworkIdRaw) : String(idx);
            const titleRaw = (artwork as { title?: unknown }).title;
            const title =
              typeof titleRaw === "string" && titleRaw.trim()
                ? titleRaw.trim()
                : "Untitled";
            const registryIdRaw = (artwork as { registry_id?: unknown })
              .registry_id;
            const registryId =
              typeof registryIdRaw === "string" && registryIdRaw.trim()
                ? registryIdRaw.trim()
                : null;
            const yearRaw = (artwork as { year?: unknown }).year;
            const mediumRaw = (artwork as { medium?: unknown }).medium;
            const year =
              typeof yearRaw === "string"
                ? yearRaw
                : yearRaw != null
                  ? String(yearRaw)
                  : "—";
            const medium =
              typeof mediumRaw === "string"
                ? mediumRaw
                : mediumRaw != null
                  ? String(mediumRaw)
                  : "—";
            const imageUrlRaw = (artwork as { image_url?: unknown }).image_url;
            const imageUrl =
              typeof imageUrlRaw === "string" && imageUrlRaw
                ? imageUrlRaw
                : null;

            const saleSignal = saleSignals?.[String((artwork as { id?: unknown }).id)];
            const hasSaleSignal = Boolean(saleSignal);
            const transferCount =
              Number(
                (artwork as { ownership_transfer_count?: unknown })
                  .ownership_transfer_count ?? 0
              ) || 0;
            const sold = latestEventIsSale(artwork);
            const youHold = holderIsYou(artwork, userId);
            const holder = currentHolderLabel(artwork, userId);

            const accent =
              hasSaleSignal
                ? "border-l-amber-400 bg-gradient-to-br from-amber-500/[0.12] via-white/[0.03] to-transparent shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                : youHold && !hasSaleSignal
                  ? "border-l-emerald-400/90 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
                  : "border-l-white/20 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]";

            return (
              <div
                key={artworkId}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onArtworkClick(artwork);
                  }
                }}
                className={`group relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.07] border-l-[5px] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)] ${accent}`}
                onClick={() => onArtworkClick(artwork)}
                title="Open ownership ledger"
              >
                {hasSaleSignal ? (
                  <div className="absolute right-3 top-3 z-10 max-w-[11rem] rounded-lg border border-amber-300/35 bg-amber-950/50 px-2.5 py-1.5 text-sm font-semibold leading-tight text-amber-100/95 backdrop-blur-sm">
                    Sale logged — finish transfer
                  </div>
                ) : null}

                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]"
                      aria-hidden
                    >
                      <svg
                        className="h-14 w-14 text-white/15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={0.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {(artwork as { verification_status?: string })
                        .verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-500/25 px-2 py-0.5 text-sm font-semibold text-green-100 ring-1 ring-green-400/30">
                          Verified
                        </span>
                      ) : null}
                      {sold ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-sm font-semibold text-rose-100/95 ring-1 ring-rose-400/25">
                          Last event · Sale
                        </span>
                      ) : null}
                      {youHold ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/25">
                          In your custody
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-serif text-lg font-normal leading-snug text-white drop-shadow-sm">
                      {registryId ? (
                        <Link
                          href={`/artwork/${encodeURIComponent(registryId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline decoration-white/35 underline-offset-2"
                        >
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </h3>
                    <p className="mt-1 text-xs text-white/70">
                      {year} · {medium}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
                  <div className="rounded-xl bg-black/25 p-3.5 ring-1 ring-white/[0.08]">
                    <p className="text-sm font-semibold text-white/40">
                      Current holder
                    </p>
                    <p className="mt-2 text-[15px] font-medium leading-snug text-white">
                      {holder}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white/40">
                        Chain depth
                      </p>
                      <p className="mt-1.5 text-xs text-white/55">
                        {transferCount} transfer
                        {transferCount === 1 ? "" : "s"} on record
                      </p>
                      <div className="mt-2">
                        <TransferDots count={transferCount} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.08] pt-4">
                    <div className="min-w-0">
                      {registryId ? (
                        <span className="inline-block max-w-full truncate rounded-lg bg-white/[0.06] px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white/70 ring-1 ring-white/10">
                          {registryId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/35">
                          No registry ID
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-xl bg-white/[0.1] px-3 py-2 text-[11px] font-semibold text-white ring-1 ring-white/15 transition group-hover:bg-white/[0.14]">
                      Ledger →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : isTrulyEmpty ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center md:p-14">
          <p className="text-xs text-white/55">
            Ownership
          </p>
          <h3 className="mt-4 font-serif text-2xl font-normal tracking-tight text-white">
            No ownership activity yet
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
            When transfers or claims are recorded, each work appears here with
            holder, chain depth, and sale signals.
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
