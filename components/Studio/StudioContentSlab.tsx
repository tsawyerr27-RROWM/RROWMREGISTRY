"use client";

import type { ReactNode } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { rrowmStudioSurface, rrowmZoneClass } from "@/styles/rrowm-theme";

/** Vertical rhythm between hero and overview slabs */
export const studioOverviewStackClass = "space-y-8 md:space-y-10";

const accentLineClass =
  "pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_45%,transparent)] to-transparent md:inset-x-8";

type StudioContentSlabProps = {
  id?: string;
  title: ReactNode;
  subtitle?: string;
  overline?: string;
  headerExtra?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  scrollMargin?: boolean;
  /** Tighter slab for summary strips */
  compact?: boolean;
  /** Render body only — no title block */
  headerless?: boolean;
};

/** Section panel below studio heroes — matches `StudioHeroSlab` chrome. */
export function StudioContentSlab({
  id,
  title,
  subtitle,
  overline,
  headerExtra,
  actions,
  children,
  className = "",
  bodyClassName = "",
  scrollMargin = false,
  compact = false,
  headerless = false,
}: StudioContentSlabProps) {
  const shell = compact ? rrowmStudioSurface.card : rrowmStudioSurface.panel;
  const pad = compact
    ? "relative px-5 py-5 sm:px-6 sm:py-6"
    : "relative px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10";

  return (
    <section
      id={id}
      className={`relative ${scrollMargin ? "scroll-mt-28" : ""} ${className}`}
    >
      <div className={`${shell} ${rrowmZoneClass.studio} relative overflow-hidden`}>
        <div className={accentLineClass} aria-hidden />
        <div className={pad}>
          {!headerless ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {overline ? (
                  <p className="text-sm font-medium text-neutral-500">{overline}</p>
                ) : null}
                {headerExtra ? (
                  <div className={overline ? "mt-3" : undefined}>{headerExtra}</div>
                ) : null}
                {subtitle ? (
                  <div className={overline || headerExtra ? "mt-3" : undefined}>
                    <InfoTooltip text={subtitle} theme="light" />
                  </div>
                ) : null}
                <h2
                  className={`font-serif font-normal leading-[1.12] tracking-tight text-neutral-950 ${
                    compact ? "text-lg md:text-xl" : "text-[1.35rem] md:text-[1.75rem]"
                  } ${subtitle || overline || headerExtra ? "mt-3" : ""}`}
                >
                  {title}
                </h2>
              </div>
              {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
              ) : null}
            </div>
          ) : null}
          <div
            className={`${
              headerless
                ? ""
                : compact
                  ? "mt-4"
                  : "mt-8 border-t border-neutral-900/[0.06] pt-8"
            } ${bodyClassName}`}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

type StudioMetricTileProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

/** Metric capsule — aligns with hero `HeroTile` density on light studio chrome. */
export function StudioMetricTile({
  label,
  value,
  hint,
  className = "",
  onClick,
  disabled = false,
}: StudioMetricTileProps) {
  const inner = (
    <>
      <p className="text-[13px] font-medium text-neutral-700">{label}</p>
      <p className="mt-3 font-serif text-2xl font-normal tabular-nums tracking-tight text-neutral-950 md:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">{hint}</p> : null}
    </>
  );

  const shellClass = `${rrowmStudioSurface.metricCapsule} text-left transition-[border-color,box-shadow,transform] duration-300 ${
    onClick && !disabled
      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(40,25,10,0.08)]"
      : ""
  } ${disabled ? "cursor-not-allowed opacity-45" : ""} ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={shellClass}>
        {inner}
      </button>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}

/** Interactive intelligence tile — gallery overview grid */
export function StudioInsightTile({
  label,
  children,
  footer,
  className = "",
  onClick,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const shellClass = `${rrowmStudioSurface.metricCapsule} flex min-h-[11rem] flex-col text-left transition-[border-color,box-shadow,transform] duration-300 ${
    onClick && !disabled
      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(40,25,10,0.08)]"
      : ""
  } ${disabled ? "cursor-not-allowed opacity-45" : ""} ${className}`;

  const body = (
    <>
      <p className="text-[13px] font-medium text-neutral-700">{label}</p>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
      {footer ? <div className="mt-4 text-[11px] leading-snug text-neutral-500">{footer}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={shellClass}>
        {body}
      </button>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
