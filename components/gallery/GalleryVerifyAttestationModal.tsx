"use client";

import { useEffect, useId, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle: string;
  registryId: string | null;
  busy: boolean;
  onConfirm: () => void;
};

/**
 * Deliberate, weighty confirmation before gallery verification RPC.
 * Not a casual toggle — mirrors institutional responsibility.
 */
export function GalleryVerifyAttestationModal({
  isOpen,
  onClose,
  artworkTitle,
  registryId,
  busy,
  onConfirm,
}: Props) {
  const [ack, setAck] = useState(false);
  const bodyId = useId();

  useEffect(() => {
    if (!isOpen) setAck(false);
  }, [isOpen]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="liquid-glass rrowm-modal-surface max-h-[90vh] w-full max-w-lg overflow-auto border border-black/[0.06]"
    >
      <div className="p-10 md:p-12" id={bodyId}>
        <h2 className="font-serif text-2xl font-normal leading-snug text-neutral-950">
          Mark this work verified?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          You are about to mark{" "}
          <span className="font-medium text-neutral-800">
            {(artworkTitle || "").trim() || "this work"}
          </span>{" "}
          as verified on behalf of your institution. This action is recorded and may be relied
          upon in the registry and certificate pipeline.
        </p>
        {registryId ? (
          <p className="mt-4 font-mono text-[11px] text-neutral-500">{registryId}</p>
        ) : null}
        <label className="mt-8 flex cursor-pointer gap-3 text-left">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/20"
          />
          <span className="text-sm leading-relaxed text-neutral-700">
            I understand this attestation is recorded on the registry and reflects the
            institution&apos;s confirmation of this work&apos;s record.
          </span>
        </label>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-black/[0.08] bg-white px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ack || busy}
            className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
          >
            {busy ? "Recording…" : "Mark verified"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
