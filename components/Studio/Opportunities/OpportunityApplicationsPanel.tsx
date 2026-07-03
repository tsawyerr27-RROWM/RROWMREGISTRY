"use client";

import { useMemo, useState } from "react";

import type { OrganisationOpportunityApplicationListItem } from "@/lib/field-opportunity-applications";
import { opportunityApplicationStatusLabel } from "@/lib/field-opportunity-applications";
import {
  computeOpportunityApplicationReviewMetrics,
  filterOpportunityApplicationsForReview,
  OPPORTUNITY_APPLICATION_REVIEW_TABS,
  opportunityApplicationReviewTabCount,
  type OpportunityApplicationReviewTab,
} from "@/lib/opportunity-application-review";
import { formatOpportunityDate } from "@/lib/opportunity-editor";
import { isSystemRole, productRoleLabel } from "@/lib/studio-terminology";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { OpportunityApplicationStatus } from "@/lib/field-opportunity-applications";
import type { MessageKey } from "@/lib/locale-messages";
import { economicSectionCard } from "@/styles/rrowm-theme";

type Props = {
  applications: OrganisationOpportunityApplicationListItem[];
  loading: boolean;
  busy: boolean;
  applicationStatusBusyId: string | null;
  onUpdateStatus: (applicationId: string, status: OpportunityApplicationStatus) => void;
};

const REVIEW_TAB_MESSAGE_KEYS: Record<OpportunityApplicationReviewTab, MessageKey> = {
  all: "studio.opportunities.applicationsTab.all",
  submitted: "studio.opportunities.applicationsTab.submitted",
  shortlisted: "studio.opportunities.applicationsTab.shortlisted",
  selected: "studio.opportunities.applicationsTab.selected",
  rejected: "studio.opportunities.applicationsTab.rejected",
};

const METRIC_ITEMS: readonly {
  key: keyof ReturnType<typeof computeOpportunityApplicationReviewMetrics>;
  labelKey: MessageKey;
}[] = [
  { key: "total", labelKey: "studio.opportunities.applicationsMetrics.total" },
  { key: "submitted", labelKey: "studio.opportunities.applicationsMetrics.submitted" },
  {
    key: "shortlisted",
    labelKey: "studio.opportunities.applicationsMetrics.shortlisted",
  },
  { key: "selected", labelKey: "studio.opportunities.applicationsMetrics.selected" },
  { key: "rejected", labelKey: "studio.opportunities.applicationsMetrics.rejected" },
  {
    key: "eligibilityOverrideRequests",
    labelKey: "studio.opportunities.applicationsMetrics.overrideRequests",
  },
];

export function OpportunityApplicationsPanel({
  applications,
  loading,
  busy,
  applicationStatusBusyId,
  onUpdateStatus,
}: Props) {
  const { t } = useLocalePreferences();
  const [activeTab, setActiveTab] = useState<OpportunityApplicationReviewTab>("all");
  const [overrideOnly, setOverrideOnly] = useState(false);

  const metrics = useMemo(
    () => computeOpportunityApplicationReviewMetrics(applications),
    [applications]
  );

  const filteredApplications = useMemo(
    () =>
      filterOpportunityApplicationsForReview(applications, {
        tab: activeTab,
        overrideOnly,
      }),
    [applications, activeTab, overrideOnly]
  );

  function applicantRoleLabel(role: string): string {
    if (isSystemRole(role)) return productRoleLabel(role, t);
    return role;
  }

  function formatApplicationDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(iso)
      );
    } catch {
      return iso;
    }
  }

  function tabClass(active: boolean): string {
    return active
      ? "rounded-full border border-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_12%,var(--rrowm-zone-elevated))] px-3 py-1.5 text-xs font-medium text-[color:var(--rrowm-zone-secondary)] shadow-[0_6px_18px_rgba(40,25,10,0.06)]"
      : "rounded-full border border-[color:var(--rrowm-zone-border)] bg-[color:var(--rrowm-zone-elevated)] px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_25%,transparent)] hover:bg-white";
  }

  return (
    <section className={economicSectionCard()}>
      <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        {t("studio.opportunities.section.applications")}
      </h3>
      <p className="mt-2 text-sm text-neutral-600">
        {t("studio.opportunities.applicationsHint")}
      </p>

      {!loading && applications.length > 0 ? (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRIC_ITEMS.map(({ key, labelKey }) => {
              const isPrimary = key === "total";
              const needsAttention =
                key === "eligibilityOverrideRequests" && metrics[key] > 0;
              return (
                <div
                  key={key}
                  className={`rounded-lg border bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ${
                    isPrimary
                      ? "border-[var(--v2-border-strong)]"
                      : needsAttention
                        ? "border-[var(--v2-amber-exception-dim)]"
                        : "border-[var(--v2-border)]"
                  }`}
                >
                  <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {t(labelKey)}
                  </dt>
                  <dd
                    className={`mt-1 font-serif tabular-nums leading-none ${
                      isPrimary
                        ? "text-[1.85rem] text-[var(--v2-ink)]"
                        : "text-xl text-[var(--v2-ink-soft)]"
                    }`}
                  >
                    {metrics[key]}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label={t("studio.opportunities.applicationsTabListLabel")}
            >
              {OPPORTUNITY_APPLICATION_REVIEW_TABS.map((tab) => {
                const count = opportunityApplicationReviewTabCount(metrics, tab);
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={tabClass(active)}
                    onClick={() => setActiveTab(tab)}
                  >
                    {t(REVIEW_TAB_MESSAGE_KEYS[tab])}{" "}
                    <span className="tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>

            <label className="ml-auto flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={overrideOnly}
                onChange={(event) => setOverrideOnly(event.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-emerald-900/20"
              />
              {t("studio.opportunities.applicationsOverrideOnly")}
            </label>
          </div>
        </>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">
          {t("studio.opportunities.applicationsLoading")}
        </p>
      ) : applications.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          {t("studio.opportunities.applicationsEmpty")}
        </p>
      ) : filteredApplications.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          {t("studio.opportunities.applicationsEmptyFiltered")}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-900/[0.06] rounded-xl border border-neutral-900/[0.06]">
          {filteredApplications.map((application) => {
            const statusBusy = applicationStatusBusyId === application.id;
            const reviewedLabel = formatOpportunityDate(application.reviewed_at);
            return (
              <li key={application.id} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-neutral-950">
                        {application.applicant_name}
                      </p>
                      {application.eligibility_override_requested ? (
                        <span className="rounded-full border border-amber-900/15 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-950">
                          {t("studio.opportunities.applicationsEligibilityOverrideBadge")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {applicantRoleLabel(application.applicant_role)}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Submitted {formatApplicationDate(application.created_at)}
                    </p>
                    {application.eligibility_override_requested &&
                    application.eligibility_override_reason ? (
                      <p className="mt-3 rounded-lg border border-amber-900/10 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
                        {application.eligibility_override_reason}
                      </p>
                    ) : null}
                    {reviewedLabel ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        {t("studio.opportunities.applicationsReviewedAt")}: {reviewedLabel}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-neutral-800">
                    {opportunityApplicationStatusLabel(application.status)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={
                      statusBusy || busy || application.status === "shortlisted"
                    }
                    onClick={() => onUpdateStatus(application.id, "shortlisted")}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {statusBusy && application.status !== "shortlisted"
                      ? "…"
                      : t("studio.opportunities.applicationsShortlist")}
                  </button>
                  <button
                    type="button"
                    disabled={statusBusy || busy || application.status === "selected"}
                    onClick={() => onUpdateStatus(application.id, "selected")}
                    className="rounded-lg border border-emerald-900/15 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {statusBusy && application.status !== "selected"
                      ? "…"
                      : t("studio.opportunities.applicationsSelect")}
                  </button>
                  <button
                    type="button"
                    disabled={statusBusy || busy || application.status === "rejected"}
                    onClick={() => onUpdateStatus(application.id, "rejected")}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-900 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {statusBusy && application.status !== "rejected"
                      ? "…"
                      : t("studio.opportunities.applicationsReject")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
