"use client";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import ModalShell from "@/components/ui/ModalShell";
import { CurrencyCombobox } from "@/components/ui/CurrencyCombobox";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export type RegisterModalArtwork = {
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  visibility_level: string;
  imageFile: File | null;
  declared_value: string;
  currency: string;
  value_type: string;
};

/** `liquid-glass-inset` sets border-radius:0 in globals — force round corners */
const fieldClass =
  "liquid-glass-inset !rounded-2xl w-full px-4 py-3.5 text-[15px] leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15";

const selectClass = `${fieldClass} appearance-none`;

const textareaClass =
  "w-full rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-3.5 text-[15px] leading-snug text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 resize-none";

const labelClass =
  "mb-2 block text-sm font-semibold text-neutral-500";

const btnPrimary =
  "flex-1 rounded-2xl bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50";

const btnSecondary =
  "liquid-glass-inset !rounded-2xl px-6 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-white/70";

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  newArtwork: RegisterModalArtwork;
  onArtworkChange: (artwork: RegisterModalArtwork) => void;
  onRegister: () => void;
  registerLoading: boolean;
  /** Gallery: optional link to an existing roster artist account */
  representedArtistOptions?: { id: string; label: string }[];
  representedArtistId?: string;
  onRepresentedArtistChange?: (id: string) => void;
  /** Gallery: plain-text artist identity (required when no roster link) */
  catalogueArtistName?: string;
  onCatalogueArtistNameChange?: (name: string) => void;
  pendingArtistEmail?: string;
  onPendingArtistEmailChange?: (email: string) => void;
  /** Gallery dashboard: calmer copy and hierarchy, less “form product” */
  variant?: "default" | "gallery";
};

export function RegisterModal({
  isOpen,
  onClose,
  newArtwork,
  onArtworkChange,
  onRegister,
  registerLoading,
  representedArtistOptions,
  representedArtistId,
  onRepresentedArtistChange,
  catalogueArtistName = "",
  onCatalogueArtistNameChange,
  pendingArtistEmail = "",
  onPendingArtistEmailChange,
  variant = "default",
}: RegisterModalProps) {
  const { t } = useLocalePreferences();
  const isGallery = variant === "gallery";
  const rosterOptions =
    isGallery && Array.isArray(representedArtistOptions)
      ? representedArtistOptions
      : [];
  const hasRosterLink =
    Boolean(
      representedArtistId &&
        rosterOptions.some((o) => o.id === representedArtistId)
    );
  const catalogueNameOk =
    !isGallery || hasRosterLink || Boolean(catalogueArtistName?.trim());
  const galleryMediaOk = !isGallery || Boolean(newArtwork.imageFile);
  const artistOk = isGallery ? catalogueNameOk && galleryMediaOk : true;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      tone="light"
      panelClassName="max-h-[90vh] w-full max-w-2xl overflow-auto"
    >
      <div className="p-10 md:p-12">
        {variant === "gallery" ? (
          <>
            <InfoTooltip text="Issues a registry identifier and opens the canonical artwork record, the same documentary object an artist would file. Your institution attestation layers onto the chronology; the artist may later authenticate authorship and deepen detail. Not an approval or upload queue." />
            <h2 className="font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
              {t("studio.register.titleGallery")}
            </h2>
          </>
        ) : (
          <h2 className="font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
            {t("studio.register.titleNew")}
          </h2>
        )}

        <div className={`space-y-6 ${variant === "gallery" ? "mt-10" : "mt-8"}`}>
          {isGallery ? (
            <>
              <div>
                <label className={labelClass}>
                  {t("studio.register.artistName")}
                  {hasRosterLink ? "" : " *"}
                </label>
                <input
                  type="text"
                  value={catalogueArtistName}
                  onChange={(e) => onCatalogueArtistNameChange?.(e.target.value)}
                  className={fieldClass}
                  placeholder={t("studio.register.asCreditedPlaceholder")}
                  disabled={hasRosterLink}
                />
                <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
                  {t("studio.register.plainTextHint")}
                </p>
              </div>
              <div>
                <label className={labelClass}>
                  {t("studio.register.artistEmailOptional")}
                </label>
                <input
                  type="email"
                  value={pendingArtistEmail}
                  onChange={(e) => onPendingArtistEmailChange?.(e.target.value)}
                  className={fieldClass}
                  placeholder={t("studio.register.emailInvitePlaceholder")}
                />
              </div>
              {rosterOptions.length > 0 ? (
                <div>
                  <label className={labelClass}>
                    {t("studio.register.linkRosterOptional")}
                  </label>
                  <select
                    value={representedArtistId || ""}
                    onChange={(e) => onRepresentedArtistChange?.(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">{t("studio.register.noAccountLink")}</option>
                    {rosterOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          ) : null}
          <div>
            <label className={labelClass}>{t("studio.form.titleRequired")}</label>
            <input
              type="text"
              value={newArtwork.title}
              onChange={(e) =>
                onArtworkChange({ ...newArtwork, title: e.target.value })
              }
              className={fieldClass}
              placeholder={t("studio.register.placeholderTitle")}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{t("studio.form.year")}</label>
              <input
                type="text"
                value={newArtwork.year}
                onChange={(e) =>
                  onArtworkChange({ ...newArtwork, year: e.target.value })
                }
                className={fieldClass}
                placeholder={t("studio.register.placeholderYear")}
              />
            </div>

            <div>
              <label className={labelClass}>{t("studio.form.medium")}</label>
              <input
                type="text"
                value={newArtwork.medium}
                onChange={(e) =>
                  onArtworkChange({ ...newArtwork, medium: e.target.value })
                }
                className={fieldClass}
                placeholder={t("studio.register.placeholderMedium")}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("studio.form.dimensions")}</label>
            <input
              type="text"
              value={newArtwork.dimensions}
              onChange={(e) =>
                onArtworkChange({
                  ...newArtwork,
                  dimensions: e.target.value,
                })
              }
              className={fieldClass}
              placeholder={t("studio.register.placeholderDimensions")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("studio.form.description")}</label>
            <textarea
              value={newArtwork.description}
              onChange={(e) =>
                onArtworkChange({
                  ...newArtwork,
                  description: e.target.value,
                })
              }
              rows={4}
              className={textareaClass}
              placeholder={t("studio.register.placeholderDescription")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("studio.form.visibility")}</label>
            <select
              value={newArtwork.visibility_level}
              onChange={(e) =>
                onArtworkChange({
                  ...newArtwork,
                  visibility_level: e.target.value,
                })
              }
              className={selectClass}
            >
              <option value="private">{t("studio.form.visibilityPrivate")}</option>
              <option value="gallery">{t("studio.form.visibilityGallery")}</option>
              <option value="public">{t("studio.form.visibilityPublic")}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {isGallery ? t("studio.form.imageRequired") : t("studio.form.image")}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                onArtworkChange({
                  ...newArtwork,
                  imageFile: e.target.files?.[0] || null,
                })
              }
              className={`${fieldClass} file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700`}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{t("studio.form.initialAmount")}</label>
              <input
                type="number"
                value={newArtwork.declared_value || ""}
                onChange={(e) =>
                  onArtworkChange({
                    ...newArtwork,
                    declared_value: e.target.value,
                  })
                }
                className={fieldClass}
                placeholder={t("studio.register.placeholderAmount")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("studio.form.currency")}</label>
              <div className="mt-2">
                <CurrencyCombobox
                  value={String(newArtwork.currency || "").toUpperCase()}
                  onChange={(code) =>
                    onArtworkChange({
                      ...newArtwork,
                      currency: code,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("studio.form.eventType")}</label>
            <select
              value={newArtwork.value_type || "initial"}
              onChange={(e) =>
                onArtworkChange({
                  ...newArtwork,
                  value_type: e.target.value,
                })
              }
              className={selectClass}
            >
              <option value="initial">{t("studio.form.eventInitial")}</option>
              <option value="primary_sale">
                {t("studio.form.eventPrimarySale")}
              </option>
              <option value="secondary_sale">
                {t("studio.form.eventSecondarySale")}
              </option>
              <option value="appraisal">{t("studio.form.eventAppraisal")}</option>
              <option value="internal_estimate">
                {t("studio.form.eventInternalEstimate")}
              </option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onRegister}
            disabled={!newArtwork.title || registerLoading || !artistOk}
            className={`${btnPrimary} sm:flex-1`}
          >
            {registerLoading
              ? t("common.recording")
              : variant === "gallery"
                ? t("studio.register.issueCanonical")
                : t("studio.registerArtwork")}
          </button>
          <button type="button" onClick={onClose} className={btnSecondary}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
