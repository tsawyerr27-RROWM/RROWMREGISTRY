"use client";

import type { RefObject } from "react";
import { useMemo, useState } from "react";

import type { BadgeTone } from "@/components/ui/Badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { inviteVisibilityLabel } from "@/lib/gallery-invitations-i18n";
import type { MessageKey } from "@/lib/locale-messages";
import { Badge } from "@/components/ui/Badge";
import { workspace } from "@/styles/workspace-design";

export type GalleryInviteRow = {
  id: string;
  artist_email: string;
  status: string;
  created_at: string;
  visibility_status?: string | null;
  token_expires_at?: string | null;
  accepted_user_id?: string | null;
  invite_token?: string | null;
};

function norm(s: string | null | undefined) {
  return String(s || "")
    .toLowerCase()
    .trim();
}

function isPendingExpired(inv: GalleryInviteRow): boolean {
  if (norm(inv.status) !== "pending") return false;
  const raw = inv.token_expires_at;
  if (!raw) return false;
  const t = new Date(String(raw)).getTime();
  return Number.isFinite(t) && t < Date.now();
}

/** Table status: pending | confirmed | public | expired (plus declined when applicable). */
function tableStatus(
  inv: GalleryInviteRow,
  t: (key: MessageKey) => string
): {
  label: string;
  tone: BadgeTone;
} {
  const st = norm(inv.status);
  if (st === "declined") return { label: t("gallery.invitations.statusDeclined"), tone: "muted" };
  if (isPendingExpired(inv)) {
    return { label: t("gallery.artworkAuth.statusExpired"), tone: "muted" };
  }
  if (st === "pending") {
    return {
      label: inviteVisibilityLabel("pending", t),
      tone: "warning",
    };
  }
  const vis = norm(inv.visibility_status);
  if (vis === "public") {
    return {
      label: inviteVisibilityLabel(vis, t),
      tone: "success",
    };
  }
  if (vis === "confirmed") {
    return {
      label: inviteVisibilityLabel(vis, t),
      tone: "neutral",
    };
  }
  return {
    label: inviteVisibilityLabel("pending", t),
    tone: "warning",
  };
}

function inviteSignupUrl(registrySiteUrl: string, token: string | null | undefined) {
  const t = String(token || "").trim();
  if (!t) return null;
  const base = String(registrySiteUrl || "").replace(/\/$/, "");
  if (!base) return null;
  return `${base}/signup?invite_token=${encodeURIComponent(t)}`;
}

function formatSentDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "–";
  }
}

const badgeClass =
  "normal-case tracking-normal px-2 py-0.5 text-[11px] font-medium leading-tight";

const fieldClass = workspace.modal.field;

type Props = {
  galleryName: string;
  registrySiteUrl: string;
  invites: GalleryInviteRow[];
  isAdmin: boolean;
  inviteEmail: string;
  onInviteEmailChange: (v: string) => void;
  inviting: boolean;
  onSendInvite: () => void;
  resendingInviteId: string | null;
  onResendInvite: (inviteId: string) => void;
  inviteError: string | null;
  inviteMessage: string | null;
  duplicateInviteActive: boolean;
  duplicateResendInviteId: string | null;
  manualDraft: string;
  manualDraftCopyDone: boolean;
  onCopyManualDraft: () => void;
  sectionRef?: RefObject<HTMLDivElement | null>;
  publishingPublicInviteId?: string | null;
  onMakeInvitePublic?: (inviteId: string) => void | Promise<void>;
  invitePublishError?: string | null;
  /** When nested inside GalleryInvitationsHub */
  hidePageHeader?: boolean;
  sectionEyebrow?: string;
  sectionDescription?: string;
};

export function GalleryInvitationsSection({
  galleryName,
  registrySiteUrl,
  invites,
  isAdmin,
  inviteEmail,
  onInviteEmailChange,
  inviting,
  onSendInvite,
  resendingInviteId,
  onResendInvite,
  inviteError,
  inviteMessage,
  duplicateInviteActive,
  duplicateResendInviteId,
  manualDraft,
  manualDraftCopyDone,
  onCopyManualDraft,
  sectionRef,
  publishingPublicInviteId = null,
  onMakeInvitePublic,
  invitePublishError = null,
  hidePageHeader = false,
  sectionEyebrow,
  sectionDescription,
}: Props) {
  const { t } = useLocalePreferences();
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const sendDisabled = useMemo(
    () =>
      inviting ||
      !inviteEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim()) ||
      duplicateInviteActive,
    [inviting, inviteEmail, duplicateInviteActive]
  );

  return (
    <div
      ref={hidePageHeader ? undefined : sectionRef}
      id={hidePageHeader ? undefined : "gallery-invitations"}
      className={hidePageHeader ? "space-y-10" : "scroll-mt-20 space-y-10 text-neutral-900"}
    >
      {hidePageHeader ? null : (
        <header className={`max-w-2xl ${workspace.panel.shell} !p-6 md:!p-8`}>
          <InfoTooltip text={t("gallery.invitations.sectionTooltip")} />
          <h1 className={workspace.panel.title}>{t("gallery.nav.invitations")}</h1>
        </header>
      )}

      {sectionEyebrow ? (
        <div className="max-w-2xl">
          {sectionDescription ? (
            <InfoTooltip text={sectionDescription} />
          ) : null}
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            {sectionEyebrow}
          </h2>
        </div>
      ) : null}

      <section
        aria-label={t("gallery.invitations.sendRepresentationLabel")}
        className={workspace.panel.shell}
      >
        {isAdmin ? (
          <div className="max-w-xl space-y-5">
            <label
              className="block text-[13px] font-medium text-neutral-800"
              htmlFor="gallery-invite-email"
            >
              {t("gallery.invitations.artistEmail")}
            </label>
            <input
              id="gallery-invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              placeholder={t("gallery.invitations.emailPlaceholder")}
              autoComplete="email"
              className={fieldClass}
            />
            <p className="text-[13px] text-neutral-500">
              {t("gallery.invitations.sentAs")}{" "}
              <span className="font-medium text-neutral-800">{galleryName}</span>
            </p>
            <p className="text-[13px] leading-relaxed text-neutral-600">
              {t("gallery.invitations.representationBody")}
            </p>

            {duplicateInviteActive ? (
              <p className="text-[13px] leading-relaxed text-neutral-800" role="status">
                {t("gallery.invitations.duplicatePending")}
                {duplicateResendInviteId ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      disabled={resendingInviteId === duplicateResendInviteId}
                      onClick={() => void onResendInvite(duplicateResendInviteId)}
                      className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 disabled:opacity-50"
                    >
                      {resendingInviteId === duplicateResendInviteId
                        ? t("common.sending")
                        : t("gallery.invitations.resend")}
                    </button>
                  </>
                ) : null}
              </p>
            ) : null}

            {inviteError ? (
              <p className="text-[13px] text-red-800" role="alert">
                {inviteError}
              </p>
            ) : null}
            {inviteMessage ? (
              <p className="text-[13px] font-medium text-neutral-800" role="status">
                {inviteMessage}
              </p>
            ) : null}

            <div>
              <button
                type="button"
                disabled={sendDisabled}
                onClick={() => void onSendInvite()}
                className="rounded-md border border-neutral-900/20 bg-neutral-950 px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {inviting
                  ? t("common.sending")
                  : t("gallery.hero.inviteToAuthenticate")}
              </button>
            </div>

            {manualDraft ? (
              <div className="border-t border-neutral-200/90 pt-5">
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  {t("gallery.invitations.manualDraftHint")}
                </p>
                <button
                  type="button"
                  onClick={() => void onCopyManualDraft()}
                  className="mt-2 text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                >
                  {manualDraftCopyDone
                    ? t("gallery.invitations.copied")
                    : t("gallery.invitations.copyDraft")}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-neutral-600">
            {t("gallery.invitations.adminOnly")}
          </p>
        )}
      </section>

      {invitePublishError ? (
        <p className="text-[13px] text-red-800" role="alert">
          {invitePublishError}
        </p>
      ) : null}

      {invites.length === 0 ? (
        <p className="text-[15px] text-neutral-600">
          {t("gallery.invitations.noneSent")}
        </p>
      ) : (
        <div className={`overflow-x-auto ${workspace.panel.shell} !p-0`}>
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-neutral-900/[0.06] bg-white/60">
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  {t("gallery.invitations.colArtist")}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  {t("gallery.invitations.colStatus")}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  {t("gallery.invitations.colSentDate")}
                </th>
                <th className="px-4 py-3 text-right text-[12px] font-medium text-neutral-500">
                  {t("gallery.invitations.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => {
                const st = tableStatus(inv, t);
                const canResend = isAdmin && norm(inv.status) === "pending";
                const busy = resendingInviteId === inv.id;
                const canCopyLink =
                  isAdmin &&
                  norm(inv.status) === "pending" &&
                  Boolean(inviteSignupUrl(registrySiteUrl, inv.invite_token));
                const signupUrl = inviteSignupUrl(registrySiteUrl, inv.invite_token);
                const canPublish =
                  isAdmin &&
                  norm(inv.status) === "accepted" &&
                  norm(inv.visibility_status) === "confirmed" &&
                  typeof onMakeInvitePublic === "function";
                const publishing = publishingPublicInviteId === inv.id;

                return (
                  <tr
                    key={inv.id}
                    className="border-b border-neutral-100 last:border-b-0"
                  >
                    <td className="px-4 py-3.5 text-[13px] text-neutral-900">
                      {inv.artist_email}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={st.tone} className={badgeClass}>
                        {st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] tabular-nums text-neutral-600">
                      {formatSentDate(inv.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                        {canResend ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onResendInvite(inv.id)}
                            className="text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 disabled:opacity-40"
                          >
                            {busy ? t("common.sending") : t("gallery.invitations.resend")}
                          </button>
                        ) : null}
                        {canCopyLink && signupUrl ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(signupUrl);
                                setCopiedInviteId(inv.id);
                                window.setTimeout(() => setCopiedInviteId(null), 2000);
                              } catch {
                                /* ignore */
                              }
                            }}
                            className="text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                          >
                            {copiedInviteId === inv.id
                              ? t("gallery.invitations.copied")
                              : t("gallery.invitations.copyInviteLink")}
                          </button>
                        ) : null}
                        {canPublish ? (
                          <button
                            type="button"
                            disabled={publishing}
                            onClick={() => void onMakeInvitePublic(inv.id)}
                            className="text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 disabled:opacity-40"
                          >
                            {publishing
                              ? t("gallery.invitations.publishing")
                              : t("gallery.invitations.publish")}
                          </button>
                        ) : null}
                        {!canCopyLink && !canResend && !canPublish ? (
                          <span className="text-[13px] text-neutral-400">–</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
