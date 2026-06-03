import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import { DELETION_GRACE_DAYS } from "@/lib/account-lifecycle/constants";

function formatDeletionDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function buildDeletionRequestedEmail(opts: {
  scheduledAt: string;
  restoreUrl: string;
}): { subject: string; html: string; text: string } {
  const date = formatDeletionDate(opts.scheduledAt);
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Your account deletion has been scheduled.",
    blocks: [
      { type: "kicker", text: "Account · Deletion requested" },
      {
        type: "p",
        html: `We received your request to permanently delete your RROWM account. Your account is now disabled and your profile is hidden.`,
      },
      {
        type: "p",
        html: `Your account is scheduled for permanent deletion on <strong>${escapeHtml(date)}</strong> (${DELETION_GRACE_DAYS}-day recovery window). Registry records required for provenance integrity may remain preserved in anonymised form.`,
      },
      {
        type: "p",
        html: `If you did not request this, or you change your mind, you may restore your account before the scheduled date.`,
      },
    ],
    cta: { label: "Restore account", url: opts.restoreUrl },
    footnoteHtml: `This link is single-use and expires when your recovery window ends.`,
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Account deletion requested";
  const text = [
    subject,
    "",
    `Scheduled for permanent deletion: ${date}`,
    "",
    `Restore: ${opts.restoreUrl}`,
  ].join("\n");
  return { subject, html: buildRrowmEmailHtml(inner, layout.preheader), text };
}

export function buildDeletionScheduledEmail(opts: {
  scheduledAt: string;
  restoreUrl: string;
}): { subject: string; html: string; text: string } {
  return buildDeletionRequestedEmail(opts);
}

export function buildAccountRestoredEmail(): { subject: string; html: string; text: string } {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Your RROWM account has been restored.",
    blocks: [
      { type: "kicker", text: "Account · Restored" },
      {
        type: "p",
        html: `Your account deletion has been cancelled. You may sign in and continue using RROWM.`,
      },
    ],
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Account restored";
  return {
    subject,
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [subject, "", "Your account has been restored."].join("\n"),
  };
}

export function buildAccountPermanentlyDeletedEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Your RROWM account has been permanently deleted.",
    blocks: [
      { type: "kicker", text: "Account · Permanently deleted" },
      {
        type: "p",
        html: `Your RROWM account and private profile data have been permanently removed. Registry records required to maintain provenance integrity may remain preserved in anonymised form.`,
      },
      {
        type: "p",
        html: `This action cannot be reversed.`,
      },
    ],
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Account permanently deleted";
  return {
    subject,
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [subject, "", "Your account has been permanently deleted."].join("\n"),
  };
}

export function buildDataExportReadyEmail(opts: {
  downloadUrl: string;
  expiresAt: string;
}): { subject: string; html: string; text: string } {
  const expires = formatDeletionDate(opts.expiresAt);
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Your RROWM data export is ready.",
    blocks: [
      { type: "kicker", text: "Privacy · Data export ready" },
      {
        type: "p",
        html: `Your personal data export is ready to download. The link expires on <strong>${escapeHtml(expires)}</strong>.`,
      },
    ],
    cta: { label: "Download export", url: opts.downloadUrl },
    footnoteHtml: `Do not share this link. It contains personal data.`,
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Your data export is ready";
  const text = [subject, "", `Download: ${opts.downloadUrl}`, "", `Expires: ${expires}`].join(
    "\n"
  );
  return { subject, html: buildRrowmEmailHtml(inner, layout.preheader), text };
}

export function buildAccountDeactivatedEmail(): { subject: string; html: string; text: string } {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Your RROWM account has been deactivated.",
    blocks: [
      { type: "kicker", text: "Account · Deactivated" },
      {
        type: "p",
        html: `Your account has been deactivated. You cannot sign in and your public profile is hidden. Registry ownership and records on file are preserved. You may reactivate by signing in and restoring your account from My Account.`,
      },
    ],
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Account deactivated";
  return {
    subject,
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [subject, "", "Your account has been deactivated."].join("\n"),
  };
}

export function buildOAuthReauthEmail(opts: {
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Confirm a sensitive account action.",
    blocks: [
      { type: "kicker", text: "Account · Verification required" },
      {
        type: "p",
        html: `Use the link below to verify your identity before completing a sensitive account action. The link is time-limited.`,
      },
    ],
    cta: { label: "Verify identity", url: opts.confirmUrl },
    footnoteHtml: `If you did not initiate this, take no action.`,
  };
  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = "RROWM · Verify your identity";
  return {
    subject,
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [subject, "", opts.confirmUrl].join("\n"),
  };
}
