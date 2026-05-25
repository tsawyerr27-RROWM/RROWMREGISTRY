"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setRememberMe } from "@/lib/supabase";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { acceptPendingGalleryInvite } from "@/lib/accept-gallery-invite-client";
import {
  persistArtworkAuthInviteFromReturnPath,
  readPendingArtworkAuthInviteToken,
} from "@/lib/accept-artwork-auth-invite-client";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { resolvePostAuthRedirectPath } from "@/lib/post-auth-redirect";
import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/components/auth/AuthFieldStyles";

type View = "signin" | "forgot";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sb = useSupabaseBrowserLazy();
  const nextParam = useMemo(
    () => sanitizeAuthReturnPath(searchParams.get("next")),
    [searchParams]
  );
  const inviteTokenParam = useMemo(
    () => String(searchParams.get("invite_token") || "").trim(),
    [searchParams]
  );
  const artworkAuthFlow = Boolean(
    nextParam?.includes("/authenticate-record") ||
      readPendingArtworkAuthInviteToken()
  );

  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (nextParam) persistArtworkAuthInviteFromReturnPath(nextParam);
  }, [nextParam]);

  const signupHref = useMemo(() => {
    const q = new URLSearchParams();
    if (nextParam) q.set("next", nextParam);
    if (inviteTokenParam) q.set("invite_token", inviteTokenParam);
    const qs = q.toString();
    return qs ? `/signup?${qs}` : "/signup";
  }, [nextParam, inviteTokenParam]);

  const cleanEmail = email.trim().toLowerCase();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfoMsg(null);
    if (!cleanEmail) {
      setErr("Enter your email address.");
      return;
    }
    if (!password) {
      setErr("Enter your password.");
      return;
    }
    setSubmitting(true);
    setRememberMe(rememberMe);
    const supabase = sb();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setSubmitting(false);
    if (error) {
      setErr(
        error.message.includes("Invalid login credentials")
          ? "Email or password is incorrect."
          : error.message
      );
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      deferredRouterReplace(router, nextParam || "/studio");
      return;
    }

    const inviteResult = await acceptPendingGalleryInvite();
    if (!inviteResult.ok && inviteResult.error) {
      console.warn("[login] invite accept", inviteResult.error);
    }

    const dest = await resolvePostAuthRedirectPath(supabase, user.id, {
      explicitNext: nextParam,
    });
    deferredRouterReplace(router, dest);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfoMsg(null);
    if (!cleanEmail) {
      setErr("Enter the email address for your account.");
      return;
    }
    setSubmitting(true);
    const supabase = sb();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setInfoMsg(
      "If an account exists for that address, you will receive an email with a link to reset your password. Check your inbox and spam folder."
    );
  };

  const switchToForgot = () => {
    setView("forgot");
    setErr(null);
    setInfoMsg(null);
  };

  const switchToSignIn = () => {
    setView("signin");
    setErr(null);
    setInfoMsg(null);
  };

  return (
    <AuthPageShell
      title={view === "signin" ? "Sign in" : "Reset password"}
      subtitle={
        view === "signin" ? (
          <>
            {artworkAuthFlow ? (
              <span className="block pb-2 text-neutral-600">
                Sign in to review and authenticate the artwork record on file.
              </span>
            ) : null}
            Access your registry with email and password.{" "}
            <Link
              href={signupHref}
              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
            >
              Create an account
            </Link>
          </>
        ) : (
          "Enter the email associated with your account. We will send a secure link to choose a new password."
        )
      }
      footer={
        <p className="text-[13px] text-neutral-600 sm:text-sm">
          Need help?{" "}
          <Link
            href="/get-started"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            Get started
          </Link>
        </p>
      }
    >
      {view === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="login-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
              <label htmlFor="login-password" className={authLabelClass + " mb-0"}>
                Password
              </label>
              <button
                type="button"
                onClick={switchToForgot}
                className="text-[12px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-[0.2em] hover:text-neutral-900 sm:text-[13px]"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
              placeholder="••••••••"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMeState(e.target.checked)}
              className="h-4 w-4 rounded border-black/20 text-neutral-950 focus:ring-neutral-900/20"
            />
            <span className="text-[13px] text-neutral-700 sm:text-sm">
              Remember me
            </span>
          </label>
          {err ? (
            <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-[13px] text-red-800 sm:text-sm">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={authPrimaryButtonClass}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgot} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="forgot-email" className={authLabelClass}>
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="you@example.com"
            />
          </div>
          {infoMsg ? (
            <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-[13px] text-emerald-900 sm:text-sm">
              {infoMsg}
            </p>
          ) : null}
          {err ? (
            <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-[13px] text-red-800 sm:text-sm">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={authPrimaryButtonClass}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-center">
            <button
              type="button"
              onClick={switchToSignIn}
              className={authSecondaryLinkClass}
            >
              Back to sign in
            </button>
          </p>
        </form>
      )}
    </AuthPageShell>
  );
}
