"use client";

import Link from "next/link";
import { useMemo } from "react";

import { OrganisationPresenceDiscoverySection } from "@/components/Field/OrganisationPresenceDiscoverySection";
import { ProfilePresencePrestigeBand } from "@/components/Field/ProfilePresencePrestigeBand";
import { FieldRelationshipContextSection } from "@/components/Field/FieldRelationshipContextSection";
import { OrganisationPresenceOwnerStewardship } from "@/components/Field/OrganisationPresenceOwnerStewardship";
import { OrganisationPresenceRegistryEvidence } from "@/components/Field/OrganisationPresenceRegistryEvidence";
import { ProfileShareControl } from "@/components/sharing/ProfileShareControl";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { OrganisationPresencePageData } from "@/lib/field-organisation-presence";
import {
  fieldExplorerRecordsHref,
  fieldRecordHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { registryLedgerHref } from "@/lib/registry-nav";
import { artworkCardParticipationLabel } from "@/lib/representation-language";
import { buildOrganisationProfileShareContext } from "@/lib/profile-presence-summary";

type Props = {
  data: OrganisationPresencePageData;
};

function organisationInitial(name: string) {
  const c = name.trim().charAt(0);
  return c ? c.toUpperCase() : "?";
}

export function OrganisationPresenceView({ data }: Props) {
  const { t } = useLocalePreferences();
  const {
    organisation,
    showRoster,
    showLocation,
    showDescription,
    participationLayers,
    representedCreatives,
    artworks,
    footprint,
    isProfileOwner,
    stewardshipItems,
    contextPanels,
  } = data;

  const shareContext = useMemo(
    () => buildOrganisationProfileShareContext(data),
    [data]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <div className="flex flex-wrap items-start gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-neutral-900/[0.08] bg-gradient-to-br from-neutral-100 to-neutral-200/90 font-serif text-2xl text-neutral-700"
            aria-hidden
          >
            {organisationInitial(organisation.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-[3.25rem]">
              {organisation.name}
            </h1>
          </div>
        </div>

        <ProfilePresencePrestigeBand context={shareContext} />
        <ProfileShareControl context={shareContext} className="mt-5" />

        <OrganisationPresenceRegistryEvidence
          footprint={footprint}
          representedCreativesCount={representedCreatives.length}
          participationLayers={participationLayers}
        />

        {isProfileOwner ? (
          <OrganisationPresenceOwnerStewardship items={stewardshipItems} />
        ) : null}

        {showLocation && organisation.location ? (
          <p className="mt-8 text-base text-neutral-600">{organisation.location}</p>
        ) : null}
        {organisation.websiteHref ? (
          <a
            href={organisation.websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
          >
            {t("field.presence.linkWebsite")}
          </a>
        ) : null}
      </section>

      <OrganisationPresenceDiscoverySection />

      <FieldRelationshipContextSection data={{ panels: contextPanels }} />

      {showRoster ? (
        <section className="mt-14 md:mt-16" aria-labelledby="org-roster-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
            <div>
              <InfoTooltip text={t("field.presence.organisation.rosterTooltip")} />
              <h2
                id="org-roster-heading"
                className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
              >
                {t("field.organisation.representedCreatives")}
              </h2>
            </div>
            {representedCreatives.length > 0 ? (
              <span className="tabular-nums text-xs text-neutral-500">
                {representedCreatives.length}{" "}
                {representedCreatives.length === 1
                  ? t("field.presence.nameSingular")
                  : t("field.presence.namesPlural")}
              </span>
            ) : null}
          </div>

          {representedCreatives.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm">
              <p className="text-sm text-neutral-600">
                {t("field.presence.organisation.rosterEmpty")}
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {representedCreatives.map((creative) => (
                <li key={creative.id}>
                  <div className="flex h-full gap-4 rounded-2xl border border-black/[0.06] bg-white/90 p-5 shadow-sm transition hover:border-black/[0.08] hover:shadow-md">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-serif text-lg text-neutral-600"
                      aria-hidden
                    >
                      {organisationInitial(creative.displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {creative.href ? (
                        <Link
                          href={creative.href}
                          className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                        >
                          {creative.displayName}
                        </Link>
                      ) : (
                        <span className="font-medium text-neutral-950">
                          {creative.displayName}
                        </span>
                      )}
                      <p className="mt-2 text-[12px] text-neutral-500">
                        {creative.href
                          ? t("field.presence.organisation.profilePublic")
                          : creative.slug
                            ? t("field.presence.organisation.profileNotPublic")
                            : t("field.presence.organisation.profileNotOnFile")}
                        {creative.artistVerified
                          ? ` · ${t("field.presence.artistConfirmationOnFile")}`
                          : null}
                      </p>
                      {creative.totalWorkCount > 0 ? (
                        <p className="mt-2 text-[11px] font-medium text-neutral-700">
                          {creative.verifiedWorkCount > 0 ? (
                            <>
                              {fillMessage(
                                t("field.presence.organisation.verifiedRosterLine"),
                                {
                                  verified: String(creative.verifiedWorkCount),
                                  total: String(creative.totalWorkCount),
                                  worksUnit:
                                    creative.totalWorkCount === 1
                                      ? t("field.presence.workSingular")
                                      : t("field.presence.worksPlural"),
                                }
                              )}
                            </>
                          ) : (
                            <>
                              {creative.totalWorkCount === 1
                                ? fillMessage(
                                    t("field.presence.organisation.worksRegisteredSingular"),
                                    { count: String(creative.totalWorkCount) }
                                  )
                                : fillMessage(
                                    t("field.presence.organisation.worksRegistered"),
                                    { count: String(creative.totalWorkCount) }
                                  )}
                            </>
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-16 md:mt-20" aria-labelledby="org-footprint-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div>
            <InfoTooltip text={t("field.presence.footprintTooltip")} />
            <h2
              id="org-footprint-heading"
              className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
            >
              {t("field.presence.footprintHeading")}
            </h2>
          </div>
          {footprint.totalRecords > 0 ? (
            <p className="text-xs text-neutral-500">
              {footprint.totalRecords}{" "}
              {footprint.totalRecords === 1
                ? t("field.presence.recordSingular")
                : t("field.presence.recordsPlural")}{" "}
              · {footprint.verifiedRecords} {t("field.presence.verifiedSuffix")}
              {footprint.certificateCount > 0
                ? ` · ${fillMessage(
                    footprint.certificateCount === 1
                      ? t("field.presence.collector.certificatesLine")
                      : t("field.presence.collector.certificatesLinePlural"),
                    { count: String(footprint.certificateCount) }
                  )}`
                : null}
            </p>
          ) : null}
        </div>

        {footprint.totalRecords === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-14 text-center shadow-sm">
            <p className="text-sm text-neutral-600">
              {t("field.organisation.noRecordsOnFile")}
            </p>
            <Link
              href={fieldExplorerRecordsHref()}
              className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.presence.organisation.browseRegistry")}
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => {
              const isVerified =
                String(artwork.verification_status || "").toLowerCase() === "verified";
              const title = (artwork.title || "").trim() || t("registry.card.untitled");
              const recordHref = fieldRecordHref(artwork.registry_id);
              const ledgerHref = registryLedgerHref(artwork.registry_id);
              const verifyHref = fieldVerifyRecordHref(artwork.registry_id);
              const creativeHref =
                artwork.artist_id &&
                representedCreatives.find((c) => c.id === artwork.artist_id)?.href;

              return (
                <li key={artwork.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/90 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-black/[0.08]">
                    <Link
                      href={recordHref}
                      className="relative block aspect-[4/3] overflow-hidden bg-neutral-100"
                    >
                      {artwork.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artwork.image_url}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                          {t("field.presence.noImage")}
                        </div>
                      )}
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex max-w-[calc(100%-2rem)] rounded-full border border-neutral-200/90 bg-white/95 px-3 py-1 text-[11px] font-medium leading-tight text-neutral-800 backdrop-blur-sm">
                          {artworkCardParticipationLabel({
                            institutionLinked: true,
                            artistConfirmed: isVerified,
                          })}
                        </span>
                      </div>
                      {artwork.hasCertificate ? (
                        <div className="absolute right-4 top-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
                              artwork.certificateRevoked
                                ? "bg-neutral-950/80 text-white/90"
                                : "bg-emerald-950/85 text-white/95"
                            }`}
                          >
                            {artwork.certificateRevoked
                              ? t("field.presence.certificateRevoked")
                              : t("field.presence.certificateOnFile")}
                          </span>
                        </div>
                      ) : null}
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-xl font-normal leading-snug text-neutral-950">
                        <Link
                          href={recordHref}
                          className="transition hover:text-neutral-600"
                        >
                          {title}
                        </Link>
                      </h3>
                      {artwork.artistName ? (
                        <p className="mt-2 text-sm text-neutral-500">
                          {creativeHref ? (
                            <Link
                              href={creativeHref}
                              className="underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                            >
                              {artwork.artistName}
                            </Link>
                          ) : (
                            artwork.artistName
                          )}
                        </p>
                      ) : null}
                      <p className="mt-3 font-mono text-[11px] text-neutral-400">
                        {artwork.registry_id}
                      </p>

                      <div className="mt-auto flex flex-col gap-2 border-t border-black/[0.05] pt-5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={recordHref}
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

      {showDescription && organisation.description ? (
        <section className="mt-16 max-w-3xl md:mt-20" aria-labelledby="org-about-heading">
          <h2
            id="org-about-heading"
            className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl"
          >
            {t("field.presence.aboutHeading")}
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-[1.75] text-neutral-700">
            {organisation.description.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
          {organisation.websiteHref ? (
            <div className="mt-8">
              <a
                href={organisation.websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
              >
                {t("field.presence.linkVisitWebsite")}
              </a>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-24 md:px-12">
        <p className="text-base leading-relaxed text-neutral-700">
          {t("field.presence.organisation.closingLede")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={fieldExplorerRecordsHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.presence.organisation.browseRegistry")}
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
