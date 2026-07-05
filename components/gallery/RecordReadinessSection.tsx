"use client";

import Link from "next/link";
import { StudioContentSlab } from "@/components/Studio/StudioContentSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import {
  aggregateReadinessCounts,
  computeRecordReadiness,
  type ReadinessArtworkFields,
  type RecordReadinessStatus,
} from "@/lib/gallery-record-readiness";
import {
  translateOpsActionLabel,
  translateReadinessReason,
} from "@/lib/gallery-ops-i18n";
import { semanticTextClass } from "@/lib/registry-semantic-signals";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  artworks: ReadinessArtworkFields[];
  ownershipByArtworkId: Record<string, number>;
  hasDeclaredValueByArtworkId: Record<string, boolean>;
  onGoToRoster: () => void;
};

function statusPillClass(status: RecordReadinessStatus): string {
  const base = "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1";
  if (status === "ready") {
    return `${base} border border-[var(--v2-seal-border)] bg-[var(--v2-paper-bone)] text-[var(--v2-ink)] ring-transparent`;
  }
  if (status === "needs_attention") {
    return `${base} bg-[var(--v2-amber-exception-dim)] text-[var(--v2-ink)] ring-[var(--v2-amber-exception)]/20`;
  }
  return `${base} bg-neutral-900/[0.04] text-[var(--v2-ink-muted)] ring-black/[0.06]`;
}

const STATUS_KEYS: Record<RecordReadinessStatus, MessageKey> = {
  ready: "gallery.status.ready",
  needs_attention: "gallery.status.needsAttention",
  incomplete: "gallery.status.incomplete",
};

function displayTitle(
  artwork: ReadinessArtworkFields,
  untitled: string
): string {
  const title = (artwork.title || "").trim() || untitled;
  const y = artwork.year != null && String(artwork.year).trim();
  return y ? `${title} (${String(artwork.year).trim()})` : title;
}

export function RecordReadinessSection({
  artworks,
  ownershipByArtworkId,
  hasDeclaredValueByArtworkId,
  onGoToRoster,
}: Props) {
  const { t } = useLocalePreferences();

  if (artworks.length === 0) return null;

  const rows = artworks.map((w) => {
    const oc = ownershipByArtworkId[w.id] ?? 0;
    const dv = Boolean(hasDeclaredValueByArtworkId[w.id]);
    const r = computeRecordReadiness(w, oc, dv);
    return { artwork: w, ...r };
  });

  const counts = aggregateReadinessCounts(rows);
  const affected = rows
    .filter((r) => r.status !== "ready")
    .sort((a, b) => {
      const order: Record<RecordReadinessStatus, number> = {
        incomplete: 0,
        needs_attention: 1,
        ready: 2,
      };
      return order[a.status] - order[b.status];
    });

  return (
    <StudioContentSlab
      className="mb-8"
      title={t("gallery.readiness.title")}
      subtitle={t("gallery.readiness.tooltip")}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] tabular-nums text-[var(--v2-ink-muted)]">
        <span>
          <span className={`font-medium ${semanticTextClass("certification")}`}>
            {counts.ready}
          </span>{" "}
          {t("gallery.readiness.ready")}
        </span>
        <span>
          <span className={`font-medium ${semanticTextClass("correction")}`}>
            {counts.needs_attention}
          </span>{" "}
          {t("gallery.readiness.needsAttention")}
        </span>
        <span>
          <span className="font-medium text-[var(--v2-ink)]">{counts.incomplete}</span>{" "}
          {t("gallery.readiness.incomplete")}
        </span>
      </div>

      {affected.length === 0 ? (
        <p className="mt-5 text-[13px] text-[var(--v2-ink-muted)]">
          {t("gallery.readiness.allPass")}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--v2-border)] border-t border-[var(--v2-border)] pt-4">
          {affected.map(({ artwork, status, reasonCode, action }) => (
            <li
              key={artwork.id}
              className={`${studioV2.scope} flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[var(--v2-ink)]">
                  {displayTitle(artwork, t("gallery.fallback.untitled"))}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={statusPillClass(status)}>
                    {status === "needs_attention" ? "⚠ " : null}
                    {t(STATUS_KEYS[status])}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-[var(--v2-ink-muted)]">
                  {reasonCode ? translateReadinessReason(reasonCode, t) : null}
                </p>
              </div>
              <div className="shrink-0 sm:pt-0.5">
                {action?.kind === "link" ? (
                  <Link
                    href={action.href}
                    className="text-[12px] font-medium text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border-strong)] underline-offset-4 transition hover:text-[var(--v2-ink)]"
                  >
                    {translateOpsActionLabel(action.labelKey, t)}
                  </Link>
                ) : action?.kind === "roster" ? (
                  <button
                    type="button"
                    onClick={onGoToRoster}
                    className="text-left text-[12px] font-medium text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border-strong)] underline-offset-4 transition hover:text-[var(--v2-ink)]"
                  >
                    {translateOpsActionLabel(action.labelKey, t)}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </StudioContentSlab>
  );
}
