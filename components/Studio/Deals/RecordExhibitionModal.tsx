"use client";

import { useEffect, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRow;
  onRecorded?: (state: DealExecutionPanelState) => void;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/90 px-3.5 py-2.5 text-[15px] leading-relaxed text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white";

const labelClass = "block text-sm font-medium text-neutral-700";

export function RecordExhibitionModal({
  isOpen,
  onClose,
  deal,
  onRecorded,
}: Props) {
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setVenue("");
    setCity("");
    setStartDate("");
    setEndDate("");
    setNote("");
    setBusy(false);
    setError(null);
  }, [isOpen, deal.id]);

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
        `/api/deals/${encodeURIComponent(deal.id)}/execution/exhibition`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({
            venue,
            city: city.trim() || null,
            start_date: startDate,
            end_date: endDate.trim() || null,
            note: note.trim() || null,
          }),
        }
      );

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        state?: DealExecutionPanelState;
      };

      if (!res.ok) {
        setError(payload.error || `Could not record exhibition (${res.status}).`);
        return;
      }

      if (payload.state) {
        onRecorded?.(payload.state);
      }
      onClose();
    } catch {
      setError("Could not record exhibition.");
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
            Record exhibition
          </h2>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-600">
            File this accepted exhibition as a provenance milestone on the registry
            chronology. Venue and opening date are required.
          </p>

          <div className="mt-8 space-y-5 rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
            <div>
              <label htmlFor="exhibition-venue" className={labelClass}>
                Venue
              </label>
              <input
                id="exhibition-venue"
                type="text"
                value={venue}
                onChange={(e) => {
                  setVenue(e.target.value);
                  setError(null);
                }}
                className={fieldClass}
                maxLength={300}
                placeholder="Institution or presentation space"
              />
            </div>

            <div>
              <label htmlFor="exhibition-city" className={labelClass}>
                City
              </label>
              <input
                id="exhibition-city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setError(null);
                }}
                className={fieldClass}
                maxLength={200}
                placeholder="Optional"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="exhibition-start-date" className={labelClass}>
                  Start date
                </label>
                <input
                  id="exhibition-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setError(null);
                  }}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="exhibition-end-date" className={labelClass}>
                  End date
                </label>
                <input
                  id="exhibition-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setError(null);
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="exhibition-note" className={labelClass}>
                Note
              </label>
              <textarea
                id="exhibition-note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError(null);
                }}
                className={`${fieldClass} min-h-[6rem] resize-y`}
                maxLength={2000}
                placeholder="Optional context for the chronology"
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
              disabled={busy || !venue.trim() || !startDate}
              className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
            >
              {busy ? "Recording…" : "Record exhibition"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
