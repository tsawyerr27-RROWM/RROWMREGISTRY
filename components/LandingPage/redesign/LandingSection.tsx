"use client";

import type { ReactNode } from "react";

import { landingLayout } from "@/styles/landing-redesign";

export function LandingSection({
  children,
  className = "",
  id,
  tone = "bone",
  pad = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "bone" | "ivory" | "espresso";
  pad?: "default" | "tight" | "hero";
}) {
  const toneClass =
    tone === "espresso"
      ? "bg-[var(--landing-espresso)] text-[var(--landing-ivory)]"
      : tone === "ivory"
        ? "bg-[var(--landing-ivory)]"
        : "bg-[var(--landing-bone)]";

  const padClass =
    pad === "hero"
      ? "pb-0 pt-0"
      : pad === "tight"
        ? landingLayout.sectionYTight
        : landingLayout.sectionY;

  return (
    <section
      id={id}
      className={`relative isolate ${toneClass} ${padClass} ${landingLayout.scrollAnchor} ${className}`}
    >
      {children}
    </section>
  );
}

export function LandingContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${landingLayout.gutter} ${className}`}>{children}</div>;
}
