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
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";

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

function InviteTrustFooter() {
  const { t } = useLocalePreferences();
  return (
    <p className="mx-auto max-w-md text-[12px] leading-relaxed text-neutral-500 sm:text-[13px]">
      {t("signup.invite.trustFooter")}
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
  const { t } = useLocalePreferences();
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
    if (role === "gallery") return t("signup.role.gallery");
    if (role === "artist") return t("signup.role.artist");
    return t("signup.role.collector");
  }, [role, t]);

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
      setErr(t("signup.err.inviteBlocked"));
      return;
    }

    if (!cleanEmail) {
      setErr(t("signup.err.emailRequired"));
      return;
    }
    if (password.length < 8) {
      setErr(t("signup.err.passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setErr(t("signup.err.passwordMismatch"));
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

    setInfoMsg(t("signup.checkEmail"));
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
          title={t("signup.invite.title")}
          subtitle={
            <p className="text-[14px] text-neutral-600 sm:text-[15px]">
              {t("signup.invite.verifying")}
            </p>
          }
        >
          <p
            className="text-center text-[14px] text-neutral-500"
            role="status"
          >
            {t("signup.invite.oneMoment")}
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
        fetch_error: t("signup.invite.fetchError"),
        expired: t("signup.invite.expired"),
        used: t("signup.invite.used"),
        invalid: t("signup.invite.invalid"),
      };
      return (
        <AuthPageShell
          {...shellCommon}
          title={titles[inviteSurface] || t("signup.invite.title")}
          subtitle={
            <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
              {inviteSurface === "used"
                ? t("signup.invite.usedSubtitle")
                : t("signup.invite.fallbackSubtitle")}
            </p>
          }
        >
          <div className="flex flex-col gap-4">
            <Link
              href="/signup"
              className={authPrimaryButtonClass + " text-center"}
            >
              {t("auth.createAccount")}
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-neutral-900/12 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-800"
            >
              {t("auth.signIn")}
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
              <InfoTooltip text="Works associated with your practice are on file. Review the records, then join to authenticate authorship and contribute to the continuity." />
              <h1 className="mt-3 font-serif text-[1.65rem] font-normal leading-tight tracking-tight text-neutral-950 sm:text-3xl">
                {t("signup.invite.recordsTitle")}
              </h1>
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
                  {fillMessage(t("signup.invite.noArtworks"), { gallery: gName })}
                </p>
              </div>
            )}

            {/* Join / Sign in CTAs */}
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white/95 p-6 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <p className="text-sm leading-relaxed text-neutral-700">
                {masked
                  ? fillMessage(t("signup.invite.joinMasked"), { email: masked })
                  : t("signup.invite.joinGeneric")}
              </p>
              <p className="mt-2 text-[12px] text-neutral-500">
                {t("signup.invite.attestationNote")}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className={authPrimaryButtonClass + " flex-1 text-center"}
                >
                  {t("signup.invite.joinToAuthenticate")}
                </button>
                <Link
                  href={loginHref}
                  className="flex-1 rounded-xl border border-neutral-900/12 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-800"
                >
                  {t("auth.signIn")}
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
        title={t("signup.invite.createArtistProfile")}
        subtitle={
          <p className="text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
            <span className="font-medium text-neutral-800">{gName}</span>{" "}
            {t("signup.invite.galleryInvited")}
          </p>
        }
      >
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {masked ? (
              <p className="text-[13px] leading-relaxed text-neutral-600 sm:text-sm">
                {fillMessage(t("signup.invite.directedTo"), { email: masked })}
              </p>
            ) : null}
            <div>
              <label htmlFor="signup-email" className={authLabelClass}>
                {t("auth.email")}
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
                {t("auth.password")}
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${authInputClass} ${authInputDisabledClass}`}
                placeholder={t("signup.passwordPlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="signup-confirm" className={authLabelClass}>
                {t("signup.confirmPassword")}
              </label>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${authInputClass} ${authInputDisabledClass}`}
                placeholder={t("signup.confirmPlaceholder")}
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
              {submitting ? t("signup.creatingProfile") : t("signup.createProfile")}
            </button>
          </form>
        </div>
      </AuthPageShell>
    );
  }

  /* ── Standard (non-invite) signup ── */
  return (
    <AuthPageShell
      title={
        isArtworkAuthFlow ? t("signup.createArtistAccount") : t("signup.joinTitle")
      }
      subtitle={
        <>
          {isArtworkAuthFlow ? (
            <span className="block pb-2 text-neutral-600">
              {t("signup.subtitleArtworkAuth")}
            </span>
          ) : null}
          {t("signup.signingUpAs")}{" "}
          <span className="font-medium text-neutral-900">{roleLabel}</span>.{" "}
          {t("signup.studioDesc")} {t("signup.alreadyRegistered")}{" "}
          <Link
            href={loginHref}
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            {t("auth.signIn")}
          </Link>
        </>
      }
      footer={
        <p className="text-[13px] text-neutral-600 sm:text-sm">
          <Link
            href="/get-started"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.2em] hover:decoration-neutral-500"
          >
            {t("signup.otherEntryPaths")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="signup-email" className={authLabelClass}>
            {t("signup.workEmail")}
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
            {t("auth.password")}
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder={t("signup.passwordPlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="signup-confirm" className={authLabelClass}>
            {t("signup.confirmPassword")}
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            placeholder={t("signup.confirmPlaceholder")}
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
          {submitting ? t("signup.creatingProfile") : t("signup.createProfile")}
        </button>
      </form>
    </AuthPageShell>
  );
}
