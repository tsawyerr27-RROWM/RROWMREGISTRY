"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { FieldOpportunityCard } from "@/lib/fetch-field-opportunities-list";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";
import { semanticStampClass } from "@/lib/registry-semantic-signals";

export type OpportunityExplorerCardVariant = "featured" | "standard";

type Props = {
  row: FieldOpportunityCard;
  variant?: OpportunityExplorerCardVariant;
  accentIndex?: number;
};

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
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
  const stampTone =
    tone === "open"
      ? "certification"
      : tone === "closed"
        ? "correction"
        : tone === "verified"
          ? "certification"
          : "registration";

  return (
    <span className={semanticStampClass(stampTone)}>
      {children}
    </span>
  );
}

export function OpportunityExplorerCard({
  row,
  variant = "standard",
}: Props) {
  const { t } = useLocalePreferences();
  const deadline = formatDeadline(row.closesAt);
  const isFeatured = variant === "featured";

  const deadlineLine = deadline
    ? fillMessage(t("field.opportunities.closesOn"), { date: deadline })
    : t("field.opportunities.deadlineNotSet");

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden ${registryV2.surface.filing} ${registryV2.motion.hover} ${
        isFeatured ? "registry-filing-sheet--major v2-shadow-paper" : ""
      }`}
    >
      <div
        className={`relative flex flex-1 flex-col ${
          isFeatured ? "p-8 md:p-10 lg:p-12" : "p-6 md:p-7 lg:p-8"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <QuietBadge tone={row.acceptingResponses ? "open" : "closed"}>
            {row.acceptingResponses
              ? t("field.opportunities.windowOpen")
              : t("field.opportunities.windowClosed")}
          </QuietBadge>
          <QuietBadge>{row.briefTypeLabel}</QuietBadge>
          {row.sectorLabel ? (
            <span
              className={`${registryV2.type.monoId} text-[var(--v2-ink-muted)] ${
                isFeatured ? "md:ml-auto" : ""
              }`}
            >
              {row.sectorLabel}
            </span>
          ) : null}
        </div>

        <div className={isFeatured ? "mt-auto pt-10 md:pt-12" : "mt-auto pt-8"}>
          <h2
            className={`${registryV2.type.sectionTitle} transition group-hover:text-[var(--v2-cool-grey)] ${
              isFeatured
                ? "text-[2rem] md:text-[2.75rem] lg:text-[3rem]"
                : "text-[1.45rem] md:text-[1.65rem]"
            }`}
          >
            <Link href={row.href} className="before:absolute before:inset-0">
              {row.title}
            </Link>
          </h2>

          <p
            className={`${registryV2.type.metaValue} mt-4 font-medium ${
              isFeatured ? "text-base md:text-lg" : "text-sm md:text-[15px]"
            }`}
          >
            {row.organisationName}
            {row.organisationVerified ? (
              <span className="ml-2 inline-flex align-middle">
                <QuietBadge tone="verified">
                  {t("field.opportunities.verifiedOrganisation")}
                </QuietBadge>
              </span>
            ) : null}
          </p>

          <p className={`${registryV2.type.monoId} mt-3`}>{deadlineLine}</p>

          {row.descriptionExcerpt ? (
            <p
              className={`${registryV2.type.metaValue} mt-4 ${
                isFeatured ? "line-clamp-4 max-w-3xl text-base" : "line-clamp-2 text-sm"
              }`}
            >
              {row.descriptionExcerpt}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
