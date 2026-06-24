"use client";

import Link from "next/link";

import { FullBleed } from "@/components/LandingPage/FullBleed";
import { control } from "@/styles/system-design";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";

/** Workspace snapshot — calm, institutional (no “dashboard confetti”). */
function PortfolioCommandDeck() {
  return (
    <div
      className="pointer-events-none relative mx-auto w-full max-w-md select-none lg:mx-0"
      aria-hidden
    >
      <div className="absolute -inset-7 rounded-[2rem] bg-gradient-to-br from-stone-200/25 via-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_40%,transparent)] to-transparent blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_86%,transparent)] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.1)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_78%,transparent)] px-5 py-4">
          <span className="text-sm font-medium text-neutral-700">Studio</span>
          <span className="text-[11px] font-medium text-neutral-500">
            Linked to the catalogue
          </span>
        </div>

        <div className="space-y-4 p-6 md:p-7">
          <div className="grid gap-3">
            {[
              { k: "Represented works", v: "Each piece keeps one registry row" },
              { k: "Chronology", v: "Filings appear in order as continuity grows" },
              { k: "Transfers", v: "Custody steps stay on the same chronology" },
              { k: "Visibility", v: "Public catalogue plus authenticated views" },
            ].map((row) => (
              <div
                key={row.k}
                className="grid gap-1 rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_84%,transparent)] px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[14px] font-medium text-neutral-900">{row.k}</p>
                  <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--rrowm-atmo-rim)_55%,transparent)]" aria-hidden />
                </div>
                <p className="text-[15px] leading-[1.7] text-neutral-600">{row.v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_80%,rgb(249_250_251)_20%)] px-5 py-4">
            <p className="text-[14px] font-medium text-neutral-800">
              Status
            </p>
            <p className="mt-2 text-[15px] leading-[1.7] text-neutral-600">
              The studio view aligns with what the public catalogue shows per work.
              Private material stays on file behind sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioWorkspaceSection() {
  const { t } = useLocalePreferences();

  return (
    <section className="pb-28 pt-[4.5rem] md:pb-36 md:pt-24">
      <FullBleed className="rrowm-atmo-section--dusk relative overflow-hidden py-[4.5rem] md:py-24">
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-[min(26rem,66vh)] w-[min(52vw,24rem)] -translate-y-1/2 rounded-full bg-gradient-to-bl from-stone-200/20 via-slate-200/12 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
          <div className="lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-x-20 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-x-28">
            <header className="max-w-lg lg:sticky lg:top-28">
              <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-normal leading-[1.08] tracking-tight text-neutral-950">
                {t("landing.workspace.title")}
              </h2>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <Link href="/get-started" className={`${control.secondary} w-fit`}>
                  {t("landing.workspace.takePart")}
                </Link>
                <Link href={fieldExplorerRecordsHref()} className={`${control.quietLink} w-fit`}>
                  {t("landing.workspace.viewPublic")}
                </Link>
              </div>
            </header>

            <div className="relative mt-16 flex justify-center lg:mt-6 lg:justify-end lg:pr-4">
              <PortfolioCommandDeck />
            </div>
          </div>
        </div>
      </FullBleed>
    </section>
  );
}
