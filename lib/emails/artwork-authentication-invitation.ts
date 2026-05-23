import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";

export type ArtworkAuthenticationInvitationEmailParams = {
  galleryName: string;
  artworkTitle: string;
  registryId: string;
  inviteLink: string;
  recipientEmail: string;
  personalMessage?: string | null;
};

export function artworkAuthenticationInvitationSubject(artworkTitle: string): string {
  const t = artworkTitle.trim() || "Artwork";
  return `Authenticate artwork record on file · ${t}`;
}

export function buildArtworkAuthenticationInvitationEmail(
  p: ArtworkAuthenticationInvitationEmailParams
): { subject: string; html: string; text: string } {
  const g = escapeHtml(p.galleryName.trim() || "An institution");
  const title = escapeHtml(p.artworkTitle.trim() || "Work on file");
  const reg = escapeHtml(p.registryId.trim());
  const note =
    p.personalMessage?.trim()
      ? escapeHtml(p.personalMessage.trim())
      : null;

  const layout: RrowmEmailLayoutOpts = {
    preheader:
      "Review, authenticate, and deepen a canonical artwork record on file.",
    blocks: [
      { type: "kicker", text: "Artwork record · Continuity invitation" },
      {
        type: "p",
        html: `An artwork associated with your practice is already on file within the registry.`,
      },
      {
        type: "p",
        html: `<strong>${title}</strong>${reg ? `<br/><span style="font-family:ui-monospace,monospace;font-size:12px;color:#525252;">${reg}</span>` : ""}<br/>Filed with continuity participation from <strong>${g}</strong>.`,
      },
      { type: "hr" },
      {
        type: "p",
        html: `You are invited to review, authenticate authorship, and deepen the documentary record — ${escapeHtml(CANONICAL_RECORD_PHRASES.recordDeepensOverTime.toLowerCase())}. This is not an approval request or onboarding task for the institution.`,
      },
      ...(note
        ? [
            {
              type: "p" as const,
              html: `<em>Note from ${g}:</em> ${note}`,
            },
          ]
        : []),
      {
        type: "p",
        html: `The link is for this address only and expires as set in the invitation record.`,
      },
    ],
    cta: { label: "Review artwork record", url: p.inviteLink },
    footnoteHtml: `If this was not intended for you, take no action. Do not forward the link.`,
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = artworkAuthenticationInvitationSubject(p.artworkTitle);

  const text = [
    subject,
    "",
    "An artwork associated with your practice is already on file within the registry.",
    "",
    `${p.artworkTitle.trim() || "Work"} · ${p.registryId}`,
    `Institution: ${p.galleryName.trim() || "Institution"}`,
    "",
    "You are invited to review, authenticate authorship, and deepen the record.",
    note ? `\nNote: ${p.personalMessage?.trim()}` : "",
    "",
    p.inviteLink,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html: buildRrowmEmailHtml(inner),
    text,
  };
}
