/** Portfolio / card ownership presentation states (read-model labels only). */
export type OwnershipSurfaceBadge =
  | "owned"
  | "pending_transfer"
  | "sold"
  | "licensed"
  | "on_exhibition";

export type CollectorPortfolioFilter = "current" | "pending" | "sold";

export function ownershipSurfaceBadgeLabel(badge: OwnershipSurfaceBadge): string {
  switch (badge) {
    case "owned":
      return "Owned";
    case "pending_transfer":
      return "Pending transfer";
    case "sold":
      return "Sold / transferred";
    case "licensed":
      return "Licensed";
    case "on_exhibition":
      return "On exhibition";
    default:
      return "Owned";
  }
}

export function badgeTone(
  badge: OwnershipSurfaceBadge
): "emerald" | "amber" | "rose" | "sky" | "violet" | "neutral" {
  switch (badge) {
    case "owned":
      return "emerald";
    case "pending_transfer":
      return "amber";
    case "sold":
      return "rose";
    case "licensed":
      return "violet";
    case "on_exhibition":
      return "sky";
    default:
      return "neutral";
  }
}

const SALE_TRANSFER_TYPES = new Set([
  "sale",
  "auction",
  "primary_sale",
  "secondary_sale",
  "ownership_transfer",
]);

export function isSaleOrTransferType(transferType: string | null | undefined): boolean {
  const t = String(transferType ?? "").toLowerCase().trim();
  return SALE_TRANSFER_TYPES.has(t);
}

export function resolvePortfolioBadge(args: {
  portfolioStatus?: "held" | "pending_transfer" | "sold";
  transferType?: string | null;
  licensed?: boolean;
  onExhibition?: boolean;
}): OwnershipSurfaceBadge {
  if (args.portfolioStatus === "pending_transfer") return "pending_transfer";
  if (args.portfolioStatus === "sold") return "sold";
  if (args.onExhibition) return "on_exhibition";
  if (args.licensed) return "licensed";
  return "owned";
}
