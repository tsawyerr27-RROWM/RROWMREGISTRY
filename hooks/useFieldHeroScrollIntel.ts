"use client";

import { useEffect, useState } from "react";

const FIELD_STATES = ["ACTIVE", "INDEXING", "MAPPING", "SYNC"] as const;
const SCROLL_STEP_PX = 150;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export type FieldHeroScrollIntel = {
  coords: readonly string[];
  signalPct: number;
};

export function useFieldHeroScrollIntel(): FieldHeroScrollIntel {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const nextStep = Math.floor(window.scrollY / SCROLL_STEP_PX);
      setStep((prev) => (prev === nextStep ? prev : nextStep));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const signalPct = Math.min(98, 72 + step * 3);

  return {
    coords: [
      `X:${pad2(22 + step * 2)}`,
      `Y:${pad2(1 + step * 2)}`,
      `NODE:${pad2(5 + step * 2)}`,
      `FIELD:${FIELD_STATES[step % FIELD_STATES.length]}`,
    ],
    signalPct,
  };
}
