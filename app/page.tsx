"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  AmbientNarrativeField,
  CTASection,
  HeroSection,
  JourneyProgress,
  InstitutionalCredibilityStrip,
  LandingPersonaStrip,
  LandingThesisBand,
  MotionReveal,
  PortfolioWorkspaceSection,
  ScrollAtmosphere,
  ScrollInvitation,
  SectionFadeDivider,
  SystemFlowSection,
} from "@/components/LandingPage";
import {
  NARRATIVE_PAGE_ENTER_DURATION_S,
  NARRATIVE_PAGE_ENTER_Y,
  narrativeLayout,
  narrativeEase,
} from "@/styles/narrative-layout";

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="ds-page-environment relative min-h-[100dvh] overflow-x-clip text-neutral-900 selection:bg-neutral-900/10">
      <div className="ds-narrative-chrome" aria-hidden />
      <AmbientNarrativeField />
      {/* Quant-style: keep the page calm — no vertical network rails */}
      <JourneyProgress />
      <ScrollInvitation />

      <motion.div
        className="relative z-10 pb-0"
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
        <div id="net-hero">
          <HeroSection />
        </div>

        <MotionReveal
          id="net-thesis"
          delay={0.03}
          className={`${narrativeLayout.scrollAnchor} ${narrativeLayout.postHeroTop}`}
        >
          <ScrollAtmosphere parallax={4} edgeSoftening>
            <LandingThesisBand />
          </ScrollAtmosphere>
        </MotionReveal>

        <SectionFadeDivider />

        <MotionReveal
          id="net-system"
          delay={0.04}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={10}>
            <SystemFlowSection />
          </ScrollAtmosphere>
        </MotionReveal>

        <SectionFadeDivider />

        <MotionReveal id="net-trust" delay={0.03} className={narrativeLayout.scrollAnchor}>
          <ScrollAtmosphere parallax={0} edgeSoftening={false}>
            <InstitutionalCredibilityStrip>
              Cryptographic verification · Clear visibility rules · One registry
              identity per work
            </InstitutionalCredibilityStrip>
          </ScrollAtmosphere>
        </MotionReveal>

        <SectionFadeDivider />

        <MotionReveal
          id="net-personas"
          delay={0.04}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={6} edgeSoftening>
            <LandingPersonaStrip />
          </ScrollAtmosphere>
        </MotionReveal>

        <SectionFadeDivider />

        <MotionReveal
          id="net-portfolio"
          delay={0.05}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={8}>
            <PortfolioWorkspaceSection />
          </ScrollAtmosphere>
        </MotionReveal>

        <MotionReveal
          id="net-cta"
          delay={0.05}
          className={narrativeLayout.scrollAnchor}
        >
          <ScrollAtmosphere parallax={0} edgeSoftening={false}>
            <CTASection />
          </ScrollAtmosphere>
        </MotionReveal>
      </motion.div>
    </div>
  );
}
