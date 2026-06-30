"use client";

import Link from "next/link";

import { LandingContainer, LandingSection } from "@/components/LandingPage/redesign/LandingSection";
import { LandingReveal } from "@/components/LandingPage/redesign/LandingReveal";
import { LandingPageShell } from "@/components/LandingPage/redesign/LandingPageShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerHref, fieldExplorerRecordsHref } from "@/lib/field-nav";
import { landingType } from "@/styles/landing-redesign";

const PILLAR_KEYS = [
  { title: "about.v2.pillar.authorship.title", body: "about.v2.pillar.authorship.body" },
  { title: "about.v2.pillar.stewardship.title", body: "about.v2.pillar.stewardship.body" },
  { title: "about.v2.pillar.chronology.title", body: "about.v2.pillar.chronology.body" },
] as const;

const ECOSYSTEM_KEYS = [
  { title: "about.v2.ecosystem.studio.title", body: "about.v2.ecosystem.studio.body", href: "/studio/creative" },
  { title: "about.v2.ecosystem.registry.title", body: "about.v2.ecosystem.registry.body", href: fieldExplorerRecordsHref() },
  { title: "about.v2.ecosystem.field.title", body: "about.v2.ecosystem.field.body", href: fieldExplorerHref() },
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
          <LandingReveal variant="file">
            <h2 className={`${landingType.display} max-w-[16ch] text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.08] text-[var(--landing-charcoal)]`}>
              {t("about.v2.ecosystem.title")}
            </h2>
          </LandingReveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {ECOSYSTEM_KEYS.map((item, i) => (
              <LandingReveal key={item.title} variant="append" delay={i * 0.06}>
                <Link
                  href={item.href}
                  className="group block border border-[var(--landing-border)] bg-white/80 p-7 transition hover:border-[var(--landing-charcoal-muted)]/30"
                >
                  <h3 className={`${landingType.display} text-xl text-[var(--landing-charcoal)] group-hover:text-[var(--landing-cobalt)]`}>
                    {t(item.title)}
                  </h3>
                  <p className={`${landingType.body} mt-4`}>{t(item.body)}</p>
                </Link>
              </LandingReveal>
            ))}
          </div>
          <LandingReveal className="mt-14" variant="stamp">
            <Link href="/get-started" className="landing-cta-primary landing-cta-primary--signal">
              {t("nav.takePart")}
            </Link>
          </LandingReveal>
        </LandingContainer>
      </LandingSection>
    </LandingPageShell>
  );
}
