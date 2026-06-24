"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ProfilePresencePrestigeBand } from "@/components/Field/ProfilePresencePrestigeBand";
import { ProfileShareControl } from "@/components/sharing/ProfileShareControl";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { CollectorPresencePageData } from "@/lib/field-collector-presence";
import { buildCollectorProfileShareContext } from "@/lib/profile-presence-summary";
import {
  fieldExplorerRecordsHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { registryLedgerHref } from "@/lib/registry-nav";
import { rrowmFieldCard } from "@/styles/rrowm-theme";

type Props = {
  data: CollectorPresencePageData;
};

function collectorInitial(title: string) {
  const c = title.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

export function CollectorPresenceView({ data }: Props) {
  const { t } = useLocalePreferences();
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

  const shareContext = useMemo(
    () => buildCollectorProfileShareContext(data),
    [data]
  );

  const certificatesLine =
    footprint.certificateCount === 1
      ? fillMessage(t("field.presence.collector.certificatesLine"), {
          count: String(footprint.certificateCount),
        })
      : fillMessage(t("field.presence.collector.certificatesLinePlural"), {
          count: String(footprint.certificateCount),
        });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <div className="flex flex-wrap items-start gap-5">
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
                {t("field.presence.collector.anonymousNote")}
              </p>
            ) : null}
          </div>
        </div>

        <ProfilePresencePrestigeBand context={shareContext} />
        <ProfileShareControl context={shareContext} className="mt-5" />
      </section>

      <section className="mt-10 max-w-3xl">
        <div className={`${rrowmFieldCard.prestige} max-w-3xl`}>
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            {t("field.presence.collector.stewardshipHeading")}
          </h2>
          <div className="mt-4">
            <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
              <p className="text-sm text-neutral-500">
                {t("field.organisation.certificates")}
              </p>
              <p className="mt-1 text-sm text-neutral-800">
                {footprint.certificateCount > 0 ? (
                  <>
                    {certificatesLine}
                    {footprint.revokedCertificateCount > 0 ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="text-neutral-600">
                          {footprint.revokedCertificateCount}{" "}
                          {t("field.presence.revoked")}
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  t("field.presence.collector.noCertificates")
                )}
              </p>
            </div>
          </div>

          {stats ? (
            <p className="mt-4 text-xs text-neutral-500">
              {fillMessage(t("field.presence.collector.holdingsDocumented"), {
                total: String(stats.total_owned),
                holdingsUnit:
                  stats.total_owned === 1
                    ? t("field.presence.holdingSingular")
                    : t("field.presence.holdingsPlural"),
                verified: String(stats.verified_owned),
              })}
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
            <InfoTooltip text={t("field.presence.collector.footprintTooltip")} />
            <h2
              id="collector-footprint-heading"
              className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
            >
              {t("field.presence.footprintHeading")}
            </h2>
          </div>
          {footprint.visibleWorks > 0 ? (
            <p className="text-xs text-neutral-500">
              {footprint.visibleWorks}{" "}
              {footprint.visibleWorks === 1
                ? t("field.presence.workSingular")
                : t("field.presence.worksPlural")}
              {footprint.verifiedWorks > 0
                ? ` · ${footprint.verifiedWorks} ${t("field.presence.verifiedSuffix")}`
                : null}
            </p>
          ) : null}
        </div>

        {works.length === 0 ? (
          <div className={`mt-10 ${rrowmFieldCard.empty}`}>
            <p className="text-sm text-neutral-600">
              {t("field.presence.collector.emptyHoldings")}
            </p>
            <Link
              href={fieldExplorerRecordsHref()}
              className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.verify.hub.linkRecords")}
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => {
              const title = (work.title || "").trim() || t("registry.card.untitled");
              const ledgerHref = registryLedgerHref(work.registry_id);
              const verifyHref = fieldVerifyRecordHref(work.registry_id);

              return (
                <li key={work.id}>
                  <article className={`group flex h-full flex-col ${rrowmFieldCard.portfolio}`}>
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
                          {t("field.presence.noImage")}
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
                          {work.recordVerified
                            ? t("field.presence.verifiedRecord")
                            : t("field.presence.onFile")}
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
                              ? t("field.presence.certificateRevoked")
                              : t("field.presence.certificateOnFile")}
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
                            {t("field.presence.viewRecord")}
                          </Link>
                          <Link
                            href={verifyHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                          >
                            {t("field.record.link.verify")}
                          </Link>
                        </div>
                        <Link
                          href={ledgerHref}
                          className="text-center text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                        >
                          {t("field.presence.linkRegistryLedger")}
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
            {t("field.presence.aboutHeading")}
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

      <section className={`mx-auto mt-20 max-w-2xl md:mt-24 ${rrowmFieldCard.empty}`}>
        <p className="text-base leading-relaxed text-neutral-700">
          {t("field.presence.collector.closingLede")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={fieldExplorerRecordsHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.verify.hub.linkRecords")}
          </Link>
          <Link
            href={fieldVerifyHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.verify.hub.title")}
          </Link>
        </div>
      </section>
    </main>
  );
}
