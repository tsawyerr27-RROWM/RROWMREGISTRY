import { translate, type MessageKey } from "@/lib/locale-messages";
import type { AppLang } from "@/lib/request-locale";

export type GalleryApiErrorKey =
  | "gallery.api.invalidJson"
  | "gallery.api.invalidBody"
  | "gallery.api.unauthorized"
  | "gallery.api.missingGalleryId"
  | "gallery.api.invalidArtistEmail"
  | "gallery.api.inviteAdminOnly"
  | "gallery.api.resendAdminOnly"
  | "gallery.api.couldNotLoadGallery"
  | "gallery.api.galleryNotFound"
  | "gallery.api.couldNotVerifyInviteState"
  | "gallery.api.alreadyInvited"
  | "gallery.api.couldNotRecordInvite"
  | "gallery.api.missingInviteId"
  | "gallery.api.inviteNotFound"
  | "gallery.api.inviteNotPending"
  | "gallery.api.missingArtworkId"
  | "gallery.api.artworkNotFound"
  | "gallery.api.noInstitutionContext"
  | "gallery.api.emailCreatedFailed"
  | "gallery.api.emailUpdatedFailed"
  | "gallery.api.notAuthorisedInstitution"
  | "gallery.api.artworkAuthDuplicatePending"
  | "gallery.api.artworkAuthAlreadyCompleted";

const KEYS: Record<GalleryApiErrorKey, MessageKey> = {
  "gallery.api.invalidJson": "gallery.api.invalidJson",
  "gallery.api.invalidBody": "gallery.api.invalidBody",
  "gallery.api.unauthorized": "gallery.api.unauthorized",
  "gallery.api.missingGalleryId": "gallery.api.missingGalleryId",
  "gallery.api.invalidArtistEmail": "gallery.api.invalidArtistEmail",
  "gallery.api.inviteAdminOnly": "gallery.api.inviteAdminOnly",
  "gallery.api.resendAdminOnly": "gallery.api.resendAdminOnly",
  "gallery.api.couldNotLoadGallery": "gallery.api.couldNotLoadGallery",
  "gallery.api.galleryNotFound": "gallery.api.galleryNotFound",
  "gallery.api.couldNotVerifyInviteState": "gallery.api.couldNotVerifyInviteState",
  "gallery.api.alreadyInvited": "gallery.api.alreadyInvited",
  "gallery.api.couldNotRecordInvite": "gallery.api.couldNotRecordInvite",
  "gallery.api.missingInviteId": "gallery.api.missingInviteId",
  "gallery.api.inviteNotFound": "gallery.api.inviteNotFound",
  "gallery.api.inviteNotPending": "gallery.api.inviteNotPending",
  "gallery.api.missingArtworkId": "gallery.api.missingArtworkId",
  "gallery.api.artworkNotFound": "gallery.api.artworkNotFound",
  "gallery.api.noInstitutionContext": "gallery.api.noInstitutionContext",
  "gallery.api.emailCreatedFailed": "gallery.api.emailCreatedFailed",
  "gallery.api.emailUpdatedFailed": "gallery.api.emailUpdatedFailed",
  "gallery.api.notAuthorisedInstitution": "gallery.api.notAuthorisedInstitution",
  "gallery.api.artworkAuthDuplicatePending": "gallery.api.artworkAuthDuplicatePending",
  "gallery.api.artworkAuthAlreadyCompleted": "gallery.api.artworkAuthAlreadyCompleted",
};

export function galleryApiError(key: GalleryApiErrorKey, lang: AppLang): string {
  return translate(KEYS[key], lang);
}
