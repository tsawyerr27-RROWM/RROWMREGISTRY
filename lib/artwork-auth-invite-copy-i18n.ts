import { translate, type MessageKey } from "@/lib/locale-messages";
import type { Region } from "@/lib/regions";

type Lang = Region["lang"];

const COPY_KEYS = {
  modalTitle: "gallery.artworkAuth.modalTitle",
  modalLead: "gallery.artworkAuth.modalLead",
  modalOutcome: "gallery.artworkAuth.modalOutcome",
  ctaSend: "gallery.artworkAuth.ctaSend",
  representationSectionTitle: "gallery.invitations.representationSectionTitle",
  representationSectionDesc: "gallery.invitations.representationSectionDesc",
  artworkSectionTitle: "gallery.artworkAuth.sectionTitle",
  artworkSectionDescIntro: "gallery.artworkAuth.sectionDescIntro",
} as const satisfies Record<string, MessageKey>;

export type LocalizedArtworkAuthInviteCopy = {
  [K in keyof typeof COPY_KEYS]: string;
};

export function getArtworkAuthInviteCopy(lang: Lang): LocalizedArtworkAuthInviteCopy {
  return {
    modalTitle: translate(COPY_KEYS.modalTitle, lang),
    modalLead: translate(COPY_KEYS.modalLead, lang),
    modalOutcome: translate(COPY_KEYS.modalOutcome, lang),
    ctaSend: translate(COPY_KEYS.ctaSend, lang),
    representationSectionTitle: translate(COPY_KEYS.representationSectionTitle, lang),
    representationSectionDesc: translate(COPY_KEYS.representationSectionDesc, lang),
    artworkSectionTitle: translate(COPY_KEYS.artworkSectionTitle, lang),
    artworkSectionDescIntro: translate(COPY_KEYS.artworkSectionDescIntro, lang),
  };
}

export function resolveArtworkAuthInviteLang(
  acceptLanguage: string | null,
  langParam: string | null
): Lang {
  const raw = String(langParam || acceptLanguage || "")
    .toLowerCase()
    .trim();
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("ja")) return "ja";
  return "en";
}
