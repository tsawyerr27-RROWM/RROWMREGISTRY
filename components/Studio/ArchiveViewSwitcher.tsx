"use client";

import { useCallback, useEffect, useState } from "react";

export type ArchiveViewOption = {
  id: string;
  label: string;
};

/** Session-persisted archive view mode. */
export function useArchiveViewMode(
  storageKey: string,
  fallback: string,
  validIds: readonly string[]
): [string, (mode: string) => void] {
  const [mode, setMode] = useState(fallback);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored && validIds.includes(stored)) setMode(stored);
    } catch {
      /* sessionStorage unavailable — keep fallback */
    }
  }, [storageKey, validIds]);

  const update = useCallback(
    (next: string) => {
      if (!validIds.includes(next)) return;
      setMode(next);
      try {
        window.sessionStorage.setItem(storageKey, next);
      } catch {
        /* ignore persistence failures */
      }
    },
    [storageKey, validIds]
  );

  return [mode, update];
}

type ArchiveViewSwitcherProps = {
  label: string;
  mode: string;
  onChange: (mode: string) => void;
  options: readonly ArchiveViewOption[];
};

/**
 * Universal archive presentation switcher — session-persisted, accessible, reduced-motion safe.
 */
export function ArchiveViewSwitcher({
  label,
  mode,
  onChange,
  options,
}: ArchiveViewSwitcherProps) {
  const optionClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 v2-type-mono text-[10px] uppercase tracking-[0.14em] transition motion-reduce:transition-none ${
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
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={mode === option.id}
            onClick={() => onChange(option.id)}
            className={optionClass(mode === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
