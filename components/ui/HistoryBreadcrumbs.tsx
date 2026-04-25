"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readNavigationTrail } from "@/components/navigation/NavigationHistory";
import type { BreadcrumbItem } from "@/components/ui/PageNav";

function labelForPath(href: string): string {
  try {
    const u = new URL(href, "http://local");
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Home";

    const [root, second, third] = parts;
    // `/search` has been removed; map old trails to collector workspace.
    if (root === "search") return "Collector studio";
    if (root === "studio") return "Studio";
    if (root === "collector-studio") {
      if (second === "artwork" && third) return "Artwork";
      if (second) return "Collector studio";
      return "Collector studio";
    }
    if (root === "institutional-studio-dashboard") return "Institutional studio";
    if (root === "institutional-studio") {
      if (second === "onboarding") return "Institutional onboarding";
      if (second) return "Institutional studio";
    }
    if (root === "registry" && !second) return "Registry index";
    if (root === "registry" && second) return "Registry";
    if (root === "artwork" && second) return "Artwork";
    if (root === "verify" && second) return "Verify";
    if (root === "certificate" && second) return "Certificate";
    if (root === "artist" && second) return "Artist";
    if (root === "onboarding") return "Onboarding";
    if (root === "gallery" && second === "onboarding") return "Institutional onboarding";
    if (root === "gallery" && second) return "Institutional studio";
    if (root === "dashboard") return "Studio";
    if (root === "gallery-dashboard") return "Institutional studio";
    if (root === "collector" && second) return "Collector studio";
    return parts[0].replace(/-/g, " ");
  } catch {
    return "Page";
  }
}

function normalizeCrumbHref(href: string): string {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname === "/search" || u.pathname.startsWith("/search/")) {
      u.pathname = u.pathname.replace(/^\/search\b/, "/collector-studio");
    }
    return u.pathname + (u.search || "") + (u.hash || "");
  } catch {
    return href;
  }
}

function toCrumbsFromTrail(): BreadcrumbItem[] {
  const trail = readNavigationTrail();
  if (trail.length === 0) return [];

  // Keep just the last few *unique* pages in this session.
  const unique: string[] = [];
  for (const e of trail) {
    const href = e.href;
    if (!href) continue;
    const norm = normalizeCrumbHref(href);
    if (unique[unique.length - 1] === norm) continue;
    unique.push(norm);
  }
  const last = unique.slice(-4);
  return last.map((href) => ({ href, label: labelForPath(href) }));
}

export function HistoryBreadcrumbs({
  fallbackCrumbs,
}: {
  fallbackCrumbs?: BreadcrumbItem[];
}) {
  const fallback = useMemo(() => fallbackCrumbs || [], [fallbackCrumbs]);
  // Hydration safety: first client render must match server render.
  // We render fallback crumbs initially, then swap to session trail after mount.
  const [crumbs, setCrumbs] = useState<BreadcrumbItem[]>(fallback);

  useEffect(() => {
    const fromTrail = toCrumbsFromTrail();
    if (fromTrail.length > 0) setCrumbs(fromTrail);
  }, []);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-neutral-500"
    >
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        const content = c.href && !isLast ? (
          <Link
            href={c.href}
            className="transition hover:text-neutral-800 hover:underline decoration-neutral-300 underline-offset-4"
          >
            {c.label}
          </Link>
        ) : (
          <span className={isLast ? "text-neutral-800" : ""}>{c.label}</span>
        );

        return (
          <span key={`${c.label}-${idx}`} className="flex items-center gap-2">
            {idx > 0 ? <span className="text-neutral-300">/</span> : null}
            {content}
          </span>
        );
      })}
    </nav>
  );
}

