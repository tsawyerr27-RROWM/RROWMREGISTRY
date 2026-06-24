"use client";

import { briefTypeLabelLocalized } from "@/lib/opportunity-types";
import {
  formatOpportunityDate,
  opportunityVisibilityLabelLocalized,
  type OpportunityBriefRow,
} from "@/lib/opportunity-editor";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { rrowmButton, rrowmSurface } from "@/styles/rrowm-theme";

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
          className={`shrink-0 ${rrowmButton.primaryEconomic}`}
        >
          {t("studio.opportunities.create")}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {t("studio.opportunities.lede")}
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">{t("studio.opportunities.loading")}</p>
      ) : briefs.length === 0 && !isCreating ? (
        <p className="mt-8 text-sm text-neutral-600">{t("studio.opportunities.empty")}</p>
      ) : (
        <ul className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
          {briefs.map((brief) => {
            const active =
              (selectedId === brief.id && !isCreating) || reviewModeId === brief.id;
            const inReview = reviewModeId === brief.id;
            const updatedLabel = formatOpportunityDate(brief.updated_at);
            const applicationCount = brief.application_count ?? 0;
            return (
              <li key={brief.id}>
                <div
                  className={`p-4 transition ${
                    active
                      ? `${rrowmSurface.l2} ring-1 ring-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_28%,transparent)]`
                      : `${rrowmSurface.l3} hover:shadow-[0_12px_30px_rgba(40,25,10,0.08)]`
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(brief)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                        {opportunityVisibilityLabelLocalized(brief.visibility_state, t)}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {fillMessage(t("studio.opportunities.applicationCount"), {
                          count: applicationCount,
                        })}
                      </span>
                      {inReview ? (
                        <span className="text-[11px] font-medium text-emerald-900/80">
                          {t("studio.opportunities.applicationsHeading")}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-serif text-lg text-neutral-950">{brief.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      {briefTypeLabelLocalized(brief.brief_type, t)}
                      {updatedLabel
                        ? ` · ${fillMessage(t("studio.opportunities.lastUpdated"), { date: updatedLabel })}`
                        : null}
                    </p>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-900/[0.05] pt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onSelect(brief)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {t("studio.opportunities.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onReviewApplications(brief)}
                      className="rounded-lg border border-emerald-900/15 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {t("studio.opportunities.reviewApplications")}
                      {applicationCount > 0 ? ` (${applicationCount})` : ""}
                    </button>
                    <button
                      type="button"
                      disabled
                      title={t("studio.opportunities.duplicatePlaceholder")}
                      onClick={() => onDuplicate(brief)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t("studio.opportunities.duplicate")}
                    </button>
                    <button
                      type="button"
                      disabled
                      title={t("studio.opportunities.deletePlaceholder")}
                      onClick={() => onDelete(brief)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
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
