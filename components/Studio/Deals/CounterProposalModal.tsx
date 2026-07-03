"use client";

import { useEffect, useMemo, useState } from "react";

import { DealTermsForm } from "@/components/Deals/DealTermsForm";
import ModalShell from "@/components/ui/ModalShell";
import { useMaxWidth1023 } from "@/hooks/useMaxWidth1023";
import type { DealRow } from "@/lib/deals";
import {
  buildUpdatedTerms,
  resolveTermFieldsForDeal,
  termsToFormValues,
  type DealTermField,
} from "@/lib/deal-intents";
import { workspace } from "@/styles/workspace-design";
import { studioFilingForm } from "@/styles/studio-filing-form";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRow;
  onSubmitted: () => void;
};

const summaryClass = `${studioFilingForm.textarea} mt-2 min-h-[6rem]`;

export function CounterProposalModal({ isOpen, onClose, deal, onSubmitted }: Props) {
  const isMobile = useMaxWidth1023();
  const [values, setValues] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = useMemo<DealTermField[]>(() => {
    const terms =
      deal.terms && typeof deal.terms === "object" && !Array.isArray(deal.terms)
        ? (deal.terms as Record<string, unknown>)
        : {};
    return resolveTermFieldsForDeal({ type: String(deal.type ?? ""), terms });
  }, [deal.terms, deal.type]);

  useEffect(() => {
    if (!isOpen) return;
    const terms =
      deal.terms && typeof deal.terms === "object" && !Array.isArray(deal.terms)
        ? (deal.terms as Record<string, unknown>)
        : {};
    setValues(termsToFormValues(terms));
    setSummary("");
    setError(null);
    setBusy(false);
  }, [deal.terms, isOpen]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const submit = async () => {
    const terms =
      deal.terms && typeof deal.terms === "object" && !Array.isArray(deal.terms)
        ? (deal.terms as Record<string, unknown>)
        : {};

    const nextTerms = buildUpdatedTerms(terms, fields, values);
    if (Object.keys(nextTerms).length === 0) {
      setError("At least one term is required.");
      return;
    }

    const note = summary.trim();
    if (!note) {
      setError("Add a revision summary for the ledger.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/deals/${encodeURIComponent(deal.id)}/counterproposal`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ terms: nextTerms, summary: note }),
        }
      );

      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(payload.error || `Could not submit counterproposal (${res.status}).`);
        return;
      }

      onClose();
      onSubmitted();
    } catch {
      setError("Could not submit counterproposal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      tone="light"
      overlayClassName={
        isMobile
          ? "ds-z-modal-backdrop fixed inset-0 flex items-end bg-[rgba(10,10,10,0.42)] backdrop-blur-md"
          : undefined
      }
      panelClassName={
        isMobile
          ? "relative max-h-[min(92dvh,40rem)] w-full max-w-none overflow-hidden rounded-b-none rounded-t-[var(--v2-radius-modal)]"
          : "relative max-h-[92vh] w-full max-w-2xl overflow-hidden"
      }
    >
      <div className="relative max-h-[92vh] overflow-y-auto overscroll-contain">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-400/30 to-transparent" />

        <div className="px-6 pb-8 pt-12 sm:px-9 sm:pb-10 sm:pt-14">
          <h2 className={workspace.type.sectionTitle}>Counter proposal</h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">
            Revise the structured terms. The prior version is archived as a numbered
            revision in the deal record.
          </p>

          <div className="mt-8 space-y-6">
            {fields.length > 0 ? (
              <DealTermsForm
                fields={fields}
                values={values}
                onChange={(key, value) => {
                  setValues((prev) => ({ ...prev, [key]: value }));
                  setError(null);
                }}
                idPrefix="counter-term"
              />
            ) : (
              <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 text-[14px] text-neutral-600">
                No structured terms are on file for this deal.
              </div>
            )}

            <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
              <label
                htmlFor="counter-revision-summary"
                className="block font-serif text-lg font-normal tracking-tight text-neutral-950"
              >
                Revision summary
              </label>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                Record why the terms changed. This note is entered in the correspondence
                ledger.
              </p>
              <textarea
                id="counter-revision-summary"
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setError(null);
                }}
                placeholder="Summarise the revision for the other participant."
                className={summaryClass}
                maxLength={2000}
              />
            </div>
          </div>

          {error ? (
            <p className="mt-6 text-[14px] leading-relaxed text-neutral-700">{error}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900/[0.06] pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-[13px] font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50 md:min-h-0"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy || fields.length === 0}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50 md:min-h-0"
            >
              {busy ? "Recording…" : "Submit counterproposal"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
