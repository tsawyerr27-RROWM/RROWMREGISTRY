import ModalShell from "@/components/ui/ModalShell";
import { CurrencyCombobox } from "@/components/ui/CurrencyCombobox";

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
  "liquid-glass-inset !rounded-2xl w-full px-4 py-3 text-sm leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15";

const selectClass = `${fieldClass} appearance-none`;

const textareaClass =
  "w-full rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-3 text-sm leading-snug text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 resize-none";

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
  /** When set (e.g. gallery registering for a represented artist), show picker and require selection */
  representedArtistOptions?: { id: string; label: string }[];
  representedArtistId?: string;
  onRepresentedArtistChange?: (id: string) => void;
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
  variant = "default",
}: RegisterModalProps) {
  const needsArtist =
    Array.isArray(representedArtistOptions) &&
    representedArtistOptions.length > 0;
  const artistOk =
    !needsArtist ||
    Boolean(
      representedArtistId &&
        representedArtistOptions!.some((o) => o.id === representedArtistId)
    );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="liquid-glass rrowm-modal-surface max-h-[90vh] w-full max-w-2xl overflow-auto"
      closeClassName="liquid-glass-close absolute right-5 top-5 z-10 rounded-xl px-4 py-2 text-xs font-medium text-neutral-600 transition duration-200 ease-out hover:bg-white/75 hover:text-neutral-900 md:right-6 md:top-6"
    >
      <div className="p-10 md:p-12">
        {variant === "gallery" ? (
          <>
            <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-[1.65rem]">
              Register a work
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
              A new registry identifier will be issued. Core fields define the
              record; you can refine provenance details later within the same
              system.
            </p>
          </>
        ) : (
          <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-[1.65rem]">
            Register new artwork
          </h2>
        )}

        <div className={`space-y-6 ${variant === "gallery" ? "mt-10" : "mt-8"}`}>
          {needsArtist ? (
            <div>
              <label className={labelClass}>Represented artist *</label>
              <select
                value={representedArtistId || ""}
                onChange={(e) => onRepresentedArtistChange?.(e.target.value)}
                className={selectClass}
              >
                <option value="">Select artist</option>
                {representedArtistOptions!.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={newArtwork.title}
              onChange={(e) =>
                onArtworkChange({ ...newArtwork, title: e.target.value })
              }
              className={fieldClass}
              placeholder="Artwork title"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Year</label>
              <input
                type="text"
                value={newArtwork.year}
                onChange={(e) =>
                  onArtworkChange({ ...newArtwork, year: e.target.value })
                }
                className={fieldClass}
                placeholder="2024"
              />
            </div>

            <div>
              <label className={labelClass}>Medium</label>
              <input
                type="text"
                value={newArtwork.medium}
                onChange={(e) =>
                  onArtworkChange({ ...newArtwork, medium: e.target.value })
                }
                className={fieldClass}
                placeholder="Oil on canvas"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Dimensions</label>
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
              placeholder="48 × 36 in"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
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
              placeholder="Describe the work…"
            />
          </div>

          <div>
            <label className={labelClass}>Visibility</label>
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
              <option value="private">Private</option>
              <option value="gallery">Gallery</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Image</label>
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
              <label className={labelClass}>Initial amount (optional)</label>
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
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
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
            <label className={labelClass}>Event type</label>
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
              <option value="initial">Initial</option>
              <option value="primary_sale">Primary Sale</option>
              <option value="secondary_sale">Secondary Sale</option>
              <option value="appraisal">Appraisal</option>
              <option value="internal_estimate">Internal Estimate</option>
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
              ? "Recording…"
              : variant === "gallery"
                ? "Issue registry record"
                : "Register artwork"}
          </button>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
