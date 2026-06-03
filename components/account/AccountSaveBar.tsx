"use client";

type Props = {
  saving: boolean;
  savedAt: number | null;
  error: string | null;
  onSave: () => void;
};

export function AccountSaveBar({ saving, savedAt, error, onSave }: Props) {
  return (
    <div className="sticky bottom-4 z-20 mt-10">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-900/[0.08] bg-white/90 px-5 py-4 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : savedAt ? (
            <p className="text-sm text-neutral-500" aria-live="polite">
              Changes saved
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              Save updates to profile and visibility settings.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="shrink-0 rounded-xl bg-neutral-950 px-8 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
