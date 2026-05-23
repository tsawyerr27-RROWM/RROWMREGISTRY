"use client";

import type { RefObject } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import {
  type ArtworkAuthenticationInviteRow,
  artworkAuthenticationInviteStatusLabel,
  buildArtworkAuthenticationInviteUrl,
} from "@/lib/artwork-authentication-invite";
import { ARTWORK_AUTH_INVITE_COPY } from "@/lib/artwork-authentication-invite";
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
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return "—";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <section
      aria-label={ARTWORK_AUTH_INVITE_COPY.artworkSectionTitle}
      className={workspace.panel.shell}
    >
      <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
        {ARTWORK_AUTH_INVITE_COPY.artworkSectionTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-neutral-600">
        {ARTWORK_AUTH_INVITE_COPY.artworkSectionDesc}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-emerald-900/90" role="status">
          {message}
        </p>
      ) : null}

      {invites.length === 0 ? (
        <p className="mt-6 text-[13px] text-neutral-500">
          No artwork authentication invitations yet. From Works, use{" "}
          <span className="font-medium text-neutral-700">
            Invite artist to authenticate
          </span>{" "}
          on a registered record.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-900/[0.06]">
          {invites.map((row) => {
            const art = artFromRow(row);
            const title = art?.title?.trim() || "Untitled work";
            const reg = art?.registry_id?.trim();
            const statusLabel = artworkAuthenticationInviteStatusLabel(row);
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
                      Sent {formatSent(row.created_at)}
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
                        {resendingId === row.id ? "Sending…" : "Resend"}
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
                          {copiedId === row.id ? "Copied" : "Copy link"}
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
