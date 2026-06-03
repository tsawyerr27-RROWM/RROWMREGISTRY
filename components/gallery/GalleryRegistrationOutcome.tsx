"use client";

import Link from "next/link";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { workspace } from "@/styles/workspace-design";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export type GalleryRegistrationOutcomeData = {
  title: string;
  registryId: string;
  artworkId: string | null;
  institutionFilingOk: boolean;
  institutionFilingError?: string | null;
  artistName?: string | null;
  /** Optional email filed at registration for later authenticate & deepen */
  pendingArtistEmail?: string | null;
  /** True when registration linked an existing roster artist account */
  artistAccountLinked?: boolean;
  imageUrl?: string | null;
  catalogueArtistName?: string | null;
};

type Props = {
  data: GalleryRegistrationOutcomeData;
  onDismiss: () => void;
  /** Opens artwork authentication invite modal for this registration */
  onSendAuthenticationInvite?: () => void;
  onViewRecordDepth?: () => void;
  onViewWork?: () => void;
  isAdmin?: boolean;
};

/**
 * Post-register: canonical record issued; institution attestation layered; artist may deepen.
 */
export function GalleryRegistrationOutcome({
  data,
  onDismiss,
  onSendAuthenticationInvite,
  onViewRecordDepth,
  onViewWork,
  isAdmin,
}: Props) {
  const publicHref = data.registryId
    ? `/artwork/${encodeURIComponent(data.registryId)}`
    : null;

  return (
    <section
      className={`${workspace.panel.shell} mt-6`}
      role="status"
      aria-live="polite"
    >
      <InfoTooltip text="This canonical record is now on file within the registry. Artist attestation may deepen when the artist authenticates authorship." />
      <h2 className="mt-2 font-serif text-[1.35rem] font-normal text-neutral-950 md:text-[1.75rem]">
        {data.title}
      </h2>
      <p className={`mt-2 ${workspace.type.registryId}`}>{data.registryId}</p>

      <ol className="mt-6 space-y-2 text-sm text-neutral-600">
        <li className="flex gap-2">
          <span className="font-medium text-neutral-800">1.</span>
          <span>{CANONICAL_RECORD_PHRASES.canonicalRecordOnFile}. Public page live.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-neutral-800">2.</span>
          <span>
            {data.institutionFilingOk
              ? CANONICAL_RECORD_PHRASES.institutionAttestationOnFile
              : "Institution attestation: add when roster link is on file."}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-neutral-800">3.</span>
          <span>
            Invite the artist to authenticate authorship and deepen the chronology.
          </span>
        </li>
      </ol>

      <div className="mt-6 flex flex-wrap gap-2">
        {publicHref ? (
          <Link
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-900/[0.1] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            View public record
          </Link>
        ) : null}
        {typeof onViewWork === "function" ? (
          <button
            type="button"
            onClick={onViewWork}
            className="rounded-xl border border-neutral-900/[0.1] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Open in Works
          </button>
        ) : null}
        {typeof onViewRecordDepth === "function" ? (
          <button
            type="button"
            onClick={onViewRecordDepth}
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            Record depth
          </button>
        ) : null}
        {isAdmin &&
        typeof onSendAuthenticationInvite === "function" &&
        !data.artistAccountLinked ? (
          <button
            type="button"
            onClick={onSendAuthenticationInvite}
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            Send authentication invitation
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl px-4 py-2.5 text-xs text-neutral-500 transition hover:text-neutral-800"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}
