"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm text-white/50">
              Rrowm Registry
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Admin Console
            </h1>
          </div>
          <Link
            href="/studio"
            className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline"
          >
            Back to studio
          </Link>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/internal/replay-debugger"
            className="liquid-glass-tile-dark block space-y-3 p-6 transition-opacity hover:opacity-95"
          >
            <p className="text-xs text-white/50">
              Forensics
            </p>
            <h2 className="text-xl font-semibold">Visual replay debugger</h2>
            <p className="text-sm text-white/70">
              Step through ownership, value, verification, and certificate events with replayed state
              only—same logic as the audit validator.
            </p>
          </Link>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <p className="text-xs text-white/50">
              Registry
            </p>
            <h2 className="text-xl font-semibold">System Overview</h2>
            <p className="text-sm text-white/70">
              High-level controls and health checks for the registry
              infrastructure. This is a placeholder for future admin tools.
            </p>
          </div>

          <div className="liquid-glass-tile-dark space-y-3 p-6">
            <p className="text-xs text-white/50">
              Coming Soon
            </p>
            <h2 className="text-xl font-semibold">Moderation &amp; Tools</h2>
            <p className="text-sm text-white/70">
              You&apos;ll manage ownership claims, verify artworks, and review
              activity here as the admin surface evolves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}