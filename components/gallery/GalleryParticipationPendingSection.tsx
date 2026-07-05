"use client";

import Link from "next/link";
import { GovernanceSectionShell } from "@/components/Studio/GovernanceSectionShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";

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

export function GalleryRecordDepthSection({
  items,
  onGoToInvitations,
  onInviteWork,
  isAdmin,
}: Props) {
  const { t } = useLocalePreferences();

  if (items.length === 0) return null;

  const description = `${t("gallery.participation.descIntro")} ${t("gallery.participation.descMiddle")} ${t("gallery.participation.descOutro")}`;

  return (
    <GovernanceSectionShell
      id="gallery-record-depth"
      eyebrow={t("gallery.nav.recordDepth")}
      title={t("gallery.participation.title")}
      description={description}
      badge={
        <span className="studio-execution-stamp studio-execution-stamp--active">
          {items.length}{" "}
          {items.length === 1
            ? t("gallery.participation.record")
            : t("gallery.participation.records")}
        </span>
      }
      actions={
        typeof onGoToInvitations === "function" ? (
          <button
            type="button"
            onClick={onGoToInvitations}
            className="v2-cta-secondary px-4 py-2.5 text-xs"
          >
            {t("gallery.participation.inviteAuthenticate")}
          </button>
        ) : null
      }
    >
      <ul className="space-y-3">
        {items.map((row) => {
          const title = row.title?.trim() || t("gallery.participation.untitledWork");
          const reg = row.registry_id?.trim();
          const when = formatWhen(row.filed_at);
          return (
            <li
              key={row.artwork_id}
              className={`${studioV2.surface.filingSheet} flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5`}
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
                      {t("gallery.participation.noImage")}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {title}
                  </p>
                  {reg ? (
                    <p className="mt-0.5 v2-type-mono text-[10px] tracking-[0.08em] text-[var(--v2-cool-grey)]">
                      {reg}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[12px] text-[var(--v2-ink-muted)]">
                    {row.artist_name || t("gallery.participation.associatedArtist")}
                    {when
                      ? fillMessage(t("gallery.participation.institutionLayer"), {
                          when,
                        })
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {reg ? (
                  <Link
                    href={`/artwork/${encodeURIComponent(reg)}`}
                    className="text-xs font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4"
                  >
                    {t("gallery.participation.publicRecord")}
                  </Link>
                ) : null}
                {isAdmin && typeof onInviteWork === "function" ? (
                  <button
                    type="button"
                    onClick={() => onInviteWork(row.artwork_id)}
                    className="v2-cta-secondary px-2.5 py-1 text-[10px]"
                  >
                    {t("gallery.participation.inviteAuthenticate")}
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
