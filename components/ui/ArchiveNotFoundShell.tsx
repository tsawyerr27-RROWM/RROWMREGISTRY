"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { studioV2 } from "@/styles/studio-v2";

const linkClass =
  "v2-cta-secondary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-xs";

export function ArchiveNotFoundShell() {
  const { t } = useLocalePreferences();

  return (
    <main
      className={`${studioV2.scope} ds-page-environment flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 pt-24 sm:px-6 sm:pt-28`}
    >
      <div
        className={`${studioV2.surface.filingSheetMajor} studio-reveal w-full max-w-[min(100%,26rem)] px-6 py-8 sm:px-8 sm:py-9`}
      >
        <header className="border-b border-[var(--v2-border)] pb-6">
          <p className="v2-type-mono text-[9px] uppercase tracking-[0.22em] text-[var(--v2-ink-muted)]">
            {t("notFound.rail")}
          </p>
          <h1 className="mt-3 font-serif text-[1.65rem] font-normal leading-tight tracking-tight text-[var(--v2-ink)] sm:text-[1.85rem]">
            {t("notFound.title")}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--v2-ink-muted)] sm:text-[15px]">
            {t("notFound.body")}
          </p>
        </header>

        <div className="pt-6">
          <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
            {t("notFound.returnLabel")}
          </p>
          <nav
            className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap"
            aria-label={t("notFound.returnLabel")}
          >
            <Link href="/studio/creative" className={linkClass}>
              {t("footer.studio")}
            </Link>
            <Link href={fieldExplorerRecordsHref()} className={linkClass}>
              {t("footer.registry")}
            </Link>
            <Link href="/field" className={linkClass}>
              {t("footer.field")}
            </Link>
            <Link href="/" className={linkClass}>
              {t("notFound.home")}
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
