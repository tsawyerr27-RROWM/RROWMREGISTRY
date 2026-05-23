"use client";

import Link from "next/link";

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

export function HeroTile({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
      <p className="text-[13px] font-medium text-white">{title}</p>
      <div className="mt-3 flex min-h-[5.5rem] flex-1 flex-col justify-between gap-3">
        {children}
      </div>
      {footer ? (
        <div className="mt-3 border-t border-white/10 pt-3">{footer}</div>
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
}: {
  percent: number;
  label?: string;
  accent?: MeterAccent;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wide text-white/45">
          {label}
        </span>
        <span className="tabular-nums text-sm font-semibold text-white">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
}: {
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="font-serif text-2xl font-normal tabular-nums text-white">
        {value}
        {sub ? (
          <span className="ml-1.5 text-sm font-sans font-normal text-white/45">
            {sub}
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-[11px] text-white/45">{label}</p>
    </div>
  );
}

export function HeroMiniBar({
  label,
  percent,
  accentClass = "from-emerald-400/90 to-emerald-200/80",
}: {
  label: string;
  percent: number;
  accentClass?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-[10px]">
        <span className="text-white/50">{label}</span>
        <span className="tabular-nums font-medium text-white/70">{percent}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
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
}: {
  items: { label: string; done: boolean }[];
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[11px]">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
              item.done
                ? "bg-emerald-500/25 text-emerald-200"
                : "bg-white/10 text-white/35"
            }`}
            aria-hidden
          >
            {item.done ? "✓" : "·"}
          </span>
          <span className={item.done ? "text-white/70" : "text-white/45"}>
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
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-200/90 transition hover:text-amber-100"
    >
      {children}
      <span aria-hidden>↓</span>
    </Link>
  );
}

export function HeroActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-left text-[12px] font-medium text-amber-200/90 transition hover:text-amber-100"
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
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-medium text-white transition hover:bg-white/15 ${className}`}
    >
      {children}
    </Link>
  );
}
