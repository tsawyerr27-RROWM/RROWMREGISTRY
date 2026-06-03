import type { MessageKey } from "@/lib/locale-messages";
import { formatValueEventLabel } from "@/lib/format-registry-labels";
import { formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";
import type { OwnershipSystemStatus } from "@/lib/ownership-ledger";

type Translate = (key: MessageKey) => string;
type FormatMoney = (amount: number, currency: string) => string;

const STATUS_KEYS: Record<OwnershipSystemStatus, MessageKey> = {
  verified: "studio.ledger.status.verified",
  claimed: "studio.ledger.status.claimed",
  unassigned: "studio.ledger.status.unassigned",
  recorded: "studio.ledger.status.recorded",
};

export function translateOwnershipStatusLabel(
  status: OwnershipSystemStatus,
  t: Translate
): string {
  return t(STATUS_KEYS[status]);
}

export function translateOwnershipOwnerLabel(
  label: string,
  t: Translate
): string {
  if (label === "You") return t("studio.ownership.you");
  if (label === "Unknown owner") return t("studio.ledger.unknownOwner");
  return label;
}

export function translateOwnershipPartyLabel(
  party: string,
  t: Translate
): string {
  if (party === "Unknown owner") return t("studio.ledger.unknownOwner");
  if (party === "Unknown") return t("studio.ledger.unknown");
  return party;
}

export function translateValueEventType(
  valueType: string | null | undefined,
  t: Translate
): string {
  const key = String(valueType || "")
    .toLowerCase()
    .trim();
  if (key === "initial") return t("studio.form.eventInitial");
  if (key === "primary_sale") return t("studio.form.eventPrimarySale");
  if (key === "secondary_sale") return t("studio.form.eventSecondarySale");
  if (key === "appraisal") return t("studio.form.eventAppraisal");
  if (key === "internal_estimate") return t("studio.form.eventInternalEstimate");
  if (key === "sale") return t("studio.ledger.valueType.sale");
  if (key === "auction") return t("studio.ledger.valueType.auction");
  return formatValueEventLabel(valueType);
}

export function translateTransferTypeLabel(
  transferType: string | null | undefined,
  t: Translate
): string {
  const key = String(transferType || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "");
  if (key === "transfer" || key === "ownershiptransfer")
    return t("studio.ledger.transferType.transfer");
  if (key === "mint" || key === "initialmint")
    return t("studio.ledger.transferType.initial");
  if (key === "correction" || key === "recordcorrection")
    return t("studio.ledger.transferType.correction");
  if (key === "sale") return t("studio.ledger.transferType.sale");
  return formatOwnershipTransferTypeLabel(transferType);
}

export function translateVisibilityLevel(
  level: string | null | undefined,
  t: Translate
): string {
  const key = String(level || "")
    .toLowerCase()
    .trim();
  if (key === "private") return t("studio.form.visibilityPrivate");
  if (key === "gallery") return t("studio.form.visibilityGallery");
  if (key === "public") return t("studio.form.visibilityPublic");
  if (key === "certificate") return t("studio.form.visibilityCertificate");
  return level || "–";
}

export function translateBuyerType(
  buyerType: string,
  t: Translate
): string {
  switch (buyerType) {
    case "collector":
      return t("studio.ledger.buyerType.collector");
    case "gallery":
      return t("studio.ledger.buyerType.gallery");
    case "institution":
      return t("studio.ledger.buyerType.institution");
    case "private":
      return t("studio.ledger.buyerType.private");
    case "unknown":
      return t("studio.ledger.buyerType.unknown");
    default:
      return buyerType;
  }
}

export function translateRawVerificationStatus(
  status: string | null | undefined,
  t: Translate
): string {
  const key = String(status || "")
    .toLowerCase()
    .trim();
  if (key === "verified") return t("studio.ledger.status.verified");
  if (key === "claimed") return t("studio.ledger.status.claimed");
  if (key === "recorded") return t("studio.ledger.status.recorded");
  if (key === "unassigned") return t("studio.ledger.status.unassigned");
  return String(status || "").trim();
}

export function translateOwnershipLedgerSubtitle(
  ev: Record<string, unknown>,
  t: Translate,
  formatMoney: FormatMoney
): string {
  const parts: string[] = [
    translateTransferTypeLabel(ev.transfer_type as string | null | undefined, t),
  ];

  const price = ev.sale_price;
  const cur = ev.sale_currency;
  if (price != null && String(price).trim() !== "") {
    try {
      parts.push(
        formatMoney(
          Number(price),
          typeof cur === "string" && cur.trim() ? cur : "USD"
        )
      );
    } catch {
      parts.push(String(price));
    }
  }

  const dateSrc = ev.sale_date || ev.created_at;
  if (dateSrc) {
    const d = new Date(String(dateSrc));
    if (!Number.isNaN(d.getTime())) {
      parts.push(String(d.getFullYear()));
    }
  }

  return parts.join(" · ");
}
