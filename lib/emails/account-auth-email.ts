/**
 * Auth-adjacent HTML for flows you control outside Supabase’s default templates.
 * Supabase-hosted confirmation emails are still edited in the project dashboard;
 * paste derived markup there if you want visual parity.
 */

import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";

export function buildPasswordResetEmail(opts: { actionUrl: string }): {
  html: string;
  text: string;
} {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Password reset request.",
    blocks: [
      { type: "kicker", text: "Account" },
      {
        type: "p",
        html: `A reset was requested for this account. Use the link once; it is time-limited. If you did not request it, ignore this message.`,
      },
    ],
    cta: { label: "Reset password", url: opts.actionUrl },
    footnoteHtml: `Do not share this link.`,
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  return {
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [
      "RROWM Registry · password reset",
      "",
      opts.actionUrl,
      "",
      "If you did not request this, disregard.",
    ].join("\n"),
  };
}

export function buildAccountSetupConfirmEmail(opts: {
  actionUrl: string;
  intentLabel: string;
}): { html: string; text: string } {
  const layout: RrowmEmailLayoutOpts = {
    preheader: "Account confirmation.",
    blocks: [
      { type: "kicker", text: "Account" },
      {
        type: "p",
        html: `Continue: <strong>${escapeHtml(opts.intentLabel)}</strong>. Link expires shortly.`,
      },
    ],
    cta: { label: "Continue", url: opts.actionUrl },
    footnoteHtml: `If this was not you, ignore.`,
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  return {
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text: [
      `RROWM Registry · ${opts.intentLabel}`,
      "",
      opts.actionUrl,
      "",
      "If unexpected, disregard.",
    ].join("\n"),
  };
}
