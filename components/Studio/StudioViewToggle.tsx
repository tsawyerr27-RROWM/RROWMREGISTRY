"use client";

import { useCallback, useEffect, useState } from "react";

export type StudioViewMode = "ledger" | "gallery";

/** Session-persisted Ledger/Gallery view mode. */
export function useStudioViewMode(
  storageKey: string,
  fallback: StudioViewMode = "ledger"
): [StudioViewMode, (mode: StudioViewMode) => void] {
  const [mode, setMode] = useState<StudioViewMode>(fallback);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored === "ledger" || stored === "gallery") setMode(stored);
    } catch {
      /* sessionStorage unavailable — keep fallback */
    }
  }, [storageKey]);

  const update = useCallback(
    (next: StudioViewMode) => {
      setMode(next);
      try {
        window.sessionStorage.setItem(storageKey, next);
      } catch {
        /* ignore persistence failures */
      }
    },
    [storageKey]
  );

  return [mode, update];
}

type Props = {
  mode: StudioViewMode;
  onChange: (mode: StudioViewMode) => void;
  label: string;
  ledgerLabel: string;
  galleryLabel: string;
};

export function StudioViewToggle({
  mode,
  onChange,
  label,
  ledgerLabel,
  galleryLabel,
}: Props) {
  const optionClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 v2-type-mono text-[10px] uppercase tracking-[0.14em] transition ${
      active
        ? "bg-[var(--v2-ink)] text-white"
        : "text-[var(--v2-ink-muted)] hover:text-[var(--v2-ink)]"
    }`;

  return (
    <div className="flex items-center gap-2">
      <span className="v2-type-mono text-[9px] uppercase tracking-[0.2em] text-[var(--v2-cool-grey)]">
        {label}
      </span>
      <div
        role="tablist"
        aria-label={label}
        className="flex items-center gap-1 rounded-lg border border-[var(--v2-border)] bg-white/80 p-0.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "ledger"}
          onClick={() => onChange("ledger")}
          className={optionClass(mode === "ledger")}
        >
          {ledgerLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "gallery"}
          onClick={() => onChange("gallery")}
          className={optionClass(mode === "gallery")}
        >
          {galleryLabel}
        </button>
      </div>
    </div>
  );
}
