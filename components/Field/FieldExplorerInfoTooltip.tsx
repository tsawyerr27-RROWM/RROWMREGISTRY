"use client";

import type { ReactNode } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";

type Props = {
  text: ReactNode;
  className?: string;
};

/** Compact ⓘ for Field explorer orientation copy (ledes, scope notes). */
export function FieldExplorerInfoTooltip({ text, className = "" }: Props) {
  return (
    <InfoTooltip
      theme="light"
      className={`mt-1 shrink-0 ${className}`.trim()}
      text={text}
    />
  );
}
