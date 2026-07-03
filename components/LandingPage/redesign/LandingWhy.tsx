"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOpportunitiesHref } from "@/lib/field-nav";
import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const FIELD_RECORDS: { code: string; titleKey: MessageKey }[] = [
  { code: "RR-2024-018", titleKey: "landing.v2.visual.artworkCobalt" },
  { code: "RR-2023-241", titleKey: "landing.v2.visual.artworkEmber" },
  { code: "RR-2024-077", titleKey: "landing.v2.visual.artworkLime" },
];

const OPPORTUNITY_PREVIEW: { code: string; labelKey: MessageKey }[] = [
  { code: "OPP-2026-04", labelKey: "studio.opportunities.briefType.directCommission" },
  { code: "OPP-2026-09", labelKey: "studio.opportunities.briefType.residencyAward" },
  { code: "OPP-2026-12", labelKey: "studio.opportunities.briefType.openCall" },
];

export function LandingWhy() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-why" tone="bone">
      <LandingContainer>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <LandingReveal variant="stamp" className="lg:col-span-5">
            <div className="landing-trust-archive flex flex-col gap-4">
              <div className="landing-plane landing-plane--record relative overflow-hidden p-5">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--landing-border)] pb-4">
                  <p className={landingType.signal}>{t("landing.v2.why.eyebrow")}</p>
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--landing-charcoal-soft)]">
                    discover
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-full border border-[var(--landing-border)] bg-white/70 px-3 py-2">
                  <span className="h-3 w-3 rounded-full border border-[var(--landing-charcoal-soft)]/50" aria-hidden />
                  <span className="h-1.5 w-24 rounded-full bg-[var(--landing-charcoal-soft)]/20" aria-hidden />
                </div>

                <ul className="mt-4 space-y-1">
                  {FIELD_RECORDS.map((rec) => (
                    <li
                      key={rec.code}
                      className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-500 hover:bg-black/[0.03]"
                    >
                      <span className="v2-type-mono shrink-0 text-[10px] tracking-[0.08em] text-[var(--landing-charcoal-soft)]">
                        {rec.code}
                      </span>
                      <span
                        className={`${landingType.display} flex-1 truncate text-[15px] text-[var(--landing-charcoal)]`}
                      >
                        {t(rec.titleKey)}
                      </span>
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--landing-ember)]/60 text-[8px] text-[var(--landing-ember)]"
                        aria-hidden
                      >
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="landing-plane landing-plane--record relative overflow-hidden p-5">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--landing-border)] pb-4">
                  <p className={landingType.signal}>{t("landing.v2.why.eyebrow")}</p>
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--landing-charcoal-soft)]">
                    open
                  </span>
                </div>
                <ul className="mt-4 space-y-1">
                  {OPPORTUNITY_PREVIEW.map((opp) => (
                    <li
                      key={opp.code}
                      className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-500 hover:bg-black/[0.03]"
                    >
                      <span className="v2-type-mono shrink-0 text-[10px] tracking-[0.08em] text-[var(--landing-charcoal-soft)]">
                        {opp.code}
                      </span>
                      <span
                        className={`${landingType.display} flex-1 truncate text-[15px] text-[var(--landing-charcoal)]`}
                      >
                        {t(opp.labelKey)}
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[var(--landing-lime)]"
                        aria-hidden
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </LandingReveal>

          <div className="lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
            <LandingReveal variant="file">
              <p className={landingType.signal}>{t("landing.v2.why.eyebrow")}</p>
              <h2
                className={`${landingType.display} mt-5 max-w-[14ch] text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] text-[var(--landing-charcoal)]`}
              >
                {t("landing.v2.why.title")}
              </h2>
              <p className={`${landingType.lead} mt-6 max-w-prose`}>{t("landing.v2.why.lead")}</p>
            </LandingReveal>

            <LandingReveal className="mt-10 lg:mt-12" variant="stamp">
              <div className="landing-plane relative overflow-hidden border-l-2 border-[var(--landing-lime)] p-6 sm:p-7">
                <p className="v2-type-mono text-[9px] uppercase tracking-[0.2em] text-[var(--landing-charcoal-soft)]">
                  {t("landing.v2.why.eyebrow")}
                </p>
                <h3
                  className={`${landingType.display} mt-3 text-[1.5rem] leading-tight text-[var(--landing-charcoal)]`}
                >
                  {t("landing.v2.why.opps.title")}
                </h3>
                <p className={`${landingType.body} mt-3 max-w-prose`}>
                  {t("landing.v2.why.opps.body")}
                </p>
                <div className="mt-6">
                  <Link
                    href={fieldOpportunitiesHref()}
                    className="landing-cta-primary landing-cta-primary--signal"
                  >
                    {t("landing.v2.why.opps.cta")}
                  </Link>
                </div>
              </div>
            </LandingReveal>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
