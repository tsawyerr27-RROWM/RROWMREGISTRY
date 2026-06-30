export type FieldExplorerDensity = "compact" | "standard" | "editorial";

export type FieldExplorerKind =
  | "records"
  | "creatives"
  | "organisations"
  | "opportunities";

export const FIELD_EXPLORER_DENSITY_KEY_PREFIX = "rrowm.field.explorer.density.";

/** @deprecated Use fieldExplorerDensityStorageKey(kind) */
export const FIELD_EXPLORER_DENSITY_STORAGE_KEY = "rrowm.field.explorer.density";

export const DEFAULT_FIELD_EXPLORER_DENSITY: FieldExplorerDensity = "standard";

export const FIELD_EXPLORER_DENSITY_OPTIONS: readonly FieldExplorerDensity[] = [
  "compact",
  "standard",
  "editorial",
] as const;

export function fieldExplorerDensityStorageKey(kind: FieldExplorerKind): string {
  return `${FIELD_EXPLORER_DENSITY_KEY_PREFIX}${kind}`;
}

export function isFieldExplorerDensity(value: string): value is FieldExplorerDensity {
  return (
    value === "compact" || value === "standard" || value === "editorial"
  );
}

export function parseFieldExplorerDensity(
  raw: string | null | undefined
): FieldExplorerDensity {
  if (raw && isFieldExplorerDensity(raw)) return raw;
  return DEFAULT_FIELD_EXPLORER_DENSITY;
}

function standardColumnsForKind(kind: FieldExplorerKind): string {
  switch (kind) {
    case "records":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    case "creatives":
    case "organisations":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case "opportunities":
      return "grid-cols-1 lg:grid-cols-2";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  }
}

function compactColumnsForKind(kind: FieldExplorerKind): string {
  switch (kind) {
    case "records":
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    case "creatives":
    case "organisations":
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "opportunities":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
  }
}

function editorialColumnsForKind(kind: FieldExplorerKind): string {
  switch (kind) {
    case "opportunities":
      return "grid-cols-1";
    default:
      return "grid-cols-1 lg:grid-cols-2";
  }
}

export function fieldExplorerDensityGridClass(
  density: FieldExplorerDensity,
  kind: FieldExplorerKind
): string {
  const base = "field-explorer-density-grid mt-12 grid min-w-0 w-full";

  switch (density) {
    case "compact":
      return `${base} gap-5 md:gap-6 ${compactColumnsForKind(kind)}`;
    case "editorial":
      return `${base} gap-10 lg:gap-12 ${editorialColumnsForKind(kind)}`;
    case "standard":
    default:
      return `${base} gap-8 ${standardColumnsForKind(kind)}`;
  }
}
