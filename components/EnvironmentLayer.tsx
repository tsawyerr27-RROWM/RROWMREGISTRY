"use client";

import { useEffect, useState } from "react";

/**
 * Global v2 app environment — layered cool field with grain, scan lines,
 * and rare cobalt/lime signal pulses. Very subtle; pairs with `rrowm-app-environment` in globals.css.
 */
export default function EnvironmentLayer() {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 240);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const pulseActive = pulsePhase === 0;

  return (
    <div className="rrowm-app-environment pointer-events-none fixed inset-0 -z-40 print:hidden" aria-hidden>
      <div className="rrowm-app-environment__base" />
      <div className="rrowm-app-environment__grain" />
      <div className="rrowm-app-environment__scanlines" />
      <div
        className={`rrowm-app-environment__pulse rrowm-app-environment__pulse--cobalt ${
          pulseActive ? "rrowm-app-environment__pulse--active" : ""
        }`}
      />
      <div
        className={`rrowm-app-environment__pulse rrowm-app-environment__pulse--lime ${
          pulsePhase === 120 ? "rrowm-app-environment__pulse--active" : ""
        }`}
      />
    </div>
  );
}
