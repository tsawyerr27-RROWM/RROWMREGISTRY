import Link from "next/link";

import type { OrganisationExplorerRow } from "@/lib/fetch-organisation-explorer-list";

type Props = {
  row: OrganisationExplorerRow;
};

export function OrganisationPresenceCard({ row }: Props) {
  return (
    <article className="flex h-full flex-col rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/90 p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-900/[0.09] hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.18)] md:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
        Organisation
      </p>

      <h2 className="mt-2 font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950">
        <Link href={row.href} className="transition hover:text-neutral-600">
          {row.name}
        </Link>
      </h2>

      {row.location ? (
        <p className="mt-2 text-sm text-neutral-600">{row.location}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
            row.verified
              ? "border border-emerald-200/80 bg-emerald-50/90 text-emerald-950/85"
              : "border border-neutral-200/80 bg-neutral-50/95 text-neutral-700"
          }`}
        >
          {row.verified ? "Organisation verification on file" : "Registry participant"}
        </span>
        {row.verifiedWorkCount > 0 ? (
          <span className="text-[11px] text-neutral-500">
            {row.verifiedWorkCount} verified{" "}
            {row.verifiedWorkCount === 1 ? "work" : "works"}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
        {row.representedCreativesCount > 0
          ? `${row.representedCreativesCount} represented ${
              row.representedCreativesCount === 1 ? "Creative" : "Creatives"
            }`
          : "No represented Creatives listed yet"}
      </p>

      <div className="mt-3 rounded-xl border border-neutral-900/[0.05] bg-neutral-50/70 px-3.5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
          Registry footprint
        </p>
        <p className="mt-1 text-sm text-neutral-800">
          {row.totalRecords > 0 ? (
            <>
              <span className="font-medium tabular-nums">{row.totalRecords}</span>{" "}
              {row.totalRecords === 1 ? "record" : "records"} on file
            </>
          ) : (
            "No Registry records on file yet"
          )}
          {row.certificateCount > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="tabular-nums">{row.certificateCount}</span>{" "}
              {row.certificateCount === 1 ? "certificate" : "certificates"}
              {row.revokedCertificateCount > 0 ? (
                <span className="text-neutral-600">
                  {" "}
                  ({row.revokedCertificateCount} revoked)
                </span>
              ) : null}
            </>
          ) : null}
        </p>
      </div>

      {row.descriptionExcerpt ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
          {row.descriptionExcerpt}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-900/[0.05] pt-5">
        <p className="text-[11px] text-neutral-500">
          {row.verifiedWorkCount > 0
            ? `${row.verifiedWorkCount} verified on registry`
            : "Verification forming on registry"}
        </p>
        <Link
          href={row.href}
          className="shrink-0 text-sm font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
