"use client";

import { useEffect, useState } from "react";

function formatUtcStamp(date: Date): string {
  return `${date.toISOString().slice(11, 19)} UTC`;
}

/** UI-only sync clock — not tied to API polling. */
export function useFieldSyncClock(intervalMs = 5000): string {
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    const tick = () => setStamp(formatUtcStamp(new Date()));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return stamp;
}
