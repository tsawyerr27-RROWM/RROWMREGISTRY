"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterReplace } from "@/lib/deferred-app-router";

export default function AdminPage() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const [ready, setReady] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await sb().auth.getUser();
      if (!user) {
        deferredRouterReplace(router, "/login?next=/admin");
        return;
      }
      const { data: profile } = await sb()
        .from("artists")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        deferredRouterReplace(router, "/studio");
        return;
      }
      setReady(true);

      const { count } = await sb()
        .from("artworks")
        .select("id", { count: "exact", head: true })
        .in("verification_status", ["unverified", "pending"]);
      setPendingCount(count ?? 0);
    })();
  }, [router, sb]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <p className="text-sm text-white/50">Verifying access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">RROWM Registry</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Admin Console
            </h1>
          </div>
          <Link
            href="/studio"
            className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Back to studio
          </Link>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/internal/verify"
            className="liquid-glass-tile-dark block space-y-3 p-6 transition-opacity hover:opacity-95"
          >
            <p className="text-xs text-white/50">Verification</p>
            <h2 className="text-xl font-semibold">Verify artworks</h2>
            <p className="text-sm text-white/70">
              Review and verify pending artwork registrations. Verified works
              receive certificates and are published on the public registry.
            </p>
            {pendingCount != null && pendingCount > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {pendingCount} pending
              </span>
            ) : pendingCount === 0 ? (
              <span className="text-xs text-white/40">No pending works</span>
            ) : null}
          </Link>

          <Link
            href="/internal/replay-debugger"
            className="liquid-glass-tile-dark block space-y-3 p-6 transition-opacity hover:opacity-95"
          >
            <p className="text-xs text-white/50">Forensics</p>
            <h2 className="text-xl font-semibold">Visual replay debugger</h2>
            <p className="text-sm text-white/70">
              Step through ownership, value, verification, and certificate
              events with replayed state only — same logic as the audit
              validator.
            </p>
          </Link>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <p className="text-xs text-white/50">Registry</p>
            <h2 className="text-xl font-semibold">System overview</h2>
            <p className="text-sm text-white/70">
              High-level controls and health checks for the registry
              infrastructure.
            </p>
          </div>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <p className="text-xs text-white/50">Coming soon</p>
            <h2 className="text-xl font-semibold">Moderation &amp; tools</h2>
            <p className="text-sm text-white/70">
              Manage ownership claims, review activity, and moderate content as
              the admin surface evolves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
