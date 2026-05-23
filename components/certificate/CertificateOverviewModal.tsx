"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ModalShell from "@/components/ui/ModalShell";
import { recordVerificationPendingLabel } from "@/lib/representation-language";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { getSiteUrl } from "@/lib/site-url";

type CertPublic = {
  has_certificate: boolean;
  revoked: boolean;
  revoked_reason: string | null;
};

function buildShareUrl(registryId: string) {
  return `${getSiteUrl()}/verify/${encodeURIComponent(registryId)}`;
}

function SocialIconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SocialIconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SocialIconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function SocialIconShare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function SocialIconLink({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

type Props = {
  registryId: string | null;
  onClose: () => void;
};

export function CertificateOverviewModal({ registryId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [artistName, setArtistName] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [certificate, setCertificate] = useState<CertPublic | undefined>();

  useEffect(() => {
    setCopied(false);
  }, [registryId]);

  useEffect(() => {
    if (!registryId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: artwork, error: awErr } = await supabase
        .from("artworks")
        .select("id, title, registry_id, verification_status, created_at, artist_id")
        .eq("registry_id", registryId.trim())
        .maybeSingle();

      if (cancelled) return;
      if (awErr || !artwork) {
        setError(
          awErr
            ? summarizeRpcError(awErr)
            : "Could not load this registry record."
        );
        setLoading(false);
        return;
      }

      setTitle(artwork.title || "");
      setVerificationStatus(String(artwork.verification_status || ""));
      setCreatedAt(artwork.created_at || null);

      const { data: artist } = await supabase
        .from("artists")
        .select("display_name, full_name")
        .eq("id", artwork.artist_id)
        .maybeSingle();

      if (!cancelled) {
        const name =
          artist?.display_name?.trim() || artist?.full_name?.trim() || null;
        setArtistName(name);
      }

      const isVerified = artwork.verification_status === "verified";
      if (isVerified) {
        const { data: certRows, error: certErr } = await supabase.rpc(
          "get_certificate_public_status_single",
          { p_artwork_id: artwork.id }
        );
        if (!cancelled) {
          if (certErr) {
            console.warn("[CertificateOverviewModal]", certErr);
          }
          setCertificate(certRows?.[0] as CertPublic | undefined);
        }
      } else {
        setCertificate(undefined);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [registryId]);

  const shareUrl = registryId ? buildShareUrl(registryId) : "";
  const shareText = registryId
    ? `Certificate overview · ${title || "RROWM registry"} (${registryId})`
    : "";

  const openPopup = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }, []);

  const shareNative = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "RROWM · certificate overview",
          text: shareText,
          url: shareUrl,
        });
      }
    } catch {
      /* user cancelled or share failed */
    }
  }, [shareText, shareUrl]);

  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    if (!shareUrl || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  const isVerified = verificationStatus === "verified";
  const isRevoked = Boolean(certificate?.revoked);
  const certStatusLabel = !isVerified
    ? recordVerificationPendingLabel()
    : !certificate?.has_certificate
      ? "Certificate not recorded"
      : isRevoked
        ? "Revoked"
        : "Certificate recorded";

  return (
    <ModalShell
      isOpen={!!registryId}
      onClose={onClose}
      tone="silver"
      panelClassName="relative w-full max-w-xl overflow-hidden md:max-w-[26rem]"
    >
      {registryId ? (
        <div className="relative max-h-[min(90vh,44rem)] overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-slate-400/[0.14] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-[18rem] w-[18rem] rounded-full bg-emerald-500/[0.12] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/45 to-transparent" />

          <div className="relative px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-14">
            <p className="text-sm font-semibold text-emerald-800/80">
              Certificate overview
            </p>

            {loading ? (
              <p className="mt-10 text-sm text-white/70">Loading…</p>
            ) : error ? (
              <p className="mt-10 text-sm text-red-300/90">{error}</p>
            ) : (
              <>
                <h2 className="mt-8 font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-3xl">
                  {title || "—"}
                </h2>
                {artistName ? (
                  <p className="mt-3 text-base text-neutral-600">{artistName}</p>
                ) : null}

                {!isVerified && (
                  <div className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <p className="font-medium text-amber-900">Not yet verified</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
                      Certificate verification applies after the record is
                      verified.
                    </p>
                    <Link
                      href={`/registry/${encodeURIComponent(registryId)}`}
                      className="mt-3 inline-block text-xs font-medium text-amber-900 underline underline-offset-2"
                    >
                      View registry record
                    </Link>
                  </div>
                )}

                <div className="mt-10 space-y-4 text-sm text-neutral-600">
                  <div>
                    <span className="text-sm text-neutral-500">
                      Registry ID
                    </span>
                    <p className="mt-1 font-mono text-xs text-neutral-900">
                      {registryId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      Certificate status
                    </span>
                    <p className="mt-1 capitalize text-neutral-900">
                      {certStatusLabel}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      Verification
                    </span>
                    <p className="mt-1 capitalize text-neutral-900">
                      {verificationStatus || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      Recorded
                    </span>
                    <p className="mt-1 text-neutral-900">
                      {createdAt
                        ? new Date(createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {isVerified && isRevoked && certificate?.revoked_reason ? (
                    <div className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100/95">
                      <p className="text-sm font-medium text-red-200/90">
                        Revocation reason
                      </p>
                      <p className="mt-2">{certificate.revoked_reason}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-10 border-t border-neutral-200/90 pt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {typeof navigator !== "undefined" &&
                    typeof navigator.share === "function" ? (
                      <button
                        type="button"
                        onClick={() => void shareNative()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white/80 px-3 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-100"
                      >
                        <SocialIconShare className="h-4 w-4" />
                        Share…
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        openPopup(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                        )
                      }
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200/90 bg-white/70 p-2.5 text-neutral-900 transition hover:bg-neutral-100"
                      title="Share on X"
                      aria-label="Share on X"
                    >
                      <SocialIconX className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openPopup(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                        )
                      }
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200/90 bg-white/70 p-2.5 text-neutral-900 transition hover:bg-neutral-100"
                      title="Share on Facebook"
                      aria-label="Share on Facebook"
                    >
                      <SocialIconFacebook className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openPopup(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
                        )
                      }
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200/90 bg-white/70 p-2.5 text-neutral-900 transition hover:bg-neutral-100"
                      title="Share on LinkedIn"
                      aria-label="Share on LinkedIn"
                    >
                      <SocialIconLinkedIn className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white/70 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                      title="Copy verification link"
                    >
                      <SocialIconLink className="h-4 w-4" />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>

                {isVerified ? (
                  <div className="mt-8">
                    <Link
                      href={`/certificate/${encodeURIComponent(registryId)}`}
                      className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] transition hover:bg-white/95"
                    >
                      View full certificate
                    </Link>
                  </div>
                ) : (
                  <p className="mt-8 text-center text-xs text-neutral-400">
                    Full certificate is available once the work is verified.
                  </p>
                )}

                <p className="mt-6 text-center text-[11px] leading-relaxed text-neutral-500">
                  Fingerprints and certificate numbers stay off public surfaces.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
