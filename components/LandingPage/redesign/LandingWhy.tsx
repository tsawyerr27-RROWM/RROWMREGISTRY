"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const REASONS = [
  { titleKey: "landing.v2.why.r1.title" as MessageKey, bodyKey: "landing.v2.why.r1.body" as MessageKey },
  { titleKey: "landing.v2.why.r2.title" as MessageKey, bodyKey: "landing.v2.why.r2.body" as MessageKey },
  { titleKey: "landing.v2.why.r3.title" as MessageKey, bodyKey: "landing.v2.why.r3.body" as MessageKey },
  { titleKey: "landing.v2.why.r4.title" as MessageKey, bodyKey: "landing.v2.why.r4.body" as MessageKey },
] as const;

export function LandingWhy() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-why" tone="bone">
      <LandingContainer>
        <div className="grid gap-20 lg:grid-cols-12 lg:gap-24">
          <LandingReveal className="lg:col-span-4" variant="stamp">
            <h2
              className={`${landingType.display} text-[clamp(2rem,3.2vw,2.85rem)] leading-[1.08] text-[var(--landing-charcoal)]`}
            >
              {t("landing.v2.why.title")}
            </h2>
            <p className={`${landingType.lead} mt-8 max-w-sm`}>{t("landing.v2.why.lead")}</p>
          </LandingReveal>

          <div className="space-y-12 lg:col-span-7 lg:col-start-6 lg:space-y-14">
            {REASONS.map((reason, i) => (
              <LandingReveal key={reason.titleKey} variant="append" delay={i * 0.06}>
                <article className="landing-trust-row">
                  <span
                    className={`landing-accent-bar landing-accent-bar--${
                      i % 3 === 0 ? "cobalt" : i % 3 === 1 ? "lime" : "ember"
                    }`}
                    aria-hidden
                  />
                  <div>
                  <h3
                    className={`${landingType.display} text-[1.4rem] leading-snug text-[var(--landing-charcoal)] md:text-[1.5rem]`}
                  >
                    {t(reason.titleKey)}
                  </h3>
                  <p className={`${landingType.body} mt-4 max-w-prose`}>
                    {t(reason.bodyKey)}
                  </p>
                  </div>
                </article>
              </LandingReveal>
            ))}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
