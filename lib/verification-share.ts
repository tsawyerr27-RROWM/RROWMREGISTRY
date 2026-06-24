import { fieldVerifyRecordHref } from "@/lib/field-nav";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";
import type { RegistryTrustLevel } from "@/lib/registry-trust-model";
import { getSiteUrl } from "@/lib/site-url";

export type VerificationSharePublicity = "full" | "restricted";

export type VerificationShareContext = {
  registryId: string;
  artworkTitle: string;
  verifierName: string | null;
  trustLevel: RegistryTrustLevel;
  verifiedAt: string | null;
  publicity: VerificationSharePublicity;
};

export type TranslateFn = (key: MessageKey) => string;

export function verificationSharePath(registryId: string): string {
  return fieldVerifyRecordHref(registryId.trim());
}

export function verificationShareOgImagePath(registryId: string): string {
  return `${verificationSharePath(registryId)}/opengraph-image`;
}

export function buildVerificationShareUrl(
  registryId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${verificationSharePath(registryId)}`;
}

export function verificationShareAbsoluteOgImageUrl(
  registryId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${verificationShareOgImagePath(registryId)}`;
}

/** Relative client download path (same-origin fetch; safe for SSR + local dev). */
export function verificationShareDownloadImagePath(registryId: string): string {
  const params = new URLSearchParams({ registry_id: registryId.trim() });
  return `/api/og/verification?${params.toString()}`;
}

/** Client download endpoint (stable fetch target; avoids opengraph-image route quirks). */
export function verificationShareDownloadImageUrl(
  registryId: string,
  origin?: string
): string {
  const path = verificationShareDownloadImagePath(registryId);
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${path}`;
}

export function resolveVerificationSharePublicity(
  isVerified: boolean
): VerificationSharePublicity {
  return isVerified ? "full" : "restricted";
}

export function buildVerificationShareTitle(
  context: VerificationShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return t("verification.share.titleRestricted");
  }
  const title = context.artworkTitle.trim() || "Work on file";
  return fillMessage(t("verification.share.titleWithWork"), { title });
}

export function buildVerificationShareText(
  context: VerificationShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return fillMessage(t("verification.share.textRestricted"), {
      registryId: context.registryId,
    });
  }
  const title = context.artworkTitle.trim() || "Work on file";
  return fillMessage(t("verification.share.text"), { title });
}

export function buildVerificationShareContext(args: {
  registryId: string;
  artworkTitle: string;
  verifierName?: string | null;
  trustLevel: RegistryTrustLevel;
  verifiedAt?: string | null;
  isVerified: boolean;
}): VerificationShareContext {
  return {
    registryId: args.registryId.trim(),
    artworkTitle: args.artworkTitle,
    verifierName: args.verifierName ?? null,
    trustLevel: args.trustLevel,
    verifiedAt: args.verifiedAt ?? null,
    publicity: resolveVerificationSharePublicity(args.isVerified),
  };
}
