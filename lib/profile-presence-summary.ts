import type { CreativePresencePageData } from "@/lib/field-creative-presence";
import type { CollectorPresencePageData } from "@/lib/field-collector-presence";
import type { OrganisationPresencePageData } from "@/lib/field-organisation-presence";
import { fieldOrganisationHref } from "@/lib/field-nav";
import type { MessageKey } from "@/lib/locale-messages";
import { fillMessage } from "@/lib/locale-messages";
import { getSiteUrl } from "@/lib/site-url";

export type ProfilePresenceRole = "creative" | "organisation" | "collector";

export type ProfileShareLine = {
  key: MessageKey;
  params?: Record<string, string>;
};

export type ProfileShareContext = {
  role: ProfilePresenceRole;
  displayName: string;
  canonicalPath: string;
  surfaceLabelKey: MessageKey;
  trustLine: ProfileShareLine;
  footprintLine: ProfileShareLine | null;
  secondaryLine: ProfileShareLine | null;
  practiceLine: string | null;
  rightsLine: ProfileShareLine | null;
};

type TranslateFn = (key: MessageKey) => string;

function isVerifiedStatus(status: string | null | undefined): boolean {
  return String(status ?? "").toLowerCase() === "verified";
}

function formatShareLine(
  line: ProfileShareLine | null,
  t: TranslateFn
): string | null {
  if (!line) return null;
  const template = t(line.key);
  return line.params ? fillMessage(template, line.params) : template;
}

export function buildCreativeProfileShareContext(
  data: CreativePresencePageData
): ProfileShareContext {
  const {
    artist,
    verifiedWorkCount,
    total,
    declaredPractices,
    activeRepresentation,
    exhibitionCount,
    activeLicenseCount,
  } = data;
  const artistVerified = isVerifiedStatus(artist.verification_status);

  const trustLine: ProfileShareLine = activeRepresentation
    ? {
        key: "profile.presence.trust.creative.representedBy",
        params: { organisation: activeRepresentation.organisationName },
      }
    : artistVerified
      ? { key: "profile.presence.trust.creative.established" }
      : verifiedWorkCount > 0
        ? { key: "profile.presence.trust.creative.footprint" }
        : { key: "profile.presence.trust.creative.registered" };

  let footprintLine: ProfileShareLine | null = null;
  if (verifiedWorkCount > 0 || exhibitionCount > 0) {
    footprintLine = {
      key: "profile.presence.secondary.creative.worksExhibitions",
      params: {
        verified: String(verifiedWorkCount),
        exhibitions: String(exhibitionCount),
      },
    };
  } else if (total > 0) {
    footprintLine = {
      key: "field.creative.publicFootprintLine",
      params: { count: String(total) },
    };
  }

  const practiceLine =
    declaredPractices.length > 0
      ? declaredPractices
          .slice(0, 3)
          .map((practice) => practice.label)
          .join(" · ")
      : null;

  const secondaryLine: ProfileShareLine | null =
    !activeRepresentation && data.gallery?.verified
      ? { key: "profile.presence.secondary.representedByVerifiedOrg" }
      : !activeRepresentation && data.gallery
        ? { key: "profile.presence.secondary.representedByOrg" }
        : null;

  const rightsLine: ProfileShareLine | null =
    activeLicenseCount > 0
      ? {
          key: "profile.presence.rights.creative.activeLicenses",
          params: { count: String(activeLicenseCount) },
        }
      : null;

  return {
    role: "creative",
    displayName: artist.display_name,
    canonicalPath: data.basePath,
    surfaceLabelKey: "field.presence.creative.title",
    trustLine,
    footprintLine,
    secondaryLine,
    practiceLine,
    rightsLine,
  };
}

export function buildOrganisationProfileShareContext(
  data: OrganisationPresencePageData
): ProfileShareContext {
  const {
    organisation,
    footprint,
    representedCreatives,
    representedArtistCount,
    exhibitionCount,
    activeRightsAgreementCount,
  } = data;

  const trustLine: ProfileShareLine = organisation.verified
    ? { key: "field.organisation.verification.onFile" }
    : { key: "field.organisation.verification.participant" };

  const artistsCount =
    representedArtistCount > 0
      ? representedArtistCount
      : representedCreatives.length;

  let footprintLine: ProfileShareLine | null = null;
  if (artistsCount > 0 || exhibitionCount > 0) {
    footprintLine = {
      key: "profile.presence.secondary.organisation.artistsExhibitions",
      params: {
        artists: String(artistsCount),
        exhibitions: String(exhibitionCount),
      },
    };
  } else if (footprint.verifiedRecords > 0) {
    footprintLine = {
      key: "field.organisation.verifiedRecordsLine",
      params: { count: String(footprint.verifiedRecords) },
    };
  } else if (footprint.totalRecords > 0) {
    footprintLine = {
      key: "field.organisation.totalRecordsLine",
      params: { count: String(footprint.totalRecords) },
    };
  }

  const secondaryLine: ProfileShareLine | null =
    footprint.verifiedRecords > 0 && artistsCount === 0 && exhibitionCount === 0
      ? {
          key: "field.organisation.verifiedRecordsLine",
          params: { count: String(footprint.verifiedRecords) },
        }
      : footprint.certificateCount > 0 && artistsCount === 0 && exhibitionCount === 0
        ? {
            key: "field.organisation.certificatesLine",
            params: { count: String(footprint.certificateCount) },
          }
        : null;

  const rightsLine: ProfileShareLine | null =
    activeRightsAgreementCount > 0
      ? {
          key: "profile.presence.rights.organisation.activeAgreements",
          params: { count: String(activeRightsAgreementCount) },
        }
      : null;

  return {
    role: "organisation",
    displayName: organisation.name,
    canonicalPath: fieldOrganisationHref(organisation.slug),
    surfaceLabelKey: "field.presence.organisation.title",
    trustLine,
    footprintLine,
    secondaryLine,
    practiceLine: null,
    rightsLine,
  };
}

export function buildCollectorProfileShareContext(
  data: CollectorPresencePageData
): ProfileShareContext {
  const { displayTitle, anonymousPublic, footprint } = data;
  const {
    verifiedWorks,
    acquisitionCount,
    completedTransferCount,
    visibleWorks,
  } = footprint;

  const trustLine: ProfileShareLine = anonymousPublic
    ? { key: "profile.presence.trust.collector.private" }
    : verifiedWorks > 0
      ? { key: "profile.presence.trust.collector.established" }
      : visibleWorks > 0
        ? { key: "profile.presence.trust.collector.stewardship" }
        : { key: "profile.presence.trust.collector.opening" };

  let footprintLine: ProfileShareLine | null = null;
  if (verifiedWorks > 0 || acquisitionCount > 0 || completedTransferCount > 0) {
    if (acquisitionCount > 0 && completedTransferCount > 0) {
      footprintLine = {
        key: "profile.presence.secondary.collector.holdingsFull",
        params: {
          verified: String(verifiedWorks),
          acquisitions: String(acquisitionCount),
          transfers: String(completedTransferCount),
        },
      };
    } else if (acquisitionCount > 0) {
      footprintLine = {
        key: "profile.presence.secondary.collector.holdingsAcquisitions",
        params: {
          verified: String(verifiedWorks),
          acquisitions: String(acquisitionCount),
        },
      };
    } else if (completedTransferCount > 0) {
      footprintLine = {
        key: "profile.presence.secondary.collector.holdingsTransfers",
        params: {
          verified: String(verifiedWorks),
          transfers: String(completedTransferCount),
        },
      };
    } else if (verifiedWorks > 0) {
      footprintLine = {
        key:
          verifiedWorks === 1
            ? "field.presence.collector.verifiedRecordsLine"
            : "field.presence.collector.verifiedRecordsLinePlural",
        params: { count: String(verifiedWorks) },
      };
    }
  } else if (visibleWorks > 0) {
    footprintLine = {
      key:
        visibleWorks === 1
          ? "field.presence.collector.custodyLine"
          : "field.presence.collector.custodyLinePlural",
      params: { count: String(visibleWorks) },
    };
  }

  return {
    role: "collector",
    displayName: displayTitle,
    canonicalPath: data.profilePath,
    surfaceLabelKey: "field.presence.collector.title",
    trustLine,
    footprintLine,
    secondaryLine: null,
    practiceLine: null,
    rightsLine: null,
  };
}

export function profileShareAbsoluteUrl(
  context: ProfileShareContext,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  const path = context.canonicalPath.startsWith("/")
    ? context.canonicalPath
    : `/${context.canonicalPath}`;
  return `${base}${path}`;
}

export function buildProfileShareTitle(
  context: ProfileShareContext,
  t: TranslateFn
): string {
  return `${context.displayName} · RROWM`;
}

export function buildProfileShareText(
  context: ProfileShareContext,
  t: TranslateFn
): string {
  const trust = formatShareLine(context.trustLine, t);
  const footprint = formatShareLine(context.footprintLine, t);
  const secondary = formatShareLine(context.secondaryLine, t);
  const lines = [trust, footprint, secondary, context.practiceLine].filter(
    Boolean
  );
  const summary = lines.join(" · ");
  return fillMessage(t("profile.presence.share.text"), {
    name: context.displayName,
    summary: summary || t(context.surfaceLabelKey),
  });
}
