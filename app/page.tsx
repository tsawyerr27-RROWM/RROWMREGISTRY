"use client";

import {
  LandingFinalCta,
  LandingHero,
  LandingOperatingSystem,
  LandingPageShell,
  LandingPillars,
  LandingProblem,
  LandingProductShowcase,
  LandingTrust,
  LandingWhy,
} from "@/components/LandingPage/redesign";

export default function LandingPage() {
  return (
    <LandingPageShell>
      <LandingHero />
      <LandingProblem />
      <LandingPillars />
      <LandingOperatingSystem />
      <LandingProductShowcase />
      <LandingWhy />
      <LandingTrust />
      <LandingFinalCta />
    </LandingPageShell>
  );
}
