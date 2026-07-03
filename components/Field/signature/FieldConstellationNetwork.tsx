"use client";

import type { ConstellationIdleEvent } from "@/hooks/useFieldConstellationIdle";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { isAnchorLit, isEdgeLit } from "@/lib/field-intelligence-events";

import type { ClusterId } from "./field-constellation-types";
import {
  CONSTELLATION_ANCHORS,
  CONSTELLATION_EDGES,
  edgeTouchesCluster,
} from "./field-constellation-network";

type Props = {
  activeCluster: ClusterId | null;
  motionEnabled: boolean;
  booted: boolean;
  idleEvent: ConstellationIdleEvent | null;
};

const ANCHOR_ORDER: ClusterId[] = [
  "records",
  "creatives",
  "organisations",
  "opportunities",
];

export function FieldConstellationNetwork({
  activeCluster,
  motionEnabled,
  booted,
  idleEvent,
}: Props) {
  const intel = useFieldIntelligence();

  return (
    <svg
      className="field-signature-constellation__network pointer-events-none absolute inset-0 hidden md:block"
      aria-hidden
      viewBox="0 0 1000 640"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="field-constellation-pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="field-constellation-haze-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="field-constellation-idle-packet" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="field-constellation-anchor-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CONSTELLATION_EDGES.map((edge) => {
        const highlighted = edgeTouchesCluster(edge, activeCluster);
        const intelLit = isEdgeLit(intel, edge.id, activeCluster);
        const idleEdgePulse =
          idleEvent?.type === "edge-pulse" && idleEvent.edgeId === edge.id;
        const idlePacket =
          idleEvent?.type === "signal-packet" && idleEvent.edgeId === edge.id;

        return (
          <g
            key={edge.id}
            className={`field-signature-network-edge${highlighted || intelLit ? " field-signature-network-edge--lit" : ""}${idleEdgePulse ? " field-signature-network-edge--idle-pulse" : ""}${booted ? " field-signature-network-edge--drawn" : ""}`}
            data-edge={edge.id}
          >
            <path
              d={edge.d}
              className="field-signature-network-edge__haze"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={edge.d}
              pathLength={1}
              className="field-signature-network-edge__line"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={edge.labelX}
              y={edge.labelY}
              className={`field-signature-network-edge__label${highlighted || intelLit ? " field-signature-network-edge__label--lit" : ""}`}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {edge.label}
            </text>
            {motionEnabled ? (
              <circle
                r="2.5"
                className={`field-signature-network-pulse field-signature-network-pulse--${edge.connects[0]}`}
                filter="url(#field-constellation-pulse-glow)"
              >
                <animateMotion
                  dur={edge.pulseDur}
                  begin={edge.pulseDelay}
                  repeatCount="indefinite"
                  path={edge.d}
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.55;0.55;0"
                  keyTimes="0;0.12;0.82;1"
                  dur={edge.pulseDur}
                  begin={edge.pulseDelay}
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
            {idleEdgePulse ? (
              <circle
                r="3"
                className={`field-signature-network-idle-pulse field-signature-network-pulse--${edge.connects[0]}`}
                filter="url(#field-constellation-pulse-glow)"
              >
                <animateMotion
                  dur="2.8s"
                  begin="0s"
                  repeatCount="1"
                  fill="freeze"
                  path={edge.d}
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.65;0.45;0"
                  keyTimes="0;0.15;0.75;1"
                  dur="2.8s"
                  begin="0s"
                  repeatCount="1"
                  fill="freeze"
                />
              </circle>
            ) : null}
            {idlePacket ? (
              <circle
                r="1.8"
                className={`field-signature-network-idle-packet field-signature-network-pulse--${edge.connects[1]}`}
                filter="url(#field-constellation-idle-packet)"
              >
                <animateMotion
                  dur="2.4s"
                  begin="0s"
                  repeatCount="1"
                  fill="freeze"
                  path={edge.dReverse}
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.5;0.35;0"
                  keyTimes="0;0.2;0.7;1"
                  dur="2.4s"
                  begin="0s"
                  repeatCount="1"
                  fill="freeze"
                />
              </circle>
            ) : null}
          </g>
        );
      })}

      {ANCHOR_ORDER.map((clusterId) => {
        const anchor = CONSTELLATION_ANCHORS[clusterId];
        const lit = isAnchorLit(intel, clusterId);
        return (
          <g
            key={clusterId}
            className={`field-signature-network-anchor field-signature-network-anchor--${clusterId}${lit ? " field-signature-network-anchor--lit" : ""}`}
            transform={`translate(${anchor.x} ${anchor.y})`}
          >
            <circle
              r="8"
              className="field-signature-network-anchor__halo"
              filter="url(#field-constellation-anchor-glow)"
            />
            <circle r="2.2" className="field-signature-network-anchor__core" />
          </g>
        );
      })}
    </svg>
  );
}
