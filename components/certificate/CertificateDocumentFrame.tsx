"use client";

import type { ReactNode } from "react";

import { registryPremium } from "@/styles/registry-premium";

type Props = {
  children: ReactNode;
  screenWatermark?: ReactNode;
  revokedWatermark?: ReactNode;
};

export function CertificateDocumentFrame({
  children,
  screenWatermark,
  revokedWatermark,
}: Props) {
  return (
    <div className="registry-print-page relative flex min-h-screen items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8 print:box-border print:bg-white print:px-4 print:py-3">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply print:hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.16) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      {screenWatermark}

      {revokedWatermark}

      <article
        className={`${registryPremium.document.sheet} relative z-10 mx-auto w-full max-w-[820px] print:mx-auto print:max-w-none print:w-full`}
      >
        <div
          className={`print:box-border print:mx-auto print:flex print:h-auto print:w-[190mm] print:max-w-[190mm] print:shrink-0 print:flex-col print:overflow-hidden ${registryPremium.print.a4Aspect}`}
        >
          <div
            className={`registry-document-ornament ${registryPremium.frame.outer} print:flex print:h-full print:min-h-0 print:flex-1 print:flex-col print:overflow-hidden`}
          >
            <div
              className={`m-[10px] ${registryPremium.frame.inner} print:m-1.5 print:flex print:min-h-0 print:flex-1 print:flex-col`}
            >
              <div className="registry-document-paper flex min-h-0 flex-1 flex-col justify-between gap-0 px-8 py-12 sm:px-12 sm:py-14 md:px-16 md:py-16 print:box-border print:min-h-0 print:flex-1 print:gap-0 print:px-3 print:py-2">
                {children}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
