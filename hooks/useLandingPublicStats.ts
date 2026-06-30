"use client";

import { useEffect, useState } from "react";

import type { LandingPublicStats } from "@/lib/landing-public-stats";

export function useLandingPublicStats() {
  const [stats, setStats] = useState<LandingPublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/registry/public-stats", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const body = (await res.json()) as LandingPublicStats;
        if (!cancelled) setStats(body);
      } catch {
        /* non-blocking */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}
