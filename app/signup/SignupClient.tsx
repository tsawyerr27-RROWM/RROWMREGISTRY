"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthFieldStyles";

const allowedRoles = ["artist", "gallery", "collector"] as const;
type SignupRole = (typeof allowedRoles)[number];

function normalizeRole(raw: string | null): SignupRole {
  if (raw === "gallery" || raw === "artist" || raw === "collector") return raw;
  return "collector";
}

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = normalizeRole(searchParams.get("role"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const prefillEmail = useMemo(() => {
    const raw = String(searchParams.get("email") || "").trim().toLowerCase();
    return raw;
  }, [searchParams]);

  useEffect(() => {
    if (!prefillEmail) return;
    setEmail((prev) => (prev.trim() ? prev : prefillEmail));
  }, [prefillEmail]);

  const roleLabel = useMemo(() => {
    if (role === "gallery") return "Gallery";
    if (role === "artist") return "Artist";
    return "Collector";
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfoMsg(null);

    if (!cleanEmail) {
      setErr("Enter your email address.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const emailRedirectTo = `${origin}/signup/complete?role=${encodeURIComponent(role)}`;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo,
        data: { role },
      },
    });
    setSubmitting(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.session) {
      try {
        window.sessionStorage.setItem("rrowm_pending_signup_role", role);
      } catch {
        /* ignore */
      }
      deferredRouterReplace(
        router,
        `/signup/complete?role=${encodeURIComponent(role)}`,
      );
      return;
    }

    try {
      window.sessionStorage.setItem("rrowm_pending_signup_role", role);
    } catch {
      /* ignore */
    }

    setInfoMsg(
      "Check your email to verify your address and finish setup. Open the confirmation link in this browser. If you do not see the message, check spam or promotions.",
    );
  };

  return (
    <AuthPageShell
      title="Create account"
      subtitle={
        <>
          Register as{" "}
          <span className="font-medium text-neutral-900">{roleLabel}</span>.
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            Sign in
          </Link>
        </>
      }
      footer={
        <p className="text-[13px] text-neutral-600 sm:text-sm">
          <Link
            href="/get-started"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            Compare plans
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="signup-email" className={authLabelClass}>
            Work email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className={authLabelClass}>
            Password
          </label>
          <input
            id="signup-password"
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
          <label htmlFor="signup-confirm" className={authLabelClass}>
            Confirm password
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            placeholder="Re-enter password"
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthPageShell>
  );
}
