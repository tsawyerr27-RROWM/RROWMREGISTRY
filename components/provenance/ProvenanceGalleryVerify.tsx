"use client";

import Link from "next/link";
import { useState } from "react";

import { GalleryVerifyAttestationModal } from "@/components/gallery/GalleryVerifyAttestationModal";
import { VerificationShareControl } from "@/components/Registry/VerificationShareControl";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldVerifyRecordHref } from "@/lib/field-nav";
import { buildVerificationShareContext } from "@/lib/verification-share";

type Props = {
  artworkId: string;
  artworkTitle: string;
  registryId: string;
  canMarkVerified: boolean;
};

/**
 * Inline gallery verification control for provenance (gallery view only).
 */
export function ProvenanceGalleryVerify({
  artworkId,
  artworkTitle,
  registryId,
  canMarkVerified,
}: Props) {
  const { t } = useLocalePreferences();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedJustNow, setVerifiedJustNow] = useState(false);

  if (!canMarkVerified) return null;

  const onConfirm = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/registry/verify-artwork", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ artwork_id: artworkId }),
    });
    const payload = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(payload.error || "Verification failed.");
      return;
    }
    setOpen(false);
    setVerifiedJustNow(true);
  };

  const shareContext = buildVerificationShareContext({
    registryId,
    artworkTitle: artworkTitle.trim() || "Work on file",
    verifierName: null,
    trustLevel: "established",
    verifiedAt: new Date().toISOString(),
    isVerified: true,
  });

  if (verifiedJustNow) {
    return (
      <section className="mt-6 rounded-[1.15rem] border border-neutral-300/70 bg-gradient-to-br from-[#f7f4ef] via-[#fafaf8] to-[#f0ebe3] px-5 py-5">
        <p className="text-sm font-medium text-neutral-900">
          {t("verification.share.successTitle")}
        </p>
        <VerificationShareControl context={shareContext} className="mt-4" />
        <Link
          href={fieldVerifyRecordHref(registryId)}
          className="mt-4 inline-flex text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4"
        >
          {t("verification.share.viewVerificationPage")}
        </Link>
      </section>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        Mark as verified
      </button>
      {error ? <p className="mt-3 text-sm text-neutral-600">{error}</p> : null}
      <GalleryVerifyAttestationModal
        isOpen={open}
        onClose={() => !busy && setOpen(false)}
        artworkTitle={artworkTitle}
        registryId={registryId}
        busy={busy}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
