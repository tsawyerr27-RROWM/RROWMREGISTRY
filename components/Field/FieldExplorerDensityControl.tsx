"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  FIELD_EXPLORER_DENSITY_OPTIONS,
  type FieldExplorerDensity,
} from "@/lib/field-explorer-density";
import type { MessageKey } from "@/lib/locale-messages";

const DENSITY_LABEL_KEYS: Record<FieldExplorerDensity, MessageKey> = {
  compact: "field.explorer.density.compact",
  standard: "field.explorer.density.standard",
  editorial: "field.explorer.density.editorial",
};

type Props = {
  value: FieldExplorerDensity;
  onChange: (density: FieldExplorerDensity) => void;
  className?: string;
};

export function FieldExplorerDensityControl({
  value,
  onChange,
  className = "",
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <div
      className={`field-explorer-density-control ${className}`.trim()}
      role="radiogroup"
      aria-label={t("field.explorer.density.label")}
    >
      {FIELD_EXPLORER_DENSITY_OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            className={`field-explorer-density-control__option ${
              active ? "field-explorer-density-control__option--active" : ""
            }`}
            onClick={() => onChange(option)}
          >
            {t(DENSITY_LABEL_KEYS[option])}
          </button>
        );
      })}
    </div>
  );
}
