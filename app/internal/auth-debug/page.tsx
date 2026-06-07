"use client";

import { useCallback, useEffect, useState } from "react";

import { loadAuthDebugSnapshot, type AuthDebugSnapshot } from "@/lib/auth-debug";
import { signOutSafely } from "@/lib/auth-sign-out";

export default function AuthDebugPage() {
  const [snapshot, setSnapshot] = useState<AuthDebugSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutNote, setSignOutNote] = useState<string | null>(null);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSnapshot(await loadAuthDebugSnapshot());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSignOutTest = async () => {
    setSignOutBusy(true);
    setSignOutNote(null);
    try {
      const result = await signOutSafely();
      setSignOutNote(result.note ?? (result.ok ? "signOut completed" : "signOut failed"));
      await refresh();
    } finally {
      setSignOutBusy(false);
    }
  };

  return (
    <div className="ds-page-environment min-h-screen px-6 py-24 text-neutral-900">
      <main className="mx-auto max-w-2xl">
        <h1 className="font-serif text-2xl text-neutral-950">Auth debug (Phase 0)</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Temporary internal page — verify browser session persistence before storage
          unification.
        </p>

        <div className="mt-8 space-y-3 rounded-xl border border-neutral-900/10 bg-white/70 p-6 text-sm">
          {loading || !snapshot ? (
            <p className="text-neutral-500">Loading snapshot…</p>
          ) : (
            <>
              <Row label="Session exists" value={snapshot.sessionExists ? "yes" : "no"} />
              <Row label="User id" value={snapshot.userId ?? "—"} />
              <Row label="Auth storage mode" value={snapshot.authStorageMode ?? "—"} />
              <Row label="Project ref" value={snapshot.projectRef ?? "—"} />
              <Row label="Expected storage key" value={snapshot.expectedStorageKey ?? "—"} />
              <Row
                label="localStorage sb-* keys"
                value={
                  snapshot.localStorageAuthKeys.length
                    ? snapshot.localStorageAuthKeys.join(", ")
                    : "(none)"
                }
              />
              <Row
                label="sessionStorage sb-* keys"
                value={
                  snapshot.sessionStorageAuthKeys.length
                    ? snapshot.sessionStorageAuthKeys.join(", ")
                    : "(none)"
                }
              />
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl border border-neutral-900/15 px-4 py-2 text-sm font-medium"
          >
            Refresh snapshot
          </button>
          <button
            type="button"
            disabled={signOutBusy}
            onClick={() => void handleSignOutTest()}
            className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {signOutBusy ? "Signing out…" : "Test sign out"}
          </button>
        </div>

        {signOutNote ? (
          <p className="mt-4 text-sm text-neutral-700" role="status">
            Sign out: {signOutNote}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_1fr]">
      <span className="font-medium text-neutral-700">{label}</span>
      <span className="break-all font-mono text-xs text-neutral-900">{value}</span>
    </div>
  );
}
