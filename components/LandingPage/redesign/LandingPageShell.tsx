"use client";

import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";

const landingDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-landing-display",
  display: "swap",
});

const landingSans = Inter({
  subsets: ["latin"],
  variable: "--font-landing-sans",
  display: "swap",
});

export function LandingPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`rrowm-landing ${landingDisplay.variable} ${landingSans.variable} relative min-h-[100dvh] overflow-x-clip text-[var(--landing-charcoal)] selection:bg-black/10`}
    >
      {children}
    </div>
  );
}
