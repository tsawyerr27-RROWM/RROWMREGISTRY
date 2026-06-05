import Link from "next/link";

import { PersonalArchiveControl } from "@/components/archive/PersonalArchiveControl";
import {
  artistConfirmationLabel,
  certificateStatusLabel,
  type FieldVerifyRecordData,
  organisationVerificationLabel,
  recordVerificationStatusLabel,
} from "@/lib/field-verify-record";
import {
  fieldCreativeHref,
  fieldOrganisationHref,
  fieldVerifyHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { recordVerificationPendingLabel } from "@/lib/representation-language";

type Props = {
  data: FieldVerifyRecordData;
};

function TrustRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border-b border-neutral-900/[0.06] py-4 last:border-0">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-neutral-900">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{detail}</p>
      ) : null}
    </div>
  );
}

export function FieldVerifyRecordView({ data }: Props) {
  const {
    artwork,
    artist,
    recordVerified,
    artistConfirmationOnFile,
    organisation,
    artistVerifiedWorkCount,
    certificate,
    certificateRevoked,
    archiveCount,
    userArchived,
    sessionUserId,
  } = data;

  const verifyPath = fieldVerifyRecordHref(artwork.registry_id);
  const registryHref = `/registry/${encodeURIComponent(artwork.registry_id)}`;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      {certificateRevoked ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-24 flex justify-center opacity-[0.07]"
          aria-hidden
        >
          <span className="rotate-[-18deg] text-7xl font-bold tracking-widest text-red-700 md:text-8xl">
            REVOKED
          </span>
        </div>
      ) : null}

      <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
        Field verification
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-4xl">
        {artwork.title?.trim() || "Registry record"}
      </h1>
      {artist?.display_name ? (
        <p className="mt-3 text-base text-neutral-700">{artist.display_name}</p>
      ) : null}

      {!recordVerified ? (
        <div className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">Registry record registered</p>
          <p className="mt-1 text-amber-900/85">
            This Registry ID exists on file. Certificate verification applies after
            the record reaches verified status on the Registry ledger.
          </p>
          <Link
            href={registryHref}
            className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
          >
            View Registry record
          </Link>
        </div>
      ) : null}

      <section className="relative mt-10 rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/85 p-6 shadow-sm md:p-8">
        <h2 className="font-serif text-xl font-normal text-neutral-950">
          Trust on file
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">
          The Field displays Registry truth only. Signals below are read from the
          ledger and existing verification services — not self-authored profile claims.
        </p>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Tier 1 — Registry record
          </p>
          <TrustRow
            label="Registry ID"
            value={artwork.registry_id}
          />
          <TrustRow
            label="Record verification"
            value={recordVerificationStatusLabel(
              artwork.verification_status,
              recordVerified
            )}
          />
          <TrustRow
            label="Artist confirmation"
            value={artistConfirmationLabel(artistConfirmationOnFile)}
          />
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Tier 2 — Organisation & verified works
          </p>
          <TrustRow
            label="Organisation verification"
            value={organisationVerificationLabel(organisation)}
          />
          {artistVerifiedWorkCount > 0 ? (
            <TrustRow
              label="Verified works by Creative"
              value={`${artistVerifiedWorkCount} verified ${artistVerifiedWorkCount === 1 ? "work" : "works"} on file`}
              detail="Factual count from the Registry — not a reputation score."
            />
          ) : null}
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            Tier 3 — Certificate
          </p>
          <TrustRow
            label="Certificate status"
            value={certificateStatusLabel({
              recordVerified,
              certificate,
              certificateRevoked,
              pendingLabel: recordVerificationPendingLabel(),
            })}
          />
          {certificateRevoked && certificate?.revoked_reason ? (
            <div className="mt-4 rounded-xl border border-red-200/80 bg-red-50/85 px-4 py-3 text-sm text-red-800">
              <p className="text-xs font-medium uppercase tracking-wide">
                Revocation reason
              </p>
              <p className="mt-1">{certificate.revoked_reason}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 border-t border-neutral-900/[0.06] pt-4">
          <TrustRow
            label="Recorded on Registry"
            value={new Date(artwork.created_at).toLocaleDateString()}
          />
        </div>
      </section>

      {recordVerified ? (
        <p className="mt-8 text-xs leading-relaxed text-neutral-500">
          Full certificate document requires sign-in.{" "}
          <a
            href={`/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(artwork.registry_id)}`)}`}
            className="font-medium text-neutral-800 underline underline-offset-2"
          >
            View certificate (login required)
          </a>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
        <Link
          href={registryHref}
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
        >
          Registry record
        </Link>
        {artist?.slug ? (
          <Link
            href={fieldCreativeHref(artist.slug)}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
          >
            Creative profile
          </Link>
        ) : null}
        <Link
          href={fieldVerifyHref()}
          className="text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
        >
          Verify hub
        </Link>
      </div>

      <PersonalArchiveControl
        artworkId={artwork.id}
        registryId={artwork.registry_id}
        isSignedIn={Boolean(sessionUserId)}
        initialArchived={userArchived}
        initialCount={archiveCount}
        variant="compact"
        loginNextPath={verifyPath}
      />
    </div>
  );
}
