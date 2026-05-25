import { Suspense } from "react";

import { AuthenticateArtworkRecordClient } from "@/components/gallery/AuthenticateArtworkRecordClient";

export default function AuthenticateRecordPage() {
  return (
    <div className="min-h-[100dvh] rrowm-bg-page text-neutral-900">
      <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
        <Suspense
          fallback={
            <p className="text-center text-sm text-neutral-500" role="status">
              Loading record review…
            </p>
          }
        >
          <AuthenticateArtworkRecordClient />
        </Suspense>
      </main>
    </div>
  );
}
