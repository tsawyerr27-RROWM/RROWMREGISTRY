import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";

export type ArtistVerifiedGalleryNotifyParams = {
  galleryName: string;
  artistDisplayName: string;
  dashboardUrl?: string;
  recipientEmails: string[];
};

export function artistVerifiedGallerySubject(
  galleryName: string,
  artistName: string
): string {
  const g = galleryName.trim() || "Institution";
  const a = artistName.trim() || "Artist";
  return `${g}: ${a} · onboarding complete`;
}

export function buildArtistVerifiedGalleryEmail(p: ArtistVerifiedGalleryNotifyParams): {
  subject: string;
  html: string;
  text: string;
} {
  const g = escapeHtml(p.galleryName.trim() || "Your institution");
  const a = escapeHtml(p.artistDisplayName.trim() || "Artist");

  const layout: RrowmEmailLayoutOpts = {
    preheader: `Artist onboarding complete.`,
    blocks: [
      { type: "kicker", text: "Notice" },
      {
        type: "p",
        html: `<strong>${a}</strong> has completed onboarding and is linked to <strong>${g}</strong> in the registry. Representation is recorded accordingly.`,
      },
      {
        type: "p",
        html: `Public roster visibility follows artist opt-in and your published profile settings.`,
      },
    ],
    cta:
      p.dashboardUrl && p.dashboardUrl.length > 0
        ? { label: "Open workspace", url: p.dashboardUrl }
        : undefined,
    footnoteHtml: `Automated notice.`,
  };

  const inner = rrowmEmailInnerFromOpts(layout);

  const text = [
    `${p.galleryName.trim() || "Institution"}: ${p.artistDisplayName.trim() || "Artist"} · onboarding complete`,
    "",
    "The artist has finished onboarding and is linked to your institution in the registry.",
    "",
    "Public listing depends on visibility settings and artist choice.",
    "",
    p.dashboardUrl ? p.dashboardUrl : "",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: artistVerifiedGallerySubject(p.galleryName, p.artistDisplayName),
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text,
  };
}
