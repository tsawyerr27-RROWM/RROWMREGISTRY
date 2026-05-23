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
import { deferredRouterReplace } from "@/lib/deferred-app-router";

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

/** Optional URLs: avoid input type="url" (browser blocks submit without a scheme). */
function normalizeOptionalWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

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
        deferredRouterReplace(router, homePathForRole(actor?.role) || "/studio");
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
      /* non-fatal: gallery notification retries can be handled later */
    }
    deferredRouterReplace(router, "/studio");
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
    deferredRouterReplace(router, "/institutional-studio-dashboard");
  };

  if (step === "loading") {
    return (
      <div className="ds-page-environment min-h-screen pt-24 text-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  const shell = (inner: React.ReactNode) => (
    <div className="ds-page-environment min-h-screen pb-28 pt-20 text-neutral-900">
      <main className="mx-auto max-w-lg px-6 md:px-10">{inner}</main>
    </div>
  );

  if (step === "role") {
    return shell(
      <>
        <header className="border-b border-black/[0.05] pb-12">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-[2rem]">
            How you take part
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Pick the role that matches your filings. The next screen asks for basics.
            Depth accrues later in the studio.
          </p>
        </header>
        <div className="mt-12 divide-y divide-black/[0.08]">
          {(
            [
              {
                id: "artist" as const,
                title: "Artist",
                line: "Represented works and public catalogue presence",
              },
              {
                id: "collector" as const,
                title: "Collector",
                line: "Custody and holdings on file when you participate",
              },
              {
                id: "gallery" as const,
                title: "Gallery",
                line: "Institutional association for represented artists",
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={busy}
              onClick={() => void pickRole(opt.id)}
              className="flex w-full flex-col items-start py-7 text-left transition hover:opacity-70 disabled:opacity-50 first:pt-0"
            >
              <span className="font-medium text-neutral-900">{opt.title}</span>
              <span className="mt-1 text-sm text-neutral-500">{opt.line}</span>
            </button>
          ))}
        </div>
        {error ? (
          <p className="mt-6 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-10 text-center text-xs text-neutral-500">
          <Link href="/login" className="underline decoration-neutral-300 underline-offset-4">
            Sign out
          </Link>
        </p>
      </>
    );
  }

  if (step === "artist") {
    return shell(
      <>
        <header className="border-b border-black/[0.05] pb-12">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            Your name on the catalogue
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            This is how you read on public records and in the studio. Detail accrues as
            you register represented works.
          </p>
        </header>
        <form onSubmit={(e) => void submitArtist(e)} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Full name
            </label>
            <input
              value={artistFull}
              onChange={(e) => setArtistFull(e.target.value)}
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="Legal or professional name"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Display name <span className="text-red-800">*</span>
            </label>
            <input
              value={artistDisplay}
              onChange={(e) => setArtistDisplay(e.target.value)}
              required
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="How you appear on the registry"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Bio <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={artistBio}
              onChange={(e) => setArtistBio(e.target.value)}
              rows={3}
              className="w-full resize-none border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="A short line about your practice"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition duration-200 ease-out hover:-translate-y-px hover:bg-neutral-900 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {busy ? "Saving…" : "Continue to studio"}
          </button>
        </form>
      </>
    );
  }

  if (step === "collector") {
    return shell(
      <>
        <header className="border-b border-black/[0.05] pb-12">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            How you appear when custody is on file
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            A simple public-facing name for the current record. No feed, no social layer.
          </p>
        </header>
        <form
          onSubmit={(e) => void submitCollector(e)}
          className="mt-10 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Display name <span className="text-red-800">*</span>
            </label>
            <input
              value={collectorDisplay}
              onChange={(e) => setCollectorDisplay(e.target.value)}
              required
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="Your name or how you collect"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Location <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              value={collectorLocation}
              onChange={(e) => setCollectorLocation(e.target.value)}
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="City, country"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition duration-200 ease-out hover:-translate-y-px hover:bg-neutral-900 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {busy ? "Saving…" : "Continue to collection"}
          </button>
        </form>
      </>
    );
  }

  if (step === "gallery") {
    return shell(
      <>
        <header className="border-b border-black/[0.05] pb-12">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950">
            Name your institution on the catalogue
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            This is the label artists and the public see next to institutional
            association. Participant confirmations stay on the chronology.
          </p>
        </header>
        <form onSubmit={(e) => void submitGallery(e)} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Gallery name <span className="text-red-800">*</span>
            </label>
            <input
              value={galleryName}
              onChange={(e) => setGalleryName(e.target.value)}
              required
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="e.g. Riverside Contemporary"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">
              Public URL slug
            </p>
            <p className="border border-dashed border-black/[0.12] bg-neutral-50/80 px-4 py-3 font-mono text-sm text-neutral-700">
              /institutional-studio/{gallerySlugPreview || "…"}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Location <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              value={galleryLocation}
              onChange={(e) => setGalleryLocation(e.target.value)}
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-500">
              Website <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              value={galleryWebsite}
              onChange={(e) => setGalleryWebsite(e.target.value)}
              className="w-full border border-black/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 transition focus:border-neutral-950 focus:outline-none"
              placeholder="https://your-gallery.com or your-gallery.com"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition duration-200 ease-out hover:-translate-y-px hover:bg-neutral-900 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {busy ? "Saving…" : "Continue to institutional studio"}
          </button>
        </form>
      </>
    );
  }

  return null;
}
