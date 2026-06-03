"use client";

import Link from "next/link";
import { GovernanceSectionShell } from "@/components/Studio/GovernanceSectionShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fillMessage } from "@/lib/locale-messages";
import {
  translateCanonicalPhrase,
} from "@/lib/representation-i18n";
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
  onReview?: (item: ArtistRepresentationReviewItem) => void;
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

const DEEPEN_STEP_KEYS = [
  "studio.records.deepen.step1",
  "studio.records.deepen.step2",
  "studio.records.deepen.step3",
  "studio.records.deepen.step4",
] as const;

/**
 * Artist: authenticate authorship and deepen canonical records (not gallery approval).
 */
export function ArtistRecordDeepeningSection({
  items,
  busyArtworkId,
  onConfirm,
  onContribute,
  onReview,
}: Props) {
  const { t } = useLocalePreferences();

  if (items.length === 0) return null;

  const description = fillMessage(t("studio.records.deepen.description"), {
    inviteRecordExists: translateCanonicalPhrase("inviteRecordExists", t),
    recordDeepensOverTime: translateCanonicalPhrase("recordDeepensOverTime", t),
  });

  return (
    <GovernanceSectionShell
      id="artist-record-deepening"
      eyebrow={t("studio.records.deepen.eyebrow")}
      title={t("studio.records.deepen.title")}
      description={description}
      badge={
        <span className={workspace.card.pill}>
          {fillMessage(
            t(
              items.length === 1
                ? "studio.records.deepen.badge"
                : "studio.records.deepen.badgePlural"
            ),
            { count: String(items.length) }
          )}
        </span>
      }
    >
      <ol className="mb-6 space-y-2 border-b border-neutral-900/[0.06] pb-6">
        {DEEPEN_STEP_KEYS.map((stepKey, i) => (
          <li
            key={stepKey}
            className="flex gap-3 text-[15px] leading-relaxed text-neutral-600"
          >
            <span className="shrink-0 font-medium tabular-nums text-neutral-400">
              {i + 1}
            </span>
            <span>{t(stepKey)}</span>
          </li>
        ))}
      </ol>

      <ul className="space-y-4">
        {items.map((row) => {
          const title = row.title?.trim() || t("registry.card.untitled");
          const reg = row.registry_id?.trim();
          const when = formatFiledWhen(row.filed_at);
          const institution =
            row.gallery_name?.trim() || t("studio.records.deepen.institution");
          const busy = busyArtworkId === row.artwork_id;
          const publicHref = reg
            ? `/artwork/${encodeURIComponent(reg)}`
            : null;
          const reviewHref = `/authenticate-record?artwork_id=${encodeURIComponent(row.artwork_id)}`;

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
                      {t("registry.card.noImage")}
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
                    {translateCanonicalPhrase("canonicalRecordOnFile", t)}
                    {when
                      ? ` · ${fillMessage(t("studio.records.deepen.opened"), { when })}`
                      : ""}
                  </p>
                  <p className={`mt-1 ${workspace.type.metaQuiet}`}>
                    {translateCanonicalPhrase("institutionAttestationOnFile", t)}{" "}
                    · {institution}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                {typeof onReview === "function" ? (
                  <button
                    type="button"
                    onClick={() => onReview(row)}
                    className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    {t("studio.records.deepen.reviewAuthenticate")}
                  </button>
                ) : (
                  <Link
                    href={reviewHref}
                    className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    {t("studio.records.deepen.reviewAuthenticate")}
                  </Link>
                )}
                {publicHref ? (
                  <Link
                    href={publicHref}
                    className="rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    {t("studio.records.deepen.publicRecord")}
                  </Link>
                ) : null}
                {onContribute ? (
                  <button
                    type="button"
                    onClick={() => onContribute(row)}
                    className="rounded-xl border border-neutral-900/[0.08] bg-white/90 px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    {t("studio.records.deepen.contributeAuthorship")}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onConfirm(row.artwork_id)}
                  className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-50"
                >
                  {busy
                    ? t("common.recording")
                    : t("studio.records.deepen.authenticateAuthorship")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`mt-6 ${workspace.type.metaQuiet}`}>
        {translateCanonicalPhrase("notApprovalWorkflow", t)}
      </p>
    </GovernanceSectionShell>
  );
}

/** @deprecated Use ArtistRecordDeepeningSection */
export const ArtistRepresentationReviewSection = ArtistRecordDeepeningSection;
