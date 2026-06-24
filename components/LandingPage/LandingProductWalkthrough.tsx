"use client";

import Link from "next/link";

import { narrativeLayout } from "@/styles/narrative-layout";
import { narrativeControl } from "@/styles/system-design";
import { fieldExplorerRecordsHref, fieldHomeHref } from "@/lib/field-nav";

const SURFACES = [
  {
    name: "Registry",
    summary: "The authoritative ledger for each work. Verification, certificates, chronology, and rights stay on one record.",
    detail: "Registry ID · Verification · Provenance · Certificates",
    href: fieldExplorerRecordsHref(),
    cta: "Browse records",
    accent: "from-sky-100/70 to-slate-50/40",
  },
  {
    name: "Field",
    summary: "The public cultural layer. Creatives, organisations, records, and opportunities become discoverable presence.",
    detail: "Profiles · Records · Opportunities · Verification hub",
    href: fieldHomeHref(),
    cta: "Explore The Field",
    accent: "from-violet-100/55 to-slate-50/35",
  },
  {
    name: "Studio",
    summary: "Where participants manage identity, portfolios, certificates, and visibility. Private work stays behind sign in.",
    detail: "Creative · Collector · Organisation workspaces",
    href: "/get-started",
    cta: "Open Studio",
    accent: "from-indigo-100/60 to-slate-50/35",
  },
  {
    name: "Deals",
    summary: "Structured proposals for commissions, acquisitions, representation, and licensing. Terms and correspondence on file.",
    detail: "Proposals · Terms · Negotiation ledger · Execution",
    href: "/get-started",
    cta: "Start with Deals",
    accent: "from-amber-100/55 to-stone-50/35",
  },
] as const;

function SurfacePreview({
  name,
  detail,
}: {
  name: string;
  detail: string;
}) {
  return (
    <div
      className="pointer-events-none mt-6 overflow-hidden rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_88%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--rrowm-atmo-rim)] px-4 py-3">
        <span className="text-sm font-medium text-neutral-800">{name}</span>
        <span className="text-[11px] text-neutral-500">Live surface</span>
      </div>
      <div className="space-y-2 p-4">
        {detail.split(" · ").map((line) => (
          <div
            key={line}
            className="rounded-xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_82%,transparent)] px-3 py-2.5 text-[13px] text-neutral-600"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingProductWalkthrough() {
  return (
    <section
      className="rrowm-atmo-section--blend"
      aria-labelledby="landing-products-heading"
    >
      <div className={`${narrativeLayout.gutter} ${narrativeLayout.sectionPadYTight}`}>
        <div className="max-w-3xl">
          <h2
            id="landing-products-heading"
            className="font-serif text-[clamp(1.65rem,2.9vw,2.45rem)] font-normal leading-[1.14] tracking-tight text-neutral-950"
          >
            One platform, four surfaces
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-neutral-600 md:text-base">
            Registry holds truth. Field publishes presence. Studio is where work gets
            done. Deals turn verified relationships into structured transactions.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 lg:gap-6">
          {SURFACES.map((surface) => (
            <li
              key={surface.name}
              className={`list-none overflow-hidden rounded-[1.25rem] border border-[color:var(--rrowm-atmo-rim)] bg-gradient-to-br ${surface.accent} p-6 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.1)] backdrop-blur-sm md:p-7`}
            >
              <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                {surface.name}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.72] text-neutral-600">
                {surface.summary}
              </p>
              <SurfacePreview name={surface.name} detail={surface.detail} />
              <Link
                href={surface.href}
                className={`${narrativeControl.quietLink} mt-6 inline-flex text-sm font-medium`}
              >
                {surface.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
