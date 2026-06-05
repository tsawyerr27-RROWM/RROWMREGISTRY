"use client";

import Link from "next/link";

import { ArchivalProvenanceTimeline } from "@/components/provenance/ArchivalProvenanceTimeline";
import { RegistryCertificateOverviewButton } from "@/components/certificate/RegistryCertificateOverviewButton";
import { PublicClaimOwnership } from "@/components/Registry/PublicClaimOwnership";
import { RegistryTechnicalDetails } from "@/components/Registry/RegistryTechnicalDetails";
import { ShareRecordButton } from "@/components/Registry/ShareRecordButton";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import type { ProvenanceInsight } from "@/lib/provenance-insights";
import {
  ownershipStatusBadge,
  type OwnershipSystemStatus,
} from "@/lib/ownership-ledger";
import { translateProvenanceInsight } from "@/lib/archival-provenance-i18n";
import { fieldCreativeHref, fieldRecordHref } from "@/lib/field-nav";

export type RegistryTrustKind =
  | "revoked"
  | "verified_with_cert"
  | "verified_no_cert"
  | "unverified";

export type PublicRegistryRecordProps = {
  artwork: {
    id: string;
    title: string | null;
    registry_id: string;
    year: string | number | null;
    medium: string | null;
    dimensions: string | null;
    description: string | null;
    image_url: string | null;
    verification_status: string | null;
    verification_hash: string | null;
    timeline_hash: string | null;
    is_locked: boolean | null;
  };
  artistName: string;
  artistSlug: string | null;
  trustKind: RegistryTrustKind;
  verificationGalleryName: string | null;
  edition: {
    is_unique: boolean | null;
    edition_number: number | null;
    edition_total: number | null;
  } | null;
  hasCertificate: boolean;
  certRevoked: boolean;
  revokedReason: string | null;
  ownershipStatus: OwnershipSystemStatus;
  currentOwner: {
    slug: string | null;
    display_name: string | null;
    user_id: string | null;
    verification_status: string | null;
  };
  sessionUserId: string | null;
  provenanceBundle: ArchivalProvenanceBundle;
  provenanceInsights: ProvenanceInsight[];
  shareUrl: string;
  claimReturnPath: string;
};

function ownershipLabel(
  status: OwnershipSystemStatus,
  t: ReturnType<typeof useLocalePreferences>["t"]
) {
  switch (status) {
    case "verified":
      return t("registry.record.ownership.verified");
    case "claimed":
      return t("registry.record.ownership.claimed");
    case "unassigned":
      return t("registry.record.ownership.unassigned");
    default:
      return t("registry.record.ownership.recorded");
  }
}

export function PublicRegistryRecordView({
  artwork,
  artistName,
  artistSlug,
  trustKind,
  verificationGalleryName,
  edition,
  hasCertificate,
  certRevoked,
  revokedReason,
  ownershipStatus,
  currentOwner,
  sessionUserId,
  provenanceBundle,
  provenanceInsights,
  shareUrl,
  claimReturnPath,
}: PublicRegistryRecordProps) {
  const { t } = useLocalePreferences();

  const trust = (() => {
    if (trustKind === "revoked") {
      return {
        tone: "red" as const,
        headline: t("registry.record.trust.revokedHeadline"),
        sub: t("registry.record.trust.revokedSub"),
      };
    }
    if (trustKind === "verified_with_cert") {
      return {
        tone: "green" as const,
        headline: t("registry.record.trust.verifiedHeadline"),
        sub: t("registry.record.trust.verifiedSubCert"),
      };
    }
    if (trustKind === "verified_no_cert") {
      return {
        tone: "green" as const,
        headline: t("registry.record.trust.verifiedHeadline"),
        sub: t("registry.record.trust.verifiedSubNoCert"),
      };
    }
    return {
      tone: "amber" as const,
      headline: t("registry.record.trust.unverifiedHeadline"),
      sub: t("registry.record.trust.unverifiedSub"),
    };
  })();

  const editionLine = (() => {
    if (!edition) return null;
    if (edition.is_unique === true) return t("registry.record.edition.unique");
    const n = edition.edition_number;
    const total = edition.edition_total;
    if (n != null && total != null) {
      return fillMessage(t("registry.record.edition.nOfT"), { n, total });
    }
    if (n != null) return fillMessage(t("registry.record.edition.n"), { n });
    if (total != null) {
      return fillMessage(t("registry.record.edition.of"), { total });
    }
    return null;
  })();

  const ownBadge = ownershipStatusBadge(ownershipStatus, "light");
  ownBadge.label = ownershipLabel(ownershipStatus, t);

  const heldByContent = (() => {
    if (
      currentOwner.user_id &&
      sessionUserId &&
      currentOwner.user_id === sessionUserId
    ) {
      return t("registry.record.heldByYou");
    }
    if (!currentOwner.user_id) return t("registry.record.ownership.unassigned");
    if (currentOwner.verification_status !== "verified") {
      return currentOwner.verification_status === "claimed"
        ? t("registry.record.ownershipClaimed")
        : t("registry.record.ownershipRecorded");
    }
    if (currentOwner.slug && currentOwner.display_name) {
      return (
        <>
          {t("registry.record.heldBy")}{" "}
          <Link
            href={`/collector-studio/${encodeURIComponent(currentOwner.slug)}`}
            className="underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
          >
            {currentOwner.display_name}
          </Link>
        </>
      );
    }
    return t("registry.record.privateCollection");
  })();

  const trustBarToneClass =
    trust.tone === "red"
      ? "border-red-200/60 bg-red-50/40 text-red-950"
      : trust.tone === "green"
        ? "border-emerald-200/35 bg-emerald-50/20 text-neutral-800"
        : "border-amber-200/45 bg-amber-50/30 text-amber-950";

  const isVerified = artwork.verification_status === "verified" && !certRevoked;

  return (
    <div className="ds-page-environment min-h-screen pt-20 text-neutral-900">
      <main className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(52vh,28rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.07),transparent_58%),radial-gradient(ellipse_55%_45%_at_100%_0%,rgba(14,165,233,0.06),transparent_50%)]"
          aria-hidden
        />
        <div
          className={`mb-8 rounded-lg border px-3.5 py-2 shadow-sm md:px-4 md:py-2.5 ${trustBarToneClass}`}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="min-w-0">
              <p
                className={
                  trust.tone === "green"
                    ? "text-[13px] font-medium leading-tight text-emerald-900/85"
                    : "text-[13px] font-medium leading-tight"
                }
              >
                {trust.headline}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-600">
                {trust.sub}
              </p>
              {verificationGalleryName ? (
                <p className="mt-1 text-[10px] leading-snug text-neutral-500">
                  {fillMessage(t("registry.record.verificationBy"), {
                    name: verificationGalleryName,
                  })}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 md:justify-end">
              {isVerified ? (
                <span className="rounded border border-emerald-200/70 bg-white/65 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-emerald-900/90">
                  {t("registry.cert.verified")}
                </span>
              ) : null}
              {hasCertificate && !certRevoked ? (
                <span className="rounded border border-neutral-200/80 bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
                  {t("registry.record.badge.certificate")}
                </span>
              ) : null}
              {hasCertificate && certRevoked ? (
                <span className="rounded border border-red-200/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-red-900">
                  {t("registry.cert.revoked")}
                </span>
              ) : null}
              {!hasCertificate ? (
                <span className="rounded border border-neutral-200/70 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                  {t("registry.record.badge.noCertificate")}
                </span>
              ) : null}
              {artwork.is_locked ? (
                <span className="rounded border border-neutral-200/70 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                  {t("registry.record.badge.locked")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-900/[0.06] bg-white/70 px-4 py-3 shadow-sm">
          <p className="text-sm text-neutral-600">
            {t("registry.record.ledgerDiscoveryNote")}
          </p>
          <Link
            href={fieldRecordHref(artwork.registry_id)}
            className="inline-flex rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("registry.record.openFieldRecord")}
          </Link>
        </div>

        <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-7">
            <div className="liquid-glass-tile overflow-hidden rounded-[1.65rem] shadow-[0_28px_72px_-32px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06]">
              {artwork.image_url ? (
                <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-neutral-100 to-neutral-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200/60 text-sm text-neutral-500">
                  {t("registry.card.noImage")}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-1">
            <div className="rounded-2xl border border-black/[0.06] bg-white/75 px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-sm md:px-6 md:py-6">
              <p className="font-mono text-[11px] leading-relaxed tracking-tight text-neutral-500">
                {artwork.registry_id}
              </p>
              <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-[1.06]">
                {artwork.title}
              </h1>
              <p className="mt-4 text-lg text-neutral-700">
                {artistSlug ? (
                  <Link
                    href={fieldCreativeHref(artistSlug)}
                    className="transition hover:text-neutral-900 hover:underline"
                  >
                    {artistName}
                  </Link>
                ) : (
                  artistName
                )}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {[artwork.year, artwork.medium].filter(Boolean).join(" · ") ||
                  "–"}
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.05] bg-gradient-to-br from-neutral-50/95 to-white/80 px-5 py-5 md:px-6">
              <p className={ownBadge.className}>{ownBadge.label}</p>
              <p className="mt-2 text-sm text-neutral-600">{heldByContent}</p>
            </div>
            {artwork.description ? (
              <section className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-6 shadow-sm md:px-6 md:py-7">
                <h2 className="font-serif text-lg font-normal text-neutral-950">
                  {t("registry.record.aboutWork")}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                  {artwork.description}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            <section className="liquid-glass-tile rounded-2xl p-6 md:p-8">
              <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                {t("registry.record.specifications")}
              </h2>
              <dl className="mt-6 divide-y divide-black/[0.06] text-sm">
                <div className="flex justify-between gap-6 py-4 first:pt-0">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.medium")}
                  </dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.medium || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.dimensions")}
                  </dt>
                  <dd className="max-w-[60%] text-right text-neutral-900">
                    {artwork.dimensions || "–"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-neutral-500">
                    {t("registry.record.field.year")}
                  </dt>
                  <dd className="text-right text-neutral-900">
                    {artwork.year || "–"}
                  </dd>
                </div>
                {editionLine ? (
                  <div className="flex justify-between gap-6 py-4">
                    <dt className="text-neutral-500">
                      {t("registry.record.field.edition")}
                    </dt>
                    <dd className="text-right text-neutral-900">{editionLine}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-gradient-to-b from-white via-white to-neutral-50/90 p-6 shadow-[0_20px_56px_-36px_rgba(15,23,42,0.14)] md:p-9">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <div className="flex flex-col gap-3 border-b border-black/[0.06] pb-6">
                  <InfoTooltip text="A unified timeline of creation, verification, certification, ownership, and recorded values." />
                  <h2 className="font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
                    {t("registry.record.provenance")}
                  </h2>
                </div>
                {provenanceInsights.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-base font-medium text-neutral-900">
                      {t("registry.record.recordInsights")}
                    </h3>
                    <div className="mt-4 space-y-3">
                      {provenanceInsights.map((ins, i) => (
                        <div
                          key={`${ins.type}-${ins.priority}-${i}`}
                          className="rounded-xl border border-emerald-900/[0.08] bg-emerald-50/35 px-5 py-4 text-sm text-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]"
                        >
                          {translateProvenanceInsight(ins.message, t)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-8">
                  <ArchivalProvenanceTimeline bundle={provenanceBundle} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="liquid-glass-tile rounded-2xl p-8 md:p-9">
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                {t("registry.record.certStatusTitle")}
              </h2>
              <div className="mt-6 space-y-3 text-sm">
                {!hasCertificate ? (
                  <p className="font-medium text-neutral-900">
                    {t("registry.record.certNotRecorded")}
                  </p>
                ) : certRevoked ? (
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">
                      {t("registry.record.certRevoked")}
                    </p>
                    {revokedReason ? (
                      <p className="text-red-700/90">{revokedReason}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-medium text-emerald-900">
                    {t("registry.record.certRecorded")}
                  </p>
                )}

                <div className="mt-6">
                  <RegistryCertificateOverviewButton
                    registryId={artwork.registry_id}
                  />
                </div>

                <p className="text-xs text-neutral-500">
                  {t("registry.record.certFootnote")}
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/certificate/${artwork.registry_id}`)}`}
                  className="liquid-glass-inset mt-4 block px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white/80"
                >
                  {t("registry.card.viewCertLogin")}
                </Link>
              </div>
            </div>

            <RegistryTechnicalDetails
              registryId={artwork.registry_id}
              verificationHash={artwork.verification_hash}
              timelineHash={artwork.timeline_hash}
            />

            <div className="liquid-glass-tile rounded-2xl p-8">
              <h2 className="font-serif text-lg font-normal text-neutral-950">
                {t("registry.record.verificationTitle")}
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/verify/${encodeURIComponent(artwork.registry_id)}`}
                  className="rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                >
                  {t("registry.card.verifyCert")}
                </Link>
                <PublicClaimOwnership
                  artworkId={artwork.id}
                  registryId={artwork.registry_id}
                  loginNextPath={claimReturnPath}
                />
                <ShareRecordButton url={shareUrl} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
