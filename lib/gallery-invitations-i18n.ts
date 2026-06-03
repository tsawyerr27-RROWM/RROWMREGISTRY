import type { MessageKey } from "@/lib/locale-messages";

type Translate = (key: MessageKey) => string;

export function inviteVisibilityLabel(
  visibility: string | null | undefined,
  t: Translate
): string {
  const v = String(visibility ?? "")
    .toLowerCase()
    .trim();
  if (v === "public") return t("representation.publicParticipationOnFile");
  if (v === "confirmed") return t("representation.representationOnFile");
  return t("representation.artistAttestationMayDeepen");
}

export function artworkAuthInviteStatusLabel(
  row: Pick<{ status: string; token_expires_at?: string | null }, "status" | "token_expires_at">,
  t: Translate
): string {
  const st = String(row.status || "").toLowerCase();
  if (st === "authenticated") return t("gallery.artworkAuth.statusAuthenticated");
  if (st === "cancelled") return t("gallery.artworkAuth.statusWithdrawn");
  if (st === "expired") return t("gallery.artworkAuth.statusExpired");
  if (st === "pending" && row.token_expires_at) {
    const expires = new Date(row.token_expires_at).getTime();
    if (Number.isFinite(expires) && expires < Date.now()) {
      return t("gallery.artworkAuth.statusExpired");
    }
  }
  return t("gallery.artworkAuth.statusAwaiting");
}
