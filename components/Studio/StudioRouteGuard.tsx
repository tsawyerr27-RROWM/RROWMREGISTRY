"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { getOnboardingRedirectPath } from "@/lib/onboarding";
import {
  studioLayoutGuardSkipsPath,
  studioRoleHomeMismatch,
} from "@/lib/studio-route-access";

type GuardPhase = "pending" | "ready";

export type StudioGuardUser = {
  userId: string;
  email: string | null;
};

const StudioGuardUserContext = createContext<StudioGuardUser | null>(null);

export function useStudioGuardUser(): StudioGuardUser | null {
  return useContext(StudioGuardUserContext);
}

export function StudioRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sb = useSupabaseBrowserLazy();
  const [phase, setPhase] = useState<GuardPhase>("pending");
  const [guardUser, setGuardUser] = useState<StudioGuardUser | null>(null);

  const returnPath = useMemo(() => {
    const qs = searchParams?.toString();
    if (!pathname) return "/studio/creative";
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const skipGuard = studioLayoutGuardSkipsPath(pathname);

  useEffect(() => {
    if (skipGuard) {
      setPhase("ready");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const supabase = sb();
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData?.session) {
          const redirectTarget =
            "/login?next=" + encodeURIComponent(returnPath);
          if (!cancelled) {
            deferredRouterReplace(router, redirectTarget);
          }
          return;
        }

        const uid = sessionData.session.user.id;
        const onboardingPath = await getOnboardingRedirectPath(supabase, uid);
        if (onboardingPath) {
          if (!cancelled) deferredRouterReplace(router, onboardingPath);
          return;
        }

        const { data: actor } = await supabase
          .from("actor_profiles")
          .select("role")
          .eq("user_id", uid)
          .maybeSingle();

        if (!actor?.role) {
          if (!cancelled) deferredRouterReplace(router, "/onboarding");
          return;
        }

        const mismatch = studioRoleHomeMismatch(actor.role, pathname);
        if (mismatch) {
          if (!cancelled) deferredRouterReplace(router, mismatch);
          return;
        }

        if (!cancelled) {
          setGuardUser({
            userId: uid,
            email: sessionData.session.user.email ?? null,
          });
          setPhase("ready");
        }
      } catch {
        /* guard stays pending */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [skipGuard, pathname, returnPath, router, sb]);

  if (skipGuard || phase === "ready") {
    return (
      <StudioGuardUserContext.Provider value={skipGuard ? null : guardUser}>
        {children}
      </StudioGuardUserContext.Provider>
    );
  }

  return (
    <div className="ds-page-environment flex min-h-screen items-center justify-center pt-20">
      <p className="text-sm text-neutral-500">Loading…</p>
    </div>
  );
}
