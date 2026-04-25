"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getRegion, REGIONS, type RegionId } from "@/lib/regions";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  regionId: RegionId;
  onRegionChange: (id: RegionId) => void;
  labelId: string;
};

export function FooterRegionSelector({
  regionId,
  onRegionChange,
  labelId,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = getRegion(regionId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full md:max-w-[22rem]">
      <button
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-[3px] py-1.5 text-left text-[13px] leading-snug text-[#425466] transition-colors hover:text-[#0a2540] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]/35 focus-visible:ring-offset-2"
      >
        <GlobeIcon className="shrink-0 text-[#425466]" />
        <span className="min-w-0 flex-1 truncate">{current.localeDisplayLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute bottom-full left-0 z-[100] mb-2 max-h-[min(320px,50vh)] w-full min-w-[min(100%,20rem)] overflow-y-auto rounded-[6px] border border-[#e6ebf1] bg-white py-1 shadow-[0_7px_14px_0_rgba(50,50,93,0.1),0_3px_6px_0_rgba(0,0,0,0.08)]"
        >
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="option"
              aria-selected={regionId === r.id}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] leading-snug transition-colors hover:bg-[#f6f9fc] ${
                regionId === r.id ? "text-[#0a2540]" : "text-[#425466]"
              }`}
              onClick={() => {
                onRegionChange(r.id);
                setOpen(false);
              }}
            >
              <span className="min-w-0">{r.localeDisplayLabel}</span>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#6b7c93]">
                {r.currency}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
