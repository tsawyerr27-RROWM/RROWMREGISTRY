"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModalShell from "@/components/ui/ModalShell";
import { CertificateShareControl } from "@/components/certificate/CertificateShareControl";
import { RegistryTrustPanel } from "@/components/Registry/RegistryTrustPanel";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { buildCertificateShareContext } from "@/lib/certificate-share";
import { recordVerificationPendingLabel } from "@/lib/representation-language";
import { computeRegistryTrustPresentation } from "@/lib/registry-trust-model";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

type CertPublic = {
  has_certificate: boolean;
  revoked: boolean;
  revoked_reason: string | null;
};

type Props = {
  registryId: string | null;
  onClose: () => void;
};

export function CertificateOverviewModal({ registryId, onClose }: Props) {
  const { t } = useLocalePreferences();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [artistName, setArtistName] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [certificate, setCertificate] = useState<CertPublic | undefined>();

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

  const isVerified = verificationStatus === "verified";
  const isRevoked = Boolean(certificate?.revoked);
  const hasCertificate = Boolean(certificate?.has_certificate);

  const shareContext = registryId
    ? buildCertificateShareContext({
        registryId,
        artworkTitle: title || "Work on file",
        artistName,
        isVerified,
        hasCertificate,
        revoked: isRevoked,
      })
    : null;

  const trust = computeRegistryTrustPresentation({
    verificationStatus,
    hasCertificate: Boolean(certificate?.has_certificate),
    certRevoked: isRevoked,
  });
  const certStatusLabel = !isVerified
    ? recordVerificationPendingLabel()
    : certificate?.has_certificate && !isRevoked
      ? t("registry.record.certRecorded")
      : isRevoked
        ? t("registry.record.certRevoked")
        : t("registry.record.certNotRecorded");

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
            <p className="text-sm font-medium text-neutral-700">
              {t("certificate.document.overviewTitle")}
            </p>

            {loading ? (
              <p className="mt-10 text-sm text-neutral-600">{t("common.processing")}</p>
            ) : error ? (
              <p className="mt-10 text-sm text-red-700">{error}</p>
            ) : (
              <>
                <RegistryTrustPanel
                  presentation={trust}
                  variant="modal"
                  className="mt-8"
                />

                <div className="mt-8">
                  <h2 className="font-serif text-[1.75rem] font-normal leading-tight tracking-tight text-neutral-950 md:text-3xl">
                    {title || "–"}
                  </h2>
                  {artistName ? (
                    <p className="mt-3 text-base text-neutral-600">{artistName}</p>
                  ) : null}
                </div>

                {!isVerified && (
                  <div className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <p className="font-medium text-amber-900">
                      {t("certificate.document.notYetVerified")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
                      {t("certificate.document.notYetVerifiedBody")}
                    </p>
                    <Link
                      href={`/registry/${encodeURIComponent(registryId)}/ledger`}
                      className="mt-3 inline-block text-xs font-medium text-amber-900 underline underline-offset-2"
                    >
                      {t("certificate.document.viewRecord")}
                    </Link>
                  </div>
                )}

                <div className="mt-10 space-y-4 text-sm text-neutral-600">
                  <div>
                    <span className="text-sm text-neutral-500">
                      {t("certificate.document.registryId")}
                    </span>
                    <p className="mt-1 font-mono text-xs text-neutral-900">
                      {registryId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      {t("certificate.document.overviewStatus")}
                    </span>
                    <p className="mt-1 text-neutral-900">{certStatusLabel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      Verification
                    </span>
                    <p className="mt-1 capitalize text-neutral-900">
                      {verificationStatus || "–"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-500">
                      Recorded
                    </span>
                    <p className="mt-1 text-neutral-900">
                      {createdAt
                        ? new Date(createdAt).toLocaleDateString()
                        : "–"}
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
                  {shareContext ? (
                    <>
                      <p className="mb-3 text-sm font-medium text-neutral-800">
                        {t("certificate.share.sectionLabel")}
                      </p>
                      <CertificateShareControl context={shareContext} />
                    </>
                  ) : null}
                </div>

                {isVerified ? (
                  <div className="mt-8">
                    <Link
                      href={`/certificate/${encodeURIComponent(registryId)}`}
                      className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      {t("certificate.document.openDocument")}
                    </Link>
                  </div>
                ) : null}

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
