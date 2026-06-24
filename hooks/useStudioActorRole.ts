"use client";

import { useEffect, useState } from "react";

import { useStudioGuardUser } from "@/components/Studio/StudioRouteGuard";
import type { StudioRole } from "@/components/Studio/StudioShell";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";

export function useStudioActorRole() {
  const guardUser = useStudioGuardUser();
  const sb = useSupabaseBrowserLazy();
  const [role, setRole] = useState<StudioRole | null>(null);
  const [ready, setReady] = useState(false);

  const userId = guardUser?.userId ?? null;

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setRole(null);
      setReady(true);
      return;
    }

    void (async () => {
      const { data: actor } = await sb()
        .from("actor_profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      const r = actor?.role;
      if (r === "artist" || r === "collector" || r === "gallery") {
        setRole(r);
      } else {
        setRole(null);
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [sb, userId]);

  return { userId, role, ready };
}
