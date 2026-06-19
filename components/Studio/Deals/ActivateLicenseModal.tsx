"use client";

import { useEffect, useMemo, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import {
  exclusivityLabel,
  normalizeRightsExclusivity,
  normalizeRightsUsageType,
  prefillLicensingFromDealTerms,
  usageTypeLabel,
  type RightsExclusivity,
  type RightsUsageType,
} from "@/lib/rights-licenses";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRow;
  onRecorded?: (state: DealExecutionPanelState) => void;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/90 px-3.5 py-2.5 text-[15px] leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white";

const labelClass = "block text-sm font-medium text-neutral-700";

const USAGE_OPTIONS: RightsUsageType[] = [
  "editorial",
  "commercial",
  "merchandising",
  "publishing",
  "digital",
  "custom",
];

const EXCLUSIVITY_OPTIONS: RightsExclusivity[] = ["exclusive", "nonexclusive"];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActivateLicenseModal({
  isOpen,
  onClose,
  deal,
  onRecorded,
}: Props) {
  const prefill = useMemo(
    () => prefillLicensingFromDealTerms(deal.terms),
    [deal.terms]
  );

  const [usageType, setUsageType] = useState<RightsUsageType>("custom");
  const [territory, setTerritory] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [exclusivity, setExclusivity] = useState<RightsExclusivity>("nonexclusive");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setUsageType(prefill.usage_type);
    setTerritory(prefill.territory);
    setStartsAt(todayIsoDate());
    setEndsAt(prefill.ends_at);
    setExclusivity(prefill.exclusivity);
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
        `/api/deals/${encodeURIComponent(deal.id)}/execution/licensing`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({
            usage_type: usageType,
            territory: territory.trim(),
            starts_at: startsAt,
            ends_at: endsAt.trim() || null,
            exclusivity,
            notes: notes.trim() || null,
          }),
        }
      );

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        state?: DealExecutionPanelState;
      };

      if (!res.ok) {
        setError(payload.error || `Could not activate license (${res.status}).`);
        return;
      }

      if (payload.state) {
        onRecorded?.(payload.state);
      }
      onClose();
    } catch {
      setError("Could not activate license.");
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
            Activate license
          </h2>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-600">
            File the active rights grant from this accepted licensing deal on the
            canonical rights ledger.
          </p>

          <div className="mt-8 space-y-5 rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
            <div>
              <label htmlFor="license-usage-type" className={labelClass}>
                Usage type
              </label>
              <select
                id="license-usage-type"
                value={usageType}
                onChange={(e) => {
                  setUsageType(normalizeRightsUsageType(e.target.value));
                  setError(null);
                }}
                className={fieldClass}
              >
                {USAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {usageTypeLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="license-territory" className={labelClass}>
                Territory
              </label>
              <input
                id="license-territory"
                type="text"
                value={territory}
                onChange={(e) => {
                  setTerritory(e.target.value);
                  setError(null);
                }}
                className={fieldClass}
                maxLength={300}
                placeholder="Geographic or platform scope"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="license-starts-at" className={labelClass}>
                  Starts at
                </label>
                <input
                  id="license-starts-at"
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
                <label htmlFor="license-ends-at" className={labelClass}>
                  Ends at
                </label>
                <input
                  id="license-ends-at"
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
              <label htmlFor="license-exclusivity" className={labelClass}>
                Exclusivity
              </label>
              <select
                id="license-exclusivity"
                value={exclusivity}
                onChange={(e) => {
                  setExclusivity(normalizeRightsExclusivity(e.target.value));
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
              <label htmlFor="license-notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="license-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setError(null);
                }}
                className={`${fieldClass} min-h-[6rem] resize-y`}
                maxLength={2000}
                placeholder="Optional context for the rights record"
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
              disabled={busy || !usageType || !territory.trim() || !startsAt}
              className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
            >
              {busy ? "Activating…" : "Activate license"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
