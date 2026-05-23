import { Suspense } from "react";

import { AuthenticateArtworkRecordClient } from "@/components/gallery/AuthenticateArtworkRecordClient";

export default function AuthenticateRecordPage() {
  return (
    <div className="min-h-[100dvh] rrowm-bg-page pt-20 text-neutral-900">
      <main className="mx-auto max-w-lg px-5 py-14 md:py-20">
        <Suspense
          fallback={
            <p className="text-center text-sm text-neutral-500">Loading…</p>
          }
        >
          <AuthenticateArtworkRecordClient />
        </Suspense>
      </main>
    </div>
  );
}
