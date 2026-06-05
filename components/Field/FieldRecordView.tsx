"use client";

import Link from "next/link";

import {
  artistConfirmationLabel,
  certificateStatusLabel,
  organisationVerificationLabel,
  recordVerificationStatusLabel,
} from "@/lib/field-verify-record";
import type { FieldRecordPageData } from "@/lib/field-record-page";
import {
  fieldExplorerRecordsHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { registryLedgerHref } from "@/lib/registry-nav";
import { recordVerificationPendingLabel } from "@/lib/representation-language";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  data: FieldRecordPageData;
};

function TrustBand({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-900/[0.05] bg-neutral-50/80 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}

export function FieldRecordView({ data }: Props) {
  const { t } = useLocalePreferences();
  const {
    artwork,
    recordVerified,
    artistConfirmationOnFile,
    organisation,
    certificate,
    certificateRevoked,
    image_url,
    year,
    medium,
    description,
    artistName,
    creativeHref,
    organisationName,
    organisationHref,
  } = data;

  const title = artwork.title?.trim() || "Registry record";
  const ledgerHref = registryLedgerHref(artwork.registry_id);
  const verifyHref = fieldVerifyRecordHref(artwork.registry_id);
  const yearMedium = [year, medium].filter(Boolean).join(" · ");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
        {t("field.record.title")}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.06] bg-neutral-100">
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url}
              alt=""
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-sm text-neutral-400">
              No image on file
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-[11px] text-neutral-400">{artwork.registry_id}</p>
          <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-[2.75rem]">
            {title}
          </h1>
          {yearMedium ? (
            <p className="mt-3 text-sm text-neutral-600">{yearMedium}</p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <TrustBand
              label="Record verification"
              value={recordVerificationStatusLabel(
                artwork.verification_status,
                recordVerified
              )}
            />
            <TrustBand
              label="Artist confirmation"
              value={artistConfirmationLabel(artistConfirmationOnFile)}
            />
            <TrustBand
              label="Organisation"
              value={organisationVerificationLabel(organisation)}
            />
            <TrustBand
              label="Certificate"
              value={certificateStatusLabel({
                recordVerified,
                certificate,
                certificateRevoked,
                pendingLabel: recordVerificationPendingLabel(),
              })}
            />
          </div>

          {artistName ? (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                Creative
              </p>
              <p className="mt-2 text-base text-neutral-900">
                {creativeHref ? (
                  <Link
                    href={creativeHref}
                    className="font-medium underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
                  >
                    {artistName}
                  </Link>
                ) : (
                  artistName
                )}
              </p>
            </div>
          ) : null}

          {organisationName ? (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                Organisation
              </p>
              <p className="mt-2 text-base text-neutral-900">
                {organisationHref ? (
                  <Link
                    href={organisationHref}
                    className="font-medium underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
                  >
                    {organisationName}
                  </Link>
                ) : (
                  organisationName
                )}
              </p>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={verifyHref}
              className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {t("field.record.link.verify")}
            </Link>
            <Link
              href={ledgerHref}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.record.link.ledger")}
            </Link>
            <Link
              href={fieldVerifyHref()}
              className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.record.link.verifyHub")}
            </Link>
          </div>
        </div>
      </div>

      {description?.trim() ? (
        <section className="mt-14 max-w-3xl">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
            About this work
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-700">
            {description.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-6 shadow-sm md:p-8">
        <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
          {t("field.record.discoveryHeading")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
          {t("field.record.discoveryLede")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={fieldExplorerRecordsHref()}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t("field.record.link.explorer")}
          </Link>
          {creativeHref ? (
            <Link
              href={creativeHref}
              className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.record.link.creative")}
            </Link>
          ) : null}
          {organisationHref ? (
            <Link
              href={organisationHref}
              className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              {t("field.record.link.organisation")}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-2xl rounded-3xl border border-black/[0.06] bg-white/70 px-8 py-10 text-center shadow-sm md:mt-16">
        <p className="text-base leading-relaxed text-neutral-700">
          {t("field.record.ledgerNote")}
        </p>
      </section>
    </main>
  );
}
