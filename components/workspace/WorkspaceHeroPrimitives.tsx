"use client";

import Link from "next/link";

export type HeroTheme = "dark" | "light";

export function filled(s: string | undefined | null): boolean {
  return Boolean(s && String(s).trim().length > 0);
}

export function completenessPercent(flags: boolean[]): number {
  if (flags.length === 0) return 0;
  return Math.round((flags.filter(Boolean).length / flags.length) * 100);
}

export function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function publicPath(href: string): string {
  try {
    if (href.startsWith("/")) return href;
    const u = new URL(href, "https://rrowm.app");
    return `${u.pathname}${u.search}`;
  } catch {
    return href;
  }
}

/** Metric capsule grid — matches Studio workspace heroes */
export const heroMetricsGridClass = "grid gap-4 sm:grid-cols-3 sm:gap-5";

/** Two-tile account grids (gallery identity + presence) */
export const heroMetricsGridPairClass = "grid gap-4 sm:grid-cols-2 sm:gap-5";

export function HeroTile({
  title,
  children,
  footer,
  theme = "dark",
  density = "default",
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  theme?: HeroTheme;
  density?: "default" | "compact";
}) {
  const isLight = theme === "light";
  const compact = density === "compact";

  return (
    <li
      className={
        isLight
          ? `flex flex-col rounded-2xl border border-neutral-900/[0.06] bg-white shadow-[0_8px_24px_rgba(25,20,10,0.04)] ${
              compact ? "p-3.5" : "p-4"
            }`
          : `flex flex-col rounded-lg bg-white/[0.06] ring-1 ring-white/10 ${
              compact ? "p-3.5" : "p-4"
            }`
      }
    >
      <p
        className={`font-medium ${
          compact ? "text-[12px]" : "text-[13px]"
        } ${isLight ? "text-neutral-700" : "text-white"}`}
      >
        {title}
      </p>
      <div
        className={`flex flex-1 flex-col justify-between ${
          compact
            ? "mt-2.5 min-h-[4rem] gap-2.5"
            : "mt-3 min-h-[5.5rem] gap-3"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div
          className={`border-t ${
            compact ? "mt-2.5 pt-2.5" : "mt-3 pt-3"
          } ${isLight ? "border-neutral-900/[0.06]" : "border-white/10"}`}
        >
          {footer}
        </div>
      ) : null}
    </li>
  );
}

type MeterAccent = "amber" | "teal" | "violet" | "sky";

const METER_GRADIENT: Record<MeterAccent, string> = {
  amber: "from-amber-400/90 to-amber-200/80",
  teal: "from-teal-400/90 to-teal-200/80",
  violet: "from-violet-400/90 to-violet-200/80",
  sky: "from-sky-400/90 to-sky-200/80",
};

export function CompletenessMeter({
  percent,
  label = "Completeness",
  accent = "amber",
  theme = "dark",
}: {
  percent: number;
  label?: string;
  accent?: MeterAccent;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`text-[13px] font-medium ${
            isLight ? "text-neutral-500" : "text-white/60"
          }`}
        >
          {label}
        </span>
        <span
          className={`tabular-nums text-sm font-semibold ${
            isLight ? "text-neutral-900" : "text-white"
          }`}
        >
          {percent}%
        </span>
      </div>
      <div
        className={`h-1.5 overflow-hidden rounded-full ${
          isLight ? "bg-neutral-900/[0.06]" : "bg-white/10"
        }`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${METER_GRADIENT[accent]} transition-[width] duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export function HeroStat({
  value,
  label,
  sub,
  theme = "dark",
}: {
  value: string | number;
  label: string;
  sub?: string;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <div>
      <p
        className={`font-serif text-2xl font-normal tabular-nums ${
          isLight ? "text-neutral-950" : "text-white"
        }`}
      >
        {value}
        {sub ? (
          <span
            className={`ml-1.5 text-sm font-sans font-normal ${
              isLight ? "text-neutral-400" : "text-white/45"
            }`}
          >
            {sub}
          </span>
        ) : null}
      </p>
      <p className={`mt-1 text-[11px] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
        {label}
      </p>
    </div>
  );
}

export function HeroMiniBar({
  label,
  percent,
  accentClass = "from-emerald-400/90 to-emerald-200/80",
  theme = "dark",
}: {
  label: string;
  percent: number;
  accentClass?: string;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-[10px]">
        <span className={isLight ? "text-neutral-500" : "text-white/50"}>{label}</span>
        <span
          className={`tabular-nums font-medium ${
            isLight ? "text-neutral-700" : "text-white/70"
          }`}
        >
          {percent}%
        </span>
      </div>
      <div
        className={`h-1 overflow-hidden rounded-full ${
          isLight ? "bg-neutral-900/[0.06]" : "bg-white/10"
        }`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accentClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export function FieldChecklist({
  items,
  theme = "dark",
}: {
  items: { label: string; done: boolean }[];
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[11px]">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
              item.done
                ? isLight
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-emerald-500/25 text-emerald-200"
                : isLight
                  ? "bg-neutral-100 text-neutral-400"
                  : "bg-white/10 text-white/35"
            }`}
            aria-hidden
          >
            {item.done ? "✓" : "·"}
          </span>
          <span
            className={
              item.done
                ? isLight
                  ? "text-neutral-700"
                  : "text-white/70"
                : isLight
                  ? "text-neutral-400"
                  : "text-white/45"
            }
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HeroTextLink({
  href,
  children,
  theme = "dark",
}: {
  href: string;
  children: React.ReactNode;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <Link
      href={href}
      className={
        isLight
          ? "inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--rrowm-zone-accent)] transition hover:text-neutral-900"
          : "inline-flex items-center gap-1 text-[12px] font-medium text-amber-200/90 transition hover:text-amber-100"
      }
    >
      {children}
      <span aria-hidden>↓</span>
    </Link>
  );
}

export function HeroActionButton({
  onClick,
  children,
  theme = "dark",
}: {
  onClick: () => void;
  children: React.ReactNode;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isLight
          ? "inline-flex items-center gap-1 text-left text-[12px] font-medium text-[color:var(--rrowm-zone-accent)] transition hover:text-neutral-900"
          : "inline-flex items-center gap-1 text-left text-[12px] font-medium text-amber-200/90 transition hover:text-amber-100"
      }
    >
      {children}
      <span aria-hidden>→</span>
    </button>
  );
}

export function HeroInlineLink({
  href,
  children,
  className = "",
  theme = "dark",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  theme?: HeroTheme;
}) {
  const isLight = theme === "light";

  return (
    <Link
      href={href}
      className={
        isLight
          ? `rounded-xl border border-neutral-900/[0.08] bg-white px-3 py-2 text-center text-[11px] font-medium text-neutral-800 shadow-[0_2px_8px_rgba(25,20,10,0.03)] transition hover:border-neutral-900/[0.12] hover:shadow-[0_4px_14px_rgba(25,20,10,0.05)] ${className}`
          : `rounded-md border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-medium text-white transition hover:bg-white/15 ${className}`
      }
    >
      {children}
    </Link>
  );
}
