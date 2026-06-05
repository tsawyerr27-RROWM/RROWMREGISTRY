"use client";

import Link from "next/link";

import type { CreativePresenceGallery } from "@/lib/field-creative-presence";
import {
  fieldExplorerCreativesHref,
  fieldExplorerRecordsHref,
  fieldVerifyHref,
} from "@/lib/field-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  gallery: CreativePresenceGallery | null;
  showOrganisationSection: boolean;
  practiceExplorerHref: string | null;
};

export function CreativePresenceDiscoverySection({
  gallery,
  showOrganisationSection,
  practiceExplorerHref,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <section className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        {t("field.creative.discoveryHeading")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {t("field.creative.discoveryLede")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={fieldExplorerRecordsHref()}
          className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.creative.link.recordExplorer")}
        </Link>
        <Link
          href={fieldExplorerCreativesHref()}
          className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.creative.link.creativeExplorer")}
        </Link>
        {showOrganisationSection && gallery?.href ? (
          <Link
            href={gallery.href}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.creative.link.organisation")}
          </Link>
        ) : null}
        {practiceExplorerHref ? (
          <Link
            href={practiceExplorerHref}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.creative.link.practiceExplorer")}
          </Link>
        ) : null}
        <Link
          href={fieldVerifyHref()}
          className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          {t("field.creative.link.verifyHub")}
        </Link>
      </div>
    </section>
  );
}
