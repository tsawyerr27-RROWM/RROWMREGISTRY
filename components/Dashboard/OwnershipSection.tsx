"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { resolveHolderUserIdFromEvent } from "@/lib/ownership-canonical";
import type { CreativeOwnershipFilter } from "@/lib/creative-studio-ownership-filters";
import { ExperienceEmptyStateButton } from "@/components/ui/ExperienceEmptyState";
import { WorkspaceRecordCard } from "@/components/Studio/WorkspaceRecordCard";
import {
  StudioSearchRow,
  studioFilterSelectClass,
} from "@/components/Dashboard/studioListPrimitives";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  fillMessage,
  type MessageKey,
} from "@/lib/locale-messages";
import { workspace } from "@/styles/workspace-design";
import {
  semanticAccentBorderClass,
  semanticStampClass,
} from "@/lib/registry-semantic-signals";
import { registryV2 } from "@/styles/registry-v2";

type LatestOwner = {
  transfer_type?: string | null;
  to_name?: string | null;
  to_user_id?: string | null;
  to_type?: string | null;
};

type Translate = (key: MessageKey) => string;

function currentHolderLabel(
  artwork: Record<string, unknown>,
  userId: string | undefined,
  t: Translate
): string {
  const latest = artwork.__latest_owner as LatestOwner | undefined;

  if (latest?.to_name) {
    return latest.to_type
      ? `${latest.to_name} (${latest.to_type})`
      : latest.to_name;
  }
  if (latest?.to_user_id) {
    if (latest.to_user_id === userId) return t("studio.ownership.you");
    return fillMessage(t("studio.ownership.collectorId"), {
      id: latest.to_user_id.slice(0, 6),
    });
  }

  return t("studio.ownership.unassigned");
}

function latestEventIsSale(artwork: Record<string, unknown>): boolean {
  const latest = artwork.__latest_owner as LatestOwner | undefined;
  const transferType = String(latest?.transfer_type || "").toLowerCase();
  return (
    transferType === "sale" ||
    transferType === "auction" ||
    transferType === "primary_sale" ||
    transferType === "secondary_sale"
  );
}

function holderIsYou(
  artwork: Record<string, unknown>,
  userId: string | undefined
): boolean {
  if (!userId) return false;
  const canonical = artwork.__canonical_holder_id;
  if (typeof canonical === "string" && canonical.trim()) {
    return canonical.trim() === userId;
  }
  const latest = artwork.__latest_owner as LatestOwner | undefined;
  const holderId = latest
    ? resolveHolderUserIdFromEvent(latest as Record<string, unknown>)
    : null;
  return holderId === userId;
}

function isTransferredOut(artwork: Record<string, unknown>): boolean {
  return artwork.__is_transferred === true;
}

function isPendingOutboundTransfer(artwork: Record<string, unknown>): boolean {
  return artwork.__pending_outbound_transfer === true;
}

type OwnershipSectionProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: CreativeOwnershipFilter;
  onFilterChange: (value: CreativeOwnershipFilter) => void;
  filterCounts: {
    owned_by_you: number;
    needs_transfer: number;
    sold_transferred: number;
    full_catalogue: number;
  };
  filteredArtworks: Record<string, unknown>[];
  /** Rows matching ownership filter before search — empty vs no-match */
  totalOwnershipCount: number;
  onArtworkClick: (artwork: Record<string, unknown>) => void;
  onRegisterClick: () => void;
  userId: string | undefined;
  saleSignals?: Record<
    string,
    { value_event_id: string; value_type: string; created_at: string }
  >;
  outboundPendingArtworkIds?: Set<string>;
};

function TransferDots({
  count,
  t,
}: {
  count: number;
  t: Translate;
}) {
  const n = Math.max(0, Math.min(count, 6));
  if (n <= 0) {
    return (
      <span className="text-xs text-neutral-400">
        {t("studio.ownership.noTransfers")}
      </span>
    );
  }
  const ledgerKey =
    count === 1
      ? "studio.ownership.transferLedger"
      : "studio.ownership.transferLedgerPlural";
  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-1"
      title={fillMessage(t(ledgerKey), { count: String(count) })}
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
  outboundPendingArtworkIds,
}: OwnershipSectionProps) {
  const { t } = useLocalePreferences();
  const isTrulyEmpty = totalOwnershipCount === 0;
  const noMatches =
    totalOwnershipCount > 0 && filteredArtworks.length === 0;

  return (
    <div className="space-y-12">
      {!isTrulyEmpty ? (
        <>
          <StudioSearchRow
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder={t("studio.search.byTitle")}
            aside={
              <>
                <label className="sr-only" htmlFor="ownership-filter">
                  {t("studio.filter.ownership")}
                </label>
                <select
                  id="ownership-filter"
                  value={filter}
                  onChange={(e) =>
                    onFilterChange(e.target.value as CreativeOwnershipFilter)
                  }
                  className={studioFilterSelectClass("light")}
                >
                  <option value="owned_by_you">
                    {fillMessage(t("studio.ownership.filterHeldByYou"), {
                      count: String(filterCounts.owned_by_you),
                    })}
                  </option>
                  <option value="needs_transfer">
                    {fillMessage(t("studio.ownership.filterNeedsTransfer"), {
                      count: String(filterCounts.needs_transfer),
                    })}
                  </option>
                  <option value="sold_transferred">
                    {fillMessage(t("studio.ownership.filterSoldTransferred"), {
                      count: String(filterCounts.sold_transferred),
                    })}
                  </option>
                  <option value="full_catalogue">
                    {fillMessage(t("studio.ownership.filterFullCatalogue"), {
                      count: String(filterCounts.full_catalogue),
                    })}
                  </option>
                </select>
              </>
            }
          />
          <p className="-mt-8 text-[13px] leading-relaxed text-neutral-500">
            {t("studio.ownership.filterSemanticsHelp")}
          </p>
        </>
      ) : null}

      {noMatches ? (
        <div className="rounded-2xl border border-neutral-200/90 bg-white/80 px-8 py-12 text-center text-[15px] text-neutral-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          {t("studio.ownership.noMatches")}
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
                : t("registry.card.untitled");
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
                  : "–";
            const medium =
              typeof mediumRaw === "string"
                ? mediumRaw
                : mediumRaw != null
                  ? String(mediumRaw)
                  : "–";
            const imageUrlRaw = (artwork as { image_url?: unknown }).image_url;
            const imageUrl =
              typeof imageUrlRaw === "string" && imageUrlRaw
                ? imageUrlRaw
                : null;

            const saleSignal = saleSignals?.[String((artwork as { id?: unknown }).id)];
            const hasSaleSignal = Boolean(saleSignal);
            const pendingOutbound =
              isPendingOutboundTransfer(artwork) ||
              Boolean(
                artworkIdRaw != null &&
                  outboundPendingArtworkIds?.has(String(artworkIdRaw))
              );
            const transferCount =
              Number(
                (artwork as { ownership_transfer_count?: unknown })
                  .ownership_transfer_count ?? 0
              ) || 0;
            const sold =
              isTransferredOut(artwork) || latestEventIsSale(artwork);
            const youHold = holderIsYou(artwork, userId);
            const holder = currentHolderLabel(artwork, userId, t);

            const accentBorder = pendingOutbound
              ? semanticAccentBorderClass("transfer")
              : hasSaleSignal || sold
                ? semanticAccentBorderClass("sale")
                : youHold && !hasSaleSignal
                  ? semanticAccentBorderClass("transfer")
                  : "border-l-neutral-300";

            const transfersKey =
              transferCount === 1
                ? "studio.ownership.transfersOnRecord"
                : "studio.ownership.transfersOnRecordPlural";

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
                      <p
                        className={`mb-3 rounded-lg border px-2.5 py-2 text-xs font-semibold ${semanticStampClass("sale")}`}
                      >
                        {t("studio.ownership.saleLogged")}
                      </p>
                    ) : null}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {(artwork as { verification_status?: string })
                        .verification_status === "verified" ? (
                        <span
                          className={`${registryV2.type.stamp} ${semanticStampClass("certification")}`}
                        >
                          {t("studio.artworks.verified")}
                        </span>
                      ) : null}
                      {pendingOutbound ? (
                        <span
                          className={`${registryV2.type.stamp} ${semanticStampClass("transfer")}`}
                        >
                          Transfer pending
                        </span>
                      ) : null}
                      {sold && !pendingOutbound ? (
                        <span
                          className={`${registryV2.type.stamp} ${semanticStampClass("sale")}`}
                        >
                          {isTransferredOut(artwork)
                            ? "Sold / transferred"
                            : t("studio.ownership.lastEventSale")}
                        </span>
                      ) : null}
                      {youHold && !pendingOutbound ? (
                        <span
                          className={`${registryV2.type.stamp} ${semanticStampClass("transfer")}`}
                        >
                          {t("studio.ownership.inYourCustody")}
                        </span>
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-neutral-200/90 bg-white/80 p-3.5">
                      <p className="text-xs font-semibold text-neutral-500">
                        {t("studio.ownership.currentHolder")}
                      </p>
                      <p className="mt-2 text-[15px] font-medium leading-snug text-neutral-900">
                        {holder}
                      </p>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-neutral-500">
                        {t("studio.ownership.chainDepth")}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {fillMessage(t(transfersKey), {
                          count: String(transferCount),
                        })}
                      </p>
                      <div className="mt-2">
                        <TransferDots count={transferCount} t={t} />
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
                            {t("studio.ownership.noRegistryId")}
                          </span>
                        )}
                      </div>
                      {registryId ? (
                        <Link
                          href={`/registry/${encodeURIComponent(registryId)}/ledger`}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 rounded-xl bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-white"
                        >
                          {t("studio.ownership.ledgerLink")}
                        </Link>
                      ) : (
                        <span className="shrink-0 rounded-xl bg-neutral-300 px-3 py-2 text-[11px] font-semibold text-neutral-600">
                          {t("studio.ownership.ledgerLink")}
                        </span>
                      )}
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
            {t("studio.ownership.emptyLabel")}
          </p>
          <InfoTooltip text="When transfers or claims are recorded, each work appears here with holder, chain depth, and sale signals." />
          <h3 className="mt-4 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
            {t("studio.ownership.emptyTitle")}
          </h3>
          <div className="mt-10 flex justify-center">
            <ExperienceEmptyStateButton
              label={t("studio.registerArtwork")}
              onClick={onRegisterClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
