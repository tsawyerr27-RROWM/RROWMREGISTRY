"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import ModalShell from "@/components/ui/ModalShell";
import { CurrencyCombobox } from "@/components/ui/CurrencyCombobox";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  consequenceSurfaceFromTarget,
  triggerConsequenceFeedback,
} from "@/lib/consequence-feedback-runtime";
import { studioFilingForm } from "@/styles/studio-filing-form";

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

const fieldBase = `${studioFilingForm.field} mt-2`;
const selectClass = studioFilingForm.select;
const btnGhost = studioFilingForm.secondary;
const btnPrimary = studioFilingForm.primary;

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
  const { t } = useLocalePreferences();
  const valueId = useId();
  const currencyId = useId();
  const typeId = useId();
  const visId = useId();
  const noteId = useId();
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () => {
    const target = submitRef.current;
    triggerConsequenceFeedback("registryCommit", {
      target,
      surface: consequenceSurfaceFromTarget(target),
    });
    onSubmit();
  };

  return (
    <ModalShell
      isOpen={!!artwork}
      onClose={onClose}
      tone="light"
      panelClassName="relative max-h-[92vh] w-full max-w-lg overflow-hidden"
    >
      {artwork ? (
        <div className="relative max-h-[92vh] overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-emerald-400/14 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-16 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative space-y-6 p-6 pb-8 pt-14 md:p-8 md:pb-10 md:pt-16">
            <header className="space-y-4 border-b border-black/[0.06] pb-6">
              <h2 className="font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
                {t("studio.valueEvent.title")}
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
                  label={t("studio.valueEvent.declaredAmount")}
                  tipTitle={t("studio.valueEvent.declaredAmount")}
                  tip={<p>{t("studio.valueEvent.helpAmount")}</p>}
                />
                <input
                  id={valueId}
                  type="number"
                  placeholder={t("studio.valueEvent.amountPlaceholder")}
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
                  label={t("studio.form.currency")}
                  tipTitle={t("studio.form.currency")}
                  tip={<p>{t("studio.valueEvent.helpCurrency")}</p>}
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
                  label={t("studio.form.eventType")}
                  tipTitle={t("studio.form.eventType")}
                  tip={<p>{t("studio.valueEvent.helpEventTypes")}</p>}
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
                  <option value="initial_valuation">
                    {t("studio.form.eventInitialValuation")}
                  </option>
                  <option value="valuation">{t("studio.form.eventValuation")}</option>
                  <option value="exhibition_value">
                    {t("studio.form.eventExhibitionValue")}
                  </option>
                  <option value="listing_value">
                    {t("studio.form.eventListingValue")}
                  </option>
                  <option value="appraisal">{t("studio.form.eventAppraisal")}</option>
                </select>
              </div>

              <div>
                <FieldLabel
                  htmlFor={visId}
                  label={t("studio.form.visibility")}
                  tipTitle={t("studio.form.visibility")}
                  tip={<p>{t("studio.valueEvent.helpVisibility")}</p>}
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
                  <option value="private">{t("studio.form.visibilityPrivate")}</option>
                  <option value="gallery">{t("studio.form.visibilityGallery")}</option>
                  <option value="certificate">
                    {t("studio.form.visibilityCertificate")}
                  </option>
                  <option value="public">{t("studio.form.visibilityPublic")}</option>
                </select>
              </div>

              <div>
                <FieldLabel
                  htmlFor={noteId}
                  label={t("studio.valueEvent.noteOptional")}
                  tipTitle={t("studio.valueEvent.noteOptional")}
                  tip={<p>{t("studio.valueEvent.helpNotes")}</p>}
                />
                <textarea
                  id={noteId}
                  placeholder={t("studio.valueEvent.notePlaceholder")}
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
                {t("common.cancel")}
              </button>
              <button
                ref={submitRef}
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className={btnPrimary}
              >
                {loading ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
