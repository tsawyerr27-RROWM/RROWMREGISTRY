"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { persistArtworkAuthInviteFromReturnPath } from "@/lib/accept-artwork-auth-invite-client";
import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
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

type InviteArtworkPreview = {
  title: string;
  registryId: string;
  imageUrl: string | null;
  artistName: string;
};

type InvitePreviewPayload = {
  valid: boolean;
  expired: boolean;
  used: boolean;
  galleryName: string;
  maskedEmail: string;
  artworks?: InviteArtworkPreview[];
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
  const nextParam = useMemo(
    () => sanitizeAuthReturnPath(searchParams.get("next")),
    [searchParams]
  );
  const isArtworkAuthFlow = Boolean(
    nextParam?.includes("/authenticate-record")
  );
  const isInviteFlow = Boolean(inviteTokenParam);
  const [showForm, setShowForm] = useState(false);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (!inviteTokenParam || !showForm) {
      document.documentElement.removeAttribute("data-rrowm-invite-signup");
      return;
    }
    document.documentElement.setAttribute("data-rrowm-invite-signup", "1");
    return () => {
      document.documentElement.removeAttribute("data-rrowm-invite-signup");
    };
  }, [inviteTokenParam, showForm]);

  const role = useMemo(() => {
    if (inviteTokenParam || isArtworkAuthFlow) return "artist" as const;
    return normalizeRole(searchParams.get("role"));
  }, [inviteTokenParam, isArtworkAuthFlow, searchParams]);

  useEffect(() => {
    if (nextParam) persistArtworkAuthInviteFromReturnPath(nextParam);
  }, [nextParam]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [invitePreview, setInvitePreview] =
    useState<InvitePreviewPayload | null>(null);
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
    if (nextParam) q.set("next", nextParam);
    return q;
  }, [role, inviteTokenParam, nextParam]);

  const signupCompleteRedirectQs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("role", role);
    if (inviteTokenParam) q.set("invite_token", inviteTokenParam);
    if (nextParam) q.set("next", nextParam);
    return q;
  }, [role, inviteTokenParam, nextParam]);

  const loginHref = useMemo(() => {
    const q = new URLSearchParams();
    if (inviteTokenParam) q.set("invite_token", inviteTokenParam);
    if (nextParam) q.set("next", nextParam);
    const qs = q.toString();
    return qs ? `/login?${qs}` : "/login";
  }, [inviteTokenParam, nextParam]);

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
          artworks: Array.isArray(j.artworks) ? j.artworks : [],
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
    const completePath = `/signup/complete?${signupCompleteRedirectQs.toString()}`;
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(completePath)}`;

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

    if (error) {
      setSubmitting(false);
      setErr(error.message);
      return;
    }

    if (data.session) {
      try {
        window.sessionStorage.setItem("rrowm_pending_signup_role", role);
      } catch { /* ignore */ }

      const { error: roleErr } = await supabase.rpc("set_onboarding_role", {
        p_payload: { p_role: role, p_display_name: "" },
      });
      setSubmitting(false);
      if (roleErr) {
        console.warn("[signup] set_onboarding_role", roleErr.message);
      }
      if (role === "artist") {
        const { acceptPendingGalleryInvite } = await import(
          "@/lib/accept-gallery-invite-client"
        );
        await acceptPendingGalleryInvite().catch(() => {});
      }
      deferredRouterReplace(router, "/onboarding");
      return;
    }

    setSubmitting(false);
    try {
      window.sessionStorage.setItem("rrowm_pending_signup_role", role);
    } catch { /* ignore */ }

    setInfoMsg(
      "Check your email to confirm your address, then return here in this browser to finish setup."
    );
  };

  /* ── Invite flow ── */
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
          <p
            className="text-center text-[14px] text-neutral-500"
            role="status"
          >
            One moment.
          </p>
        </AuthPageShell>
      );
    }

    if (
      inviteSurface === "fetch_error" ||
      inviteSurface === "expired" ||
      inviteSurface === "used" ||
      inviteSurface === "invalid"
    ) {
      const titles: Record<string, string> = {
        fetch_error: "This invitation could not be verified",
        expired: "This invitation has expired",
        used: "This invitation has already been used",
        invalid: "This invitation is not valid",
      };
      return (
        <AuthPageShell
          {...shellCommon}
          title={titles[inviteSurface] || "Invitation"}
          subtitle={
            <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
              {inviteSurface === "used"
                ? "If you already have an account, sign in below. Otherwise create a new account to get started."
                : "You can still join the registry and manage your records. Create an account or sign in if you already have one."}
            </p>
          }
        >
          <div className="flex flex-col gap-4">
            <Link
              href="/signup"
              className={authPrimaryButtonClass + " text-center"}
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-neutral-900/12 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-800"
            >
              Sign in
            </Link>
          </div>
        </AuthPageShell>
      );
    }

    const gName = invitePreview?.galleryName?.trim() || "Gallery";
    const masked = invitePreview?.maskedEmail?.trim();
    const artworks = invitePreview?.artworks ?? [];

    /* Step 1: Record preview — show before signup form */
    if (!showForm) {
      return (
        <main className="ds-page-environment flex min-h-[100dvh] flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-16 md:px-8 md:pt-20">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="rounded-2xl border border-black/[0.08] bg-white/95 p-6 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Canonical records · Invitation
              </p>
              <h1 className="mt-3 font-serif text-[1.65rem] font-normal leading-tight tracking-tight text-neutral-950 sm:text-3xl">
                Records associated with your practice
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
                <span className="font-medium text-neutral-800">{gName}</span>{" "}
                participates in chronology for works associated with your
                practice. Canonical records may already exist on file within the
                registry.
              </p>
            </div>

            {/* Artwork previews */}
            {artworks.length > 0 ? (
              <div className="mt-6 space-y-4">
                {artworks.map((art, i) => (
                  <div
                    key={`${art.registryId || i}`}
                    className="overflow-hidden rounded-2xl border border-neutral-900/[0.06] bg-white/60 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm"
                  >
                    {art.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.imageUrl}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ) : null}
                    <div className="px-5 py-4">
                      <p className="font-serif text-lg font-normal tracking-tight text-neutral-950">
                        {art.title}
                      </p>
                      {art.registryId ? (
                        <p className="mt-1 font-mono text-[10px] tracking-wide text-neutral-400">
                          {art.registryId}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-neutral-500">
                        {art.artistName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-neutral-900/[0.06] bg-white/60 px-6 py-8 text-center shadow-sm backdrop-blur-sm">
                <p className="text-sm text-neutral-600">
                  Records filed by {gName} will appear in your studio once you
                  join. You can review, authenticate authorship, and deepen each
                  record.
                </p>
              </div>
            )}

            {/* Join / Sign in CTAs */}
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white/95 p-6 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <p className="text-sm leading-relaxed text-neutral-700">
                {masked ? (
                  <>
                    Join the registry as{" "}
                    <span className="font-medium text-neutral-900">
                      {masked}
                    </span>{" "}
                    to authenticate authorship, add continuity, and deepen
                    records on file.
                  </>
                ) : (
                  <>
                    Join the registry to authenticate authorship, add
                    continuity, and deepen records on file.
                  </>
                )}
              </p>
              <p className="mt-2 text-[12px] text-neutral-500">
                Layered attestations only — not ownership adjudication or
                institution approval.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className={authPrimaryButtonClass + " flex-1 text-center"}
                >
                  Join to authenticate
                </button>
                <Link
                  href={loginHref}
                  className="flex-1 rounded-xl border border-neutral-900/12 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-800"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Trust footer */}
            <div className="mt-8 text-center">
              <InviteTrustFooter />
            </div>
          </div>
        </main>
      );
    }

    /* Step 2: Signup form (after clicking "Join to authenticate") */
    return (
      <AuthPageShell
        {...shellCommon}
        title="Create artist profile"
        subtitle={
          <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
            <span className="font-medium text-neutral-800">{gName}</span> has
            invited you to authenticate records on file. After you create your
            profile, you&apos;ll review and deepen each record.
          </p>
        }
      >
        <div className="space-y-8">
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
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="block w-full text-center text-[13px] text-neutral-500 underline decoration-neutral-300 underline-offset-4"
          >
            Back to record preview
          </button>
        </div>
      </AuthPageShell>
    );
  }

  /* ── Standard (non-invite) signup ── */
  return (
    <AuthPageShell
      title={isArtworkAuthFlow ? "Create artist account" : "Join the registry"}
      subtitle={
        <>
          {isArtworkAuthFlow ? (
            <span className="block pb-2 text-neutral-600">
              After setup you will return to review and authenticate the artwork
              record on file.
            </span>
          ) : null}
          You&apos;re signing up as{" "}
          <span className="font-medium text-neutral-900">{roleLabel}</span>.
          Your studio holds represented works, chronology actions, and the
          current record together. Already registered?{" "}
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
