"use client";

import Link from "next/link";

import type { OrganisationExplorerRow } from "@/lib/fetch-organisation-explorer-list";
import { fieldVerifyHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  row: OrganisationExplorerRow;
};

function registryEvidenceSummary(row: OrganisationExplorerRow): string {
  const parts: string[] = [];

  if (row.verified) {
    parts.push("Organisation verification on file");
  } else {
    parts.push("Registry participant");
  }

  if (row.verifiedWorkCount > 0) {
    parts.push(
      `${row.verifiedWorkCount} verified ${row.verifiedWorkCount === 1 ? "work" : "works"} on file`
    );
  }

  if (row.representedCreativesCount > 0) {
    parts.push(
      `${row.representedCreativesCount} represented ${
        row.representedCreativesCount === 1 ? "Creative" : "Creatives"
      }`
    );
  }

  if (row.totalRecords > 0) {
    parts.push(
      `${row.totalRecords} ${row.totalRecords === 1 ? "record" : "records"} on file`
    );
  }

  return parts.join(" · ");
}

export function OrganisationPresenceCard({ row }: Props) {
  const { t } = useLocalePreferences();
  const summary = registryEvidenceSummary(row);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)]">
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h2 className="font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950">
          <Link href={row.href} className="transition hover:text-neutral-600">
            {row.name}
          </Link>
        </h2>

        {summary ? (
          <div className="mt-4 rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-3.5 py-3">
            <p className="text-sm text-neutral-500">
              {t("field.organisation.registryEvidence")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-700">{summary}</p>
          </div>
        ) : null}

        {row.location ? (
          <p className="mt-4 text-sm text-neutral-600">{row.location}</p>
        ) : null}

        {row.certificateCount > 0 ? (
          <p className="mt-3 text-[11px] text-neutral-500">
            {fillMessage(t("field.organisation.certificatesLine"), {
              count: String(row.certificateCount),
            })}
            {row.revokedCertificateCount > 0
              ? ` · ${fillMessage(t("field.organisation.certificatesRevokedLine"), {
                  count: String(row.revokedCertificateCount),
                })}`
              : null}
          </p>
        ) : null}

        {row.descriptionExcerpt ? (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
            {row.descriptionExcerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-6 flex flex-col gap-2 border-t border-neutral-900/[0.05] pt-5">
          <Link
            href={row.href}
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            {t("field.organisation.viewProfile")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="text-center text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
          >
            {t("field.organisation.link.verifyHub")}
          </Link>
        </div>
      </div>
    </article>
  );
}
