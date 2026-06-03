import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import { fillMessage, translate } from "@/lib/locale-messages";
import type { AppLang } from "@/lib/request-locale";

export type ArtworkAuthenticationInvitationEmailParams = {
  galleryName: string;
  artworkTitle: string;
  registryId: string;
  inviteLink: string;
  recipientEmail: string;
  personalMessage?: string | null;
  lang?: AppLang;
};

export function artworkAuthenticationInvitationSubject(
  artworkTitle: string,
  lang: AppLang = "en"
): string {
  const t =
    artworkTitle.trim() || translate("gallery.email.fallback.artwork", lang);
  return fillMessage(translate("gallery.email.artworkAuth.subject", lang), {
    title: t,
  });
}

export function buildArtworkAuthenticationInvitationEmail(
  p: ArtworkAuthenticationInvitationEmailParams
): { subject: string; html: string; text: string } {
  const lang = p.lang ?? "en";
  const gName =
    p.galleryName.trim() || translate("gallery.email.fallback.institution", lang);
  const g = escapeHtml(gName);
  const titleRaw =
    p.artworkTitle.trim() || translate("gallery.email.fallback.artwork", lang);
  const title = escapeHtml(titleRaw);
  const reg = escapeHtml(p.registryId.trim());
  const recordDeepensOverTime = translate("representation.recordDeepensOverTime", lang);
  const note =
    p.personalMessage?.trim()
      ? escapeHtml(p.personalMessage.trim())
      : null;

  const registryLine = reg
    ? `<br/><span style="font-family:ui-monospace,monospace;font-size:12px;color:#525252;">${reg}</span>`
    : "";

  const layout: RrowmEmailLayoutOpts = {
    preheader: translate("gallery.email.artworkAuth.preheader", lang),
    blocks: [
      { type: "kicker", text: translate("gallery.email.artworkAuth.kicker", lang) },
      {
        type: "p",
        html: translate("gallery.email.artworkAuth.body1", lang),
      },
      {
        type: "p",
        html: fillMessage(translate("gallery.email.artworkAuth.body2", lang), {
          title: `<strong>${title}</strong>`,
          registryLine,
          galleryName: `<strong>${g}</strong>`,
        }),
      },
      { type: "hr" },
      {
        type: "p",
        html: fillMessage(translate("gallery.email.artworkAuth.body3", lang), {
          recordDeepensOverTime: escapeHtml(recordDeepensOverTime),
        }),
      },
      ...(note
        ? [
            {
              type: "p" as const,
              html: `<em>${fillMessage(
                translate("gallery.email.artworkAuth.noteFrom", lang),
                { galleryName: g }
              )}</em> ${note}`,
            },
          ]
        : []),
      {
        type: "p",
        html: translate("gallery.email.artworkAuth.body4", lang),
      },
    ],
    cta: {
      label: translate("gallery.email.artworkAuth.cta", lang),
      url: p.inviteLink,
    },
    footnoteHtml: translate("gallery.email.artworkAuth.footnote", lang),
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = artworkAuthenticationInvitationSubject(p.artworkTitle, lang);

  const text = [
    subject,
    "",
    translate("gallery.email.artworkAuth.body1", lang),
    "",
    `${titleRaw} · ${p.registryId}`,
    `${translate("gallery.email.fallback.institution", lang)}: ${gName}`,
    "",
    fillMessage(translate("gallery.email.artworkAuth.body3", lang), {
      recordDeepensOverTime,
    }),
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
