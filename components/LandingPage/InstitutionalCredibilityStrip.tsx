import type { ReactNode } from "react";

import { narrativeLayout } from "@/styles/narrative-layout";

type Props = {
  children: ReactNode;
};

/**
 * Quant-style credibility line — typographic proof without a noisy logo wall.
 * Keep it short, specific, and calm.
 */
export function InstitutionalCredibilityStrip({ children }: Props) {
  return (
    <div className="border-y border-neutral-200/55 bg-white/60 backdrop-blur-sm">
      <div className={`${narrativeLayout.gutter} py-8 md:py-10`}>
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-neutral-600 md:text-[15px] md:leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
}

