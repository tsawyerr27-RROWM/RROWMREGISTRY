"use client";

import { useState } from "react";
import { GalleryVerifyAttestationModal } from "@/components/gallery/GalleryVerifyAttestationModal";
import { supabase } from "@/lib/supabase";

function summarizeRpcError(err: { message?: string } | null): string {
  return err?.message?.trim() || "";
}

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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canMarkVerified) return null;

  const onConfirm = async () => {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("gallery_verify_artwork", {
      p_artwork_id: artworkId,
    });
    setBusy(false);
    if (rpcError) {
      setError(summarizeRpcError(rpcError) || "Verification failed.");
      return;
    }
    setOpen(false);
    window.location.reload();
  };

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
