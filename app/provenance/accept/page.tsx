import { Suspense } from "react";

import { AcceptProvenanceClient } from "@/components/provenance/AcceptProvenanceClient";

export default function ProvenanceAcceptPage() {
  return (
    <div className="min-h-[100dvh] rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-lg px-5 py-14 md:py-20">
        <Suspense
          fallback={
            <p className="text-[14px] text-neutral-500">Loading…</p>
          }
        >
          <AcceptProvenanceClient />
        </Suspense>
      </main>
    </div>
  );
}
