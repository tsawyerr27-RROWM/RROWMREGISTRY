"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import { LandingArtworkTile, LANDING_ARTWORK_TITLE_KEYS } from "./LandingArtworkTile";
import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const PILLARS: {
  titleKey: MessageKey;
  bodyKey: MessageKey;
  accent: "cobalt" | "lime" | "ember" | "cobalt";
}[] = [
  { titleKey: "landing.v2.trust.r1.title", bodyKey: "landing.v2.trust.r1.body", accent: "cobalt" },
  { titleKey: "landing.v2.trust.r2.title", bodyKey: "landing.v2.trust.r2.body", accent: "lime" },
  { titleKey: "landing.v2.trust.r3.title", bodyKey: "landing.v2.trust.r3.body", accent: "ember" },
  { titleKey: "landing.v2.trust.r4.title", bodyKey: "landing.v2.trust.r4.body", accent: "cobalt" },
];

export function LandingTrust() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-trust" tone="ivory">
      <LandingContainer>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <LandingReveal variant="stamp" className="lg:col-span-5">
            <div className="landing-trust-archive flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <LandingArtworkTile
                  variant="lime"
                  title={t(LANDING_ARTWORK_TITLE_KEYS.lime)}
                  aspect="3/4"
                />
                <LandingArtworkTile
                  variant="cobalt"
                  title={t(LANDING_ARTWORK_TITLE_KEYS.cobalt)}
                  aspect="3/4"
                />
              </div>
              <div className="landing-plane landing-plane--certificate relative p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={landingType.signal}>{t("landing.v2.visual.layerCertificate")}</p>
                    <p className={`${landingType.display} mt-2 text-xl text-[var(--landing-charcoal)]`}>
                      {t("landing.v2.showcase.recordTitle")}
                    </p>
                    <p className={`${landingType.meta} mt-2 normal-case tracking-[0.04em]`}>
                      {t("landing.v2.trust.archiveLabel")}
                    </p>
                  </div>
                  <div className="landing-emboss-stamp shrink-0 scale-75">
                    <span className="landing-emboss-stamp__ring" />
                    <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-[var(--landing-ember)]">
                      ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </LandingReveal>

          <div className="lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
            <LandingReveal variant="file">
              <h2
                className={`${landingType.display} max-w-[14ch] text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] text-[var(--landing-charcoal)]`}
              >
                {t("landing.v2.trust.title")}
              </h2>
              <p className={`${landingType.lead} mt-6 max-w-prose`}>
                {t("landing.v2.trust.lead")}
              </p>
            </LandingReveal>

            <div className="mt-14 space-y-10 lg:mt-16">
              {PILLARS.map((item, i) => (
                <LandingReveal key={item.titleKey} variant="append" delay={i * 0.08}>
                  <article className="landing-trust-row">
                    <span
                      className={`landing-accent-bar landing-accent-bar--${item.accent}`}
                      aria-hidden
                    />
                    <div>
                      <h3
                        className={`${landingType.display} text-[1.35rem] leading-snug text-[var(--landing-charcoal)] md:text-[1.45rem]`}
                      >
                        {t(item.titleKey)}
                      </h3>
                      <p className={`${landingType.body} mt-3 max-w-prose`}>
                        {t(item.bodyKey)}
                      </p>
                    </div>
                  </article>
                </LandingReveal>
              ))}
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
