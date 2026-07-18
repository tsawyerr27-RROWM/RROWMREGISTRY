"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ArchiveViewOption = {
  id: string;
  label: string;
};

/** Session-persisted archive view mode. */
export function useArchiveViewMode(
  storageKey: string,
  fallback: string,
  validIds: readonly string[],
  migrate?: (stored: string) => string
): [string, (mode: string) => void, boolean] {
  const [mode, setMode] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("view");
    const requestedMode =
      requested && validIds.includes(requested) ? requested : null;
    let stored: string | null = null;
    try {
      stored = window.sessionStorage.getItem(storageKey);
    } catch {
      /* sessionStorage unavailable — URL and fallback remain valid */
    }
    const migratedStored = stored && migrate ? migrate(stored) : stored;
    const resolved = requestedMode ?? migratedStored;
    if (resolved && validIds.includes(resolved)) {
      if (stored !== resolved) {
        try {
          window.sessionStorage.setItem(storageKey, resolved);
        } catch {
          /* ignore persistence failures */
        }
      }
    }
    const frame = window.requestAnimationFrame(() => {
      if (resolved && validIds.includes(resolved)) setMode(resolved);
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [migrate, storageKey, validIds]);

  useEffect(() => {
    const handlePopState = () => {
      const requested = new URLSearchParams(window.location.search).get("view");
      if (requested && validIds.includes(requested)) {
        setMode(requested);
        try {
          window.sessionStorage.setItem(storageKey, requested);
        } catch {
          /* ignore persistence failures */
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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

  return [mode, update, ready];
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
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
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
        role="radiogroup"
        aria-label={label}
        className="flex items-center gap-1 rounded-lg border border-[var(--v2-border)] bg-white/80 p-0.5"
      >
        {options.map((option, index) => (
          <button
            key={option.id}
            ref={(node) => {
              if (node) buttonRefs.current.set(option.id, node);
              else buttonRefs.current.delete(option.id);
            }}
            type="button"
            role="radio"
            aria-checked={mode === option.id}
            tabIndex={mode === option.id ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => {
              let nextIndex: number | null = null;
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                nextIndex = (index + 1) % options.length;
              } else if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
              ) {
                nextIndex = (index - 1 + options.length) % options.length;
              } else if (event.key === "Home") {
                nextIndex = 0;
              } else if (event.key === "End") {
                nextIndex = options.length - 1;
              }
              if (nextIndex === null) return;
              event.preventDefault();
              const next = options[nextIndex];
              if (!next) return;
              onChange(next.id);
              buttonRefs.current.get(next.id)?.focus();
            }}
            className={optionClass(mode === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
