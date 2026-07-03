"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

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

function studioGuardLoginPath(pathname: string | null): string {
  if (!pathname || pathname === "/login") return "/login";
  return `/login?next=${encodeURIComponent(pathname)}`;
}

export function StudioRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sb = useSupabaseBrowserLazy();
  const [phase, setPhase] = useState<GuardPhase>("pending");
  const [guardUser, setGuardUser] = useState<StudioGuardUser | null>(null);
  const redirectedRef = useRef(false);

  const skipGuard = studioLayoutGuardSkipsPath(pathname);

  useEffect(() => {
    redirectedRef.current = false;
  }, [pathname]);

  const redirectLoginOnce = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    deferredRouterReplace(router, studioGuardLoginPath(pathname));
  };

  useEffect(() => {
    if (skipGuard || phase !== "pending") return;

    const timeoutId = window.setTimeout(() => {
      console.warn(
        "[StudioRouteGuard] Guard pending > 8s; redirecting to login."
      );
      redirectLoginOnce();
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [skipGuard, phase, pathname, router]);

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
        const session = sessionData?.session;
        if (!session) {
          if (!cancelled) redirectLoginOnce();
          return;
        }

        const uid = session.user.id;
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
            email: session.user.email ?? null,
          });
          setPhase("ready");
        }
      } catch (err) {
        console.error("[StudioRouteGuard]", err);
        if (!cancelled) deferredRouterReplace(router, "/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [skipGuard, pathname, router, sb]);

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
