import { Suspense } from "react";

import { AuthenticateArtworkRecordClient } from "@/components/gallery/AuthenticateArtworkRecordClient";
import { AuthenticateRecordLoading } from "@/components/gallery/AuthenticateRecordLoading";

export default function AuthenticateRecordPage() {
  return (
    <div className="min-h-[100dvh] rrowm-bg-page text-neutral-900">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <Suspense fallback={<AuthenticateRecordLoading />}>
          <AuthenticateArtworkRecordClient />
        </Suspense>
      </main>
    </div>
  );
}
