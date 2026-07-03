"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const CAPABILITIES: {
  id: string;
  titleKey: MessageKey;
  code: string;
  dotClass: string;
}[] = [
  {
    id: "catalogue",
    titleKey: "landing.v2.os.registry.title",
    code: "CAT",
    dotClass: "bg-[var(--landing-cobalt)]",
  },
  {
    id: "deals",
    titleKey: "landing.v2.os.field.title",
    code: "DEA",
    dotClass: "bg-[var(--v2-ember-stamp,#c45c26)]",
  },
  {
    id: "ownership",
    titleKey: "landing.v2.os.studio.title",
    code: "OWN",
    dotClass: "bg-[var(--landing-lime)]",
  },
  {
    id: "verification",
    titleKey: "landing.v2.os.deals.title",
    code: "VER",
    dotClass: "bg-[var(--v2-seal-ink,#1a1a1a)]",
  },
];

export function LandingOperatingSystem() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-operating-system" tone="ivory">
      <LandingContainer>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-5">
            <LandingReveal variant="file">
              <p className={landingType.signal}>{t("landing.v2.os.eyebrow")}</p>
              <h2
                className={`${landingType.display} mt-6 max-w-[16ch] text-[clamp(2rem,3.6vw,3rem)] leading-[1.06] text-[var(--landing-charcoal)]`}
              >
                {t("landing.v2.os.title")}
              </h2>
              <p className={`${landingType.lead} mt-8 max-w-md`}>{t("landing.v2.os.lead")}</p>
              <div className="mt-10">
                <Link
                  href="/studio/creative"
                  className="landing-cta-primary landing-cta-primary--signal"
                >
                  {t("landing.v2.os.cta")}
                </Link>
              </div>
            </LandingReveal>
          </div>

          <LandingReveal className="lg:col-span-6 lg:col-start-7" variant="stamp">
            <div className="landing-plane relative overflow-hidden p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--landing-border)] pb-5">
                <div>
                  <p className={landingType.signal}>{t("landing.v2.os.hubLabel")}</p>
                  <p
                    className={`${landingType.display} mt-2 text-2xl leading-tight text-[var(--landing-charcoal)]`}
                  >
                    {t("landing.v2.os.title")}
                  </p>
                </div>
                <span className="v2-type-mono shrink-0 rounded-full border border-[var(--landing-border)] px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--landing-charcoal-soft)]">
                  HUB
                </span>
              </div>

              <ul className="mt-5 space-y-1.5">
                {CAPABILITIES.map((cap, index) => (
                  <li
                    key={cap.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-500 hover:bg-black/[0.03]"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${cap.dotClass}`} aria-hidden />
                    <span
                      className={`${landingType.display} flex-1 truncate text-[15px] text-[var(--landing-charcoal)]`}
                    >
                      {t(cap.titleKey)}
                    </span>
                    <span className="v2-type-mono shrink-0 text-[10px] uppercase tracking-[0.16em] text-[var(--landing-charcoal-soft)]">
                      {cap.code}
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-2 border-t border-[var(--landing-border)] pt-4">
                <span className="landing-accent-bar landing-accent-bar--cobalt !min-h-0 h-3" aria-hidden />
                <span className="v2-type-mono text-[10px] uppercase tracking-[0.16em] text-[var(--landing-charcoal-soft)]">
                  {t("landing.v2.showcase.recordLabel")}
                </span>
              </div>
            </div>
          </LandingReveal>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
