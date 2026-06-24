"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthFieldStyles";

const PASSWORD_UPDATE_TIMEOUT_MS = 12_000;
const LOGIN_REDIRECT_DELAY_MS = 1500;

/**
 * Supabase can apply the password server-side while the `updateUser` promise
 * never resolves during PASSWORD_RECOVERY (auth lock contention). Accept success
 * from the promise, a USER_UPDATED event, or a timeout fallback.
 */
function updatePasswordWithRecovery(
  supabase: SupabaseClient,
  password: string
): Promise<{ error: Error | null }> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (result: { error: Error | null }) => {
      if (settled) return;
      settled = true;
      subscription.unsubscribe();
      window.clearTimeout(timer);
      resolve(result);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "USER_UPDATED") {
        settle({ error: null });
      }
    });

    const timer = window.setTimeout(() => {
      settle({ error: null });
    }, PASSWORD_UPDATE_TIMEOUT_MS);

    void supabase.auth.updateUser({ password }).then(({ error }) => {
      if (error) {
        settle({ error });
        return;
      }
      settle({ error: null });
    });
  });
}

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
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
    let cancelled = false;

    const markReady = (session: Session | null) => {
      if (cancelled) return;
      setSessionReady(Boolean(session));
      setChecked(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        markReady(session);
      }
    });

    void (async () => {
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErr(error.message);
          setChecked(true);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setErr(error.message);
      }
      markReady(data.session);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [sb, searchParams]);

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

    try {
      const { error } = await updatePasswordWithRecovery(sb(), password);

      if (error) {
        setErr(error.message);
        return;
      }

      setSuccess(true);
      window.setTimeout(() => {
        window.location.assign("/login");
      }, LOGIN_REDIRECT_DELAY_MS);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checked && !sessionReady && !success) {
    return (
      <AuthPageShell
        title="Link expired or invalid"
        subtitle="Open the reset link from your most recent email, or request a new one from the sign-in page."
        footer={null}
      >
        <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
          For your security, password reset links expire after a short time. If you
          already changed your password, sign in with your new credentials.
        </p>
        <p className="mt-6">
          <Link
            href="/login?view=forgot"
            className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            Request a new reset link
          </Link>
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
          aria-busy={submitting}
          className={authPrimaryButtonClass}
        >
          {submitting ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthPageShell>
  );
}
