"use client";

import { narrativeLayout } from "@/styles/narrative-layout";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";

/**
 * Context chapter — Quant-inspired “the world has changed / the system lags” rhythm,
 * adapted to registry infrastructure without hype.
 */
export function LandingThesisBand() {
  const { t } = useLocalePreferences();
  const cards: { titleKey: MessageKey; bodyKey: MessageKey }[] = [
    {
      titleKey: "landing.thesis.card1Title",
      bodyKey: "landing.thesis.card1Body",
    },
    {
      titleKey: "landing.thesis.card2Title",
      bodyKey: "landing.thesis.card2Body",
    },
    {
      titleKey: "landing.thesis.card3Title",
      bodyKey: "landing.thesis.card3Body",
    },
  ];

  return (
    <section
      className="rrowm-atmo-section--warm"
      aria-labelledby="landing-context-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rrowm-atmo-section__hairline"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} py-20 md:py-28`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2
              id="landing-context-heading"
              className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
            >
              {t("landing.thesis.title")}
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-1">
            <div className="grid gap-4 rounded-3xl border border-[color:var(--rrowm-atmo-rim)] bg-gradient-to-br from-[color-mix(in_srgb,var(--rrowm-atmo-panel)_88%,transparent)] via-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_82%,transparent)] to-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_78%,transparent)] p-7 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-8 md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_75%,rgb(55_48_43))] md:hover:bg-gradient-to-br md:from-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_90%,transparent)] md:via-[color-mix(in_srgb,var(--rrowm-atmo-panel)_86%,transparent)] md:to-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_80%,transparent)] md:hover:shadow-[0_28px_76px_-50px_rgba(15,23,42,0.2)]">
              {cards.map((x) => (
                <div
                  key={x.titleKey}
                  className="rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_90%,transparent)] px-5 py-4 transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_78%,rgb(55_48_43))] md:hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_88%,transparent)] md:hover:shadow-[0_14px_44px_-36px_rgba(15,23,42,0.12)]"
                >
                  <p className="text-[14px] font-medium text-neutral-900">
                    {t(x.titleKey)}
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.7] text-neutral-600">
                    {t(x.bodyKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

