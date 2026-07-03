import type { ClusterId } from "@/components/Field/signature/field-constellation-types";
import type { FieldClusterIntel } from "@/lib/fetch-field-cultural-signals";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";

function formatIntelCount(value: number | null, locale: string): string {
  if (value === null) return "-";
  return value.toLocaleString(locale);
}

export function clusterIntelLines(
  clusterId: ClusterId,
  intel: FieldClusterIntel,
  translate: (key: MessageKey) => string,
  locale: string
): string[] {
  const fmt = (value: number | null) => formatIntelCount(value, locale);

  switch (clusterId) {
    case "records":
      return [
        fillMessage(translate("field.signature.cluster.records.intelTotal"), {
          count: fmt(intel.records.total),
        }),
        fillMessage(translate("field.signature.cluster.records.intelNew"), {
          count: fmt(intel.records.new7d),
        }),
        fillMessage(translate("field.signature.cluster.records.intelAttestation"), {
          count: fmt(intel.records.awaitingAttestation),
        }),
      ];
    case "creatives":
      return [
        fillMessage(translate("field.signature.cluster.creatives.intelTotal"), {
          count: fmt(intel.creatives.total),
        }),
        fillMessage(translate("field.signature.cluster.creatives.intelRecent"), {
          count: fmt(intel.creatives.recentlyActive7d),
        }),
      ];
    case "organisations":
      return [
        fillMessage(translate("field.signature.cluster.organisations.intelTotal"), {
          count: fmt(intel.organisations.total),
        }),
        fillMessage(translate("field.signature.cluster.organisations.intelVerified"), {
          count: fmt(intel.organisations.verifiedInstitutions),
        }),
      ];
    case "opportunities":
      return [
        fillMessage(translate("field.signature.cluster.opportunities.intelTotal"), {
          count: fmt(intel.opportunities.live),
        }),
        fillMessage(translate("field.signature.cluster.opportunities.intelUrgent"), {
          count: fmt(intel.opportunities.closingSoon72h),
        }),
      ];
  }
}
