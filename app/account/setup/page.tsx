"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { deferredRouterReplace } from "@/lib/deferred-app-router";

/**
 * Legacy route: account setup now lives at /onboarding.
 */
export default function AccountSetupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    deferredRouterReplace(router, "/onboarding");
  }, [router]);

  return (
    <div className="rrowm-bg-page-warm flex min-h-screen items-center justify-center text-sm leading-relaxed text-neutral-500">
      Redirecting…
    </div>
  );
}
