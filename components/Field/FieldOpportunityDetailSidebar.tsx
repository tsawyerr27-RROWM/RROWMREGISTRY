"use client";

import type { ReactNode } from "react";

import { FieldOpportunityApplySection } from "@/components/Field/FieldOpportunityApplySection";
import { FieldOpportunityEligibilityIndicators } from "@/components/Field/FieldOpportunityEligibilityIndicators";
import type { FieldOpportunityApplyContext } from "@/lib/field-opportunity-applications";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  briefId: string;
  briefTitle: string;
  acceptingResponses: boolean;
  sectorLabel: string;
  briefTypeLabel: string;
  participationModeLabel: string;
  practiceLabels: string[];
  opensLabel: string;
  closesLabel: string;
  applyContext: FieldOpportunityApplyContext;
  stacked?: boolean;
};

function QuietBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "open" | "closed" | "verified";
}) {
  const toneClass =
    tone === "open"
      ? "bg-emerald-950/[0.04] text-emerald-950/80 ring-emerald-900/[0.08]"
      : tone === "closed"
        ? "bg-neutral-950/[0.03] text-neutral-500 ring-neutral-900/[0.06]"
        : tone === "verified"
          ? "bg-neutral-950/[0.04] text-neutral-700 ring-neutral-900/[0.07]"
          : "bg-neutral-950/[0.03] text-neutral-600 ring-neutral-900/[0.06]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ring-1 ${toneClass}`}
    >
      {children}
    </span>
  );
}

function DossierRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-neutral-900/[0.06] py-3.5 first:border-t-0 first:pt-0">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-sm font-medium text-neutral-950">{value}</dd>
    </div>
  );
}

export function FieldOpportunityDetailSidebar({
  briefId,
  briefTitle,
  acceptingResponses,
  sectorLabel,
  briefTypeLabel,
  participationModeLabel,
  practiceLabels,
  opensLabel,
  closesLabel,
  applyContext,
  stacked = false,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <aside className={stacked ? "" : "lg:sticky lg:top-24 lg:self-start"}>
      <div
        className={
          stacked
            ? "rounded-[1.25rem] bg-gradient-to-br from-[#f7f4ef]/70 via-white/80 to-[#eef2ef]/50 px-6 py-8 md:px-8"
            : "border-l border-neutral-900/[0.08] bg-gradient-to-b from-[#f7f4ef]/50 via-white/40 to-transparent pl-6 md:pl-8 lg:pl-8"
        }
      >
        <h2 className="font-serif text-xl text-neutral-950 md:text-2xl">
          {t("field.opportunities.detail.dossierHeading")}
        </h2>

        <div className="mt-5 flex flex-wrap gap-2">
          <QuietBadge tone={acceptingResponses ? "open" : "closed"}>
            {acceptingResponses
              ? t("field.opportunities.windowOpen")
              : t("field.opportunities.windowClosed")}
          </QuietBadge>
          <QuietBadge>{briefTypeLabel}</QuietBadge>
        </div>

        <dl className="mt-6">
          <DossierRow label={t("field.opportunities.detail.closes")} value={closesLabel} />
          <DossierRow label={t("field.opportunities.detail.opens")} value={opensLabel} />
          <DossierRow label={t("field.opportunities.detail.sector")} value={sectorLabel} />
          <DossierRow
            label={t("field.opportunities.detail.participation")}
            value={participationModeLabel}
          />
        </dl>

        {practiceLabels.length > 0 ? (
          <div className="mt-2 border-t border-neutral-900/[0.06] py-3.5">
            <p className="text-xs text-neutral-500">{t("field.opportunities.detail.practices")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {practiceLabels.map((label) => (
                <QuietBadge key={label}>{label}</QuietBadge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 border-t border-neutral-900/[0.08] pt-8">
          <FieldOpportunityApplySection
            briefId={briefId}
            briefTitle={briefTitle}
            acceptingResponses={acceptingResponses}
            initialApplyContext={applyContext}
            variant="sidebar"
          />
        </div>

        {applyContext.viewerRole === "artist" &&
        applyContext.eligibilityIndicators.length > 0 ? (
          <div className="mt-8 border-t border-neutral-900/[0.08] pt-8">
            <FieldOpportunityEligibilityIndicators
              indicators={applyContext.eligibilityIndicators}
              variant="sidebar"
            />
          </div>
        ) : null}

        {!acceptingResponses ? (
          <p className="mt-6 text-sm leading-relaxed text-neutral-600">
            {fillMessage(t("field.opportunities.closesOn"), { date: closesLabel })}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
