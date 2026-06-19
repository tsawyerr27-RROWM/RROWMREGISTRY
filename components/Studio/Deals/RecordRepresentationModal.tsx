"use client";

import { useEffect, useMemo, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import {
  exclusivityLabel,
  normalizeRepresentationExclusivity,
  prefillRepresentationFromDealTerms,
  type RepresentationExclusivity,
} from "@/lib/representation-relationships";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRow;
  onRecorded?: (state: DealExecutionPanelState) => void;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/90 px-3.5 py-2.5 text-[15px] leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white";

const labelClass = "block text-sm font-medium text-neutral-700";

const EXCLUSIVITY_OPTIONS: RepresentationExclusivity[] = [
  "exclusive",
  "nonexclusive",
  "unspecified",
];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RecordRepresentationModal({
  isOpen,
  onClose,
  deal,
  onRecorded,
}: Props) {
  const prefill = useMemo(
    () => prefillRepresentationFromDealTerms(deal.terms),
    [deal.terms]
  );

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [exclusivity, setExclusivity] = useState<RepresentationExclusivity>("unspecified");
  const [territory, setTerritory] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStartsAt(todayIsoDate());
    setEndsAt(prefill.ends_at);
    setExclusivity(prefill.exclusivity);
    setTerritory(prefill.territory);
    setNotes(prefill.notes);
    setBusy(false);
    setError(null);
  }, [isOpen, deal.id, prefill]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    setError(null);

    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setError("Could not prepare a secure session. Refresh and try again.");
        return;
      }

      const res = await fetch(
        `/api/deals/${encodeURIComponent(deal.id)}/execution/representation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({
            starts_at: startsAt,
            ends_at: endsAt.trim() || null,
            exclusivity,
            territory: territory.trim() || null,
            notes: notes.trim() || null,
          }),
        }
      );

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        state?: DealExecutionPanelState;
      };

      if (!res.ok) {
        setError(payload.error || `Could not record representation (${res.status}).`);
        return;
      }

      if (payload.state) {
        onRecorded?.(payload.state);
      }
      onClose();
    } catch {
      setError("Could not record representation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      tone="light"
      panelClassName="relative max-h-[92vh] w-full max-w-xl overflow-hidden"
    >
      <div className="relative max-h-[92vh] overflow-y-auto overscroll-contain">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-400/30 to-transparent" />

        <div className="px-6 pb-8 pt-12 sm:px-9 sm:pb-10 sm:pt-14">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
            Record representation
          </h2>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-600">
            File the active artist–organisation relationship from this accepted
            deal. Start date is required.
          </p>

          <div className="mt-8 space-y-5 rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="representation-starts-at" className={labelClass}>
                  Starts at
                </label>
                <input
                  id="representation-starts-at"
                  type="date"
                  value={startsAt}
                  onChange={(e) => {
                    setStartsAt(e.target.value);
                    setError(null);
                  }}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="representation-ends-at" className={labelClass}>
                  Ends at
                </label>
                <input
                  id="representation-ends-at"
                  type="date"
                  value={endsAt}
                  onChange={(e) => {
                    setEndsAt(e.target.value);
                    setError(null);
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="representation-exclusivity" className={labelClass}>
                Exclusivity
              </label>
              <select
                id="representation-exclusivity"
                value={exclusivity}
                onChange={(e) => {
                  setExclusivity(
                    normalizeRepresentationExclusivity(e.target.value)
                  );
                  setError(null);
                }}
                className={fieldClass}
              >
                {EXCLUSIVITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {exclusivityLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="representation-territory" className={labelClass}>
                Territory
              </label>
              <input
                id="representation-territory"
                type="text"
                value={territory}
                onChange={(e) => {
                  setTerritory(e.target.value);
                  setError(null);
                }}
                className={fieldClass}
                maxLength={300}
                placeholder="Optional regions or markets"
              />
            </div>

            <div>
              <label htmlFor="representation-notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="representation-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setError(null);
                }}
                className={`${fieldClass} min-h-[6rem] resize-y`}
                maxLength={2000}
                placeholder="Optional context for the relationship record"
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
              className="rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-[13px] font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !startsAt}
              className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
            >
              {busy ? "Recording…" : "Record representation"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
