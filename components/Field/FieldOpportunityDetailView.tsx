"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { FieldOpportunityDetailSidebar } from "@/components/Field/FieldOpportunityDetailSidebar";
import { FieldOpportunityEligibilityPanel } from "@/components/Field/FieldOpportunityEligibilityPanel";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { FieldOpportunityDetailData } from "@/lib/fetch-field-opportunity-detail";
import { fillMessage } from "@/lib/locale-messages";
import {
  fieldExplorerOrganisationsHref,
  fieldOpportunitiesHref,
} from "@/lib/field-nav";

type Props = {
  data: FieldOpportunityDetailData;
};

function formatWindowDate(iso: string | null, fallback: string): string {
  if (!iso) return fallback;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

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

export function FieldOpportunityDetailView({ data }: Props) {
  const { t } = useLocalePreferences();
  const {
    brief,
    organisation,
    programme,
    sectorLabel,
    briefTypeLabel,
    participationModeLabel,
    practiceLabels,
    acceptingResponses,
    presence,
    applyContext,
    eligibility,
    showEligibilityPanel,
  } = data;

  const notAnnounced = t("field.opportunities.detail.deadlineNotAnnounced");
  const closesLabel = formatWindowDate(brief.closes_at, notAnnounced);
  const opensLabel = formatWindowDate(brief.opens_at, notAnnounced);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-10">
      <section className="relative overflow-hidden pb-12 pt-4 md:pb-16 md:pt-8">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#e8e4df]/45 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#dfe8e3]/40 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
          aria-hidden
        />

        <div className="relative max-w-5xl">
          <h1 className="font-serif text-[2.75rem] font-normal leading-[1.02] tracking-tight text-neutral-950 md:text-7xl md:leading-[0.98] lg:text-[5.25rem]">
            {brief.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-neutral-700">
            <Link
              href={organisation.href}
              className="font-medium text-neutral-950 underline decoration-neutral-300/80 underline-offset-[5px] transition hover:decoration-neutral-500"
            >
              {organisation.name}
            </Link>
            {organisation.verified ? (
              <QuietBadge tone="verified">
                {t("field.opportunities.verifiedOrganisation")}
              </QuietBadge>
            ) : null}
            <QuietBadge>{briefTypeLabel}</QuietBadge>
            <QuietBadge tone={acceptingResponses ? "open" : "closed"}>
              {acceptingResponses
                ? t("field.opportunities.windowOpen")
                : t("field.opportunities.windowClosed")}
            </QuietBadge>
          </div>

          <p className="mt-6 text-lg text-neutral-700 md:text-xl">
            {brief.closes_at
              ? fillMessage(t("field.opportunities.closesOn"), { date: closesLabel })
              : t("field.opportunities.deadlineNotSet")}
          </p>

          {programme ? (
            <p className="mt-4 text-[15px] text-neutral-600">
              {t("field.opportunities.detail.programme")}{" "}
              <Link
                href={programme.href}
                className="font-medium text-neutral-900 underline decoration-neutral-300/70 underline-offset-4 hover:decoration-neutral-500"
              >
                {programme.title}
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <div className="mb-10 lg:hidden">
        <FieldOpportunityDetailSidebar
          briefId={brief.id}
          briefTitle={brief.title}
          acceptingResponses={acceptingResponses}
          sectorLabel={sectorLabel}
          briefTypeLabel={briefTypeLabel}
          participationModeLabel={participationModeLabel}
          practiceLabels={practiceLabels}
          opensLabel={opensLabel}
          closesLabel={closesLabel}
          applyContext={applyContext}
          stacked
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.62fr)_minmax(280px,0.38fr)] lg:gap-16 xl:gap-20">
        <div className="min-w-0">
          <section>
            <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">
              {t("field.opportunities.detail.briefHeading")}
            </h2>
            <div className="mt-8 max-w-2xl">
              {brief.description ? (
                <p className="whitespace-pre-wrap text-lg leading-[1.8] text-neutral-700 md:text-xl md:leading-[1.75]">
                  {brief.description}
                </p>
              ) : (
                <p className="text-[15px] text-neutral-500">
                  {t("field.opportunities.detail.noDescription")}
                </p>
              )}
            </div>
          </section>

          {showEligibilityPanel ? (
            <FieldOpportunityEligibilityPanel eligibility={eligibility} variant="prose" />
          ) : null}

          <section className="mt-16 md:mt-20">
            <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">
              {t("field.opportunities.detail.organisationHeading")}
            </h2>
            <div className="mt-6 max-w-2xl">
              <p className="text-lg text-neutral-800">
                <Link
                  href={organisation.href}
                  className="font-medium underline decoration-neutral-300/80 underline-offset-4 hover:decoration-neutral-500"
                >
                  {organisation.name}
                </Link>
                {organisation.verified ? (
                  <span className="ml-2 inline-flex align-middle">
                    <QuietBadge tone="verified">
                      {t("field.opportunities.verifiedOrganisation")}
                    </QuietBadge>
                  </span>
                ) : null}
              </p>
              {presence ? (
                <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                  {presence.footprint.verifiedRecords > 0
                    ? `${presence.footprint.verifiedRecords} verified records on file`
                    : null}
                  {presence.representedCreatives.length > 0
                    ? `${presence.footprint.verifiedRecords > 0 ? " · " : ""}${presence.representedCreatives.length} represented Creatives`
                    : null}
                </p>
              ) : null}
              <Link
                href={organisation.href}
                className="mt-6 inline-flex border-b border-neutral-900/15 pb-0.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-900/35"
              >
                {t("field.opportunities.detail.viewOrganisation")}
              </Link>
            </div>
          </section>

          {brief.registry_outcome_required ? (
            <section className="mt-16 md:mt-20">
              <h2 className="font-serif text-xl text-neutral-950 md:text-2xl">
                {t("field.opportunities.detail.registryOutcome")}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-700">
                {brief.registry_outcome_copy?.trim() ||
                  t("field.opportunities.detail.registryOutcomeDefault")}
              </p>
            </section>
          ) : null}

          <section className="mt-16 border-t border-neutral-900/[0.06] pt-12 md:mt-20 md:pt-16">
            <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">
              {t("field.opportunities.detail.continueExploring")}
            </h2>
            <div className="mt-8 flex flex-col gap-3 text-[15px]">
              <Link
                href={fieldOpportunitiesHref()}
                className="w-fit border-b border-neutral-900/15 pb-0.5 font-medium text-neutral-900 transition hover:border-neutral-900/35"
              >
                {t("field.opportunities.detail.browseOpportunities")}
              </Link>
              <Link
                href={fieldExplorerOrganisationsHref()}
                className="w-fit border-b border-neutral-900/15 pb-0.5 font-medium text-neutral-900 transition hover:border-neutral-900/35"
              >
                {t("field.opportunities.detail.browseOrganisations")}
              </Link>
            </div>
          </section>
        </div>

        <div className="hidden lg:block">
          <FieldOpportunityDetailSidebar
            briefId={brief.id}
            briefTitle={brief.title}
            acceptingResponses={acceptingResponses}
            sectorLabel={sectorLabel}
            briefTypeLabel={briefTypeLabel}
            participationModeLabel={participationModeLabel}
            practiceLabels={practiceLabels}
            opensLabel={opensLabel}
            closesLabel={closesLabel}
            applyContext={applyContext}
          />
        </div>
      </div>

      <FieldExplorerDiscoveryStrip activeTab="opportunities" />
    </main>
  );
}
