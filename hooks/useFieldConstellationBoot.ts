"use client";

import { useEffect, useState, type RefObject } from "react";

/** Triggers constellation boot sequence once section enters view. */
export function useFieldConstellationBoot(
  motionEnabled: boolean,
  sectionRef: RefObject<HTMLElement | null>
) {
  const [booted, setBooted] = useState(!motionEnabled);

  useEffect(() => {
    if (!motionEnabled) {
      setBooted(true);
      return;
    }

    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setBooted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [motionEnabled, sectionRef]);

  return booted;
}
