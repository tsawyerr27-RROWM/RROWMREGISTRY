"use client";

import type { RefObject } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { ArtworkAuthenticationInviteRow } from "@/lib/artwork-authentication-invite";
import { buildArtworkAuthenticationInviteUrl } from "@/lib/artwork-authentication-invite";
import { artworkAuthInviteStatusLabel } from "@/lib/gallery-invitations-i18n";
import { fillMessage } from "@/lib/locale-messages";
import { translateCanonicalPhrase } from "@/lib/representation-i18n";
import { workspace } from "@/styles/workspace-design";

type Props = {
  invites: ArtworkAuthenticationInviteRow[];
  registrySiteUrl: string;
  isAdmin: boolean;
  resendingId: string | null;
  onResend: (inviteId: string) => void;
  message: string | null;
  error: string | null;
};

function formatSent(iso: string | null | undefined): string {
  if (!iso) return "–";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return "–";
  }
}

function artFromRow(row: ArtworkAuthenticationInviteRow) {
  const raw = row.artworks;
  return Array.isArray(raw) ? raw[0] : raw;
}

export function GalleryArtworkAuthenticationInvitesSection({
  invites,
  registrySiteUrl,
  isAdmin,
  resendingId,
  onResend,
  message,
  error,
}: Props) {
  const { t } = useLocalePreferences();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const sectionDesc = `${t("gallery.artworkAuth.sectionDescIntro")} ${translateCanonicalPhrase("notApprovalWorkflow", t)}`;

  return (
    <section
      aria-label={t("gallery.artworkAuth.sectionTitle")}
      className={workspace.panel.shell}
    >
      <InfoTooltip text={sectionDesc} />
      <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
        {t("gallery.artworkAuth.sectionTitle")}
      </h2>

      {error ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-lg border border-[var(--v2-border)] bg-white px-4 py-3 text-sm text-[var(--v2-ink-muted)]" role="status">
          {message}
        </p>
      ) : null}

      {invites.length === 0 ? (
        <p className="mt-6 text-[13px] text-neutral-500">
          {fillMessage(t("gallery.artworkAuth.emptyBody"), {
            cta: t("gallery.catalogue.inviteArtistAuthenticate"),
          })}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-900/[0.06]">
          {invites.map((row) => {
            const art = artFromRow(row);
            const title =
              art?.title?.trim() || t("gallery.participation.untitledWork");
            const reg = art?.registry_id?.trim();
            const statusLabel = artworkAuthInviteStatusLabel(row, t);
            const authenticated = row.status === "authenticated";
            const linkUrl = row.invite_token
              ? buildArtworkAuthenticationInviteUrl(
                  registrySiteUrl,
                  row.invite_token
                )
              : null;

            return (
              <li
                key={row.id}
                className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-900/[0.06]">
                    {art?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {title}
                    </p>
                    {reg ? (
                      <p className="font-mono text-[10px] text-neutral-400">{reg}</p>
                    ) : null}
                    <p className="mt-1 text-[12px] text-neutral-500">
                      {row.artist_email}
                      {row.artist_name ? ` · ${row.artist_name}` : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {t("gallery.artworkAuth.sentPrefix")}{" "}
                      {formatSent(row.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <Badge
                    tone={
                      authenticated
                        ? "success"
                        : row.status === "pending"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {statusLabel}
                  </Badge>
                  {isAdmin && row.status === "pending" && row.invite_token ? (
                    <>
                      <button
                        type="button"
                        disabled={resendingId === row.id}
                        onClick={() => onResend(row.id)}
                        className="rounded-lg border border-neutral-900/10 bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-800 hover:bg-neutral-50"
                      >
                        {resendingId === row.id
                          ? t("common.sending")
                          : t("gallery.artworkAuth.resend")}
                      </button>
                      {linkUrl ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(linkUrl);
                              setCopiedId(row.id);
                              window.setTimeout(() => setCopiedId(null), 2000);
                            } catch {
                              // ignore
                            }
                          }}
                          className="rounded-lg border border-neutral-900/10 px-2.5 py-1 text-[10px] text-neutral-600"
                        >
                          {copiedId === row.id
                            ? t("gallery.invitations.copied")
                            : t("gallery.artworkAuth.copyLink")}
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
