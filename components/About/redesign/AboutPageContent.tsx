"use client";

import Link from "next/link";

import { LandingContainer, LandingSection } from "@/components/LandingPage/redesign/LandingSection";
import { LandingReveal } from "@/components/LandingPage/redesign/LandingReveal";
import { LandingPageShell } from "@/components/LandingPage/redesign/LandingPageShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { landingType } from "@/styles/landing-redesign";

const PILLAR_KEYS = [
  { title: "about.v2.pillar.authorship.title", body: "about.v2.pillar.authorship.body" },
  { title: "about.v2.pillar.stewardship.title", body: "about.v2.pillar.stewardship.body" },
  { title: "about.v2.pillar.chronology.title", body: "about.v2.pillar.chronology.body" },
] as const;

const INTEGRITY_KEYS = [
  {
    title: "about.v2.ecosystem.registry.title",
    body: "about.v2.ecosystem.registry.body",
    accent: "cobalt",
  },
  {
    title: "about.v2.ecosystem.field.title",
    body: "about.v2.ecosystem.field.body",
    accent: "lime",
  },
  {
    title: "about.v2.ecosystem.studio.title",
    body: "about.v2.ecosystem.studio.body",
    accent: "ember",
  },
  {
    title: "about.v2.ecosystem.deals.title",
    body: "about.v2.ecosystem.deals.body",
    accent: "cobalt",
  },
] as const;

export function AboutPageContent() {
  const { t } = useLocalePreferences();

  return (
    <LandingPageShell>
      <LandingSection id="about-mission" tone="bone" pad="tight">
        <LandingContainer>
          <LandingReveal variant="file">
            <p className={landingType.signal}>{t("about.v2.mission.eyebrow")}</p>
            <h1 className={`${landingType.kinetic} mt-8 max-w-[14ch] text-[clamp(2.5rem,6vw,4.25rem)] leading-[0.98] text-[var(--landing-charcoal)]`}>
              {t("about.v2.mission.title")}
            </h1>
            <p className={`${landingType.lead} mt-10 max-w-2xl`}>
              {t("about.v2.mission.body")}
            </p>
          </LandingReveal>
        </LandingContainer>
      </LandingSection>

      <LandingSection id="about-pillars" tone="ivory">
        <LandingContainer>
          <LandingReveal variant="stamp">
            <h2 className={`${landingType.display} max-w-[16ch] text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] text-[var(--landing-charcoal)]`}>
              {t("about.v2.pillars.title")}
            </h2>
          </LandingReveal>
          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {PILLAR_KEYS.map((pillar, i) => (
              <LandingReveal key={pillar.title} variant="append" delay={i * 0.06}>
                <article className="border-l-2 border-[var(--landing-cobalt)] pl-6">
                  <h3 className={`${landingType.display} text-[1.45rem] leading-snug text-[var(--landing-charcoal)]`}>
                    {t(pillar.title)}
                  </h3>
                  <p className={`${landingType.body} mt-4`}>{t(pillar.body)}</p>
                </article>
              </LandingReveal>
            ))}
          </div>
        </LandingContainer>
      </LandingSection>

      <LandingSection id="about-infrastructure" tone="bone">
        <LandingContainer>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <LandingReveal className="lg:col-span-5" variant="file">
              <h2 className={`${landingType.display} text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.08] text-[var(--landing-charcoal)]`}>
                {t("about.v2.infrastructure.title")}
              </h2>
            </LandingReveal>
            <LandingReveal className="lg:col-span-7" variant="append">
              <p className={`${landingType.lead} max-w-prose`}>{t("about.v2.infrastructure.body")}</p>
            </LandingReveal>
          </div>
        </LandingContainer>
      </LandingSection>

      <LandingSection id="about-why" tone="espresso" pad="tight">
        <LandingContainer>
          <LandingReveal variant="stamp">
            <h2 className={`${landingType.display} max-w-[14ch] text-[clamp(2rem,3.6vw,3rem)] leading-[1.06] text-[var(--landing-ivory)]`}>
              {t("about.v2.why.title")}
            </h2>
            <p className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-white/60 md:text-lg">
              {t("about.v2.why.body")}
            </p>
          </LandingReveal>
        </LandingContainer>
      </LandingSection>

      <LandingSection id="about-ecosystem" tone="bone">
        <LandingContainer>
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-10 xl:gap-16">
            <div className="lg:col-span-5">
              <LandingReveal variant="file">
                <p className={landingType.signal}>{t("about.v2.ecosystem.eyebrow")}</p>
                <h2 className={`${landingType.display} mt-6 max-w-[15ch] text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.08] text-[var(--landing-charcoal)]`}>
                  {t("about.v2.ecosystem.title")}
                </h2>
                <p className={`${landingType.lead} mt-8 max-w-md`}>
                  {t("about.v2.ecosystem.lead")}
                </p>
              </LandingReveal>

              <LandingReveal className="mt-10" variant="stamp">
                <div className="landing-plane landing-plane--certificate relative overflow-hidden p-6">
                  <p className="v2-type-mono text-[9px] uppercase tracking-[0.22em] text-[var(--landing-charcoal-soft)]">
                    SHA-256 · canonical digest
                  </p>
                  <p className="v2-type-mono mt-3 break-all text-[12px] leading-[1.7] text-[var(--landing-charcoal-muted)]">
                    9f2c7a1e8b04d6f3a51c0e9d47b2fa88c31e6705ad9e4c22f18b0a3d7e5c1904
                  </p>
                  <div className="mt-5 flex items-center gap-2 border-t border-[var(--landing-border)] pt-4">
                    <span
                      className="landing-accent-bar landing-accent-bar--cobalt !min-h-0 h-3"
                      aria-hidden
                    />
                    <span className="v2-type-mono text-[10px] uppercase tracking-[0.16em] text-[var(--landing-charcoal-soft)]">
                      one byte changed · fingerprint breaks
                    </span>
                  </div>
                </div>
              </LandingReveal>
            </div>

            <div className="space-y-10 lg:col-span-6 lg:col-start-7 lg:space-y-12">
              {INTEGRITY_KEYS.map((item, i) => (
                <LandingReveal key={item.title} variant="append" delay={i * 0.06}>
                  <article className="landing-trust-row">
                    <span
                      className={`landing-accent-bar landing-accent-bar--${item.accent}`}
                      aria-hidden
                    />
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="v2-type-mono text-[10px] uppercase tracking-[0.2em] text-[var(--landing-charcoal-soft)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className={`${landingType.display} text-[1.4rem] leading-snug text-[var(--landing-charcoal)] md:text-[1.5rem]`}>
                          {t(item.title)}
                        </h3>
                      </div>
                      <p className={`${landingType.body} mt-3 max-w-prose`}>{t(item.body)}</p>
                    </div>
                  </article>
                </LandingReveal>
              ))}

              <LandingReveal variant="stamp">
                <Link href="/get-started" className="landing-cta-primary landing-cta-primary--signal">
                  {t("nav.takePart")}
                </Link>
              </LandingReveal>
            </div>
          </div>
        </LandingContainer>
      </LandingSection>
    </LandingPageShell>
  );
}
