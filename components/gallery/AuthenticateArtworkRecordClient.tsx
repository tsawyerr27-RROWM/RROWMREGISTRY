"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ArchivalAuthorshipContributionModal } from "@/components/Studio/ArchivalAuthorshipContributionModal";
import type { ArtworkAuthenticationInvitePreview } from "@/lib/artwork-authentication-invite";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";

export function AuthenticateArtworkRecordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "").trim();
  const [preview, setPreview] = useState<ArtworkAuthenticationInvitePreview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributeBusy, setContributeBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErr("Missing invitation link.");
      return;
    }
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/artwork-authentication/preview?token=${encodeURIComponent(token)}`
        );
        const j = (await res.json().catch(() => null)) as
          | (ArtworkAuthenticationInvitePreview & { valid?: boolean })
          | null;
        if (cancel) return;
        if (!j || typeof j.valid !== "boolean") {
          setErr("Could not load this continuity invitation.");
          return;
        }
        setPreview(j);
      } catch {
        if (!cancel) setErr("Could not load this continuity invitation.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token]);

  const accept = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/artwork-authentication/accept", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(j.error || "Could not authenticate authorship on file.");
        return;
      }
      setDone(true);
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const loginHref = `/login?next=${encodeURIComponent(`/authenticate-record?token=${encodeURIComponent(token)}`)}`;
  const signupHref = `/signup?next=${encodeURIComponent(`/authenticate-record?token=${encodeURIComponent(token)}`)}`;

  if (loading) {
    return (
      <p className="text-center text-sm text-neutral-500">
        Opening continuity invitation…
      </p>
    );
  }

  if (err && !preview) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-sm text-neutral-800">
        {err}
      </div>
    );
  }

  if (preview?.expired) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 px-6 py-8 text-sm leading-relaxed text-neutral-700">
        This continuity invitation has expired. The institution may send a new
        invitation linked to this artwork record.
      </div>
    );
  }

  if (preview?.completed || done) {
    const reg = preview?.registryId?.trim();
    return (
      <>
        <div className="rounded-2xl border border-emerald-900/15 bg-emerald-50/50 px-6 py-8">
          <p className="font-serif text-xl text-neutral-950">
            Authorship authenticated on file
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {CANONICAL_RECORD_PHRASES.artistAttestationOnFile}. You may deepen the
            chronology with an archival authorship contribution.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {reg ? (
              <Link
                href={`/artwork/${encodeURIComponent(reg)}`}
                className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
              >
                View public record
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setContributeOpen(true)}
              className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
            >
              Contribute authorship
            </button>
            <Link
              href="/studio"
              className="rounded-xl px-5 py-2.5 text-sm text-neutral-600 underline"
            >
              Artist studio
            </Link>
          </div>
        </div>
        <ArchivalAuthorshipContributionModal
          isOpen={contributeOpen}
          onClose={() => setContributeOpen(false)}
          artworkTitle={preview?.artworkTitle || ""}
          registryId={preview?.registryId}
          institutionName={preview?.galleryName}
          busy={contributeBusy}
          onSubmit={async (payload) => {
            if (!preview?.artworkId) return;
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
                setErr(j.error || "Could not file contribution.");
                return;
              }
              setContributeOpen(false);
              if (reg) router.push(`/artwork/${encodeURIComponent(reg)}`);
            } finally {
              setContributeBusy(false);
            }
          }}
        />
      </>
    );
  }

  if (!preview?.valid) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-sm text-neutral-700">
        This invitation is not available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Canonical record · Continuity invitation
        </p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-neutral-950">
          {preview.artworkTitle}
        </h1>
        {preview.registryId ? (
          <p className="mt-2 font-mono text-xs text-neutral-500">
            {preview.registryId}
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          An artwork associated with your practice is already on file. You are
          invited to review, authenticate authorship, and deepen the historical
          record — not to approve an institution upload.
        </p>
      </header>

      {preview.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-900/[0.08] shadow-[0_20px_48px_-28px_rgba(15,23,42,0.2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.imageUrl}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-5 py-4 text-sm text-neutral-700">
        <p>
          <span className="font-medium text-neutral-900">Artist on file:</span>{" "}
          {preview.artistNameOnFile}
        </p>
        <p className="mt-1">
          <span className="font-medium text-neutral-900">Institution:</span>{" "}
          {preview.galleryName}
        </p>
        <ul className="mt-3 space-y-1 text-[12px] text-neutral-500">
          <li>
            {preview.institutionOnFile
              ? CANONICAL_RECORD_PHRASES.institutionAttestationOnFile
              : "Institution continuity on file"}
          </li>
          <li>
            {preview.artistAttestationOnFile
              ? CANONICAL_RECORD_PHRASES.artistAttestationOnFile
              : CANONICAL_RECORD_PHRASES.artistAttestationNotYetOnFile}
          </li>
        </ul>
        {preview.personalMessage ? (
          <p className="mt-4 border-t border-neutral-900/[0.06] pt-4 text-[13px] italic text-neutral-600">
            {preview.personalMessage}
          </p>
        ) : null}
      </div>

      {preview.requiresAuth ? (
        <div className="space-y-3 rounded-xl border border-amber-900/15 bg-amber-50/40 px-5 py-4">
          <p className="text-sm text-neutral-800">
            Sign in as <span className="font-medium">{preview.maskedRecipientEmail}</span>{" "}
            to authenticate authorship on this record.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={loginHref}
              className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              href={signupHref}
              className="rounded-xl border border-neutral-900/12 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800"
            >
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void accept()}
            className="w-full rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "Recording…" : "Authenticate authorship on file"}
          </button>
          <p className="text-center text-[12px] text-neutral-500">
            {CANONICAL_RECORD_PHRASES.notApprovalWorkflow}
          </p>
        </div>
      )}
      {err ? (
        <p className="text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
