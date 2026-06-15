"use client";

import Link from "next/link";

import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { CreativeExplorerRow } from "@/lib/fetch-creative-explorer-list";
import { fieldVerifyHref } from "@/lib/field-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  row: CreativeExplorerRow;
};

function verificationSummary(row: CreativeExplorerRow): string {
  const parts: string[] = [];
  if (row.verifiedWorkCount > 0) {
    parts.push(
      `${row.verifiedWorkCount} verified ${row.verifiedWorkCount === 1 ? "work" : "works"} on file`
    );
  } else if (row.artistVerified) {
    parts.push("Artist confirmation on file");
  } else if (row.totalWorkCount > 0) {
    parts.push(`${row.totalWorkCount} ${row.totalWorkCount === 1 ? "work" : "works"} registered`);
  }
  if (row.institutionVerified && row.organisationName) {
    parts.push(`Represented by ${row.organisationName}`);
  } else if (row.institutionLinked) {
    parts.push("Institution-linked");
  }
  return parts.join(" · ");
}

export function CreativePresenceCard({ row }: Props) {
  const { t } = useLocalePreferences();
  const summary = verificationSummary(row);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)]">
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h2 className="font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950">
          <Link href={row.href} className="transition hover:text-neutral-600">
            {row.displayName}
          </Link>
        </h2>

        {summary ? (
          <div className="mt-4 rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-3.5 py-3">
            <p className="text-sm text-neutral-500">
              {t("field.creative.registryEvidence")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-700">{summary}</p>
          </div>
        ) : null}

        {row.practices.length > 0 ? (
          <div className="mt-4">
            <FieldCreativePracticeChips practices={row.practices} limit={3} />
          </div>
        ) : null}

        {row.bioExcerpt ? (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
            {row.bioExcerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-6 flex flex-col gap-2 border-t border-neutral-900/[0.05] pt-5">
          <Link
            href={row.href}
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            {t("field.creative.viewProfile")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="text-center text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
          >
            {t("field.creative.link.verifyHub")}
          </Link>
        </div>
      </div>
    </article>
  );
}
