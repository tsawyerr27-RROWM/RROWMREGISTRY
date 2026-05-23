"use client";

import Link from "next/link";
import { GovernanceSectionShell } from "@/components/Studio/GovernanceSectionShell";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { workspace } from "@/styles/workspace-design";

export type ParticipationPendingWork = {
  artwork_id: string;
  registry_id: string | null;
  title: string | null;
  image_url: string | null;
  artist_name: string | null;
  filed_at: string | null;
};

type Props = {
  items: ParticipationPendingWork[];
  onGoToInvitations?: () => void;
  /** Open artwork authentication invite modal for one record */
  onInviteWork?: (artworkId: string) => void;
  isAdmin?: boolean;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return "";
  }
}

/**
 * Canonical records where artist attestation may still deepen (not an approval queue).
 */
export function GalleryRecordDepthSection({
  items,
  onGoToInvitations,
  onInviteWork,
  isAdmin,
}: Props) {
  if (items.length === 0) return null;

  return (
    <GovernanceSectionShell
      id="gallery-record-depth"
      eyebrow="Record depth"
      title="Attestations may deepen"
      description={`Each work below is a ${CANONICAL_RECORD_PHRASES.canonicalRecordOnFile.toLowerCase()} with your institution's continuity layer. ${CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen} when the artist authenticates authorship — the record is complete; layers accumulate.`}
      badge={
        <span className={workspace.card.pill}>
          {items.length} {items.length === 1 ? "record" : "records"}
        </span>
      }
      actions={
        typeof onGoToInvitations === "function" ? (
          <button
            type="button"
            onClick={onGoToInvitations}
            className="rounded-xl border border-neutral-900/[0.12] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Invite to authenticate
          </button>
        ) : null
      }
    >
      <ul className="space-y-3">
        {items.map((row) => {
          const title = row.title?.trim() || "Untitled work";
          const reg = row.registry_id?.trim();
          const when = formatWhen(row.filed_at);
          return (
            <li
              key={row.artwork_id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-900/[0.06] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-900/[0.06]">
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
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {title}
                  </p>
                  {reg ? (
                    <p className={`mt-0.5 ${workspace.type.registryId}`}>{reg}</p>
                  ) : null}
                  <p className={`mt-1 ${workspace.type.metaQuiet}`}>
                    {row.artist_name || "Associated artist"}
                    {when ? ` · Institution layer ${when}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {reg ? (
                  <Link
                    href={`/artwork/${encodeURIComponent(reg)}`}
                    className="text-xs font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4"
                  >
                    Public record
                  </Link>
                ) : null}
                {isAdmin && typeof onInviteWork === "function" ? (
                  <button
                    type="button"
                    onClick={() => onInviteWork(row.artwork_id)}
                    className="rounded-lg border border-neutral-900/10 bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Invite to authenticate
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </GovernanceSectionShell>
  );
}

/** @deprecated Use GalleryRecordDepthSection */
export const GalleryParticipationPendingSection = GalleryRecordDepthSection;
