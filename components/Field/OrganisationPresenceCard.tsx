"use client";

import Link from "next/link";

import type { OrganisationExplorerRow } from "@/lib/fetch-organisation-explorer-list";
import { fieldVerifyHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

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
    <article
      className={`group flex h-full flex-col overflow-hidden ${registryV2.surface.filing} ${registryV2.motion.hover}`}
    >
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h2 className={`${registryV2.type.sectionTitle} text-xl md:text-[1.45rem]`}>
          <Link href={row.href} className="transition hover:text-[var(--v2-cool-grey)]">
            {row.name}
          </Link>
        </h2>

        {summary ? (
          <div className={`${registryV2.surface.metadataField} mt-5`}>
            <p className={registryV2.type.metaLabel}>{t("field.organisation.registryEvidence")}</p>
            <p className={`${registryV2.type.monoId} mt-2 text-[11px] leading-relaxed`}>
              {summary}
            </p>
          </div>
        ) : null}

        {row.location ? (
          <p className={`${registryV2.type.metaValue} mt-4 text-sm`}>{row.location}</p>
        ) : null}

        {row.certificateCount > 0 ? (
          <p className={`${registryV2.type.monoId} mt-3`}>
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
          <p className={`${registryV2.type.metaValue} mt-4 flex-1 text-sm`}>
            {row.descriptionExcerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--v2-border)] pt-5">
          <Link
            href={row.href}
            className="v2-cta-primary inline-flex !min-h-0 justify-center px-4 py-2.5 text-[10px]"
          >
            {t("field.organisation.viewProfile")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className={`${registryV2.type.monoId} text-center hover:text-[var(--v2-ink)]`}
          >
            {t("field.organisation.link.verifyHub")}
          </Link>
        </div>
      </div>
    </article>
  );
}
