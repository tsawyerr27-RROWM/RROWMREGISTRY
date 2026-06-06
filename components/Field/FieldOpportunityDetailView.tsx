import Link from "next/link";

import { FieldExplorerDiscoveryStrip } from "@/components/Field/FieldExplorerDiscoveryStrip";
import { OrganisationPresenceRegistryEvidence } from "@/components/Field/OrganisationPresenceRegistryEvidence";
import type { FieldOpportunityDetailData } from "@/lib/fetch-field-opportunity-detail";
import {
  fieldExplorerOrganisationsHref,
  fieldOpportunitiesHref,
} from "@/lib/field-nav";

type Props = {
  data: FieldOpportunityDetailData;
};

function formatWindowDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FieldOpportunityDetailView({ data }: Props) {
  const {
    brief,
    organisation,
    programme,
    sectorLabel,
    briefTypeLabel,
    participationModeLabel,
    practiceLabels,
    acceptingResponses,
    presence,
  } = data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          Opportunity
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl">
          {brief.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-700">
          <Link
            href={organisation.href}
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
          >
            {organisation.name}
          </Link>
          {organisation.verified ? (
            <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-950">
              Verified organisation
            </span>
          ) : null}
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-700">
            {briefTypeLabel}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${
              acceptingResponses
                ? "border border-emerald-900/15 bg-emerald-50 text-emerald-950"
                : "border border-neutral-200 bg-neutral-50 text-neutral-600"
            }`}
          >
            {acceptingResponses ? "Open" : "Closed"}
          </span>
        </div>

        {programme ? (
          <p className="mt-4 text-sm text-neutral-600">
            Programme:{" "}
            <Link href={programme.href} className="font-medium hover:text-neutral-900">
              {programme.title}
            </Link>
          </p>
        ) : null}
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-2xl text-neutral-950">About this opportunity</h2>
        {brief.description ? (
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-neutral-700">
            {brief.description}
          </p>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">No description provided.</p>
        )}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Sector
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{sectorLabel}</dd>
          </div>
          <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Participation mode
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">
              {participationModeLabel}
            </dd>
          </div>
          <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Application window opens
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">
              {formatWindowDate(brief.opens_at)}
            </dd>
          </div>
          <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Application window closes
            </dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">
              {formatWindowDate(brief.closes_at)}
            </dd>
          </div>
        </dl>

        {practiceLabels.length > 0 ? (
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Practices required
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {practiceLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {brief.registry_outcome_required ? (
          <div className="mt-8 rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
              Registry outcome
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              {brief.registry_outcome_copy?.trim() ||
                "This opportunity may result in registry-backed outcomes."}
            </p>
          </div>
        ) : null}
      </section>

      {presence ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-serif text-2xl text-neutral-950">Trust & registry evidence</h2>
          <OrganisationPresenceRegistryEvidence
            verified={presence.organisation.verified}
            footprint={presence.footprint}
            representedCreativesCount={presence.representedCreatives.length}
            participationLayers={presence.participationLayers}
          />
        </section>
      ) : null}

      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-2xl text-neutral-950">Discovery</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={organisation.href}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            View organisation profile
          </Link>
          <Link
            href={fieldOpportunitiesHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Browse opportunities
          </Link>
          <Link
            href={fieldExplorerOrganisationsHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Browse organisations
          </Link>
        </div>
      </section>

      <FieldExplorerDiscoveryStrip activeTab="opportunities" />
    </main>
  );
}
