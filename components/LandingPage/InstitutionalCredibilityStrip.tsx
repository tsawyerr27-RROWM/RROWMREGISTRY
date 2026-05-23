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
    <div className="rrowm-atmo-section--mist backdrop-blur-[2px]">
      <div className={`${narrativeLayout.gutter} py-6 md:py-8`}>
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-neutral-600 md:text-[15px] md:leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
}

