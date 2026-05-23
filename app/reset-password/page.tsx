"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthFieldStyles";

export default function ResetPasswordPage() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const [sessionReady, setSessionReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = sb();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: unknown) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setSessionReady(!!session);
        }
      },
    );

    void supabase.auth.getSession().then((res: any) => {
      setSessionReady(!!res?.data?.session);
      setChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [sb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await sb().auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      deferredRouterReplace(router, "/login");
    }, 2000);
  };

  if (checked && !sessionReady && !success) {
    return (
      <AuthPageShell
        title="Link expired or invalid"
        subtitle="Open the reset link from your most recent email, or request a new one from the sign-in page."
        footer={
          <Link
            href="/login"
            className="text-[13px] font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500 sm:text-sm"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
          For your security, password reset links expire after a short time. If you
          already changed your password, sign in with your new credentials.
        </p>
      </AuthPageShell>
    );
  }

  if (success) {
    return (
      <AuthPageShell
        title="Password updated"
        subtitle="You can sign in with your new password."
      >
        <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-[13px] text-emerald-900 sm:text-sm">
          Redirecting to sign in…
        </p>
      </AuthPageShell>
    );
  }

  if (!checked) {
    return (
      <AuthPageShell title="Set new password" subtitle="Verifying your session…">
        <p className="text-center text-[14px] text-neutral-500 sm:text-[15px]">
          One moment.
        </p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Set new password"
      subtitle="Choose a strong password you have not used on other sites."
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="reset-password" className={authLabelClass}>
            New password
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className={authLabelClass}>
            Confirm password
          </label>
          <input
            id="reset-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            placeholder="Re-enter password"
          />
        </div>
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
          {submitting ? "Saving…" : "Save password"}
        </button>
        <p className="text-center">
          <Link
            href="/login"
            className="text-[13px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-[0.2em] hover:text-neutral-950 sm:text-sm"
          >
            Cancel and return to sign in
          </Link>
        </p>
      </form>
    </AuthPageShell>
  );
}
