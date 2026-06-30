"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingMotion } from "@/hooks/useLandingMotion";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { landingEase, landingMotion, landingType } from "@/styles/landing-redesign";

import { LandingHeroLiving } from "./LandingHeroLiving";
import { LandingContainer } from "./LandingSection";

export function LandingHero() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useLandingMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.35]);
  const copyY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  const title = t("landing.v2.hero.title");
  const words = useMemo(
    () => title.split(/\s+/).filter(Boolean),
    [title]
  );
  const accentIndex = Math.max(0, words.findIndex((w) => /better|records|cultural/i.test(w)));

  return (
    <section
      ref={ref}
      className="landing-hero landing-hero--living relative isolate min-h-[165vh] overflow-x-clip"
      aria-labelledby="landing-hero-heading"
    >
      <div className="landing-hero-projection pointer-events-none absolute right-0 top-[8%] z-0 h-[50%] w-[min(52vw,32rem)]" aria-hidden />
      <div className="landing-paper-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.14]" aria-hidden />

      <div className="sticky top-0 z-10 flex min-h-[100svh] items-center pt-20 sm:pt-24 md:pt-28">
        <LandingContainer className="w-full">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-16">
            <motion.div style={{ opacity: copyOpacity, y: copyY }}>
              <p className={`${landingType.signal} mb-8 md:mb-10`}>
                {t("landing.v2.hero.eyebrow")}
              </p>

              <h1
                id="landing-hero-heading"
                className={`${landingType.kinetic} max-w-[14ch] text-[clamp(3rem,8vw,5.75rem)] leading-[0.96] text-[var(--landing-charcoal)]`}
              >
                {words.map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    className={`mr-[0.26em] inline-block last:mr-0 ${
                      i === accentIndex ? "text-[var(--landing-cobalt)]" : ""
                    }`}
                    initial={motionEnabled ? { opacity: 0, y: 32 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: landingMotion.heroDuration,
                      delay: 0.08 + i * 0.06,
                      ease: landingEase,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                className={`${landingType.lead} mt-10 max-w-[28rem] md:mt-12`}
                initial={motionEnabled ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: landingMotion.heroDuration,
                  delay: 0.55,
                  ease: landingEase,
                }}
              >
                {t("landing.v2.hero.subtext")}
              </motion.p>

              <motion.nav
                className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 md:mt-14"
                aria-label="Primary actions"
                initial={motionEnabled ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.75, ease: landingEase }}
              >
                <Link href="/get-started" className="landing-cta-primary landing-cta-primary--signal">
                  {t("landing.v2.hero.register")}
                </Link>
                <Link
                  href={fieldExplorerRecordsHref()}
                  className="landing-cta-secondary"
                >
                  {t("landing.v2.hero.explore")}
                </Link>
              </motion.nav>

              <p className={`${landingType.meta} mt-14 hidden max-w-[16rem] normal-case tracking-[0.06em] text-[var(--landing-charcoal-muted)] lg:block`}>
                {t("landing.v2.hero.assemblyHint")}
              </p>
            </motion.div>

            <div className="w-full justify-self-stretch lg:justify-self-end">
              <LandingHeroLiving progress={scrollYProgress} />
            </div>
          </div>
        </LandingContainer>
      </div>
    </section>
  );
}
