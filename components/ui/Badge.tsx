"use client";

import type { ReactNode } from "react";

import { rrowmBadge } from "@/styles/rrowm-theme";

export type BadgeTone =
  | "muted"
  | "neutral"
  | "accent"
  | "strong"
  | "danger"
  | "success"
  | "warning";

const toneClass: Record<BadgeTone, string> = {
  muted: rrowmBadge.muted,
  neutral: rrowmBadge.muted,
  accent: rrowmBadge.accent,
  strong: rrowmBadge.strong,
  danger: rrowmBadge.danger,
  success: rrowmBadge.success,
  warning: rrowmBadge.warning,
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
      className={`${rrowmBadge.base} ${toneClass[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
