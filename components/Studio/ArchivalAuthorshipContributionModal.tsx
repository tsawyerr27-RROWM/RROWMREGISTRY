"use client";

import { useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";

const fieldClass =
  "w-full rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-3 text-sm leading-snug text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 resize-none";

const labelClass = "mb-2 block text-sm font-semibold text-neutral-500";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle: string;
  registryId?: string | null;
  institutionName?: string | null;
  busy?: boolean;
  onSubmit: (payload: {
    authorship_statement: string;
    chronology_contribution: string;
  }) => void | Promise<void>;
};

/**
 * Archival authorship contribution — layered attestation on the chronology, not editing the canonical record.
 */
export function ArchivalAuthorshipContributionModal({
  isOpen,
  onClose,
  artworkTitle,
  registryId,
  institutionName,
  busy = false,
  onSubmit,
}: Props) {
  const [authorshipStatement, setAuthorshipStatement] = useState("");
  const [chronologyContribution, setChronologyContribution] = useState("");

  const canSubmit =
    authorshipStatement.trim().length > 0 || chronologyContribution.trim().length > 0;

  const handleClose = () => {
    if (busy) return;
    setAuthorshipStatement("");
    setChronologyContribution("");
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      tone="light"
      panelClassName="max-h-[90vh] w-full max-w-xl overflow-auto"
    >
      <div className="p-8 md:p-10">
        <InfoTooltip text={<>Archival authorship contribution. {CANONICAL_RECORD_PHRASES.recordDeepensOverTime}. Your words are filed as participant attestation on the chronology. They do not replace institution filings or rewrite the canonical record.</>} />
        <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-neutral-950">
          Deepen the record
        </h2>

        <div className="mt-6 rounded-xl border border-neutral-900/[0.06] bg-neutral-50/80 px-4 py-3">
          <p className="text-sm font-medium text-neutral-900">
            {(artworkTitle || "").trim() || "Work on file"}
          </p>
          {registryId ? (
            <p className="mt-1 font-mono text-[10px] text-neutral-500">{registryId}</p>
          ) : null}
          {institutionName ? (
            <p className="mt-1 text-[12px] text-neutral-500">
              {CANONICAL_RECORD_PHRASES.institutionAttestationOnFile} · {institutionName}
            </p>
          ) : null}
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className={labelClass}>Authorship statement</label>
            <textarea
              rows={4}
              value={authorshipStatement}
              onChange={(e) => setAuthorshipStatement(e.target.value)}
              className={fieldClass}
              placeholder="How you understand authorship for this work: practice, intent, or documentary context…"
            />
          </div>
          <div>
            <label className={labelClass}>Chronology contribution</label>
            <textarea
              rows={3}
              value={chronologyContribution}
              onChange={(e) => setChronologyContribution(e.target.value)}
              className={fieldClass}
              placeholder="Dates, production context, exhibition history, or continuity you want on file…"
            />
          </div>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-neutral-500">
          {CANONICAL_RECORD_PHRASES.notApprovalWorkflow}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canSubmit || busy}
            onClick={() =>
              void onSubmit({
                authorship_statement: authorshipStatement.trim(),
                chronology_contribution: chronologyContribution.trim(),
              })
            }
            className="flex-1 rounded-2xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "Filing contribution…" : "File contribution on chronology"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="rounded-2xl border border-neutral-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
