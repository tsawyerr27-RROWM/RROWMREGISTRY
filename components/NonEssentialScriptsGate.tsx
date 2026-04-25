"use client";

import { useEffect, useState } from "react";
import { analyticsAllowed } from "@/lib/cookie-consent";

/**
 * Mount point for optional analytics / measurement (e.g. Plausible, GA).
 * Renders children only when the user has accepted non-essential cookies.
 */
export function NonEssentialScriptsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const sync = () => setAllow(analyticsAllowed());
    sync();
    window.addEventListener("rrowm-cookie-consent", sync);
    return () => window.removeEventListener("rrowm-cookie-consent", sync);
  }, []);

  if (!allow) return null;
  return <>{children}</>;
}
