import type { RightsExclusivity, RightsLicenseStatus, RightsUsageType } from "@/lib/rights-licenses";
import { exclusivityLabel, usageTypeLabel } from "@/lib/rights-licenses";

export type StudioRightsTabId = "active" | "expiring" | "historical";

const EXPIRING_SOON_DAYS = 30;

export function rightsStatusLabel(status: RightsLicenseStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "revoked":
      return "Revoked";
    default:
      return "On file";
  }
}

export function studioRightsTabLabel(tab: StudioRightsTabId): string {
  switch (tab) {
    case "active":
      return "Active";
    case "expiring":
      return "Expiring";
    case "historical":
      return "Historical";
  }
}

export function formatRightsDuration(
  startsAt: string,
  endsAt: string | null | undefined
): string {
  const start = String(startsAt ?? "").trim();
  if (!start) return "—";
  if (!endsAt) return `${formatRightsDate(start)} · open-ended`;
  return `${formatRightsDate(start)} – ${formatRightsDate(endsAt)}`;
}

export function formatRightsDate(isoDate: string): string {
  const clean = String(isoDate ?? "").trim();
  if (!clean) return "—";
  const parsed = new Date(`${clean}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return clean;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysUntilRightsEnd(endsAt: string | null | undefined): number | null {
  const clean = String(endsAt ?? "").trim();
  if (!clean) return null;
  const end = new Date(`${clean}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isLicenseExpiringSoon(
  license: { status: RightsLicenseStatus; ends_at: string | null },
  withinDays = EXPIRING_SOON_DAYS
): boolean {
  if (license.status !== "active") return false;
  const days = daysUntilRightsEnd(license.ends_at);
  if (days == null) return false;
  return days >= 0 && days <= withinDays;
}

export function licenseMatchesStudioTab(
  license: { status: RightsLicenseStatus; ends_at: string | null },
  tab: StudioRightsTabId
): boolean {
  if (tab === "active") {
    return license.status === "active" && !isLicenseExpiringSoon(license);
  }
  if (tab === "expiring") {
    return isLicenseExpiringSoon(license);
  }
  return license.status === "expired" || license.status === "revoked";
}

export function formatRightsLicenseHeadline(args: {
  usageType: RightsUsageType;
  territory: string;
  exclusivity: RightsExclusivity;
}): string {
  return `${usageTypeLabel(args.usageType)} · ${args.territory.trim() || "Unspecified territory"} · ${exclusivityLabel(args.exclusivity)}`;
}

export function countLicensesByStatus(
  licenses: Array<{ status: RightsLicenseStatus }>
): Record<RightsLicenseStatus, number> {
  return licenses.reduce(
    (acc, license) => {
      acc[license.status] += 1;
      return acc;
    },
    { active: 0, expired: 0, revoked: 0 }
  );
}
