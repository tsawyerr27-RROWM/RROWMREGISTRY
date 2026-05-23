import { Suspense } from "react";

import { ContinueProvenanceFlow } from "@/components/collector/ContinueProvenanceFlow";

export default function ContinueProvenancePage() {
  return (
    <div className="ds-silver-environment min-h-[100dvh] px-4 pb-24 pt-20 text-neutral-900 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-neutral-900/[0.06] bg-gradient-to-b from-white/90 to-neutral-50/30 px-6 py-10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.12)] sm:px-8 sm:py-12">
          <Suspense
            fallback={
              <p className="text-[14px] text-neutral-500">Loading…</p>
            }
          >
            <ContinueProvenanceFlow />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
