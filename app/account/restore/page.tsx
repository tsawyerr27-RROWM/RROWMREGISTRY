"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";

export default function AccountRestorePage() {
  const sb = useSupabaseBrowserLazy();
  const [token, setToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token")?.trim();
    setToken(t || null);
    if (!t) {
      setPhase("error");
      setError("Missing recovery token.");
    } else {
      setPhase("ready");
    }
  }, []);

  const restore = async () => {
    if (!token) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/account/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setPhase("error");
        setError(j.error || "Restore failed.");
        return;
      }
      setPhase("done");
    } catch {
      setPhase("error");
      setError("Network error.");
    }
  };

  useEffect(() => {
    if (phase === "done") {
      void sb().auth.signOut();
    }
  }, [phase, sb]);

  return (
    <div className="ds-page-environment flex min-h-screen items-center justify-center px-6">
      <main className="w-full max-w-md rounded-2xl border border-neutral-900/[0.06] bg-white/60 p-8 text-center backdrop-blur-md">
        <h1 className="font-serif text-2xl text-neutral-950">Restore account</h1>
        {phase === "loading" ? (
          <p className="mt-4 text-sm text-neutral-500">Processing…</p>
        ) : null}
        {phase === "ready" ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Cancel your scheduled account deletion and restore access to RROWM.
            </p>
            <button
              type="button"
              onClick={() => void restore()}
              className="mt-6 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white"
            >
              Restore my account
            </button>
          </>
        ) : null}
        {phase === "done" ? (
          <>
            <p className="mt-4 text-sm text-neutral-600">
              Your account has been restored. Sign in to continue.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white"
            >
              Sign in
            </Link>
          </>
        ) : null}
        {phase === "error" ? (
          <>
            <p className="mt-4 text-sm text-neutral-800" role="alert">
              {error}
            </p>
            <Link href="/contact" className="mt-4 inline-block text-sm text-neutral-600 underline">
              Contact support
            </Link>
          </>
        ) : null}
      </main>
    </div>
  );
}
