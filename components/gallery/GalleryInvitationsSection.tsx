"use client";

import type { RefObject } from "react";
import { useMemo, useState } from "react";

import type { BadgeTone } from "@/components/ui/Badge";
import { inviteVisibilityStudioLabel } from "@/lib/representation-language";
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
function tableStatus(inv: GalleryInviteRow): {
  label: string;
  tone: BadgeTone;
} {
  const st = norm(inv.status);
  if (st === "declined") return { label: "Declined", tone: "muted" };
  if (isPendingExpired(inv)) return { label: "Expired", tone: "muted" };
  if (st === "pending") {
    return {
      label: inviteVisibilityStudioLabel("pending"),
      tone: "warning",
    };
  }
  const vis = norm(inv.visibility_status);
  if (vis === "public") {
    return {
      label: inviteVisibilityStudioLabel(vis),
      tone: "success",
    };
  }
  if (vis === "confirmed") {
    return {
      label: inviteVisibilityStudioLabel(vis),
      tone: "neutral",
    };
  }
  return {
    label: inviteVisibilityStudioLabel("pending"),
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
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
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
          <h1 className={workspace.panel.title}>Invitations</h1>
          <p className={workspace.panel.description}>
            Invite artists to authenticate records associated with their practice. The
            canonical artwork record exists independently; invitations deepen participant
            attestations — not gallery approval workflows.
          </p>
        </header>
      )}

      {sectionEyebrow ? (
        <div className="max-w-2xl">
          <h2 className="font-serif text-lg font-normal text-neutral-950">
            {sectionEyebrow}
          </h2>
          {sectionDescription ? (
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
              {sectionDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      <section aria-label="Send representation invitation" className={workspace.panel.shell}>
        {isAdmin ? (
          <div className="max-w-xl space-y-5">
            <label
              className="block text-[13px] font-medium text-neutral-800"
              htmlFor="gallery-invite-email"
            >
              Artist email
            </label>
            <input
              id="gallery-invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              placeholder="artist@example.com"
              autoComplete="email"
              className={fieldClass}
            />
            <p className="text-[13px] text-neutral-500">
              Sent as: <span className="font-medium text-neutral-800">{galleryName}</span>
            </p>
            <p className="text-[13px] leading-relaxed text-neutral-600">
              The artist receives a formal invitation to review and confirm records on
              file, referencing your institution.
            </p>

            {duplicateInviteActive ? (
              <p className="text-[13px] leading-relaxed text-neutral-800" role="status">
                An invitation is already pending for this address.
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
                        ? "Resending…"
                        : "Resend invitation"}
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
                {inviting ? "Sending…" : "Invite to authenticate"}
              </button>
            </div>

            {manualDraft ? (
              <div className="border-t border-neutral-200/90 pt-5">
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  If the invitation email could not be sent, you may copy a draft.
                </p>
                <button
                  type="button"
                  onClick={() => void onCopyManualDraft()}
                  className="mt-2 text-[12px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                >
                  {manualDraftCopyDone ? "Copied" : "Copy draft"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-neutral-600">
            Only administrators may send invitations.
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
          No invitations have been sent yet.
        </p>
      ) : (
        <div className={`overflow-x-auto ${workspace.panel.shell} !p-0`}>
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-neutral-900/[0.06] bg-white/60">
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  Artist
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-neutral-500">
                  Sent date
                </th>
                <th className="px-4 py-3 text-right text-[12px] font-medium text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => {
                const st = tableStatus(inv);
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
                            {busy ? "Sending…" : "Resend invitation"}
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
                            {copiedInviteId === inv.id ? "Copied" : "Copy invite link"}
                          </button>
                        ) : null}
                        {canPublish ? (
                          <button
                            type="button"
                            disabled={publishing}
                            onClick={() => void onMakeInvitePublic(inv.id)}
                            className="text-[13px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500 disabled:opacity-40"
                          >
                            {publishing ? "Publishing…" : "Publish"}
                          </button>
                        ) : null}
                        {!canCopyLink && !canResend && !canPublish ? (
                          <span className="text-[13px] text-neutral-400">—</span>
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
