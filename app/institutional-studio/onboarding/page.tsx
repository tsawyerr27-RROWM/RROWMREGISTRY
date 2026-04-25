"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { deferredRouterReplace } from "@/lib/deferred-app-router";

/** @deprecated Use /onboarding?focus=gallery */
export default function GalleryOnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    deferredRouterReplace(router, "/onboarding?focus=gallery");
  }, [router]);

  return (
    <div className="min-h-screen rrowm-bg-page pt-24 text-center text-sm text-neutral-500">
      Redirecting…
    </div>
  );
}
