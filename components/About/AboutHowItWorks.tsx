"use client";

import { motion, useReducedMotion } from "framer-motion";
import { UseCaseJourney } from "@/components/LandingPage/UseCaseJourney";
import {
  NARRATIVE_REVEAL_DURATION_S,
  narrativeLayout,
  narrativeEase,
} from "@/styles/narrative-layout";

type AboutHowItWorksProps = {
  density?: "default" | "digest";
};

export function AboutHowItWorks({ density = "default" }: AboutHowItWorksProps) {
  const reduce = useReducedMotion();
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  return (
    <Shell
      className={
        digest
          ? ""
          : `rrowm-atmo-section--cool ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-how-heading" } : {})}
    >
      <h2
        {...(!digest ? { id: "about-how-heading" } : {})}
        className={
          digest
            ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
            : "font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-normal leading-tight tracking-tight text-neutral-950"
        }
      >
        How it works
      </h2>
      <motion.div
        className={digest ? "mt-6 md:mt-7" : "mt-14 md:mt-16"}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px", amount: 0.2 }}
        transition={{ duration: NARRATIVE_REVEAL_DURATION_S, ease: narrativeEase }}
      >
        <UseCaseJourney tone="calm" />
      </motion.div>
    </Shell>
  );
}
