"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, setRememberMe } from "@/lib/supabase";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { getOnboardingRedirectPath, homePathForRole } from "@/lib/onboarding";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/components/auth/AuthFieldStyles";

type View = "signin" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setSubmitting(false);
    if (error) {
      setErr(
        error.message.includes("Invalid login credentials")
          ? "Email or password is incorrect."
          : error.message,
      );
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      deferredRouterReplace(router, "/studio");
      return;
    }

    const needOnboarding = await getOnboardingRedirectPath(supabase, user.id);
    if (needOnboarding) {
      deferredRouterReplace(router, needOnboarding);
      return;
    }

    const { data: actor } = await supabase
      .from("actor_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    deferredRouterReplace(router, homePathForRole(actor?.role) || "/studio");
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
      "If an account exists for that address, you will receive an email with a link to reset your password. Check your inbox and spam folder.",
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
            Access your registry with email and password.{" "}
            <Link
              href="/signup"
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
