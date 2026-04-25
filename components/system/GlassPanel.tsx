import type { ReactNode } from "react";
import { glass } from "@/styles/system-design";

export type GlassVariant = "soft" | "strong";

const map: Record<GlassVariant, string> = {
  soft: glass.soft,
  strong: glass.strong,
};

export function GlassPanel({
  variant = "soft",
  className = "",
  children,
}: {
  variant?: GlassVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${map[variant]} rounded-3xl ${className}`}>{children}</div>
  );
}
