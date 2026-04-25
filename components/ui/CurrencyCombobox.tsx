"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENCIES, currencyLabel } from "@/lib/currencies";

export function CurrencyCombobox({
  value,
  onChange,
  id,
  placeholder = "Select currency",
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    const v = value?.toUpperCase?.() ? value.toUpperCase() : value;
    return v ? currencyLabel(v) : "";
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...CURRENCIES].sort((a, b) => a.code.localeCompare(b.code));
    if (!q) return list;
    return list.filter((c) => {
      const hay = `${c.code} ${c.symbol} ${c.name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        id={id}
        value={open ? query : selectedLabel}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-black/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-neutral-400 focus:border-black/15 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        role="combobox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        autoComplete="off"
      />

      {open ? (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-40 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-black/[0.08] bg-white/95 p-1.5 text-sm shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)] backdrop-blur-md"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">
              No matches
            </div>
          ) : (
            filtered.map((c) => {
              const active = value === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`w-full rounded-xl px-3 py-2 text-left transition ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-800 hover:bg-neutral-100"
                  }`}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {currencyLabel(c.code)}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

