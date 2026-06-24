"use client";

import Link from "next/link";
import { useMemo } from "react";

import { CreativePresenceDiscoverySection } from "@/components/Field/CreativePresenceDiscoverySection";
import { ProfilePresencePrestigeBand } from "@/components/Field/ProfilePresencePrestigeBand";
import { FieldRelationshipContextSection } from "@/components/Field/FieldRelationshipContextSection";
import { CreativePresenceOwnerStewardship } from "@/components/Field/CreativePresenceOwnerStewardship";
import { CreativePresenceRegistryEvidence } from "@/components/Field/CreativePresenceRegistryEvidence";
import { RegistryListFilters } from "@/components/Registry/RegistryListFilters";
import { RegistryListPagination } from "@/components/Registry/RegistryListPagination";
import { ProfileShareControl } from "@/components/sharing/ProfileShareControl";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { buildStudioNewDealHref } from "@/lib/deal-create-nav";
import type { CreativePresencePageData } from "@/lib/field-creative-presence";
import {
  fieldExplorerRecordsHref,
  fieldRecordHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { registryLedgerHref } from "@/lib/registry-nav";
import { artworkCardParticipationLabel } from "@/lib/representation-language";
import { buildCreativeProfileShareContext } from "@/lib/profile-presence-summary";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-list-params";
import { rrowmFieldCard } from "@/styles/rrowm-theme";

type Props = {
  data: CreativePresencePageData;
};

export function CreativePresenceView({ data }: Props) {
  const { t } = useLocalePreferences();
  const {
    artist,
    gallery,
    participationLayers,
    artworks,
    total,
    verifiedWorkCount,
    basePath,
    q,
    sort,
    page,
    status,
    formKey,
    filterHint,
    showOrganisationSection,
    declaredPractices,
    registryPractices,
    practiceExplorerHref,
    isProfileOwner,
    isProfilePublic,
    sessionUserId,
    showOwnerPracticeGuidance,
    stewardshipItems,
    contextPanels,
  } = data;

  const shareContext = useMemo(
    () => buildCreativeProfileShareContext(data),
    [data]
  );

  const showProposeDealCta = Boolean(
    sessionUserId && isProfilePublic && !isProfileOwner
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <section className="max-w-3xl">
        <h1 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-[3.25rem]">
          {artist.display_name}
        </h1>

        <ProfilePresencePrestigeBand context={shareContext} />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ProfileShareControl context={shareContext} />
          {showProposeDealCta ? (
            <Link
              href={buildStudioNewDealHref({
                counterpartyUserId: artist.id,
                counterpartyLabel: artist.display_name,
                initialIntentId: "commission_work",
              })}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-900/[0.08] bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-900/[0.12] hover:bg-white"
            >
              Propose deal
            </Link>
          ) : null}
        </div>

        <CreativePresenceRegistryEvidence
          participationLayers={participationLayers}
          declaredPractices={declaredPractices}
          registryPractices={registryPractices}
          showOwnerPracticeGuidance={showOwnerPracticeGuidance}
        />

        {isProfileOwner ? (
          <CreativePresenceOwnerStewardship items={stewardshipItems} />
        ) : null}

        {artist.bio ? (
          <div className="mt-10 space-y-6 text-lg leading-[1.75] text-neutral-700">
            {artist.bio.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        ) : null}

        {(artist.website || artist.instagram) && (
          <div className="mt-10 flex flex-wrap gap-8 text-sm">
            {artist.website ? (
              <a
                href={artist.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
              >
                {t("field.presence.linkWebsite")}
              </a>
            ) : null}
            {artist.instagram ? (
              <a
                href={`https://instagram.com/${String(artist.instagram).replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
              >
                {t("field.presence.linkInstagram")}
              </a>
            ) : null}
          </div>
        )}
      </section>

      {gallery && showOrganisationSection ? (
        <section className="mt-14 max-w-2xl">
          <div className={`${rrowmFieldCard.prestige} max-w-2xl`}>
            <h2 className="text-xl font-medium text-neutral-900">
              {gallery.href ? (
                <Link
                  href={gallery.href}
                  className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
                >
                  {gallery.name}
                </Link>
              ) : (
                gallery.name
              )}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {gallery.verified
                ? t("field.presence.creative.organisationVerified")
                : t("field.presence.creative.organisationOnFile")}
            </p>
          </div>
        </section>
      ) : null}

      <FieldRelationshipContextSection data={{ panels: contextPanels }} />

      <CreativePresenceDiscoverySection
        gallery={gallery}
        showOrganisationSection={showOrganisationSection}
        practiceExplorerHref={practiceExplorerHref}
      />

      <section className="mt-20 md:mt-24">
        <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <InfoTooltip text={t("field.presence.footprintTooltip")} />
            <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
              {t("field.presence.footprintHeading")}
            </h2>
          </div>
          {total > 0 || verifiedWorkCount > 0 ? (
            <p className="text-xs text-neutral-500">
              {total > 0 ? (
                <>
                  {total}{" "}
                  {total === 1
                    ? t("field.presence.workSingular")
                    : t("field.presence.worksPlural")}{" "}
                  {t("field.presence.matching")}
                  {filterHint ? ` · ${filterHint}` : ""}
                  {q.trim() ? ` · search “${q.trim()}”` : ""}
                </>
              ) : null}
              {verifiedWorkCount > 0 ? (
                <>
                  {total > 0 ? " · " : ""}
                  {verifiedWorkCount} {t("field.presence.verifiedOnFile")}
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          <RegistryListFilters
            action={basePath}
            q={q}
            sort={sort}
            formKey={formKey}
            idPrefix="field-creative"
            showStatusFilter
            status={status}
          />
        </div>

        {total === 0 ? (
          <div className={`mt-14 ${rrowmFieldCard.empty}`}>
            <p className="text-sm text-neutral-600">
              {q.trim() || status !== "all"
                ? t("field.presence.creative.emptyFiltered")
                : t("field.creative.noWorksOnFile")}
            </p>
            <Link
              href={fieldExplorerRecordsHref()}
              className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.verify.hub.linkRecords")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {artworks.map((artwork) => {
                const isVerified = artwork.verification_status === "verified";
                const yearMedium = [artwork.year, artwork.medium]
                  .filter(Boolean)
                  .join(" · ");
                const recordHref = fieldRecordHref(artwork.registry_id);
                const ledgerHref = registryLedgerHref(artwork.registry_id);
                const verifyHref = fieldVerifyRecordHref(artwork.registry_id);

                return (
                  <article
                    key={artwork.id}
                    className={rrowmFieldCard.portfolio}
                  >
                    <Link
                      href={recordHref}
                      className="relative block aspect-[4/5] overflow-hidden bg-neutral-100"
                    >
                      {artwork.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artwork.image_url}
                          alt={artwork.title || t("field.record.title")}
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
                            institutionLinked: Boolean(gallery),
                            artistConfirmed: isVerified,
                          })}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <h3 className="font-serif text-xl font-normal leading-snug text-neutral-950">
                        <Link
                          href={recordHref}
                          className="transition hover:text-neutral-600"
                        >
                          {artwork.title}
                        </Link>
                      </h3>
                      {yearMedium ? (
                        <p className="mt-2 text-sm text-neutral-500">{yearMedium}</p>
                      ) : null}
                      <p className="mt-4 font-mono text-[11px] text-neutral-400">
                        {artwork.registry_id}
                      </p>

                      <div className="mt-6 flex flex-col gap-2 border-t border-black/[0.05] pt-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={recordHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
                          >
                            {t("field.presence.viewRecord")}
                          </Link>
                          <Link
                            href={verifyHref}
                            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
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
                );
              })}
            </div>

            <RegistryListPagination
              basePath={basePath}
              page={page}
              pageSize={REGISTRY_PAGE_SIZE}
              total={total}
              q={q}
              sort={sort}
              status={status}
            />
          </>
        )}
      </section>

      <section className="mx-auto mt-20 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-24 md:px-12">
        <p className="text-base leading-relaxed text-neutral-700">
          {t("field.presence.continuityLede")}
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
