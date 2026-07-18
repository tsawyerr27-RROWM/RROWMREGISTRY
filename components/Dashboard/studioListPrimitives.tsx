import type { ReactNode } from "react";

import { studioV2 } from "@/styles/studio-v2";

/**
 * Studio list search + filter tones — softer than pure white so controls blend
 * with section backgrounds (light gradient vs dark studio panels).
 */
export const studioListTone = {
  light: {
    searchInput:
      "w-full rounded-2xl border border-neutral-500/30 bg-neutral-400/15 py-3.5 pl-12 pr-4 text-[15px] text-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_2px_14px_-6px_rgba(15,23,42,0.12)] placeholder:text-neutral-500 focus:border-neutral-600/45 focus:outline-none focus:ring-2 focus:ring-neutral-900/12",
    filterSelect:
      "min-w-[13rem] w-full shrink-0 rounded-2xl border border-neutral-500/30 bg-neutral-400/15 px-4 py-3.5 text-sm font-medium text-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_2px_12px_-6px_rgba(15,23,42,0.1)] outline-none transition focus:border-neutral-600/45 focus:ring-2 focus:ring-neutral-900/12",
    searchIconWrap: "text-neutral-600",
  },
  dark: {
    searchInput:
      "w-full rounded-2xl border border-white/[0.09] bg-black/30 py-3.5 pl-12 pr-4 text-[15px] text-white/92 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_20px_-10px_rgba(0,0,0,0.45)] placeholder:text-white/38 focus:border-white/[0.18] focus:outline-none focus:ring-2 focus:ring-white/12 caret-white",
    filterSelect:
      "min-w-[13rem] w-full shrink-0 rounded-2xl border border-white/[0.09] bg-black/30 px-4 py-3.5 text-sm font-medium text-white/92 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_18px_-8px_rgba(0,0,0,0.4)] outline-none transition focus:border-white/[0.18] focus:ring-2 focus:ring-white/12 [&>option]:bg-neutral-950 [&>option]:text-white",
    searchIconWrap: "text-white/40",
  },
} as const;

export type StudioListTone = keyof typeof studioListTone;

/** @deprecated Prefer `studioListTone.light.*` or `studioFilterSelectClass("light")` */
export const STUDIO_SEARCH_INPUT_CLASS = studioListTone.light.searchInput;

/** @deprecated Prefer `studioListTone.light.filterSelect` or `studioFilterSelectClass("light")` */
export const STUDIO_FILTER_SELECT_CLASS = studioListTone.light.filterSelect;

export function studioFilterSelectClass(tone: StudioListTone): string {
  return studioListTone[tone].filterSelect;
}

export function StudioSearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

type StudioSearchRowProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  /** Filter dropdowns / primary actions (right column on large screens) */
  aside?: ReactNode;
  /** `light` = studio list surfaces (artworks, certificates, ownership) */
  tone?: StudioListTone;
};

export function StudioSearchRow({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search by title…",
  searchLabel,
  aside,
  tone = "light",
}: StudioSearchRowProps) {
  const t = studioListTone[tone];
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
      <div className="relative min-w-0 flex-1">
        <span
          className={`pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 ${t.searchIconWrap}`}
        >
          <StudioSearchIcon className="h-5 w-5" />
        </span>
        <input
          type="search"
          autoComplete="off"
          aria-label={searchLabel ?? searchPlaceholder}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={t.searchInput}
        />
      </div>
      {aside ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

/** Primary action — matches Artworks “Register artwork” */
export function StudioPrimaryPillButton({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`shrink-0 rounded-2xl bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.35)] transition-colors hover:bg-neutral-800 whitespace-nowrap ${className}`}
    >
      {children}
    </button>
  );
}

export function StudioNoMatchesBanner({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${studioV2.surface.filingSheet} px-8 py-12 text-center text-sm text-[var(--v2-ink-muted)]`}
    >
      {children}
    </div>
  );
}
