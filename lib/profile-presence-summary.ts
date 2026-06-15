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
  const { artist, verifiedWorkCount, total, declaredPractices } = data;
  const artistVerified = isVerifiedStatus(artist.verification_status);

  const trustLine: ProfileShareLine = artistVerified
    ? { key: "profile.presence.trust.creative.established" }
    : verifiedWorkCount > 0
      ? { key: "profile.presence.trust.creative.footprint" }
      : { key: "profile.presence.trust.creative.registered" };

  let footprintLine: ProfileShareLine | null = null;
  if (verifiedWorkCount > 0) {
    footprintLine = {
      key: "field.creative.verifiedWorksLine",
      params: { count: String(verifiedWorkCount) },
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

  return {
    role: "creative",
    displayName: artist.display_name,
    canonicalPath: data.basePath,
    surfaceLabelKey: "field.presence.creative.title",
    trustLine,
    footprintLine,
    secondaryLine: data.gallery?.verified
      ? { key: "profile.presence.secondary.representedByVerifiedOrg" }
      : data.gallery
        ? { key: "profile.presence.secondary.representedByOrg" }
        : null,
    practiceLine,
  };
}

export function buildOrganisationProfileShareContext(
  data: OrganisationPresencePageData
): ProfileShareContext {
  const { organisation, footprint, representedCreatives } = data;

  const trustLine: ProfileShareLine = organisation.verified
    ? { key: "field.organisation.verification.onFile" }
    : { key: "field.organisation.verification.participant" };

  let footprintLine: ProfileShareLine | null = null;
  if (footprint.verifiedRecords > 0) {
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
    representedCreatives.length > 0
      ? {
          key: "profile.presence.secondary.representedCreatives",
          params: { count: String(representedCreatives.length) },
        }
      : footprint.certificateCount > 0
        ? {
            key: "field.organisation.certificatesLine",
            params: { count: String(footprint.certificateCount) },
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
  };
}

export function buildCollectorProfileShareContext(
  data: CollectorPresencePageData
): ProfileShareContext {
  const { displayTitle, anonymousPublic, footprint } = data;

  const trustLine: ProfileShareLine = anonymousPublic
    ? { key: "profile.presence.trust.collector.private" }
    : footprint.verifiedWorks > 0
      ? { key: "profile.presence.trust.collector.established" }
      : footprint.visibleWorks > 0
        ? { key: "profile.presence.trust.collector.stewardship" }
        : { key: "profile.presence.trust.collector.opening" };

  let footprintLine: ProfileShareLine | null = null;
  if (footprint.visibleWorks > 0) {
    footprintLine = {
      key:
        footprint.visibleWorks === 1
          ? "field.presence.collector.custodyLine"
          : "field.presence.collector.custodyLinePlural",
      params: { count: String(footprint.visibleWorks) },
    };
  }

  const secondaryLine: ProfileShareLine | null =
    footprint.verifiedWorks > 0
      ? {
          key:
            footprint.verifiedWorks === 1
              ? "field.presence.collector.verifiedRecordsLine"
              : "field.presence.collector.verifiedRecordsLinePlural",
          params: { count: String(footprint.verifiedWorks) },
        }
      : null;

  return {
    role: "collector",
    displayName: displayTitle,
    canonicalPath: data.profilePath,
    surfaceLabelKey: "field.presence.collector.title",
    trustLine,
    footprintLine,
    secondaryLine,
    practiceLine: null,
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
