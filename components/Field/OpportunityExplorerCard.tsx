"use client";

import Link from "next/link";

import type { FieldOpportunityCard } from "@/lib/fetch-field-opportunities-list";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  row: FieldOpportunityCard;
};

export function OpportunityExplorerCard({ row }: Props) {
  const { t } = useLocalePreferences();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)]">
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            {row.briefTypeLabel}
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              row.acceptingResponses
                ? "border border-emerald-900/15 bg-emerald-50 text-emerald-950"
                : "border border-neutral-200 bg-neutral-50 text-neutral-600"
            }`}
          >
            {row.acceptingResponses
              ? t("field.opportunities.windowOpen")
              : t("field.opportunities.windowClosed")}
          </span>
        </div>

        <h2 className="mt-2 font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950">
          <Link href={row.href} className="transition hover:text-neutral-600">
            {row.title}
          </Link>
        </h2>

        <p className="mt-3 text-sm text-neutral-600">
          <Link href={row.organisationHref} className="font-medium hover:text-neutral-900">
            {row.organisationName}
          </Link>
          {row.organisationVerified ? (
            <span className="ml-2 rounded-full border border-emerald-900/15 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-950">
              {t("field.opportunities.verifiedOrganisation")}
            </span>
          ) : null}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
            {row.sectorLabel}
          </span>
          {row.practiceLabels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
            >
              {label}
            </span>
          ))}
        </div>

        {row.descriptionExcerpt ? (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {row.descriptionExcerpt}
          </p>
        ) : null}

        <div className="mt-auto pt-6">
          <Link
            href={row.href}
            className="inline-flex rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.opportunities.viewOpportunity")}
          </Link>
        </div>
      </div>
    </article>
  );
}
