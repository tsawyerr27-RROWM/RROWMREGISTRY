"use client";

import { useEffect } from "react";

import { CONSTELLATION_EDGES } from "@/components/Field/signature/field-constellation-network";
import { emitFieldIntelEvent } from "@/lib/field-intelligence-events";

function parseSeconds(value: string): number {
  return parseFloat(value) * 1000;
}

/** Emits pulse_complete when each network pulse cycle finishes. */
export function useConstellationPulseSync(motionEnabled: boolean, booted: boolean) {
  useEffect(() => {
    if (!motionEnabled || !booted) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const edge of CONSTELLATION_EDGES) {
      const period = parseSeconds(edge.pulseDur);
      const offset = parseSeconds(edge.pulseDelay);

      const tick = () => {
        emitFieldIntelEvent({ type: "pulse_complete", edgeId: edge.id });
        const next = setTimeout(tick, period);
        timers.push(next);
      };

      const first = setTimeout(tick, offset + period);
      timers.push(first);
    }

    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [motionEnabled, booted]);
}
