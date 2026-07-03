import type { ClusterId } from "./field-constellation-types";

export type ConstellationEdge = {
  id: string;
  d: string;
  dReverse: string;
  label: string;
  labelX: number;
  labelY: number;
  connects: readonly [ClusterId, ClusterId];
  pulseDur: string;
  pulseDelay: string;
};

export const CONSTELLATION_ANCHORS: Record<ClusterId, { x: number; y: number }> = {
  records: { x: 500, y: 120 },
  creatives: { x: 220, y: 300 },
  organisations: { x: 780, y: 300 },
  opportunities: { x: 500, y: 520 },
};

/** Spatial layout — matches desktop constellation grid anchors (viewBox 1000×640). */
export const CONSTELLATION_EDGES: ConstellationEdge[] = [
  {
    id: "records-creatives",
    d: "M500 120 L220 300",
    dReverse: "M220 300 L500 120",
    label: "RC-01",
    labelX: 360,
    labelY: 210,
    connects: ["records", "creatives"],
    pulseDur: "5.2s",
    pulseDelay: "0s",
  },
  {
    id: "records-organisations",
    d: "M500 120 L780 300",
    dReverse: "M780 300 L500 120",
    label: "RO-02",
    labelX: 640,
    labelY: 210,
    connects: ["records", "organisations"],
    pulseDur: "5.8s",
    pulseDelay: "1.1s",
  },
  {
    id: "creatives-opportunities",
    d: "M220 380 L500 520",
    dReverse: "M500 520 L220 380",
    label: "CO-03",
    labelX: 360,
    labelY: 450,
    connects: ["creatives", "opportunities"],
    pulseDur: "6.4s",
    pulseDelay: "2.3s",
  },
  {
    id: "organisations-opportunities",
    d: "M780 380 L500 520",
    dReverse: "M500 520 L780 380",
    label: "OO-04",
    labelX: 640,
    labelY: 450,
    connects: ["organisations", "opportunities"],
    pulseDur: "6.9s",
    pulseDelay: "3.5s",
  },
];

export function edgeTouchesCluster(
  edge: ConstellationEdge,
  cluster: ClusterId | null
): boolean {
  if (!cluster) return false;
  return edge.connects[0] === cluster || edge.connects[1] === cluster;
}

export const CONSTELLATION_STAGGER_MS: Record<ClusterId, number> = {
  records: 0,
  creatives: 120,
  organisations: 240,
  opportunities: 360,
};
