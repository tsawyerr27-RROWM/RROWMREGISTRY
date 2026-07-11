"use client";

import Link from "next/link";

import {
  ExperienceEmptyState,
  ExperienceEmptyStateLink,
} from "@/components/ui/ExperienceEmptyState";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";

const CLAIM_OWNERSHIP_HREF = "/collector-studio/claim-ownership";

type Props = {
  title?: string;
  body?: string;
  className?: string;
};

/** Collector studio empty holdings — explanation, claim primary, registry secondary. */
export function CollectorHoldingsEmptyState({
  title,
  body,
  className = "",
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <ExperienceEmptyState
      className={className}
      title={title ?? t("collector.works.emptyTitle")}
      body={body ?? t("collector.works.emptyBody")}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ExperienceEmptyStateLink
            label={t("collector.empty.claimOwnership")}
            href={CLAIM_OWNERSHIP_HREF}
          />
          <Link
            href={fieldExplorerRecordsHref()}
            className="v2-cta-secondary inline-flex min-h-[44px] items-center px-6 py-3 text-xs"
          >
            {t("collector.empty.browseRegistry")}
          </Link>
        </div>
      }
    />
  );
}

export { CLAIM_OWNERSHIP_HREF };
