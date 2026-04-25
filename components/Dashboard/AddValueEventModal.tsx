"use client";

import { useId, useState, type ReactNode } from "react";
import ModalShell from "@/components/ui/ModalShell";
import { CurrencyCombobox } from "@/components/ui/CurrencyCombobox";

export type AddValueEventFormState = {
  declared_value: string;
  currency: string;
  value_type: string;
  visibility_level: string;
  note: string;
};

type ArtworkMini = {
  id: string;
  title?: string;
  registry_id?: string | null;
  image_url?: string | null;
};

/** Shared with RegisterModal — `liquid-glass-inset` uses border-radius:0 in CSS; override for round fields */
const fieldBase =
  "liquid-glass-inset !rounded-2xl mt-2 w-full px-4 py-3.5 text-sm leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15";

const selectClass = `${fieldBase} appearance-none`;

const btnGhost =
  "liquid-glass-inset !rounded-2xl px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-white/70";

const btnPrimary =
  "rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60";

function InfoTip({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        className="ml-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white/80 text-[10px] font-semibold leading-none text-neutral-500 shadow-sm transition hover:bg-white hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Help: {title}</span>
        <span aria-hidden>?</span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          className="liquid-glass absolute left-0 top-full z-30 mt-2 w-[min(calc(100vw-3rem),18rem)] rounded-xl p-3.5 text-left text-xs leading-relaxed text-neutral-600"
        >
          <p className="text-sm font-medium text-neutral-700">
            {title}
          </p>
          <div className="mt-2 space-y-2">{children}</div>
        </div>
      ) : null}
    </span>
  );
}

function FieldLabel({
  htmlFor,
  label,
  tipTitle,
  tip,
}: {
  htmlFor: string;
  label: string;
  tipTitle: string;
  tip: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center text-sm font-semibold text-neutral-500"
    >
      {label}
      <InfoTip title={tipTitle}>{tip}</InfoTip>
    </label>
  );
}

type AddValueEventModalProps = {
  artwork: ArtworkMini | null;
  form: AddValueEventFormState;
  onFormChange: (next: AddValueEventFormState) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function AddValueEventModal({
  artwork,
  form,
  onFormChange,
  loading,
  onClose,
  onSubmit,
}: AddValueEventModalProps) {
  const valueId = useId();
  const currencyId = useId();
  const typeId = useId();
  const visId = useId();
  const noteId = useId();

  return (
    <ModalShell
      isOpen={!!artwork}
      onClose={onClose}
      panelClassName="liquid-glass rrowm-modal-surface relative max-h-[92vh] w-full max-w-lg overflow-hidden"
      overlayClassName="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-6 md:p-8"
      closeClassName="liquid-glass-close absolute right-4 top-4 z-10 rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-white/85 hover:text-neutral-900 md:right-5 md:top-5"
    >
      {artwork ? (
        <div className="relative max-h-[92vh] overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-emerald-400/14 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-16 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative space-y-6 p-6 pb-8 pt-14 md:p-8 md:pb-10 md:pt-16">
            <header className="space-y-4 border-b border-black/[0.06] pb-6">
              <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-[1.65rem]">
                Record value event
              </h2>
              {artwork.registry_id ? (
                <p className="font-mono text-[11px] text-neutral-500">
                  {artwork.registry_id}
                </p>
              ) : null}
            </header>

            <div className="space-y-5">
              <div>
                <FieldLabel
                  htmlFor={valueId}
                  label="Declared amount"
                  tipTitle="Declared amount"
                  tip={
                    <p>
                      The figure you are logging for this event (valuation, sale
                      price, estimate, etc.). Match what was actually stated or
                      agreed—this becomes part of your provenance trail.
                    </p>
                  }
                />
                <input
                  id={valueId}
                  type="number"
                  placeholder="Amount"
                  className={fieldBase}
                  value={form.declared_value}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      declared_value: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <FieldLabel
                  htmlFor={currencyId}
                  label="Currency"
                  tipTitle="Currency"
                  tip={
                    <p>
                      ISO currency for the amount above. Choose the currency the
                      value was quoted in, not an implied conversion.
                    </p>
                  }
                />
                <div className="mt-2">
                  <CurrencyCombobox
                    id={currencyId}
                    value={String(form.currency || "").toUpperCase()}
                    onChange={(code) =>
                      onFormChange({
                        ...form,
                        currency: code,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <FieldLabel
                  htmlFor={typeId}
                  label="Event type"
                  tipTitle="Event types"
                  tip={
                    <ul className="list-disc space-y-1.5 pl-4 text-[11px] text-neutral-600">
                      <li>
                        <strong className="text-neutral-800">Initial</strong> —
                        first recorded anchor for the work.
                      </li>
                      <li>
                        <strong className="text-neutral-800">
                          Primary sale
                        </strong>{" "}
                        — first sale from the artist or primary market.
                      </li>
                      <li>
                        <strong className="text-neutral-800">
                          Secondary sale
                        </strong>{" "}
                        — resale on the secondary market.
                      </li>
                      <li>
                        <strong className="text-neutral-800">Appraisal</strong>{" "}
                        — formal or expert valuation.
                      </li>
                      <li>
                        <strong className="text-neutral-800">
                          Internal estimate
                        </strong>{" "}
                        — your studio reference figure (not necessarily
                        public).
                      </li>
                    </ul>
                  }
                />
                <select
                  id={typeId}
                  className={selectClass}
                  value={form.value_type}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      value_type: e.target.value,
                    })
                  }
                >
                  <option value="initial">Initial</option>
                  <option value="primary_sale">Primary Sale</option>
                  <option value="secondary_sale">Secondary Sale</option>
                  <option value="appraisal">Appraisal</option>
                  <option value="internal_estimate">Internal Estimate</option>
                </select>
              </div>

              <div>
                <FieldLabel
                  htmlFor={visId}
                  label="Visibility"
                  tipTitle="Who can see this"
                  tip={
                    <ul className="list-disc space-y-1.5 pl-4 text-[11px] text-neutral-600">
                      <li>
                        <strong className="text-neutral-800">Private</strong> —
                        only you (and authorised roles) in the studio.
                      </li>
                      <li>
                        <strong className="text-neutral-800">Gallery</strong> —
                        shared in gallery-facing contexts where enabled.
                      </li>
                      <li>
                        <strong className="text-neutral-800">
                          Certificate
                        </strong>{" "}
                        — can appear on or alongside the certificate layer.
                      </li>
                      <li>
                        <strong className="text-neutral-800">Public</strong> —
                        eligible for public registry surfaces when policy allows.
                      </li>
                    </ul>
                  }
                />
                <select
                  id={visId}
                  className={selectClass}
                  value={form.visibility_level}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      visibility_level: e.target.value,
                    })
                  }
                >
                  <option value="private">Private</option>
                  <option value="gallery">Gallery</option>
                  <option value="certificate">Certificate</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <FieldLabel
                  htmlFor={noteId}
                  label="Note (optional)"
                  tipTitle="Notes"
                  tip={
                    <p>
                      Optional context: fair, channel, buyer type, appraiser, or
                      anything that helps future you interpret this event.
                      Whether it appears publicly still depends on visibility
                      above.
                    </p>
                  }
                />
                <textarea
                  id={noteId}
                  placeholder="Optional context"
                  rows={3}
                  className={`${fieldBase} resize-y min-h-[5.5rem]`}
                  value={form.note}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      note: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:justify-end sm:gap-3">
              <button type="button" onClick={onClose} className={btnGhost}>
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onSubmit}
                className={btnPrimary}
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
