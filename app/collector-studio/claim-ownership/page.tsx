import { Suspense } from "react";

import { ClaimOwnershipFlow } from "@/components/collector/ClaimOwnershipFlow";

function Fallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center text-[14px] text-neutral-500">
      Loading…
    </div>
  );
}

export default function CollectorClaimOwnershipPage() {
  return (
    <div className="ds-silver-environment min-h-[100dvh]">
      <Suspense fallback={<Fallback />}>
        <ClaimOwnershipFlow />
      </Suspense>
    </div>
  );
}
