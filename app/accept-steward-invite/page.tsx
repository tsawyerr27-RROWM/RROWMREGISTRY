import { Suspense } from "react";

import { StewardInviteAcceptanceView } from "@/components/Registry/StewardInviteAcceptanceView";

export default function AcceptStewardInvitePage() {
  return (
    <div className="registry-print-page min-h-[100dvh] rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <Suspense
          fallback={
            <p className="text-sm text-neutral-500">Loading invitation…</p>
          }
        >
          <StewardInviteAcceptanceView />
        </Suspense>
      </main>
    </div>
  );
}
