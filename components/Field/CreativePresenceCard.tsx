"use client";

import Link from "next/link";

import { FieldCreativePracticeChips } from "@/components/Field/FieldCreativePracticeChips";
import type { CreativeExplorerRow } from "@/lib/fetch-creative-explorer-list";
import { fieldVerifyHref } from "@/lib/field-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

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
    <article
      className={`group flex h-full flex-col overflow-hidden ${registryV2.surface.filing} ${registryV2.motion.hover}`}
    >
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h2 className={`${registryV2.type.sectionTitle} text-xl md:text-[1.45rem]`}>
          <Link href={row.href} className="transition hover:text-[var(--v2-cool-grey)]">
            {row.displayName}
          </Link>
        </h2>

        {summary ? (
          <div className={`${registryV2.surface.metadataField} mt-5`}>
            <p className={registryV2.type.metaLabel}>{t("field.creative.registryEvidence")}</p>
            <p className={`${registryV2.type.monoId} mt-2 text-[11px] leading-relaxed`}>
              {summary}
            </p>
          </div>
        ) : null}

        {row.practices.length > 0 ? (
          <div className="mt-4">
            <FieldCreativePracticeChips practices={row.practices} limit={3} />
          </div>
        ) : null}

        {row.bioExcerpt ? (
          <p className={`${registryV2.type.metaValue} mt-4 flex-1 text-sm`}>{row.bioExcerpt}</p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--v2-border)] pt-5">
          <Link
            href={row.href}
            className="v2-cta-primary inline-flex !min-h-0 justify-center px-4 py-2.5 text-[10px]"
          >
            {t("field.creative.viewProfile")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className={`${registryV2.type.monoId} text-center hover:text-[var(--v2-ink)]`}
          >
            {t("field.creative.link.verifyHub")}
          </Link>
        </div>
      </div>
    </article>
  );
}
