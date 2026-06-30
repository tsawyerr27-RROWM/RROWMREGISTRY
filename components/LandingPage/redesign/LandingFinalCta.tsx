"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

export function LandingFinalCta() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-cta" tone="espresso" pad="tight">
      <LandingContainer>
        <LandingReveal variant="stamp">
          <div className="relative grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="landing-signal-line absolute left-0 top-0 hidden h-[55%] w-px origin-top lg:block" aria-hidden />
            <div className="lg:col-span-7">
              <p className={`${landingType.signal} text-[var(--landing-lime)]`}>
                {t("landing.v2.cta.eyebrow")}
              </p>
              <h2
                className={`${landingType.display} mt-6 max-w-[14ch] text-[clamp(2.35rem,4.8vw,3.85rem)] leading-[1.02] text-[var(--landing-ivory)]`}
              >
                {t("landing.v2.cta.title")}
              </h2>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-[17px] leading-[1.7] text-white/55 md:text-lg">
                {t("landing.v2.cta.body")}
              </p>
              <nav
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
                aria-label="Closing actions"
              >
                <Link href="/get-started" className="landing-cta-primary landing-cta-primary--on-dark">
                  {t("landing.v2.hero.register")}
                </Link>
                <Link
                  href={fieldExplorerRecordsHref()}
                  className="landing-cta-secondary landing-cta-secondary--on-dark"
                >
                  {t("landing.v2.hero.explore")}
                </Link>
              </nav>
            </div>
          </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}
