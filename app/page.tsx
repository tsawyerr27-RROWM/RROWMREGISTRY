"use client";

import {
  LandingFinalCta,
  LandingHero,
  LandingTrust,
  LandingPageShell,
  LandingPillars,
  LandingProblem,
  LandingProductShowcase,
  LandingWhy,
} from "@/components/LandingPage/redesign";

export default function LandingPage() {
  return (
    <LandingPageShell>
      <LandingHero />
      <LandingProblem />
      <LandingPillars />
      <LandingProductShowcase />
      <LandingWhy />
      <LandingTrust />
      <LandingFinalCta />
    </LandingPageShell>
  );
}
