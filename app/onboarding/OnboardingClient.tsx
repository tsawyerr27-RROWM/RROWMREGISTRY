"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import {
  isPostgresUniqueViolation,
  summarizeRpcError,
} from "@/lib/supabase-rpc-error";
import {
  getOnboardingRedirectPath,
  homePathForRole,
} from "@/lib/onboarding";
import { acceptPendingGalleryInvite } from "@/lib/accept-gallery-invite-client";
import { resolveArtworkAuthenticationReturnPath } from "@/lib/accept-artwork-auth-invite-client";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthFieldStyles";

type Step = "loading" | "role" | "artist" | "collector" | "gallery";

function slugBaseFromName(name: string) {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "gallery";
}

function normalizeOptionalWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

const textareaClass = `${authInputClass} resize-none leading-relaxed`;

export function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");
  const sb = useSupabaseBrowserLazy();

  const [step, setStep] = useState<Step>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [artistFull, setArtistFull] = useState("");
  const [artistDisplay, setArtistDisplay] = useState("");
  const [artistBio, setArtistBio] = useState("");

  const [collectorDisplay, setCollectorDisplay] = useState("");
  const [collectorLocation, setCollectorLocation] = useState("");

  const [galleryName, setGalleryName] = useState("");
  const [galleryLocation, setGalleryLocation] = useState("");
  const [galleryWebsite, setGalleryWebsite] = useState("");

  const gallerySlugPreview = useMemo(() => {
    if (!userId) return "";
    return `${slugBaseFromName(galleryName)}-${userId.replace(/-/g, "").slice(0, 8)}`;
  }, [galleryName, userId]);

  const decideStep = useCallback(async (uid: string) => {
    const { data: actor } = await sb()
      .from("actor_profiles")
      .select("role, onboarding_complete")
      .eq("user_id", uid)
      .maybeSingle();

    const oc = Boolean(
      (actor as { onboarding_complete?: boolean } | null)?.onboarding_complete
    );

    if (!actor?.role) {
      setStep("role");
      return;
    }

    if (actor.role === "artist") {
      const { data: ar } = await sb()
        .from("artists")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (!ar || !oc) {
        setStep("artist");
        return;
      }
    } else if (actor.role === "collector") {
      const { data: cp } = await sb()
        .from("collector_profiles")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!cp || !oc) {
        setStep("collector");
        return;
      }
    } else if (actor.role === "gallery") {
      const { data: gu } = await sb()
        .from("gallery_users")
        .select("gallery_id")
        .eq("user_id", uid)
        .limit(1)
        .maybeSingle();
      if (!gu?.gallery_id || !oc) {
        setStep("gallery");
        return;
      }
    }

    const { data: a } = await sb()
      .from("actor_profiles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();
    deferredRouterReplace(router, homePathForRole(a?.role) || "/studio");
  }, [router, sb]);

  useEffect(() => {
    void (async () => {
      const { data: sessionData } = await sb().auth.getSession();
      if (!sessionData?.session) {
        deferredRouterReplace(
          router,
          `/login?next=${encodeURIComponent("/onboarding")}`
        );
        return;
      }
      const uid = sessionData.session.user.id;
      setUserId(uid);
      await sb().auth.refreshSession();

      const needOnboarding = await getOnboardingRedirectPath(sb(), uid);
      if (!needOnboarding) {
        const { data: actor } = await sb()
          .from("actor_profiles")
          .select("role")
          .eq("user_id", uid)
          .maybeSingle();
        const artworkReturn = resolveArtworkAuthenticationReturnPath();
        deferredRouterReplace(
          router,
          artworkReturn || homePathForRole(actor?.role) || "/studio"
        );
        return;
      }

      if (focus === "gallery") {
        await sb().rpc("set_onboarding_role", {
          p_payload: { p_role: "gallery", p_display_name: "" },
        });
        setStep("gallery");
        return;
      }

      await decideStep(uid);
    })();
  }, [router, focus, decideStep, sb]);

  const pickRole = async (r: "artist" | "collector" | "gallery") => {
    setBusy(true);
    setError(null);
    const { error: e } = await sb().rpc("set_onboarding_role", {
      p_payload: { p_role: r, p_display_name: "" },
    });
    setBusy(false);
    if (e) {
      setError(summarizeRpcError(e) || "Could not save role.");
      return;
    }
    setStep(r);
  };

  const goBackToRole = async () => {
    setError(null);
    setStep("role");
  };

  const submitArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const disp = artistDisplay.trim();
    if (!disp) {
      setError("Display name is required.");
      return;
    }
    setBusy(true);
    const inviteResult = await acceptPendingGalleryInvite();
    if (!inviteResult.ok && inviteResult.error) {
      console.warn("[onboarding] invite accept", inviteResult.error);
    }
    const { error: rpcErr } = await sb().rpc("complete_onboarding_artist", {
      p_full_name: artistFull.trim() || null,
      p_display_name: disp,
      p_bio: artistBio.trim() || null,
    });
    setBusy(false);
    if (rpcErr) {
      setError(summarizeRpcError(rpcErr) || "Could not save profile.");
      return;
    }
    try {
      await fetch("/api/invite/complete-verification", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* non-fatal */
    }
    try {
      sessionStorage.setItem("rrowm_show_welcome", "artist");
    } catch { /* ignore */ }
    const artworkReturn = resolveArtworkAuthenticationReturnPath();
    deferredRouterReplace(router, artworkReturn || "/studio");
  };

  const submitCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const disp = collectorDisplay.trim();
    if (!disp) {
      setError("Display name is required.");
      return;
    }
    setBusy(true);
    const { error: rpcErr } = await sb().rpc("complete_onboarding_collector", {
      p_display_name: disp,
      p_location: collectorLocation.trim() || null,
    });
    setBusy(false);
    if (rpcErr) {
      setError(summarizeRpcError(rpcErr) || "Could not save profile.");
      return;
    }
    try {
      sessionStorage.setItem("rrowm_show_welcome", "collector");
    } catch { /* ignore */ }
    deferredRouterReplace(router, "/collector-studio");
  };

  const submitGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = galleryName.trim();
    if (!n) {
      setError("Enter your gallery name.");
      return;
    }
    setBusy(true);
    const { error: rpcErr } = await sb().rpc("bootstrap_gallery_profile", {
      p_name: n,
      p_slug: slugBaseFromName(galleryName),
      p_location: galleryLocation.trim() || null,
      p_website: normalizeOptionalWebsite(galleryWebsite),
    });
    setBusy(false);
    if (rpcErr) {
      const msg = summarizeRpcError(rpcErr);
      if (
        isPostgresUniqueViolation(rpcErr) ||
        msg.toLowerCase().includes("already exists")
      ) {
        deferredRouterReplace(router, "/institutional-studio-dashboard");
        return;
      }
      setError(msg || "Could not create gallery.");
      return;
    }
    try {
      sessionStorage.setItem("rrowm_show_welcome", "gallery");
    } catch { /* ignore */ }
    deferredRouterReplace(router, "/institutional-studio-dashboard");
  };

  if (step === "loading") {
    return (
      <div className="ds-page-environment flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (step === "role") {
    return (
      <AuthPageShell
        title="How you take part"
        subtitle="Choose the role that best describes how you participate. You can refine details on the next screen."
        cardBelow={null}
      >
        <div className="divide-y divide-black/[0.06]">
          {(
            [
              {
                id: "artist" as const,
                title: "Artist",
                line: "Catalogue your represented works and build a verified public presence.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-500">
                    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 2 1.5 3.5 3 5l1.5 2 1.5-2c1.5-1.5 3-3 3-5A4.5 4.5 0 0 0 12 2Z" />
                    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M5 21c1-3 3.5-5 7-5s6 2 7 5" />
                  </svg>
                ),
              },
              {
                id: "collector" as const,
                title: "Collector",
                line: "Record custody and provenance for works in your collection.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3 9h18M9 9v12" />
                  </svg>
                ),
              },
              {
                id: "gallery" as const,
                title: "Gallery / Institution",
                line: "File works on behalf of represented artists and manage your roster.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-emerald-500">
                    <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                    <path stroke="currentColor" strokeWidth="1.5" d="M9 21v-6h6v6" />
                  </svg>
                ),
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={busy}
              onClick={() => void pickRole(opt.id)}
              className="group flex w-full items-start gap-4 py-5 text-left transition first:pt-0 last:pb-0 hover:opacity-80 disabled:opacity-50"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100/80">
                {opt.icon}
              </span>
              <div className="min-w-0">
                <span className="text-[15px] font-semibold text-neutral-900">
                  {opt.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
                  {opt.line}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                className="mt-2 shrink-0 text-neutral-300 transition group-hover:text-neutral-500 group-hover:translate-x-0.5"
              >
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
        {error ? (
          <p className="mt-6 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
      </AuthPageShell>
    );
  }

  const backButton = (
    <button
      type="button"
      onClick={() => void goBackToRole()}
      className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition hover:text-neutral-800"
    >
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
      </svg>
      Change role
    </button>
  );

  if (step === "artist") {
    return (
      <AuthPageShell
        title="Your name on the catalogue"
        subtitle="This is how you appear on public records and in your studio. You can add more detail later."
        cardBelow={null}
      >
        {backButton}
        <form onSubmit={(e) => void submitArtist(e)} className="space-y-5">
          <div>
            <label className={authLabelClass}>Full name</label>
            <input
              value={artistFull}
              onChange={(e) => setArtistFull(e.target.value)}
              className={authInputClass}
              placeholder="Legal or professional name"
              autoComplete="name"
            />
          </div>
          <div>
            <label className={authLabelClass}>
              Display name <span className="text-red-700">*</span>
            </label>
            <input
              value={artistDisplay}
              onChange={(e) => setArtistDisplay(e.target.value)}
              required
              className={authInputClass}
              placeholder="How you appear on the registry"
            />
          </div>
          <div>
            <label className={authLabelClass}>
              Bio <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={artistBio}
              onChange={(e) => setArtistBio(e.target.value)}
              rows={3}
              className={textareaClass}
              placeholder="A short line about your practice"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={authPrimaryButtonClass}>
            {busy ? "Saving…" : "Continue to studio"}
          </button>
        </form>
      </AuthPageShell>
    );
  }

  if (step === "collector") {
    return (
      <AuthPageShell
        title="How you appear on records"
        subtitle="A simple public-facing name for custody records. No feed, no social layer."
        cardBelow={null}
      >
        {backButton}
        <form onSubmit={(e) => void submitCollector(e)} className="space-y-5">
          <div>
            <label className={authLabelClass}>
              Display name <span className="text-red-700">*</span>
            </label>
            <input
              value={collectorDisplay}
              onChange={(e) => setCollectorDisplay(e.target.value)}
              required
              className={authInputClass}
              placeholder="Your name or how you collect"
            />
          </div>
          <div>
            <label className={authLabelClass}>
              Location <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              value={collectorLocation}
              onChange={(e) => setCollectorLocation(e.target.value)}
              className={authInputClass}
              placeholder="City, country"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={authPrimaryButtonClass}>
            {busy ? "Saving…" : "Continue to collection"}
          </button>
        </form>
      </AuthPageShell>
    );
  }

  if (step === "gallery") {
    return (
      <AuthPageShell
        title="Name your institution"
        subtitle="This is the label artists and the public see next to institutional association."
        cardBelow={null}
      >
        {backButton}
        <form onSubmit={(e) => void submitGallery(e)} className="space-y-5">
          <div>
            <label className={authLabelClass}>
              Gallery name <span className="text-red-700">*</span>
            </label>
            <input
              value={galleryName}
              onChange={(e) => setGalleryName(e.target.value)}
              required
              className={authInputClass}
              placeholder="e.g. Riverside Contemporary"
            />
          </div>
          <div>
            <p className={authLabelClass}>Public URL</p>
            <p className="rounded-xl border border-dashed border-black/[0.1] bg-neutral-50/80 px-4 py-3 font-mono text-sm text-neutral-600">
              /institutional-studio/{gallerySlugPreview || "…"}
            </p>
          </div>
          <div>
            <label className={authLabelClass}>
              Location <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              value={galleryLocation}
              onChange={(e) => setGalleryLocation(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label className={authLabelClass}>
              Website <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              value={galleryWebsite}
              onChange={(e) => setGalleryWebsite(e.target.value)}
              className={authInputClass}
              placeholder="https://your-gallery.com"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={authPrimaryButtonClass}>
            {busy ? "Saving…" : "Continue to institutional studio"}
          </button>
        </form>
      </AuthPageShell>
    );
  }

  return null;
}
