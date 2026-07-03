"use client";

import type { ClusterId } from "@/components/Field/signature/field-constellation-types";

import { useFieldHeroScrollIntel } from "./useFieldHeroScrollIntel";
import { useFieldIntelligence } from "./useFieldIntelligence";

const CLUSTER_NODE: Record<ClusterId, number> = {
  records: 1,
  creatives: 2,
  organisations: 3,
  opportunities: 4,
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function useFieldHeroIntel() {
  const scrollIntel = useFieldHeroScrollIntel();
  const { activeCluster, searchFocus } = useFieldIntelligence();

  if (searchFocus) {
    return {
      ...scrollIntel,
      coords: [
        scrollIntel.coords[0]!,
        scrollIntel.coords[1]!,
        "NODE:00",
        "FIELD:QUERY",
      ] as const,
    };
  }

  if (activeCluster) {
    return {
      ...scrollIntel,
      coords: [
        scrollIntel.coords[0]!,
        scrollIntel.coords[1]!,
        `NODE:${pad2(CLUSTER_NODE[activeCluster])}`,
        `FIELD:${activeCluster.toUpperCase()}`,
      ] as const,
    };
  }

  return scrollIntel;
}
