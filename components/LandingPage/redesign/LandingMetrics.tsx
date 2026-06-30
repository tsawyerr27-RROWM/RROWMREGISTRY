"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingPublicStats } from "@/hooks/useLandingPublicStats";

import { LandingStatValue } from "./LandingStatValue";
import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";
import { landingType } from "@/styles/landing-redesign";

const METRIC_KEYS = [
  {
    stat: "worksRegistered" as const,
    labelKey: "landing.v2.metrics.live.works" as const,
  },
  {
    stat: "artistsOnboarded" as const,
    labelKey: "landing.v2.metrics.live.artists" as const,
  },
  {
    stat: "valueFilings" as const,
    labelKey: "landing.v2.metrics.live.value" as const,
  },
  {
    stat: "provenanceEvents" as const,
    labelKey: "landing.v2.metrics.live.provenance" as const,
  },
] as const;

export function LandingMetrics() {
  const { t } = useLocalePreferences();
  const { stats, loading } = useLandingPublicStats();

  return (
    <LandingSection id="landing-metrics" tone="ivory" pad="tight">
      <LandingContainer>
        <LandingReveal>
          <h2
            className={`${landingType.display} max-w-[18ch] text-[clamp(1.9rem,3vw,2.65rem)] leading-[1.1] text-[var(--landing-charcoal)]`}
          >
            {t("landing.v2.metrics.title")}
          </h2>
        </LandingReveal>

        <dl className="mt-16 grid gap-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-12">
          {METRIC_KEYS.map((metric, i) => (
            <LandingReveal key={metric.labelKey} delay={i * 0.06}>
              <div className="landing-metric-cell">
                <dt>
                  <LandingStatValue
                    value={stats?.[metric.stat] ?? null}
                    loading={loading}
                    className={`${landingType.display} block text-[clamp(2.5rem,4.5vw,3.25rem)] leading-none text-[var(--landing-charcoal)]`}
                  />
                </dt>
                <dd className={`${landingType.meta} mt-5 normal-case tracking-[0.06em]`}>
                  {t(metric.labelKey)}
                </dd>
              </div>
            </LandingReveal>
          ))}
        </dl>
      </LandingContainer>
    </LandingSection>
  );
}
