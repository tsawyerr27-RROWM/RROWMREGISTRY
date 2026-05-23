"use client";

import Link from "next/link";
import { GovernanceSectionShell } from "@/components/Studio/GovernanceSectionShell";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { workspace } from "@/styles/workspace-design";

export type ArtistRepresentationReviewItem = {
  artwork_id: string;
  registry_id: string | null;
  title: string | null;
  image_url: string | null;
  gallery_id: string;
  gallery_name: string | null;
  filed_at: string | null;
  catalogue_artist_name?: string | null;
  artist_linked?: boolean;
};

type Props = {
  items: ArtistRepresentationReviewItem[];
  busyArtworkId: string | null;
  onConfirm: (artworkId: string) => void | Promise<void>;
  onContribute?: (item: ArtistRepresentationReviewItem) => void;
};

function formatFiledWhen(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const DEEPEN_STEPS = [
  "Review the canonical record as it stands on file",
  "Authenticate authorship as your attestation",
  "File an archival authorship contribution on the chronology",
  "Optionally acknowledge institutional relationship on the record",
] as const;

/**
 * Artist: authenticate authorship and deepen canonical records (not gallery approval).
 */
export function ArtistRecordDeepeningSection({
  items,
  busyArtworkId,
  onConfirm,
  onContribute,
}: Props) {
  if (items.length === 0) return null;

  return (
    <GovernanceSectionShell
      id="artist-record-deepening"
      eyebrow="Canonical records"
      title="Authenticate & deepen"
      description={`${CANONICAL_RECORD_PHRASES.inviteRecordExists}. ${CANONICAL_RECORD_PHRASES.recordDeepensOverTime}. You contribute attestations — the work is not provisional and you are not approving an institution upload.`}
      badge={
        <span className={workspace.card.pill}>
          {items.length} {items.length === 1 ? "record" : "records"} to deepen
        </span>
      }
    >
      <ol className="mb-6 space-y-2 border-b border-neutral-900/[0.06] pb-6">
        {DEEPEN_STEPS.map((step, i) => (
          <li
            key={step}
            className="flex gap-3 text-sm leading-relaxed text-neutral-600"
          >
            <span className="shrink-0 font-medium tabular-nums text-neutral-400">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <ul className="space-y-4">
        {items.map((row) => {
          const title = row.title?.trim() || "Untitled work";
          const reg = row.registry_id?.trim();
          const when = formatFiledWhen(row.filed_at);
          const institution = row.gallery_name?.trim() || "Institution";
          const busy = busyArtworkId === row.artwork_id;
          const publicHref = reg
            ? `/artwork/${encodeURIComponent(reg)}`
            : null;

          return (
            <li
              key={row.artwork_id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-900/[0.06] bg-white/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100/90 ring-1 ring-neutral-900/[0.06]">
                  {row.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-neutral-900">
                    {title}
                  </p>
                  {reg ? (
                    <p className={`mt-0.5 ${workspace.type.registryId}`}>{reg}</p>
                  ) : null}
                  <p className={`mt-1.5 ${workspace.type.metaQuiet}`}>
                    {CANONICAL_RECORD_PHRASES.canonicalRecordOnFile}
                    {when ? ` · Opened ${when}` : ""}
                  </p>
                  <p className={`mt-1 ${workspace.type.metaQuiet}`}>
                    {CANONICAL_RECORD_PHRASES.institutionAttestationOnFile} ·{" "}
                    {institution}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                {publicHref ? (
                  <Link
                    href={publicHref}
                    className="rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Review record
                  </Link>
                ) : null}
                {onContribute ? (
                  <button
                    type="button"
                    onClick={() => onContribute(row)}
                    className="rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Contribute authorship
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onConfirm(row.artwork_id)}
                  className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
                >
                  {busy ? "Recording…" : "Authenticate authorship"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`mt-6 ${workspace.type.metaQuiet}`}>
        {CANONICAL_RECORD_PHRASES.notApprovalWorkflow}
      </p>
    </GovernanceSectionShell>
  );
}

/** @deprecated Use ArtistRecordDeepeningSection */
export const ArtistRepresentationReviewSection = ArtistRecordDeepeningSection;
