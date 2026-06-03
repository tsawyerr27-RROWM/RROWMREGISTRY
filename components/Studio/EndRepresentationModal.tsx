"use client";

import { useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  translateCanonicalPhrase,
} from "@/lib/representation-i18n";
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
  const { t } = useLocalePreferences();
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    if (busy) return;
    setNotes("");
    setAcknowledged(false);
    onClose();
  };

  const tooltipText = [
    translateCanonicalPhrase("priorContributionsRemainVisible", t),
    translateCanonicalPhrase("historicalInstitutionLayer", t),
  ].join(". ");

  return (
    <ModalShell isOpen={open} onClose={handleClose} tone="silver">
      <div className="max-w-md">
        <InfoTooltip
          text={`${t("studio.endRepresentation.title")}. ${tooltipText}`}
        />
        <h3 className="font-serif text-xl font-normal text-neutral-950">
          {t("studio.endRepresentation.title")}
        </h3>
        <label className="mt-5 block">
          <span className={workspace.type.label}>
            {t("studio.endRepresentation.noteOptional")}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t("studio.endRepresentation.notePlaceholder")}
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
            {t("studio.endRepresentation.acknowledge")}
          </span>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm text-neutral-600 transition hover:text-neutral-900"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={busy || !acknowledged}
            onClick={() => void onConfirm(notes.trim())}
            className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-45"
          >
            {busy ? t("common.ending") : t("studio.records.endOnFile")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
