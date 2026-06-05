"use client";

import Link from "next/link";

import { narrativeLayout } from "@/styles/narrative-layout";
import { narrativeControl } from "@/styles/system-design";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";

/**
 * Closing band — same light surface rhythm as thesis / system flow.
 */
export function CTASection() {
  const { t } = useLocalePreferences();

  return (
    <section
      className="rrowm-atmo-section--blend"
      aria-labelledby="landing-cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rrowm-atmo-section__hairline"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} ${narrativeLayout.sectionPadYTight}`}>
        <h2
          id="landing-cta-heading"
          className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
        >
          {t("landing.cta.title")}
        </h2>

        <nav
          className="mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-4 text-[15px] font-medium md:mt-14"
          aria-label="Primary actions"
        >
          <Link
            href="/get-started"
            className={`${narrativeControl.ctaInline} pb-0.5`}
          >
            {t("landing.cta.takePart")}
          </Link>
          <Link href={fieldExplorerRecordsHref()} className={narrativeControl.ctaMuted}>
            {t("landing.cta.browseRegistry")}
          </Link>
        </nav>
      </div>
    </section>
  );
}
