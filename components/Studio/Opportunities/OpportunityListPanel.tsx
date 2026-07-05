"use client";

import { briefTypeLabelLocalized } from "@/lib/opportunity-types";
import {
  formatOpportunityDate,
  opportunityVisibilityLabelLocalized,
  type OpportunityBriefRow,
} from "@/lib/opportunity-editor";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { ExperienceEmptyState } from "@/components/ui/ExperienceEmptyState";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  briefs: OpportunityBriefRow[];
  loading: boolean;
  selectedId: string | null;
  reviewModeId: string | null;
  isCreating: boolean;
  busy: boolean;
  onCreate: () => void;
  onSelect: (brief: OpportunityBriefRow) => void;
  onReviewApplications: (brief: OpportunityBriefRow) => void;
  onDuplicate: (brief: OpportunityBriefRow) => void;
  onDelete: (brief: OpportunityBriefRow) => void;
};

export function OpportunityListPanel({
  briefs,
  loading,
  selectedId,
  reviewModeId,
  isCreating,
  busy,
  onCreate,
  onSelect,
  onReviewApplications,
  onDuplicate,
  onDelete,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-900/[0.06] pb-4">
        <h2 className="font-serif text-xl text-neutral-950 md:text-2xl">
          {t("studio.opportunities.heading")}
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="v2-cta-primary shrink-0 px-4 py-2.5 text-sm"
        >
          {t("studio.opportunities.create")}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {t("studio.opportunities.lede")}
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-[var(--v2-ink-muted)]">{t("studio.opportunities.loading")}</p>
      ) : briefs.length === 0 && !isCreating ? (
        <ExperienceEmptyState
          className="mt-8 max-w-none"
          title={t("studio.opportunities.empty")}
          body={t("studio.opportunities.lede")}
          action={
            <button type="button" onClick={onCreate} className="v2-cta-primary px-6 py-3 text-xs">
              {t("studio.opportunities.create")}
            </button>
          }
        />
      ) : (
        <ul className={`${studioV2.scope} mt-6 flex-1 space-y-3 overflow-y-auto pr-1`}>
          {briefs.map((brief) => {
            const active =
              (selectedId === brief.id && !isCreating) || reviewModeId === brief.id;
            const inReview = reviewModeId === brief.id;
            const updatedLabel = formatOpportunityDate(brief.updated_at);
            const applicationCount = brief.application_count ?? 0;
            const description = (brief.description || "").trim();
            return (
              <li key={brief.id}>
                <div
                  className={`v2-motion-hover-subtle relative overflow-hidden rounded-xl border bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow] duration-300 ${
                    active
                      ? "border-[var(--v2-cobalt-signal)]"
                      : "border-[var(--v2-border-strong)]"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 opacity-80 ${
                      active
                        ? "bg-[var(--v2-cobalt-signal)]"
                        : "bg-[var(--v2-border-strong)]"
                    }`}
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(brief)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 v2-type-mono text-[9px] uppercase tracking-[0.16em] text-[var(--v2-ink-muted)]">
                      <span className="text-[var(--v2-ink-soft)]">
                        {opportunityVisibilityLabelLocalized(brief.visibility_state, t)}
                      </span>
                      <span aria-hidden className="text-[var(--v2-cool-grey)]">·</span>
                      <span>
                        {fillMessage(t("studio.opportunities.applicationCount"), {
                          count: applicationCount,
                        })}
                      </span>
                      {updatedLabel ? (
                        <>
                          <span aria-hidden className="text-[var(--v2-cool-grey)]">·</span>
                          <span>
                            {fillMessage(t("studio.opportunities.lastUpdated"), {
                              date: updatedLabel,
                            })}
                          </span>
                        </>
                      ) : null}
                      {inReview ? (
                        <span className="studio-execution-stamp studio-execution-stamp--active">
                          {t("studio.opportunities.applicationsHeading")}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-serif text-lg leading-tight text-[var(--v2-ink)]">
                      {brief.title}
                    </h3>
                    <p className="mt-1 v2-type-mono text-[10px] uppercase tracking-[0.12em] text-[var(--v2-cool-grey)]">
                      {briefTypeLabelLocalized(brief.brief_type, t)}
                    </p>
                    {description ? (
                      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--v2-ink-muted)]">
                        {description}
                      </p>
                    ) : null}
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--v2-border)] pt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onSelect(brief)}
                      className="v2-cta-secondary px-3 py-1.5 text-[11px] disabled:opacity-50"
                    >
                      {t("studio.opportunities.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onReviewApplications(brief)}
                      className="v2-cta-primary px-3 py-1.5 text-[11px] disabled:opacity-50"
                    >
                      {t("studio.opportunities.reviewApplications")}
                      {applicationCount > 0 ? ` (${applicationCount})` : ""}
                    </button>
                    <button
                      type="button"
                      disabled
                      title={t("studio.opportunities.duplicatePlaceholder")}
                      onClick={() => onDuplicate(brief)}
                      className="v2-cta-secondary px-3 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t("studio.opportunities.duplicate")}
                    </button>
                    <button
                      type="button"
                      disabled
                      title={t("studio.opportunities.deletePlaceholder")}
                      onClick={() => onDelete(brief)}
                      className="v2-cta-secondary px-3 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t("studio.opportunities.delete")}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
