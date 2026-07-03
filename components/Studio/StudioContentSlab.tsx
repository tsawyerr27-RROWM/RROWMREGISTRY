"use client";

import type { ReactNode } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { rrowmZoneClass } from "@/styles/rrowm-theme";
import { studioV2 } from "@/styles/studio-v2";

/** Vertical rhythm between hero and overview slabs */
export const studioOverviewStackClass = "space-y-8 md:space-y-10";

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
  const shell = compact
    ? studioV2.surface.filingSheet
    : studioV2.surface.filingSheetMajor;
  const pad = compact
    ? "relative px-5 py-5 sm:px-6 sm:py-6"
    : "relative px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10";

  return (
    <section
      id={id}
      className={`${studioV2.scope} relative ${scrollMargin ? "scroll-mt-28" : ""} ${className}`}
    >
      <div className={`${shell} ${rrowmZoneClass.studio} relative overflow-hidden`}>
        <div className={pad}>
          {!headerless ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {overline ? (
                  <p className="v2-type-label text-[10px] tracking-[0.2em] text-[var(--v2-ink-muted)]">
                    {overline}
                  </p>
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
  /** primary: dominant serif figure (default) · secondary: muted microtile */
  variant?: "primary" | "secondary";
};

/** Metric capsule — archival filing-sheet tile with primary/secondary hierarchy. */
export function StudioMetricTile({
  label,
  value,
  hint,
  className = "",
  onClick,
  disabled = false,
  variant = "primary",
}: StudioMetricTileProps) {
  const isPrimary = variant === "primary";

  const inner = (
    <>
      <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
        {label}
      </p>
      <p
        className={
          isPrimary
            ? "mt-2.5 font-serif text-2xl font-normal tabular-nums tracking-tight text-[var(--v2-ink)] md:text-[1.85rem]"
            : "mt-2 font-serif text-lg font-normal tabular-nums tracking-tight text-[var(--v2-ink-soft)]"
        }
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--v2-ink-muted)]">{hint}</p>
      ) : null}
    </>
  );

  const surface = isPrimary
    ? "rounded-lg border border-[var(--v2-border-strong)] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)]"
    : "rounded-lg border border-[var(--v2-border)] bg-white/80 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]";

  const shellClass = `${studioV2.scope} ${surface} block w-full text-left transition-[border-color,box-shadow,transform] duration-300 ${
    onClick && !disabled
      ? "v2-motion-hover-subtle cursor-pointer hover:-translate-y-0.5"
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
  const shellClass = `${studioV2.scope} flex min-h-[11rem] flex-col rounded-lg border border-[var(--v2-border-strong)] bg-white px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow,transform] duration-300 ${
    onClick && !disabled
      ? "v2-motion-hover-subtle cursor-pointer hover:-translate-y-0.5"
      : ""
  } ${disabled ? "cursor-not-allowed opacity-45" : ""} ${className}`;

  const body = (
    <>
      <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
        {label}
      </p>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
      {footer ? (
        <div className="mt-4 text-[11px] leading-snug text-[var(--v2-ink-muted)]">{footer}</div>
      ) : null}
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
