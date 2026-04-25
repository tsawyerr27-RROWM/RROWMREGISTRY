"use client";

import { useEffect, useState } from "react";

/** Slow glossy highlights — aligns with ds-page-environment cool white field. */
export default function EnvironmentLayer() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 0.025) % 100);
    }, 520);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-40 print:hidden"
        style={{
          background: `radial-gradient(ellipse 92% 72% at ${50 + offset * 0.04}% ${
            38 + offset * 0.03
          }%, rgba(255,255,255,0.55), transparent 62%)`,
          transition: "background 14s ease-out",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-40 opacity-[0.35] print:hidden"
        style={{
          background: `radial-gradient(ellipse 68% 48% at ${58 - offset * 0.03}% ${
            92 - offset * 0.02
          }%, rgba(224, 242, 254, 0.42), transparent 56%)`,
          transition: "background 14s ease-out",
        }}
      />
    </>
  );
}
