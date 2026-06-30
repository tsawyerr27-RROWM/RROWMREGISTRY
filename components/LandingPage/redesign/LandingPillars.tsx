"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingMotion } from "@/hooks/useLandingMotion";
import type { MessageKey } from "@/lib/locale-messages";
import { landingEase, landingMotion, landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const PILLARS = [
  {
    id: "authorship",
    titleKey: "landing.v2.pillars.authorship.title" as MessageKey,
    bodyKey: "landing.v2.pillars.authorship.body" as MessageKey,
    detailKey: "landing.v2.pillars.authorship.detail" as MessageKey,
  },
  {
    id: "stewardship",
    titleKey: "landing.v2.pillars.stewardship.title" as MessageKey,
    bodyKey: "landing.v2.pillars.stewardship.body" as MessageKey,
    detailKey: "landing.v2.pillars.stewardship.detail" as MessageKey,
  },
  {
    id: "chronology",
    titleKey: "landing.v2.pillars.chronology.title" as MessageKey,
    bodyKey: "landing.v2.pillars.chronology.body" as MessageKey,
    detailKey: "landing.v2.pillars.chronology.detail" as MessageKey,
  },
] as const;

export function LandingPillars() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useLandingMotion();
  const [active, setActive] = useState<string>("authorship");

  return (
    <LandingSection id="landing-pillars" tone="bone">
      <LandingContainer>
        <LandingReveal variant="file">
          <h2
            className={`${landingType.display} max-w-[16ch] text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] text-[var(--landing-charcoal)]`}
          >
            {t("landing.v2.pillars.title")}
          </h2>
        </LandingReveal>

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-3 lg:gap-10 xl:gap-14">
          {PILLARS.map((pillar, i) => {
            const isActive = active === pillar.id;
            return (
              <LandingReveal key={pillar.id} variant="append" delay={i * landingMotion.stagger}>
                <motion.button
                  type="button"
                  className={`landing-pillar-item w-full text-left ${
                    isActive ? "landing-pillar-item--active" : ""
                  }`}
                  onClick={() => setActive(pillar.id)}
                  onFocus={() => setActive(pillar.id)}
                  whileHover={motionEnabled ? { opacity: 0.92 } : undefined}
                  transition={{ duration: 0.65, ease: landingEase }}
                  aria-pressed={isActive}
                >
                  <h3
                    className={`${landingType.display} text-[clamp(1.55rem,2.4vw,1.9rem)] leading-[1.1] text-[var(--landing-charcoal)]`}
                  >
                    {t(pillar.titleKey)}
                  </h3>
                  <p className={`${landingType.body} mt-5`}>{t(pillar.bodyKey)}</p>
                  <motion.p
                    className={`${landingType.body} text-[15px] text-[var(--landing-charcoal-soft)]`}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                      marginTop: isActive ? 20 : 0,
                    }}
                    transition={{ duration: 0.55, ease: landingEase }}
                  >
                    {isActive ? t(pillar.detailKey) : null}
                  </motion.p>
                </motion.button>
              </LandingReveal>
            );
          })}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
