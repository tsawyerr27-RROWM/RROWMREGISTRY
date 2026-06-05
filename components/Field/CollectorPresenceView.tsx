import Link from "next/link";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { CollectorPresencePageData } from "@/lib/field-collector-presence";
import {
  fieldExplorerRecordsHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";

type Props = {
  data: CollectorPresencePageData;
};

function collectorInitial(title: string) {
  const c = title.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

export function CollectorPresenceView({ data }: Props) {
  const {
    displayTitle,
    location,
    bio,
    anonymousPublic,
    showLocation,
    showOwnershipDetails,
    stats,
    stewardshipLines,
    footprint,
    works,
  } = data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
          Collector
        </p>
        <div className="mt-4 flex flex-wrap items-start gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-neutral-900/[0.08] bg-gradient-to-br from-neutral-100 to-neutral-200/90 font-serif text-2xl text-neutral-700"
            aria-hidden
          >
            {collectorInitial(displayTitle)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-[3.25rem]">
              {displayTitle}
            </h1>
            {showLocation && location ? (
              <p className="mt-3 text-base text-neutral-600">{location}</p>
            ) : null}
            {anonymousPublic ? (
              <p className="mt-3 text-sm text-neutral-500">
                Public stewardship presence — identifying details withheld on file.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-5 shadow-sm md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Stewardship
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                Registry footprint
              </p>
              <p className="mt-1 text-sm text-neutral-800">
                <span className="font-medium tabular-nums">
                  {footprint.visibleWorks}
                </span>{" "}
                {footprint.visibleWorks === 1 ? "work" : "works"} with verified
                custody on file
              </p>
            </div>
            <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                Verified records
              </p>
              <p className="mt-1 text-sm text-neutral-800">
                <span className="font-medium tabular-nums">
                  {footprint.verifiedWorks}
                </span>{" "}
                {footprint.verifiedWorks === 1 ? "record" : "records"} verified
                on the Registry
              </p>
            </div>
            <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3 sm:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                Certificates
              </p>
              <p className="mt-1 text-sm text-neutral-800">
                {footprint.certificateCount > 0 ? (
                  <>
                    <span className="font-medium tabular-nums">
                      {footprint.certificateCount}
                    </span>{" "}
                    {footprint.certificateCount === 1
                      ? "certificate"
                      : "certificates"}{" "}
                    recorded on file
                    {footprint.revokedCertificateCount > 0 ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="text-neutral-600">
                          {footprint.revokedCertificateCount} revoked
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  "No certificates recorded yet for visible holdings"
                )}
              </p>
            </div>
          </div>

          {stats ? (
            <p className="mt-4 text-xs text-neutral-500">
              {stats.total_owned}{" "}
              {stats.total_owned === 1 ? "holding" : "holdings"} documented ·{" "}
              {stats.verified_owned} with verified catalogue listing
            </p>
          ) : null}

          {stewardshipLines.length > 0 ? (
            <div className="mt-5 space-y-2 border-t border-neutral-900/[0.05] pt-5">
              {stewardshipLines.map((line) => (
                <p key={line} className="text-xs leading-relaxed text-neutral-600">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-14 md:mt-16" aria-labelledby="collector-footprint-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div>
            <InfoTooltip text="Works where this collector holds verified ownership on the Registry. This is a stewardship surface — not a portfolio or marketplace listing." />
            <h2
              id="collector-footprint-heading"
              className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
            >
              Registry footprint
            </h2>
          </div>
          {footprint.visibleWorks > 0 ? (
            <p className="text-xs text-neutral-500">
              {footprint.visibleWorks}{" "}
              {footprint.visibleWorks === 1 ? "work" : "works"}
              {footprint.verifiedWorks > 0
                ? ` · ${footprint.verifiedWorks} verified`
                : null}
            </p>
          ) : null}
        </div>

        {works.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm">
            <p className="text-sm text-neutral-600">
              No verified holdings are visible on this public stewardship profile
              yet.
            </p>
            <Link
              href={fieldExplorerRecordsHref()}
              className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Browse Registry records
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => {
              const title = (work.title || "").trim() || "Untitled";
              const registryHref = `/registry/${encodeURIComponent(work.registry_id)}`;
              const verifyHref = fieldVerifyRecordHref(work.registry_id);

              return (
                <li key={work.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/90 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-black/[0.08]">
                    <Link
                      href={work.recordHref}
                      className="relative block aspect-[4/3] overflow-hidden bg-neutral-100"
                    >
                      {work.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.image_url}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                          No image
                        </div>
                      )}
                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
                            work.recordVerified
                              ? "bg-emerald-950/85 text-white/95"
                              : "bg-black/45 text-white/90"
                          }`}
                        >
                          {work.recordVerified ? "Verified record" : "On file"}
                        </span>
                      </div>
                      {work.hasCertificate ? (
                        <div className="absolute right-4 top-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
                              work.certificateRevoked
                                ? "bg-neutral-950/80 text-white/90"
                                : "bg-white/90 text-neutral-900"
                            }`}
                          >
                            {work.certificateRevoked
                              ? "Certificate revoked"
                              : "Certificate on file"}
                          </span>
                        </div>
                      ) : null}
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-xl font-normal leading-snug text-neutral-950">
                        <Link
                          href={work.recordHref}
                          className="transition hover:text-neutral-600"
                        >
                          {title}
                        </Link>
                      </h3>
                      {showOwnershipDetails && work.artistName ? (
                        <p className="mt-2 text-sm text-neutral-500">
                          {work.artistName}
                        </p>
                      ) : null}
                      <p className="mt-3 font-mono text-[11px] text-neutral-400">
                        {work.registry_id}
                      </p>
                      {showOwnershipDetails ? (
                        <p
                          className={`mt-3 text-[11px] font-medium leading-snug ${work.ownershipClassName}`}
                        >
                          {work.ownershipLabel}
                        </p>
                      ) : null}
                      {showOwnershipDetails && work.heldLine ? (
                        <p className="mt-1 text-[11px] leading-snug text-neutral-500">
                          {work.heldLine}
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-col gap-2 border-t border-black/[0.05] pt-5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={work.recordHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
                          >
                            View record
                          </Link>
                          <Link
                            href={verifyHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                          >
                            Check verification
                          </Link>
                        </div>
                        <Link
                          href={registryHref}
                          className="text-center text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                        >
                          Registry ledger
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {bio ? (
        <section className="mt-16 max-w-3xl md:mt-20" aria-labelledby="collector-about-heading">
          <h2
            id="collector-about-heading"
            className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
          >
            About
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-[1.75] text-neutral-700">
            {bio.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-24 md:px-12">
        <p className="text-base leading-relaxed text-neutral-700">
          This Collector profile documents verified custody on the Registry. It is
          not a social profile, marketplace listing, or portfolio valuation
          surface.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={fieldExplorerRecordsHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Browse Registry records
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Verify a Registry record
          </Link>
        </div>
      </section>
    </main>
  );
}
