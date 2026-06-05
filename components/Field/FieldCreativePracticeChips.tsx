"use client";

import type { CreativePracticeChip } from "@/lib/practices";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

function PracticeChip({
  label,
  source,
  isPrimary,
}: {
  label: string;
  source: CreativePracticeChip["source"];
  isPrimary?: boolean;
}) {
  const base =
    "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium leading-tight";
  if (source === "registry") {
    return (
      <span className={`${base} border border-emerald-200/80 bg-emerald-50/90 text-emerald-950/85`}>
        {label}
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-neutral-200/80 bg-neutral-50/95 text-neutral-700 ${
        isPrimary ? "ring-1 ring-neutral-300/80" : ""
      }`}
    >
      {label}
      {isPrimary ? (
        <span className="ml-1 font-normal text-neutral-500">· primary</span>
      ) : null}
    </span>
  );
}

type Props = {
  practices: CreativePracticeChip[];
  limit?: number;
  showLegend?: boolean;
};

export function FieldCreativePracticeChips({
  practices,
  limit = 6,
  showLegend = false,
}: Props) {
  const { t } = useLocalePreferences();

  if (practices.length === 0) return null;

  const visible = practices.slice(0, limit);
  const overflow = practices.length - visible.length;

  return (
    <div>
      {showLegend ? (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
          <span>{t("field.creative.practice.legend.declared")}</span>
          <span>{t("field.creative.practice.legend.registry")}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((practice) => (
          <PracticeChip
            key={`${practice.slug}-${practice.source}`}
            label={practice.label}
            source={practice.source}
            isPrimary={practice.isPrimary}
          />
        ))}
        {overflow > 0 ? (
          <span className="self-center text-[11px] text-neutral-400">+{overflow}</span>
        ) : null}
      </div>
    </div>
  );
}
