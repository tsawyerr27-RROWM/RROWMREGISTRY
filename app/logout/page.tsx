"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { signOutSafely } from "@/lib/auth-sign-out";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await signOutSafely();
      if (!cancelled) deferredRouterReplace(router, "/login");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center rrowm-bg-page px-6 py-24 pt-28">
      <p className="text-sm text-neutral-600">Signing you out…</p>
    </main>
  );
}
