"use client";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { homePathForRole } from "@/lib/onboarding";
import { acceptPendingGalleryInvite } from "@/lib/accept-gallery-invite-client";
import { persistArtworkAuthInviteFromReturnPath } from "@/lib/accept-artwork-auth-invite-client";
import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { resolvePostAuthRedirectPath } from "@/lib/post-auth-redirect";

const allowedRoles = ["artist", "gallery", "collector"] as const;
type Role = (typeof allowedRoles)[number];

function isRole(r: string | null): r is Role {
  return r !== null && allowedRoles.includes(r as Role);
}

function defaultDisplayName(user: User) {
  const meta =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined);
  if (meta?.trim()) return meta.trim();
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local;
  return "Registry member";
}

async function waitForUser(
  getClient: () => SupabaseClient,
  maxAttempts = 20
): Promise<User | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const supabase = getClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user;

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) return userData.user;

    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}

export default function CompleteSignupPage() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = sb();
      const params = new URLSearchParams(window.location.search);
      const nextParam = sanitizeAuthReturnPath(params.get("next"));
      if (nextParam) persistArtworkAuthInviteFromReturnPath(nextParam);
      let roleParam: string | null = params.get("role");
      if (!isRole(roleParam) && typeof window !== "undefined") {
        try {
          const stored = window.sessionStorage.getItem("rrowm_pending_signup_role");
          if (isRole(stored)) roleParam = stored;
        } catch {
          /* ignore */
        }
      }

      if (!isRole(roleParam)) {
        deferredRouterReplace(router, "/get-started");
        return;
      }

      const role = roleParam;

      const user = await waitForUser(sb);
      if (!user) {
        setStatus("error");
        setMessage(
          "We could not confirm your session. Open the verification link from the same browser you used to sign up, or return to sign up and try again. If you already verified your email, sign in with your password."
        );
        return;
      }

      await supabase.auth.refreshSession();

      const { data: existing, error: existingErr } = await supabase
        .from("actor_profiles")
        .select("user_id, role, onboarding_complete")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingErr) {
        console.warn(
          "[signup/complete] actor_profiles select",
          summarizeRpcError(existingErr)
        );
        setStatus("error");
        setMessage(
          summarizeRpcError(existingErr) || "Could not read your profile."
        );
        return;
      }

      const displayName = defaultDisplayName(user);

      if (role === "artist") {
        const inviteResult = await acceptPendingGalleryInvite();
        if (!inviteResult.ok && inviteResult.error) {
          console.warn("[signup/complete] invite accept", inviteResult.error);
        }
      }

      if (existing) {
        const finished = Boolean(existing.onboarding_complete);
        if (finished && existing.role !== role) {
          deferredRouterReplace(router, homePathForRole(existing.role) || "/studio");
          try {
            window.sessionStorage.removeItem("rrowm_pending_signup_role");
          } catch {
            /* ignore */
          }
          return;
        }
        if (!finished && existing.role !== role) {
          const { error: syncErr } = await supabase.rpc("set_onboarding_role", {
            p_payload: { p_role: role, p_display_name: displayName },
          });
          if (syncErr) {
            const detail = summarizeRpcError(syncErr);
            console.warn("[signup/complete] set_onboarding_role (sync)", detail);
            setStatus("error");
            setMessage(
              detail ||
                "Could not align your account with this sign-up path. Try again or contact support."
            );
            return;
          }
        }

        try {
          window.sessionStorage.removeItem("rrowm_pending_signup_role");
        } catch {
          /* ignore */
        }
        const dest = await resolvePostAuthRedirectPath(supabase, user.id, {
          explicitNext: nextParam,
        });
        deferredRouterReplace(router, dest);
        return;
      }

      const { error: actorError } = await supabase.rpc("set_onboarding_role", {
        p_payload: { p_role: role, p_display_name: displayName },
      });

      if (actorError) {
        const detail = summarizeRpcError(actorError);
        console.warn("[signup/complete] set_onboarding_role", detail);
        setStatus("error");
        setMessage(
          detail ||
            "Could not create your registry profile. Check migrations (set_onboarding_role)."
        );
        return;
      }

      try {
        window.sessionStorage.removeItem("rrowm_pending_signup_role");
      } catch {
        /* ignore */
      }
      const dest = await resolvePostAuthRedirectPath(supabase, user.id, {
        explicitNext: nextParam,
      });
      deferredRouterReplace(router, dest);
    };

    void run();
  }, [router, sb]);

  if (status === "error") {
    return (
      <main className="ds-page-environment flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md space-y-8 border-t border-black/[0.06] pt-10 text-left">
          <p className="border-l-2 border-red-400 pl-4 text-sm leading-relaxed text-red-800">
            {message}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <Link
              href="/login"
              className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ds-page-environment flex min-h-screen items-center justify-center px-6 py-24">
      <p className="text-sm leading-relaxed text-neutral-500">
        Setting up your account…
      </p>
    </main>
  );
}
