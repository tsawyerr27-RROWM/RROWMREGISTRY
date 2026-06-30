"use client";

import type { ReactNode } from "react";

import { FieldExplorerDensityControl } from "@/components/Field/FieldExplorerDensityControl";
import type { FieldExplorerDensity } from "@/lib/field-explorer-density";

type Props = {
  density: FieldExplorerDensity;
  onDensityChange: (density: FieldExplorerDensity) => void;
  leading?: ReactNode;
  className?: string;
};

/** Shared explorer toolbar — density control + optional leading meta. */
export function FieldExplorerResultsToolbar({
  density,
  onDensityChange,
  leading,
  className = "",
}: Props) {
  return (
    <div
      className={`field-explorer-results-toolbar mt-8 flex flex-wrap items-center justify-between gap-4 ${className}`.trim()}
    >
      {leading ? (
        <div className="min-w-0 text-[var(--v2-ink-muted)]">{leading}</div>
      ) : (
        <span className="sr-only" />
      )}
      <FieldExplorerDensityControl value={density} onChange={onDensityChange} />
    </div>
  );
}
