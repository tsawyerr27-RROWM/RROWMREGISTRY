"use client";

import { AccountPanel } from "@/components/account/account-ui";
import {
  STUDIO_ARTWORKS_ACCENT_OPTIONS,
  type StudioArtworksAccentId,
} from "@/lib/studio-artworks-accent";

type Props = {
  accent: StudioArtworksAccentId;
  onAccentChange: (id: StudioArtworksAccentId) => void;
  saving: boolean;
};

export function AccountStudioSection({ accent, onAccentChange, saving }: Props) {
  return (
    <AccountPanel
      id="account-studio"
      title="Studio preferences"
      description="Private workspace settings. These affect your Studio only — not public pages."
    >
      <div>
        <p className="text-sm font-medium text-neutral-900">Artworks grid accent</p>
        <p className="mt-1 text-sm text-neutral-500">
          Accent colour on Artworks cards in your Studio.
        </p>
        <div
          className="mt-5 flex flex-wrap gap-3"
          role="radiogroup"
          aria-label="Studio Artworks accent color"
        >
          {STUDIO_ARTWORKS_ACCENT_OPTIONS.map((opt) => {
            const selected = accent === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={saving}
                onClick={() => onAccentChange(opt.id)}
                className={`group flex min-w-[7.5rem] flex-col items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-neutral-900/25 bg-white/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                    : "border-neutral-900/[0.08] bg-white/40 hover:border-neutral-900/15"
                } disabled:opacity-50`}
              >
                <span
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${opt.swatchClass} ${
                    selected
                      ? "ring-neutral-900/30 ring-offset-white"
                      : "ring-transparent ring-offset-transparent group-hover:ring-neutral-900/15"
                  }`}
                  aria-hidden
                />
                <span className="text-[13px] font-medium text-neutral-900">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </AccountPanel>
  );
}
