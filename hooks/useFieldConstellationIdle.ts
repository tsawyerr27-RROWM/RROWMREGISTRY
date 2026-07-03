"use client";

import { useEffect, useRef, useState } from "react";

import type { ClusterId } from "@/components/Field/signature/field-constellation-types";
import { CONSTELLATION_EDGES } from "@/components/Field/signature/field-constellation-network";

export type ConstellationIdleEvent =
  | { type: "edge-pulse"; edgeId: string }
  | { type: "node-brighten"; clusterId: ClusterId }
  | { type: "rail-flicker"; clusterId: ClusterId }
  | { type: "signal-packet"; edgeId: string };

const CLUSTER_IDS: ClusterId[] = [
  "records",
  "creatives",
  "organisations",
  "opportunities",
];

const EVENT_DURATIONS_MS: Record<ConstellationIdleEvent["type"], number> = {
  "edge-pulse": 3200,
  "node-brighten": 2000,
  "rail-flicker": 900,
  "signal-packet": 2800,
};

function pickIdleEvent(): ConstellationIdleEvent {
  const roll = Math.random();
  const edge =
    CONSTELLATION_EDGES[Math.floor(Math.random() * CONSTELLATION_EDGES.length)]!;
  const cluster = CLUSTER_IDS[Math.floor(Math.random() * CLUSTER_IDS.length)]!;

  if (roll < 0.28) {
    return { type: "edge-pulse", edgeId: edge.id };
  }
  if (roll < 0.52) {
    return { type: "node-brighten", clusterId: cluster };
  }
  if (roll < 0.76) {
    return { type: "rail-flicker", clusterId: cluster };
  }
  return { type: "signal-packet", edgeId: edge.id };
}

/** Sparse ambient intelligence — one subtle event every 8–15s. */
export function useFieldConstellationIdle(motionEnabled: boolean, booted: boolean) {
  const [event, setEvent] = useState<ConstellationIdleEvent | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!motionEnabled || !booted) {
      setEvent(null);
      return;
    }

    let scheduleTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 7000;
      scheduleTimer = setTimeout(() => {
        if (activeRef.current) {
          scheduleNext();
          return;
        }

        const next = pickIdleEvent();
        activeRef.current = true;
        setEvent(next);

        clearTimer = setTimeout(() => {
          setEvent(null);
          activeRef.current = false;
          scheduleNext();
        }, EVENT_DURATIONS_MS[next.type]);
      }, delay);
    };

    scheduleNext();

    return () => {
      if (scheduleTimer) clearTimeout(scheduleTimer);
      if (clearTimer) clearTimeout(clearTimer);
      activeRef.current = false;
      setEvent(null);
    };
  }, [motionEnabled, booted]);

  return event;
}
