"use client";

import Link from "next/link";
import { useState } from "react";

import { OpportunityApplicationModal } from "@/components/Field/OpportunityApplicationModal";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { FieldOpportunityApplyContext } from "@/lib/field-opportunity-applications";
import {
  opportunityApplicationStatusLabel,
  type OpportunityApplicationStatus,
} from "@/lib/field-opportunity-applications";

type Props = {
  briefId: string;
  briefTitle: string;
  acceptingResponses: boolean;
  initialApplyContext: FieldOpportunityApplyContext;
  variant?: "page" | "sidebar";
};

const PRACTICE_ACCOUNT_HREF = "/studio/account#account-practice";

function formatSubmissionDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function applicationStatusTone(status: OpportunityApplicationStatus): string {
  switch (status) {
    case "selected":
      return "border-emerald-900/10 bg-[#f4f7f4]/80";
    case "shortlisted":
      return "border-neutral-900/[0.08] bg-[#f6f7f9]/80";
    case "rejected":
      return "border-neutral-900/[0.06] bg-neutral-50/80";
    default:
      return "border-neutral-900/[0.08] bg-[#f7f6f3]/80";
  }
}

export function FieldOpportunityApplySection({
  briefId,
  briefTitle,
  acceptingResponses,
  initialApplyContext,
  variant = "page",
}: Props) {
  const { t } = useLocalePreferences();
  const [applyContext, setApplyContext] =
    useState<FieldOpportunityApplyContext>(initialApplyContext);
  const [modalOpen, setModalOpen] = useState(false);
  const isSidebar = variant === "sidebar";

  const gate = applyContext.practiceApplyGate;
  const requiresOverride = gate?.requiresEligibilityOverride === true;
  const canApply = gate?.canApply === true;
  const isNoPractices = gate?.status === "no_practices";
  const isMismatch = gate?.status === "mismatch";

  const showSubmittedState =
    applyContext.viewerRole === "artist" && Boolean(applyContext.application);

  const showApplyFlow =
    applyContext.viewerRole === "artist" &&
    !applyContext.application &&
    acceptingResponses;

  if (!showSubmittedState && !showApplyFlow) {
    return null;
  }

  const headingClass = isSidebar
    ? "font-serif text-xl text-neutral-950"
    : "font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl";

  const content = (
    <>
      <h2 className={headingClass}>{t("field.opportunities.detail.applyHeading")}</h2>
      {!isSidebar ? (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          {t("field.opportunities.detail.applyLede")}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {t("field.opportunities.detail.applyLede")}
        </p>
      )}

      {showSubmittedState && applyContext.application ? (
        <div
          className={`${isSidebar ? "mt-5" : "mt-10"} rounded-xl border px-5 py-5 md:px-6 md:py-6 ${applicationStatusTone(
            applyContext.application.status
          )}`}
        >
          <p className="font-serif text-lg text-neutral-950 md:text-xl">
            {t("field.opportunities.detail.applicationSubmitted")}
          </p>
          <dl className={`${isSidebar ? "mt-4 space-y-3" : "mt-6 grid gap-5 sm:grid-cols-2"} text-sm`}>
            <div>
              <dt className="text-neutral-500">{t("field.opportunities.detail.submitted")}</dt>
              <dd className="mt-1 text-[15px] font-medium text-neutral-950">
                {formatSubmissionDate(applyContext.application.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">
                {t("field.opportunities.detail.currentStatus")}
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-neutral-950">
                {opportunityApplicationStatusLabel(applyContext.application.status)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {showApplyFlow && canApply && !isMismatch ? (
        <div className={`${isSidebar ? "mt-5 space-y-4" : "mt-10 space-y-6"}`}>
          {gate?.status === "match" ? (
            <p className="inline-flex items-center rounded-full bg-emerald-950/[0.04] px-3 py-1 text-sm text-emerald-950/85 ring-1 ring-emerald-900/[0.08]">
              <span className="mr-2" aria-hidden>
                ✓
              </span>
              {t("field.opportunities.apply.matchHint")}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`inline-flex rounded-full bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 ${
              isSidebar ? "w-full justify-center px-6 py-3" : "px-8 py-3.5"
            }`}
          >
            {t("field.opportunities.detail.applyCta")}
          </button>
        </div>
      ) : null}

      {showApplyFlow && isMismatch ? (
        <div
          className={`${isSidebar ? "mt-5" : "mt-10"} rounded-xl border border-neutral-900/[0.06] bg-[#f7f4ef]/70 px-5 py-5 md:px-6 md:py-6`}
        >
          <p className="text-[15px] leading-relaxed text-neutral-800">
            {t("field.opportunities.apply.mismatch")}
          </p>
          <div className={`${isSidebar ? "mt-4 flex flex-col gap-2" : "mt-6 flex flex-wrap gap-3"}`}>
            <Link
              href={PRACTICE_ACCOUNT_HREF}
              className="inline-flex justify-center rounded-full border border-neutral-900/[0.08] bg-white/80 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-white"
            >
              {t("field.opportunities.apply.updatePractices")}
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {t("field.opportunities.apply.withJustification")}
            </button>
          </div>
        </div>
      ) : null}

      {showApplyFlow && isNoPractices ? (
        <div
          className={`${isSidebar ? "mt-5" : "mt-10"} rounded-xl border border-neutral-900/[0.06] bg-[#f7f4ef]/70 px-5 py-5 md:px-6 md:py-6`}
        >
          <p className="text-[15px] leading-relaxed text-neutral-800">
            {t("field.opportunities.apply.noPractices")}
          </p>
          <Link
            href={PRACTICE_ACCOUNT_HREF}
            className={`${isSidebar ? "mt-4 flex" : "mt-6 inline-flex"} justify-center rounded-full border border-neutral-900/[0.08] bg-white/80 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-white`}
          >
            {t("field.opportunities.apply.updatePractices")}
          </Link>
        </div>
      ) : null}

      <OpportunityApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunityId={briefId}
        opportunityTitle={briefTitle}
        requiresEligibilityOverride={requiresOverride}
        onSubmitted={(application) => {
          setApplyContext((prev) => ({
            ...prev,
            application,
          }));
        }}
      />
    </>
  );

  if (isSidebar) {
    return <div>{content}</div>;
  }

  return (
    <section className="mt-20 border-t border-neutral-900/[0.08] pt-16 md:mt-24 md:pt-20 lg:hidden">
      <div className="max-w-3xl">{content}</div>
    </section>
  );
}
