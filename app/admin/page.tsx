"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { AdminAccountLifecyclePanel } from "@/components/Admin/AdminAccountLifecyclePanel";

export default function AdminPage() {
  const [phase, setPhase] = useState<"loading" | "login" | "console">(
    "loading"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (res.ok) {
        const body = await res.json();
        if (body?.isAdmin) {
          setPhase("console");
          return true;
        }
      }
    } catch {}
    setPhase("login");
    return false;
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (phase !== "console") return;
    void (async () => {
      try {
        const res = await fetch(
          "/api/admin/pending-count",
          { credentials: "include" }
        );
        if (res.ok) {
          const body = await res.json();
          setPendingCount(body?.count ?? null);
        }
      } catch {}
    })();
  }, [phase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setLoginError(body?.error || "Login failed.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setPhase("console");
    } catch {
      setLoginError("An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <p className="text-sm text-white/50">Verifying access…</p>
      </div>
    );
  }

  if (phase === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-black to-slate-900 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="text-white/60"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-white">
                Admin access
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                Restricted to authorised personnel
              </p>
            </div>

            <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-user"
                  className="mb-1.5 block text-xs font-medium text-white/50"
                >
                  Username
                </label>
                <input
                  id="admin-user"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                  placeholder="Username"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-pass"
                  className="mb-1.5 block text-xs font-medium text-white/50"
                >
                  Password
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                  placeholder="Password"
                />
              </div>

              {loginError ? (
                <p className="text-sm text-red-400" role="alert">
                  {loginError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-white/90 disabled:opacity-50"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <InfoTooltip
              text="Registry administration console. Manage verifications, system health, and moderation tools."
              theme="dark"
            />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Admin Console
            </h1>
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/internal/verify"
            className="liquid-glass-tile-dark block space-y-3 p-6 transition-opacity hover:opacity-95"
          >
            <InfoTooltip
              text="Review and verify pending artwork registrations. Verified works receive certificates and are published on the public registry."
              theme="dark"
            />
            <h2 className="text-xl font-semibold">Verify artworks</h2>
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
              events with replayed state only, same logic as the audit
              validator.
            </p>
          </Link>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <InfoTooltip
              text="High-level controls and health checks for the registry infrastructure."
              theme="dark"
            />
            <h2 className="text-xl font-semibold">System overview</h2>
          </div>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <InfoTooltip
              text="Manage ownership claims, review activity, and moderate content as the admin surface evolves."
              theme="dark"
            />
            <h2 className="text-xl font-semibold">Moderation &amp; tools</h2>
          </div>

          <AdminAccountLifecyclePanel />
        </div>
      </div>
    </div>
  );
}
