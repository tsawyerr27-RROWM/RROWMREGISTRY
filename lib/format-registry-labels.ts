/** Human-readable value event label — no internal jargon (shared across public record surfaces) */
export function formatValueEventLabel(valueType: string | null | undefined) {
  const t = (valueType || "").toLowerCase().replace(/_/g, " ");
  const map: Record<string, string> = {
    initial: "Primary record",
    initial_valuation: "Initial valuation",
    valuation: "Valuation",
    exhibition_value: "Exhibition value",
    listing_value: "Listing value",
    appraisal: "Appraisal",
    sale: "Sale recorded",
    sale_value: "Sale recorded",
    auction: "Auction recorded",
    insurance: "Insurance",
    donation: "Donation",
    transfer: "Transfer",
    value_correction: "Value correction",
  };
  for (const [k, v] of Object.entries(map)) {
    if (t.includes(k)) return v;
  }
  if (!t) return "Recorded value";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Provenance line — institutional tone, not raw enum strings */
export function formatOwnershipTransferTypeLabel(
  transferType: string | null | undefined
) {
  const key = (transferType || "").toLowerCase().trim().replace(/_/g, "");
  if (key === "transfer" || key === "ownershiptransfer")
    return "Ownership transfer";
  if (key === "mint" || key === "initialmint") return "Initial record";
  if (key === "correction" || key === "recordcorrection")
    return "Record update";
  const raw = String(transferType || "").trim();
  if (!raw) return "Ownership event";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
