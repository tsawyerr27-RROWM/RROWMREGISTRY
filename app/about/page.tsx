"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import {
  AmbientNarrativeField,
  CTASection,
  HeroPigmentField,
  JourneyProgress,
  MotionReveal,
  ScrollAtmosphere,
  ScrollInvitation,
  SectionFadeDivider,
} from "@/components/LandingPage";
import {
  NARRATIVE_PAGE_ENTER_DURATION_S,
  NARRATIVE_PAGE_ENTER_Y,
  narrativeLayout,
  narrativeEase,
} from "@/styles/narrative-layout";
import { AboutDigestTabs } from "@/components/About/AboutDigestTabs";
import { AboutPrinciplesChapter } from "@/components/About/AboutPrinciplesChapter";

const gutter = narrativeLayout.gutter;

export default function AboutPage() {
  const reduceMotion = useReducedMotion();
  const introRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  const introY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -14]
  );

  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    reduceMotion ? [1, 1, 1] : [1, 1, 0.84]
  );

  const introFieldOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1, 0.78]
  );

  return (
    <div className="ds-page-environment relative min-h-[100dvh] overflow-x-clip text-neutral-900 selection:bg-neutral-900/10">
      <div className="ds-narrative-chrome" aria-hidden />
      <AmbientNarrativeField />
      <JourneyProgress />
      <ScrollInvitation />

      <motion.div
        className="relative z-10 pb-20 md:pb-28"
        initial={{
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : NARRATIVE_PAGE_ENTER_Y,
        }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : NARRATIVE_PAGE_ENTER_DURATION_S,
          ease: narrativeEase,
        }}
      >
        <div
          id="about-net-intro"
          ref={introRef}
          className="relative isolate min-h-[min(92svh,56rem)] overflow-hidden"
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: introFieldOpacity }}
            aria-hidden
          >
            <HeroPigmentField variant="about" bold chromatic />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[var(--rrowm-base-soft,#fafcfd)] via-[var(--rrowm-base-soft,#fafcfd)]/20 to-transparent" />

          <div className={`relative z-10 flex min-h-[inherit] flex-col justify-end pb-20 pt-28 md:pb-28 md:pt-36 ${gutter}`}>
            <div className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
              <motion.header
                className="lg:col-span-8 lg:col-start-1"
                style={{ y: introY, opacity: introOpacity }}
              >
                <h1 className="max-w-[min(100%,46rem)] font-serif text-[clamp(2.05rem,5.4vw,3.45rem)] font-normal leading-[1.06] tracking-tight text-neutral-950 lg:max-w-[min(100%,50rem)]">
                  A system for recording authorship, provenance, and
                  verification
                </h1>
                <p className="mt-8 max-w-xl text-sm leading-[1.82] text-neutral-600 md:max-w-2xl md:text-base md:leading-[1.78]">
                  The registry is a shared layer for how artworks are
                  identified, documented, and checked over time — with clear
                  rules for what is visible, what requires access, and what
                  stays private.
                </p>
                <div className="mt-10 h-px max-w-md bg-gradient-to-r from-neutral-300/70 via-neutral-200/40 to-transparent md:mt-12" aria-hidden />
                <Link
                  href="/"
                  className="group mt-8 inline-flex items-center text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.35em] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:decoration-neutral-500 hover:text-neutral-950 md:mt-10"
                >
                  <span className="mr-1.5 opacity-70 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100">
                    ←
                  </span>
                  Back to home
                </Link>
              </motion.header>

              <div
                className="relative hidden select-none lg:col-span-4 lg:col-start-9 lg:flex lg:flex-col lg:items-end lg:justify-end lg:pb-2"
                aria-hidden
              >
                <span className="font-serif text-[clamp(2.75rem,11vw,8rem)] font-light leading-[0.82] tracking-[-0.03em] text-neutral-950/[0.055]">
                  Layer
                </span>
                <span className="mt-5 block h-px w-[min(100%,11rem)] bg-gradient-to-r from-transparent via-neutral-300/50 to-neutral-300/12" />
              </div>
            </div>
          </div>
        </div>

        <MotionReveal
          id="about-net-principles"
          delay={0.03}
          className={`${narrativeLayout.scrollAnchor} ${narrativeLayout.afterIntroGap}`}
        >
          <ScrollAtmosphere parallax={0} edgeSoftening={false}>
            <div className={gutter}>
              <AboutPrinciplesChapter />
            </div>
          </ScrollAtmosphere>
        </MotionReveal>

        <MotionReveal
          id="about-net-digest"
          delay={0.04}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={6} edgeSoftening>
            <div className={`${gutter} mt-10 md:mt-14`}>
              <AboutDigestTabs />
            </div>
          </ScrollAtmosphere>
        </MotionReveal>

        <SectionFadeDivider />

        <MotionReveal
          id="about-net-cta"
          delay={0.05}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={4}>
            <div className={gutter}>
              <CTASection />
            </div>
          </ScrollAtmosphere>
        </MotionReveal>
      </motion.div>
    </div>
  );
}
