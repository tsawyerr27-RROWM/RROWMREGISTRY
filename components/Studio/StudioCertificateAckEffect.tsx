"use client";

import { useEffect } from "react";
import { studioCertAckKey } from "@/lib/studio-signals";

/** Marks certificate as “seen” for Collector Studio card signals (local only). */
export function StudioCertificateAckEffect({ registryId }: { registryId: string }) {
  useEffect(() => {
    const id = registryId.trim();
    if (!id) return;
    try {
      localStorage.setItem(studioCertAckKey(id), String(Date.now()));
    } catch {
      /* storage unavailable */
    }
  }, [registryId]);
  return null;
}
