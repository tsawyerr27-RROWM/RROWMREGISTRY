import Link from "next/link";
import { resolveArtworkOwnerId } from "@/lib/resolve-artwork-owner-id";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { WorkspaceRecordCard } from "@/components/Studio/WorkspaceRecordCard";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import { workspace } from "@/styles/workspace-design";

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
      <span className="text-xs text-neutral-400">No transfers yet</span>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-1"
      title={`${count} transfer${count === 1 ? "" : "s"} on the ledger`}
    >
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-neutral-400/70 to-neutral-300/50 shadow-sm ring-1 ring-neutral-200/80" />
          {i < n - 1 ? (
            <span
              className="mx-0.5 h-px w-2.5 bg-gradient-to-r from-neutral-300/80 to-neutral-200/40"
              aria-hidden
            />
          ) : null}
        </span>
      ))}
      {count > n ? (
        <span className="text-[11px] font-medium tabular-nums text-neutral-400">
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
                className={studioFilterSelectClass("light")}
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
        <div className="rounded-2xl border border-neutral-200/90 bg-white/80 px-8 py-12 text-center text-sm text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          No ownership records match your search or filter.
        </div>
      ) : null}

      {!noMatches && filteredArtworks.length > 0 ? (
        <div className={workspace.space.grid}>
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

            const accentBorder = hasSaleSignal
              ? "border-l-amber-500/70"
              : youHold && !hasSaleSignal
                ? "border-l-emerald-500/60"
                : "border-l-neutral-300";

            return (
              <WorkspaceRecordCard
                key={artworkId}
                title={title}
                subtitle={`${year} · ${medium}`}
                imageUrl={imageUrl}
                accentBorderClass={accentBorder}
                onClick={() => onArtworkClick(artwork)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onArtworkClick(artwork);
                  }
                }}
                reveal={
                  <>
                    {hasSaleSignal ? (
                      <p className="mb-3 rounded-lg border border-amber-200/90 bg-amber-50 px-2.5 py-2 text-xs font-semibold text-amber-900">
                        Sale logged: finish transfer
                      </p>
                    ) : null}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {(artwork as { verification_status?: string })
                        .verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                          Verified
                        </span>
                      ) : null}
                      {sold ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800 ring-1 ring-rose-200/80">
                          Last event · Sale
                        </span>
                      ) : null}
                      {youHold ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                          In your custody
                        </span>
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-neutral-200/90 bg-white/80 p-3.5">
                      <p className="text-xs font-semibold text-neutral-500">
                        Current holder
                      </p>
                      <p className="mt-2 text-sm font-medium leading-snug text-neutral-900">
                        {holder}
                      </p>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-neutral-500">
                        Chain depth
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {transferCount} transfer
                        {transferCount === 1 ? "" : "s"} on record
                      </p>
                      <div className="mt-2">
                        <TransferDots count={transferCount} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-200/80 pt-4">
                      <div className="min-w-0">
                        {registryId ? (
                          <span className="inline-block max-w-full truncate rounded-lg bg-neutral-100/90 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-neutral-800 ring-1 ring-neutral-200/90">
                            {registryId}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">
                            No registry ID
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 rounded-xl bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-white">
                        Ledger →
                      </span>
                    </div>
                  </>
                }
              />
            );
          })}
        </div>
      ) : isTrulyEmpty ? (
        <div className="rounded-2xl border border-neutral-200/90 bg-white/80 p-10 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] md:p-14">
          <p className="text-xs text-neutral-500">
            Ownership
          </p>
          <h3 className="mt-4 font-serif text-2xl font-normal tracking-tight text-neutral-950">
            No ownership activity yet
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
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
