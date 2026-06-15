"use client";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deferredRouterPush } from "@/lib/deferred-app-router";
import Image from "next/image";

type PendingArtwork = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  catalogue_artist_name: string | null;
  medium: string | null;
  dimensions: string | null;
  year_created: string | null;
  created_at: string;
  artist_id: string | null;
  filing_gallery_id: string | null;
  verification_status: string;
};

export default function InternalVerify() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [artworks, setArtworks] = useState<PendingArtwork[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (!res.ok) {
        deferredRouterPush(router, "/admin");
        return;
      }
      const body = await res.json();
      if (!body?.isAdmin) {
        deferredRouterPush(router, "/admin");
        return;
      }

      setIsAdmin(true);

      const { data: unverified } = await sb()
        .from("artworks")
        .select(
          "id, title, registry_id, image_url, catalogue_artist_name, medium, dimensions, year_created, created_at, artist_id, filing_gallery_id, verification_status"
        )
        .in("verification_status", ["unverified", "pending"])
        .order("created_at", { ascending: false });

      setArtworks((unverified as PendingArtwork[]) || []);
    };

    init();
  }, [router, sb]);

  const approveArtwork = useCallback(
    async (artwork: PendingArtwork) => {
      if (!isAdmin || approving) return;
      setApproving(artwork.id);

      try {
        const verifyRes = await fetch("/api/admin/verify-artwork", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artwork_id: artwork.id }),
        });
        const verifyBody = (await verifyRes.json()) as { error?: string };
        if (!verifyRes.ok) {
          alert(verifyBody.error || "Verification failed.");
          return;
        }

        setArtworks((prev) => prev.filter((a) => a.id !== artwork.id));
      } finally {
        setApproving(null);
      }
    },
    [isAdmin, approving]
  );

  if (!isAdmin) {
    return (
      <div className="ds-page-environment flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <p className="text-sm text-white/50">
          Retrieving pending attestations…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Pending verifications
            </h1>
            {artworks.length > 0 && (
              <p className="mt-2 text-sm text-white/50">
                {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}{" "}
                awaiting review
              </p>
            )}
          </div>
        </header>

        {artworks.length === 0 && (
          <div className="liquid-glass-tile-dark flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="text-emerald-400"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6 9 17l-5-5"
                />
              </svg>
            </div>
            <p className="text-sm text-white/70">
              All artworks have been verified. No pending works.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="liquid-glass-tile-dark overflow-hidden"
            >
              <div className="flex gap-6 p-6 md:p-8">
                {/* Thumbnail */}
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 md:h-36 md:w-36">
                  {artwork.image_url ? (
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title ?? "Artwork"}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="text-white/20"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="8.5"
                          cy="8.5"
                          r="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m3 16 5-5 4 4 3-3 6 6"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold leading-tight text-white md:text-xl">
                      {artwork.title || "Untitled"}
                    </h2>
                    {artwork.catalogue_artist_name && (
                      <p className="mt-1 text-sm text-white/60">
                        {artwork.catalogue_artist_name}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      {artwork.registry_id && (
                        <span className="font-mono">
                          {artwork.registry_id}
                        </span>
                      )}
                      {artwork.medium && <span>{artwork.medium}</span>}
                      {artwork.year_created && (
                        <span>{artwork.year_created}</span>
                      )}
                      {artwork.dimensions && <span>{artwork.dimensions}</span>}
                    </div>
                    <p className="mt-2 text-xs text-white/30">
                      Registered{" "}
                      {new Date(artwork.created_at).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => approveArtwork(artwork)}
                      disabled={approving === artwork.id}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition duration-200 ease-out hover:-translate-y-px hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {approving === artwork.id ? "Verifying…" : "Verify"}
                    </button>
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                      {artwork.verification_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
