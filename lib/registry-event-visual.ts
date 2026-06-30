import type { ArchivalNarrativeKind } from "@/lib/provenance-timeline";
import {
  semanticSignalBarClass,
  semanticStampClass,
  type RegistrySemanticEvent,
} from "@/lib/registry-semantic-signals";

/** Ceremonial filing categories for public chronology stamps */
export type RegistryEventCategory = RegistrySemanticEvent | "ownership_transfer";

export function registryEventCategory(
  kind: ArchivalNarrativeKind
): RegistryEventCategory {
  switch (kind) {
    case "registration":
      return "registration";
    case "certificate":
      return "certification";
    case "transfer":
      return "ownership_transfer";
    case "provenance_continuation":
      return "ownership_transfer";
    case "evidence":
      return "valuation";
    case "dispute_open":
    case "dispute_resolved":
      return "correction";
    case "institutional_confirmation":
    case "artist_confirmation":
    case "verification_other":
      return "certification";
    default:
      return "registration";
  }
}

function toSemanticEvent(category: RegistryEventCategory): RegistrySemanticEvent {
  return category === "ownership_transfer" ? "transfer" : category;
}

export function registryEventSemanticEvent(
  category: RegistryEventCategory
): RegistrySemanticEvent {
  return toSemanticEvent(category);
}

export function registryEventCategoryMessageKey(
  category: RegistryEventCategory
): `registry.event.${Exclude<RegistrySemanticEvent, "transfer"> | "ownership_transfer"}` {
  if (category === "ownership_transfer" || category === "transfer") {
    return "registry.event.ownership_transfer";
  }
  return `registry.event.${category}`;
}

export function registryEventSignalBarClass(category: RegistryEventCategory): string {
  return semanticSignalBarClass(toSemanticEvent(category));
}

export function registryEventStampClass(category: RegistryEventCategory): string {
  return semanticStampClass(toSemanticEvent(category));
}

/** Map ownership transfer types to sale vs generic transfer */
export function ownershipEventCategory(
  transferType: string | null | undefined
): RegistryEventCategory {
  const normalized = String(transferType || "").toLowerCase();
  if (normalized.includes("sale") || normalized.includes("acquisition")) {
    return "sale";
  }
  return "ownership_transfer";
}
