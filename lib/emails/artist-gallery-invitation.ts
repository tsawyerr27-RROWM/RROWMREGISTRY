import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import { fillMessage, translate } from "@/lib/locale-messages";
import type { AppLang } from "@/lib/request-locale";

export type ArtistInvitationEmailParams = {
  /** Display name from `galleries.name` (server-resolved). */
  galleryName: string;
  /** Absolute signup URL including `invite_token` query. */
  inviteLink: string;
  galleryPublicPageUrl?: string;
  recipientEmail: string;
  lang?: AppLang;
};

export function artistGalleryInvitationSubject(
  galleryName: string,
  lang: AppLang = "en"
): string {
  const name = galleryName.trim() || translate("gallery.email.fallback.gallery", lang);
  return fillMessage(translate("gallery.email.artistInvite.subject", lang), {
    galleryName: name,
  });
}

export function buildArtistInvitationEmail(p: ArtistInvitationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const lang = p.lang ?? "en";
  const gName =
    p.galleryName.trim() || translate("gallery.email.fallback.institution", lang);
  const g = escapeHtml(gName);
  const inviteRecordExists = translate("representation.inviteRecordExists", lang);
  const recordDeepensOverTime = translate("representation.recordDeepensOverTime", lang);

  const layout: RrowmEmailLayoutOpts = {
    preheader: translate("gallery.email.artistInvite.preheader", lang),
    blocks: [
      { type: "kicker", text: translate("gallery.email.artistInvite.kicker", lang) },
      {
        type: "p",
        html: fillMessage(translate("gallery.email.artistInvite.body1", lang), {
          galleryName: `<strong>${g}</strong>`,
          inviteRecordExists: escapeHtml(inviteRecordExists),
        }),
      },
      { type: "hr" },
      {
        type: "p",
        html: fillMessage(translate("gallery.email.artistInvite.body2", lang), {
          recordDeepensOverTime: escapeHtml(recordDeepensOverTime),
        }),
      },
      {
        type: "p",
        html: translate("gallery.email.artistInvite.body3", lang),
      },
    ],
    cta: {
      label: translate("gallery.email.artistInvite.cta", lang),
      url: p.inviteLink,
    },
    footnoteHtml:
      translate("gallery.email.artistInvite.footnote", lang) +
      (p.galleryPublicPageUrl
        ? `<br/><br/>Reference: ${escapeHtml(p.galleryPublicPageUrl)}`
        : ""),
  };

  const inner = rrowmEmailInnerFromOpts(layout);

  const text = [
    artistGalleryInvitationSubject(p.galleryName, lang),
    "",
    fillMessage(translate("gallery.email.artistInvite.textIntro", lang), {
      galleryName: gName,
    }),
    "",
    inviteRecordExists,
    translate("gallery.email.artistInvite.preheader", lang),
    "",
    translate("gallery.email.artistInvite.textLink", lang),
    p.inviteLink,
    "",
    fillMessage(translate("gallery.email.artistInvite.textRegister", lang), {
      email: p.recipientEmail,
    }),
    "",
    p.galleryPublicPageUrl ? `Reference: ${p.galleryPublicPageUrl}` : "",
    "",
    translate("gallery.email.artistInvite.textDisregard", lang),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: artistGalleryInvitationSubject(p.galleryName, lang),
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text,
  };
}
