export const COLLECTOR_VAULT_BUCKET = "collector-vault" as const;

export type CollectorVaultCategory =
  | "invoice"
  | "acquisition_record"
  | "certificate"
  | "condition_report"
  | "internal_notes"
  | "shipping_reference"
  | "other";

export const COLLECTOR_VAULT_CATEGORIES: CollectorVaultCategory[] = [
  "invoice",
  "acquisition_record",
  "certificate",
  "condition_report",
  "internal_notes",
  "shipping_reference",
  "other",
];

export const COLLECTOR_VAULT_CATEGORY_LABELS: Record<CollectorVaultCategory, string> = {
  invoice: "Invoice",
  acquisition_record: "Acquisition record",
  certificate: "Certificate",
  condition_report: "Condition report",
  internal_notes: "Internal notes",
  shipping_reference: "Shipping reference",
  other: "Other",
};

export function isVaultCategory(s: unknown): s is CollectorVaultCategory {
  return typeof s === "string" && (COLLECTOR_VAULT_CATEGORIES as string[]).includes(s);
}

export function vaultCategoryLabel(cat: CollectorVaultCategory): string {
  return COLLECTOR_VAULT_CATEGORY_LABELS[cat] ?? COLLECTOR_VAULT_CATEGORY_LABELS.other;
}

export const COLLECTOR_VAULT_FRAME =
  "Private materials support your studio archive and provenance continuity. They stay off the public record unless you release them elsewhere.";

export const COLLECTOR_VAULT_MAX_BYTES = 20 * 1024 * 1024;

export const COLLECTOR_VAULT_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export function textOnlyVaultCategories(): CollectorVaultCategory[] {
  return ["internal_notes", "shipping_reference"];
}

export function safeVaultFilename(raw: string): string {
  const base = String(raw || "file").trim() || "file";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
  if (!cleaned || cleaned === "." || cleaned === "..") return "file";
  if (cleaned.includes("..")) return "file";
  return cleaned.replace(/^\.+/, "file");
}
