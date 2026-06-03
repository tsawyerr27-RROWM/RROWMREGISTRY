"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ArtworkRecordReviewView } from "@/components/artist/ArtworkRecordReviewView";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  persistArtworkAuthInviteToken,
  readPendingArtworkAuthInviteToken,
} from "@/lib/accept-artwork-auth-invite-client";
import type { ArtworkAuthenticationInvitePreview } from "@/lib/artwork-authentication-invite";

function buildReturnPath(token: string, artworkId: string): string {
  if (token) {
    return `/authenticate-record?token=${encodeURIComponent(token)}`;
  }
  if (artworkId) {
    return `/authenticate-record?artwork_id=${encodeURIComponent(artworkId)}`;
  }
  return "/authenticate-record";
}

export function AuthenticateArtworkRecordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, region } = useLocalePreferences();
  const [token, setToken] = useState("");
  const artworkId = useMemo(
    () => String(searchParams.get("artwork_id") || "").trim(),
    [searchParams]
  );

  const [preview, setPreview] =
    useState<ArtworkAuthenticationInvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeBusy, setContributeBusy] = useState(false);

  const formatAcceptError = useCallback(
    (message: string): string => {
      const m = message.trim();
      if (!m) return t("gallery.artworkAuth.review.authFailed");
      if (m.toLowerCase().includes("different email")) {
        return t("gallery.artworkAuth.review.wrongEmail");
      }
      if (m.toLowerCase().includes("not authorized")) {
        return t("gallery.artworkAuth.review.notAuthorized");
      }
      return m;
    },
    [t]
  );

  useEffect(() => {
    const fromUrl = String(searchParams.get("token") || "").trim();
    if (fromUrl.length >= 32) {
      setToken(fromUrl);
      persistArtworkAuthInviteToken(fromUrl);
      return;
    }
    const stored = readPendingArtworkAuthInviteToken();
    if (stored) setToken(stored);
  }, [searchParams]);

  const loadPreview = useCallback(async () => {
    if (!token && !artworkId) {
      setPreview(null);
      setErr(t("gallery.artworkAuth.review.missingLink"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      if (token) q.set("token", token);
      else if (artworkId) q.set("artwork_id", artworkId);
      q.set("lang", region.lang);
      const res = await fetch(
        `/api/artwork-authentication/review?${q.toString()}`,
        { credentials: "include" }
      );
      const j = (await res.json().catch(() => null)) as
        | (ArtworkAuthenticationInvitePreview & { valid?: boolean })
        | null;
      if (!j || typeof j.valid !== "boolean") {
        setPreview(null);
        setErr(t("gallery.artworkAuth.review.loadFailed"));
        return;
      }
      setPreview(j);
    } catch {
      setPreview(null);
      setErr(t("gallery.artworkAuth.review.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, artworkId, t, region.lang]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const returnPath = buildReturnPath(token, artworkId);
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(returnPath)}`;

  const accept = async () => {
    if (!preview) return;
    setBusy(true);
    setErr(null);
    try {
      if (preview.acceptMode === "invite_token" && preview.inviteToken) {
        const res = await fetch("/api/artwork-authentication/accept", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: preview.inviteToken }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setErr(
            formatAcceptError(
              j.error || t("gallery.artworkAuth.review.authFailed")
            )
          );
          return;
        }
      } else {
        const res = await fetch("/api/representation/artist-confirm", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artwork_id: preview.artworkId }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setErr(
            formatAcceptError(
              j.error || t("gallery.artworkAuth.review.authFailed")
            )
          );
          return;
        }
      }
      setDone(true);
      void loadPreview();
    } catch {
      setErr(t("gallery.artworkAuth.networkError"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-sm text-neutral-500" role="status">
        {t("gallery.artworkAuth.review.loading")}
      </p>
    );
  }

  if (!preview) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-sm text-neutral-800">
          <p>{err || t("gallery.artworkAuth.review.loadFailed")}</p>
          <p className="mt-3 text-[13px] text-neutral-500">
            {t("gallery.artworkAuth.review.loadFailedHint")}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/55 p-6 shadow-sm backdrop-blur-md space-y-4">
          <p className="text-sm leading-relaxed text-neutral-800">
            {t("gallery.artworkAuth.review.joinPrompt")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/signup"
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              {t("gallery.artworkAuth.review.joinRegistry")}
            </a>
            <a
              href="/login"
              className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
            >
              {t("gallery.artworkAuth.review.signIn")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ArtworkRecordReviewView
      preview={preview}
      done={done}
      busy={busy}
      err={err}
      contributeOpen={contributeOpen}
      contributeBusy={contributeBusy}
      loginHref={loginHref}
      signupHref={signupHref}
      onAccept={accept}
      onOpenContribute={() => setContributeOpen(true)}
      onCloseContribute={() => setContributeOpen(false)}
      onContribute={async (payload) => {
        if (!preview.artworkId) return;
        setContributeBusy(true);
        try {
          const res = await fetch(
            "/api/representation/artist-contribute-authorship",
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                artwork_id: preview.artworkId,
                ...payload,
              }),
            }
          );
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            setErr(j.error || t("gallery.artworkAuth.review.contributeFailed"));
            return;
          }
          setContributeOpen(false);
          const reg = preview.registryId?.trim();
          if (reg) router.push(`/artwork/${encodeURIComponent(reg)}`);
        } finally {
          setContributeBusy(false);
        }
      }}
    />
  );
}
