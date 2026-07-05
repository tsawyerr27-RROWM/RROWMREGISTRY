"use client";

import Link from "next/link";
import { StudioContentSlab } from "@/components/Studio/StudioContentSlab";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import type { PriorityQueueItem, PriorityLevel } from "@/lib/gallery-priority-engine";
import {
  translateOpsActionLabel,
  translatePriorityReason,
  translateRecommendedAction,
} from "@/lib/gallery-ops-i18n";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  items: PriorityQueueItem[];
  maxVisible?: number;
  onGoToRoster: () => void;
  onVerifyArtwork: (artworkId: string) => void;
  onIssueCertificate: (artworkId: string) => void;
};

const PRIORITY_KEYS: Record<PriorityLevel, MessageKey> = {
  immediate: "gallery.priority.immediate",
  high: "gallery.priority.high",
  standard: "gallery.priority.standard",
  low: "gallery.priority.low",
};

function priorityTone(level: PriorityLevel) {
  if (level === "immediate") return "text-[var(--v2-ink)] font-medium";
  if (level === "high") return "text-[var(--v2-ink-soft)]";
  if (level === "standard") return "text-[var(--v2-ink-muted)]";
  return "text-[var(--v2-cool-grey)]";
}

export function PriorityQueueSection({
  items,
  maxVisible = 8,
  onGoToRoster,
  onVerifyArtwork,
  onIssueCertificate,
}: Props) {
  const { t } = useLocalePreferences();

  if (items.length === 0) return null;
  const visible = items.slice(0, Math.max(5, Math.min(8, maxVisible)));

  return (
    <StudioContentSlab
      className="mb-8"
      overline={t("gallery.nav.verification")}
      title={t("gallery.priority.title")}
      subtitle={t("gallery.priority.tooltip")}
    >
      <ul className="divide-y divide-[var(--v2-border)] border-t border-[var(--v2-border)] pt-4">
        {visible.map((item) => (
          <li
            key={item.artwork_id}
            className={`${studioV2.scope} flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[var(--v2-ink)]">{item.title}</p>
              <p className={`mt-1 text-[12px] ${priorityTone(item.priority_level)}`}>
                {t(PRIORITY_KEYS[item.priority_level])}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-[var(--v2-ink-muted)]">
                {item.reasonCodes
                  .map((code) => translatePriorityReason(code, t))
                  .join(" · ")}
              </p>
            </div>
            <div className="shrink-0 sm:pt-0.5">
              {item.action?.kind === "link" ? (
                <Link
                  href={item.action.href}
                  className="text-[12px] font-medium text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border-strong)] underline-offset-4 transition hover:text-[var(--v2-ink)]"
                >
                  {translateOpsActionLabel(item.action.labelKey, t)}
                </Link>
              ) : item.action?.kind === "roster" ? (
                <button
                  type="button"
                  onClick={onGoToRoster}
                  className="text-left text-[12px] font-medium text-[var(--v2-ink-soft)] underline decoration-[var(--v2-border-strong)] underline-offset-4 transition hover:text-[var(--v2-ink)]"
                >
                  {translateOpsActionLabel(item.action.labelKey, t)}
                </button>
              ) : item.action?.kind === "verify" ? (
                <button
                  type="button"
                  onClick={() => onVerifyArtwork(item.artwork_id)}
                  className="v2-cta-primary px-3 py-1.5 text-[10px]"
                >
                  {translateOpsActionLabel(item.action.labelKey, t)}
                </button>
              ) : item.action?.kind === "issue_certificate" ? (
                <button
                  type="button"
                  onClick={() => onIssueCertificate(item.artwork_id)}
                  className="v2-cta-secondary px-3 py-1.5 text-[10px]"
                >
                  {translateOpsActionLabel(item.action.labelKey, t)}
                </button>
              ) : (
                <span className="text-[12px] text-[var(--v2-cool-grey)]">
                  {translateRecommendedAction(item.recommendedActionKey, t)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </StudioContentSlab>
  );
}
