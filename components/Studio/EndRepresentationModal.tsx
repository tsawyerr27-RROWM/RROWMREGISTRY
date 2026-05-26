"use client";

import { useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import {
  CANONICAL_RECORD_PHRASES,
  REPRESENTATION_PHRASES,
} from "@/lib/representation-language";
import { workspace } from "@/styles/workspace-design";

type Props = {
  open: boolean;
  onClose: () => void;
  subjectName: string;
  institutionName?: string | null;
  busy?: boolean;
  onConfirm: (notes: string) => void | Promise<void>;
};

/**
 * Phase E: end active institution representation (artist or gallery initiator).
 */
export function EndRepresentationModal({
  open,
  onClose,
  subjectName,
  institutionName,
  busy = false,
  onConfirm,
}: Props) {
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    if (busy) return;
    setNotes("");
    setAcknowledged(false);
    onClose();
  };

  return (
    <ModalShell isOpen={open} onClose={handleClose} tone="silver">
      <div className="max-w-md">
        <InfoTooltip text={<>Ends active representation between the parties. {CANONICAL_RECORD_PHRASES.priorContributionsRemainVisible}. {CANONICAL_RECORD_PHRASES.historicalInstitutionLayer}. The canonical artwork record remains.</>} />
        <h3 className="font-serif text-xl font-normal text-neutral-950">
          End representation on file
        </h3>
        <label className="mt-5 block">
          <span className={workspace.type.label}>Note (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. roster change, contract concluded…"
            className={workspace.modal.field}
          />
        </label>
        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acknowledged}
            disabled={busy}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutral-300"
          />
          <span className="text-sm leading-relaxed text-neutral-700">
            I understand prior institution filings and chronology entries remain
            visible on the public record.
          </span>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm text-neutral-600 transition hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !acknowledged}
            onClick={() => void onConfirm(notes.trim())}
            className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-45"
          >
            {busy ? "Ending…" : "End on file"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
