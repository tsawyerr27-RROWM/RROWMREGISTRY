"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryV2 } from "@/styles/registry-v2";

export type RegistryRecordHeroField = {
  label: string;
  value: ReactNode;
};

type Props = {
  imageUrl: string | null;
  imageAlt?: string;
  title: string;
  artistName: string;
  artistHref?: string | null;
  registryId: string;
  fields?: RegistryRecordHeroField[];
  trustTierStrip?: ReactNode;
  trustPanel?: ReactNode;
  certificateActions?: ReactNode;
  /** @deprecated Prefer certificateActions — kept for Field record shell */
  actions?: ReactNode;
  noImageLabel?: string;
};

export function RegistryRecordHero({
  imageUrl,
  imageAlt = "",
  title,
  artistName,
  artistHref,
  registryId,
  fields = [],
  trustTierStrip,
  trustPanel,
  certificateActions,
  actions,
  noImageLabel = "No image on file",
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <section
      className={`grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start ${registryV2.motion.reveal}`}
    >
      <div className="lg:col-span-7">
        <div className={`${registryV2.surface.heroArtwork} ${registryV2.motion.hover}`}>
          {imageUrl ? (
            <div className="relative aspect-[4/5] w-full bg-[var(--v2-cool-grey)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-[var(--v2-cool-grey)]/8">
              <p className="v2-type-mono text-[var(--v2-cool-grey)]">{noImageLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-5 lg:gap-7 lg:pt-1">
        <div className={registryV2.surface.metadataStack}>
          <p className={registryV2.type.monoId}>{registryId}</p>
          <h1 className={`${registryV2.type.recordTitle} mt-3`}>{title}</h1>
          <p className="mt-4 text-lg text-[var(--v2-ink-muted)]">
            {artistHref ? (
              <Link
                href={artistHref}
                className="transition hover:text-[var(--v2-near-black)] hover:underline decoration-[var(--v2-border-strong)] underline-offset-4"
              >
                {artistName}
              </Link>
            ) : (
              artistName
            )}
          </p>
        </div>

        {trustTierStrip ? (
          <div className="v2-motion-reveal-slow">{trustTierStrip}</div>
        ) : null}

        {fields.length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className={registryV2.surface.metadataField}>
                <dt className={registryV2.type.metaLabel}>{field.label}</dt>
                <dd
                  className={`${registryV2.type.metaValue} mt-2 break-words font-medium text-[var(--v2-ink)]`}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {certificateActions ? (
          <div className={`${registryV2.surface.filing} p-5 md:p-6`}>
            <p className={registryV2.type.metaLabel}>
              {t("registry.record.certStatusTitle")}
            </p>
            <div className="mt-4">{certificateActions}</div>
          </div>
        ) : null}

        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
        ) : null}

        {trustPanel ? <div className="v2-motion-reveal-slow">{trustPanel}</div> : null}
      </div>
    </section>
  );
}
