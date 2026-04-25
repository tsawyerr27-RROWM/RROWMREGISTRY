"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const TRAIL_KEY = "rrowm:navigationTrail:v1";

function getFullPath(pathname: string, searchParams: URLSearchParams | null) {
  const sp = searchParams?.toString() || "";
  return sp ? `${pathname}?${sp}` : pathname;
}

export type NavigationTrailEntry = {
  href: string;
  ts: number;
};

function safeParseTrail(raw: string | null): NavigationTrailEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (v): v is NavigationTrailEntry =>
          Boolean(v) &&
          typeof (v as any).href === "string" &&
          typeof (v as any).ts === "number"
      )
      .slice(-20);
  } catch {
    return [];
  }
}

function pushTrail(href: string) {
  try {
    const existing = safeParseTrail(sessionStorage.getItem(TRAIL_KEY));
    const last = existing[existing.length - 1]?.href;
    if (last === href) return;
    const next = [...existing, { href, ts: Date.now() }].slice(-20);
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export function readNavigationTrail(): NavigationTrailEntry[] {
  if (typeof window === "undefined") return [];
  return safeParseTrail(window.sessionStorage?.getItem(TRAIL_KEY) ?? null);
}

export default function NavigationHistory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    const href = getFullPath(pathname, searchParams);
    if (!href) return;
    if (lastRecordedRef.current === href) return;
    lastRecordedRef.current = href;
    pushTrail(href);
  }, [pathname, searchParams]);

  return null;
}

