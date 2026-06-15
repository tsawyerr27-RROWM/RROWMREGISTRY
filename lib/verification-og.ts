import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";

import { loadFieldVerifyRecordData } from "@/lib/field-verify-record";
import {
  computeRegistryTrustPresentation,
  type RegistryTrustLevel,
} from "@/lib/registry-trust-model";
import { fillMessage, translate, type MessageKey } from "@/lib/locale-messages";
import { getSiteUrl } from "@/lib/site-url";
import {
  buildVerificationShareContext,
  buildVerificationShareText,
  buildVerificationShareTitle,
  buildVerificationShareUrl,
  verificationShareAbsoluteOgImageUrl,
  type VerificationShareContext,
} from "@/lib/verification-share";

export type VerificationOgBundle = {
  context: VerificationShareContext;
  indexable: boolean;
};

const OG_LANG = "en" as const;

function tOg(key: MessageKey): string {
  return translate(key, OG_LANG);
}

const TRUST_LEVEL_KEYS: Record<RegistryTrustLevel, MessageKey> = {
  registered: "registry.trust.level.registered",
  established: "registry.trust.level.established",
  layered: "registry.trust.level.layered",
  attested: "registry.trust.level.attested",
  revoked: "registry.trust.level.revoked",
};

function truncateDescription(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function trustLevelLabelForOg(level: RegistryTrustLevel): string {
  return tOg(TRUST_LEVEL_KEYS[level]);
}

export function resolveVerificationOgLines(context: VerificationShareContext) {
  const title = buildVerificationShareTitle(context, tOg);
  const description = buildVerificationShareText(context, tOg);
  const alt =
    context.publicity === "full"
      ? fillMessage(tOg("verification.share.ogAlt"), {
          title: context.artworkTitle.trim() || "Work on file",
        })
      : tOg("verification.share.ogAltRestricted");

  return { title, description, alt };
}

export function buildVerificationMetadata(bundle: VerificationOgBundle): Metadata {
  const lines = resolveVerificationOgLines(bundle.context);
  const canonicalUrl = buildVerificationShareUrl(bundle.context.registryId, getSiteUrl());
  const ogImageUrl = verificationShareAbsoluteOgImageUrl(
    bundle.context.registryId,
    getSiteUrl()
  );
  const description = truncateDescription(lines.description);

  return {
    title: lines.title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: bundle.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: lines.title,
      description,
      url: canonicalUrl,
      siteName: "RROWM",
      type: "website",
      locale: "en_GB",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: lines.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: lines.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export function buildVerificationNotFoundMetadata(): Metadata {
  const title = tOg("verification.share.titleRestricted");
  const description = tOg("verification.share.textRestrictedGeneric");

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: "RROWM",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

async function resolveVerificationDate(
  supabase: SupabaseClient,
  artworkId: string,
  fallback: string
): Promise<string> {
  const { data: vRows } = await supabase
    .from("verification_events")
    .select("created_at, status")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false });

  for (const row of vRows || []) {
    const status = String(row.status || "").toLowerCase().trim();
    if (status && status !== "confirmed") continue;
    if (row.created_at) return String(row.created_at);
  }

  return fallback;
}

export async function loadVerificationOgBundle(
  supabase: SupabaseClient,
  registryId: string
): Promise<VerificationOgBundle | null> {
  const data = await loadFieldVerifyRecordData(supabase, registryId, null);
  if (!data) return null;

  const trust = computeRegistryTrustPresentation({
    verificationStatus: data.artwork.verification_status,
    hasCertificate: Boolean(data.certificate?.has_certificate),
    certRevoked: data.certificateRevoked,
    verifierName: data.organisation?.name ?? null,
    artistConfirmationOnFile: data.artistConfirmationOnFile,
    organisationVerified: Boolean(data.organisation?.verified),
  });

  const verifiedAt = data.recordVerified
    ? await resolveVerificationDate(
        supabase,
        data.artwork.id,
        data.artwork.created_at
      )
    : null;

  const context = buildVerificationShareContext({
    registryId: data.artwork.registry_id,
    artworkTitle: String(data.artwork.title || "").trim() || "Work on file",
    verifierName: data.organisation?.name ?? null,
    trustLevel: trust.level,
    verifiedAt,
    isVerified: data.recordVerified,
  });

  return {
    context,
    indexable: context.publicity === "full",
  };
}

export type VerificationOgSealTier =
  | "attested"
  | "layered"
  | "established"
  | "registered"
  | "revoked"
  | "restricted";

export function verificationOgSealTier(
  context: VerificationShareContext
): VerificationOgSealTier {
  if (context.publicity === "restricted") return "restricted";
  if (context.trustLevel === "revoked") return "revoked";
  if (context.trustLevel === "layered") return "layered";
  if (context.trustLevel === "attested") return "attested";
  if (context.trustLevel === "established") return "established";
  return "registered";
}
