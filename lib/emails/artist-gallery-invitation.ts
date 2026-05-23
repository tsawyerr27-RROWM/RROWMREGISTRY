import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import {
  artistGalleryInvitationSubject,
  CANONICAL_RECORD_PHRASES,
} from "@/lib/representation-language";

export type ArtistInvitationEmailParams = {
  /** Display name from `galleries.name` (server-resolved). */
  galleryName: string;
  /** Absolute signup URL including `invite_token` query. */
  inviteLink: string;
  galleryPublicPageUrl?: string;
  recipientEmail: string;
};

export { artistGalleryInvitationSubject };

export function buildArtistInvitationEmail(p: ArtistInvitationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const g = escapeHtml(p.galleryName.trim() || "An institution");

  const layout: RrowmEmailLayoutOpts = {
    preheader: CANONICAL_RECORD_PHRASES.inviteAuthenticateRecord,
    blocks: [
      { type: "kicker", text: "Canonical record · Participant attestation" },
      {
        type: "p",
        html: `<strong>${g}</strong> participates in chronology on file for works associated with your practice. ${escapeHtml(CANONICAL_RECORD_PHRASES.inviteRecordExists)}. You are invited to authenticate authorship and deepen the documentary record — not to approve an institution upload.`,
      },
      { type: "hr" },
      {
        type: "p",
        html: `After you join: review the canonical record, authenticate authorship, add artist-authored detail, and contribute continuity events. ${escapeHtml(CANONICAL_RECORD_PHRASES.recordDeepensOverTime)}.`,
      },
      {
        type: "p",
        html: `The link is for this address only, single use, and expires as set in the invitation record.`,
      },
    ],
    cta: { label: "Authenticate & join", url: p.inviteLink },
    footnoteHtml:
      `If this was not intended for you, take no action. Do not forward the link.` +
      (p.galleryPublicPageUrl
        ? `<br/><br/>Reference: ${escapeHtml(p.galleryPublicPageUrl)}`
        : ""),
  };

  const inner = rrowmEmailInnerFromOpts(layout);

  const gn = p.galleryName.trim() || "Institution";
  const text = [
    artistGalleryInvitationSubject(p.galleryName),
    "",
    `${gn} participates in chronology for works associated with your practice.`,
    "",
    CANONICAL_RECORD_PHRASES.inviteRecordExists,
    CANONICAL_RECORD_PHRASES.inviteAuthenticateRecord,
    "",
    "Authenticate & join (single-use link):",
    p.inviteLink,
    "",
    `Register using this email only: ${p.recipientEmail}`,
    "",
    p.galleryPublicPageUrl ? `Reference: ${p.galleryPublicPageUrl}` : "",
    "",
    "If this message was sent in error, disregard it.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: artistGalleryInvitationSubject(p.galleryName),
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text,
  };
}
