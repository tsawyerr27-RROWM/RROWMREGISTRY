"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { HeroPigmentField } from "@/components/LandingPage/HeroPigmentField";
import { useMaxWidth767 } from "@/hooks/useMaxWidth767";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { narrativeControl } from "@/styles/system-design";

/**
 * Entry: full-viewport hero with local pigment field, typographic watermark, scroll depth.
 */
export default function HeroSection() {
  const { t } = useLocalePreferences();
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const narrow = useMaxWidth767();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  const contentYOutput = useMemo(
    () => (reduce ? ([0, 0] as const) : narrow ? ([0, -11] as const) : ([0, -18] as const)),
    [narrow, reduce]
  );
  const contentOpacityOutput = useMemo(
    () =>
      reduce
        ? ([1, 1, 1] as const)
        : narrow
          ? ([1, 1, 0.88] as const)
          : ([1, 1, 0.82] as const),
    [narrow, reduce]
  );
  const fieldOpacityOutput = useMemo(
    () =>
      reduce
        ? ([1, 1, 1] as const)
        : narrow
          ? ([1, 0.96, 0.78] as const)
          : ([1, 0.95, 0.72] as const),
    [narrow, reduce]
  );

  const contentY = useTransform(scrollYProgress, [0, 1], [...contentYOutput]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    [...contentOpacityOutput]
  );
  const fieldOpacity = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [...fieldOpacityOutput]
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: fieldOpacity }}
        aria-hidden
      >
        <HeroPigmentField variant="landing" bold chromatic />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[color-mix(in_srgb,var(--rrowm-base-soft)_90%,var(--rrowm-parchment)_10%)] via-[var(--rrowm-base-soft)]/32 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-6">
          <motion.div
            className="lg:col-span-7 lg:col-start-1"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <h1 className="mt-7 max-w-[min(100%,46rem)] font-serif text-[clamp(2.5rem,7.4vw,5.2rem)] font-normal leading-[0.985] tracking-[-0.02em] text-neutral-950 md:mt-8 lg:max-w-[min(100%,52rem)]">
              {t("landing.hero.title")}
            </h1>

            <p className="mt-10 max-w-[38rem] text-[15px] leading-[1.85] text-neutral-600 md:text-base md:leading-[1.85]">
              {t("landing.hero.lede")}
            </p>

            <nav
              className="mt-14 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 md:mt-16"
              aria-label="Primary actions"
            >
              <Link href="/registry" className={`${narrativeControl.primary} w-fit`}>
                {t("landing.hero.browseCatalogue")}
              </Link>
              <Link href="/get-started" className={`${narrativeControl.secondary} w-fit`}>
                {t("landing.hero.takePart")}
              </Link>
              <Link
                href="/about"
                className={`${narrativeControl.quietLink} w-fit sm:ml-2`}
              >
                {t("landing.hero.overview")}
              </Link>
            </nav>
          </motion.div>

          <div
            className="relative hidden min-h-[10rem] select-none lg:col-span-5 lg:col-start-8 lg:flex lg:flex-col lg:items-end lg:justify-end lg:pb-2"
            aria-hidden
          >
            <span className="font-serif text-[clamp(3.5rem,13.5vw,10.5rem)] font-light leading-[0.82] tracking-[-0.03em] text-neutral-950/[0.065]">
              Record
            </span>
            <span className="mt-6 block h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-neutral-300/60 to-neutral-300/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
