"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
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

/** Mirrors GET /api/invite/preview JSON (kept local to avoid bundling route modules). */
type InvitePreviewPayload = {
  valid: boolean;
  expired: boolean;
  used: boolean;
  galleryName: string;
  maskedEmail: string;
};

const authInputDisabledClass =
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50";

const TRUST_FOOTER_COPY =
  "This invitation was sent through the RROWM Registry. Your details are used only to establish your profile and what appears on file for represented works.";

function InviteTrustFooter() {
  return (
    <p className="mx-auto max-w-md text-[12px] leading-relaxed text-neutral-500 sm:text-[13px]">
      {TRUST_FOOTER_COPY}
    </p>
  );
}

type InviteSurfaceState =
  | "loading"
  | "fetch_error"
  | "expired"
  | "used"
  | "invalid"
  | "valid";

function resolveInviteSurface(
  loading: boolean,
  fetchErr: boolean,
  preview: InvitePreviewPayload | null
): InviteSurfaceState {
  if (loading) return "loading";
  if (fetchErr) return "fetch_error";
  if (!preview) return "invalid";
  if (preview.expired) return "expired";
  if (preview.used) return "used";
  if (preview.valid) return "valid";
  return "invalid";
}

export function SignupClient() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const searchParams = useSearchParams();
  const inviteTokenParam = useMemo(
    () => String(searchParams.get("invite_token") || "").trim(),
    [searchParams]
  );
  const isInviteFlow = Boolean(inviteTokenParam);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (!inviteTokenParam) {
      document.documentElement.removeAttribute("data-rrowm-invite-signup");
      return;
    }
    document.documentElement.setAttribute("data-rrowm-invite-signup", "1");
    return () => {
      document.documentElement.removeAttribute("data-rrowm-invite-signup");
    };
  }, [inviteTokenParam]);

  const role = useMemo(() => {
    if (inviteTokenParam) return "artist" as const;
    return normalizeRole(searchParams.get("role"));
  }, [inviteTokenParam, searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [invitePreview, setInvitePreview] = useState<InvitePreviewPayload | null>(
    null
  );
  const [invitePreviewLoading, setInvitePreviewLoading] = useState(false);
  const [invitePreviewFetchErr, setInvitePreviewFetchErr] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const prefillEmail = useMemo(() => {
    const raw = String(searchParams.get("email") || "").trim().toLowerCase();
    return raw;
  }, [searchParams]);

  useEffect(() => {
    if (!prefillEmail) return;
    setEmail((prev) => (prev.trim() ? prev : prefillEmail));
  }, [prefillEmail]);

  useEffect(() => {
    if (!inviteTokenParam || typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("rrowm_invite_token", inviteTokenParam);
    } catch {
      /* ignore */
    }
  }, [inviteTokenParam]);

  const roleLabel = useMemo(() => {
    if (role === "gallery") return "Gallery";
    if (role === "artist") return "Artist";
    return "Collector";
  }, [role]);

  const completeQs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("role", role);
    if (inviteTokenParam) q.set("invite_token", inviteTokenParam);
    return q;
  }, [role, inviteTokenParam]);

  const signupCompleteRedirectQs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("role", role);
    if (inviteTokenParam) q.set("invite_token", inviteTokenParam);
    return q;
  }, [role, inviteTokenParam]);

  const loginHref = useMemo(() => {
    if (!inviteTokenParam) return "/login";
    return `/login?invite_token=${encodeURIComponent(inviteTokenParam)}`;
  }, [inviteTokenParam]);

  useEffect(() => {
    if (!inviteTokenParam) {
      setInvitePreview(null);
      setInvitePreviewLoading(false);
      setInvitePreviewFetchErr(false);
      return;
    }
    let cancelled = false;
    setInvitePreviewLoading(true);
    setInvitePreviewFetchErr(false);
    setInvitePreview(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/invite/preview?token=${encodeURIComponent(inviteTokenParam)}`,
          { method: "GET" }
        );
        const j = (await res.json().catch(() => null)) as Partial<InvitePreviewPayload> | null;
        if (cancelled) return;
        if (!j || typeof j.valid !== "boolean") {
          setInvitePreviewFetchErr(true);
          setInvitePreview(null);
          return;
        }
        setInvitePreview({
          valid: Boolean(j.valid),
          expired: Boolean(j.expired),
          used: Boolean(j.used),
          galleryName: String(j.galleryName || "").trim() || "Gallery",
          maskedEmail: String(j.maskedEmail || "").trim() || "",
        });
      } catch {
        if (cancelled) return;
        setInvitePreviewFetchErr(true);
        setInvitePreview(null);
      } finally {
        if (!cancelled) setInvitePreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteTokenParam]);

  const inviteSurface = resolveInviteSurface(
    invitePreviewLoading,
    invitePreviewFetchErr,
    invitePreview
  );

  const inviteSignupAllowed = inviteSurface === "valid";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfoMsg(null);

    if (inviteTokenParam && !inviteSignupAllowed) {
      setErr("This invitation cannot be used to complete registration.");
      return;
    }

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
    const emailRedirectTo = `${origin}/signup/complete?${signupCompleteRedirectQs.toString()}`;

    if (inviteTokenParam && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem("rrowm_invite_token", inviteTokenParam);
      } catch {
        /* ignore */
      }
    }

    const supabase = sb();
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
        `/signup/complete?${completeQs.toString()}`,
      );
      return;
    }

    try {
      window.sessionStorage.setItem("rrowm_pending_signup_role", role);
    } catch {
      /* ignore */
    }

    setInfoMsg(
      "Check your email to confirm your address, then return here in this browser to finish setup.",
    );
  };

  if (isInviteFlow) {
    const shellCommon = {
      reserveHeaderOffset: false,
      cardBelow: null,
      footer: <InviteTrustFooter />,
    };

    if (inviteSurface === "loading") {
      return (
        <AuthPageShell
          {...shellCommon}
          title="Invitation"
          subtitle={
            <p className="text-[14px] text-neutral-600 sm:text-[15px]">
              Verifying your invitation…
            </p>
          }
        >
          <p className="text-center text-[14px] text-neutral-500" role="status">
            One moment.
          </p>
        </AuthPageShell>
      );
    }

    if (inviteSurface === "fetch_error") {
      return (
        <AuthPageShell
          {...shellCommon}
          title="This invitation could not be verified. Please try again."
          subtitle={null}
        >
          {null}
        </AuthPageShell>
      );
    }

    if (inviteSurface === "expired") {
      return (
        <AuthPageShell
          {...shellCommon}
          title="This invitation has expired. Please request a new invitation."
          subtitle={null}
        >
          {null}
        </AuthPageShell>
      );
    }

    if (inviteSurface === "used") {
      return (
        <AuthPageShell
          {...shellCommon}
          title="This invitation has already been used."
          subtitle={null}
        >
          {null}
        </AuthPageShell>
      );
    }

    if (inviteSurface === "invalid") {
      return (
        <AuthPageShell
          {...shellCommon}
          title="This invitation is not valid."
          subtitle={null}
        >
          {null}
        </AuthPageShell>
      );
    }

    const gName = invitePreview?.galleryName?.trim() || "Gallery";
    const masked = invitePreview?.maskedEmail?.trim();

    return (
      <AuthPageShell
        {...shellCommon}
        title="Authenticate records on file"
        subtitle={
          <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
            <span className="font-medium text-neutral-800">{gName}</span> participates
            in chronology for works associated with your practice. Canonical records may
            already exist — join to authenticate authorship and deepen the documentary
            record.
          </p>
        }
      >
        <div className="space-y-8">
          <p className="text-[13px] leading-relaxed text-neutral-600 sm:text-sm">
            You&apos;ll confirm your email, finish a short profile, then review canonical
            records, authenticate authorship, and add artist-authored detail. One registry
            identity; layers deepen over time.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {masked ? (
              <p className="text-[13px] leading-relaxed text-neutral-600 sm:text-sm">
                This invitation is directed to{" "}
                <span className="text-neutral-900">{masked}</span>. Use that
                address when you register.
              </p>
            ) : null}
            <div>
              <label htmlFor="signup-email" className={authLabelClass}>
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${authInputClass} ${authInputDisabledClass}`}
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
                className={`${authInputClass} ${authInputDisabledClass}`}
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
                className={`${authInputClass} ${authInputDisabledClass}`}
                placeholder="Re-enter password"
              />
            </div>
            {infoMsg ? (
              <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-800 sm:text-sm">
                {infoMsg}
              </p>
            ) : null}
            {err ? (
              <p className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-900 sm:text-sm">
                {err}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className={authPrimaryButtonClass}
            >
              {submitting ? "Creating profile…" : "Create profile"}
            </button>
          </form>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Join the registry"
      subtitle={
        <>
          You&apos;re signing up as{" "}
          <span className="font-medium text-neutral-900">{roleLabel}</span>
          . Your studio holds represented works, chronology actions, and the current record
          together. Already registered?{" "}
          <Link
            href={loginHref}
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
            Other entry paths
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
          {submitting ? "Creating profile…" : "Create profile"}
        </button>
      </form>
    </AuthPageShell>
  );
}
