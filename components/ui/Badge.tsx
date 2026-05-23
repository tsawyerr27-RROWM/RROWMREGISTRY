"use client";

import type { ReactNode } from "react";

export type BadgeTone =
  | "muted"
  | "neutral"
  | "strong"
  | "danger"
  | "success"
  | "warning";

const toneClass: Record<BadgeTone, string> = {
  muted: "border border-neutral-300/70 bg-neutral-50 text-neutral-700",
  neutral: "border border-neutral-300/80 bg-white text-neutral-800",
  strong: "border border-neutral-800/25 bg-neutral-900 text-white",
  danger: "border border-red-900/15 bg-red-50 text-red-900",
  success: "border border-emerald-900/15 bg-emerald-50 text-emerald-950",
  warning: "border border-amber-900/15 bg-amber-50 text-amber-950",
};

type Props = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  title?: string;
};

export function Badge({
  children,
  tone = "muted",
  className = "",
  title,
}: Props) {
  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${toneClass[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

