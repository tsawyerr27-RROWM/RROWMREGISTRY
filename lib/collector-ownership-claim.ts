/** Structured collector ownership declaration (stored in ownership_events.notes). */

export const OWNERSHIP_ACQUISITION_TYPES = [
  "purchase",
  "gift",
  "inheritance",
  "bequest",
  "other",
] as const;

export type OwnershipAcquisitionType =
  (typeof OWNERSHIP_ACQUISITION_TYPES)[number];

export function isAcquisitionType(v: string): v is OwnershipAcquisitionType {
  return (OWNERSHIP_ACQUISITION_TYPES as readonly string[]).includes(v);
}

export function acquisitionTypeLabel(t: OwnershipAcquisitionType): string {
  switch (t) {
    case "purchase":
      return "Purchase";
    case "gift":
      return "Gift";
    case "inheritance":
      return "Inheritance";
    case "bequest":
      return "Bequest";
    case "other":
    default:
      return "Other";
  }
}

export function buildOwnershipClaimNotes(input: {
  acquisitionType: OwnershipAcquisitionType;
  acquisitionDate: string;
  storagePaths: string[];
}): string {
  const paths =
    input.storagePaths.length > 0
      ? `supporting_storage=${input.storagePaths.join("||")}`
      : "";
  const base = `ownership_declaration; acquisition_type=${input.acquisitionType}; acquisition_date=${input.acquisitionDate}`;
  return paths ? `${base}; ${paths}` : base;
}
