import { Suspense } from "react";
import { OnboardingClient } from "./OnboardingClient";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen rrowm-bg-page pt-24 text-center text-sm text-neutral-500">
          Loading…
        </div>
      }
    >
      <OnboardingClient />
    </Suspense>
  );
}
