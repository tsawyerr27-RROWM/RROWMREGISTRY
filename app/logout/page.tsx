"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterReplace } from "@/lib/deferred-app-router";

export default function LogoutPage() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await sb().auth.signOut();
      } finally {
        if (!cancelled) deferredRouterReplace(router, "/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, sb]);

  return (
    <main className="flex min-h-screen items-center justify-center rrowm-bg-page px-6 py-24 pt-28">
      <p className="text-sm text-neutral-600">Signing you out…</p>
    </main>
  );
}

