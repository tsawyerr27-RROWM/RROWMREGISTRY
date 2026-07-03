/** Low-friction UX hint — not a secrecy guarantee for targeted attacks. */
export function maskArtistInviteEmail(email: string): string {
  const e = String(email || "").trim().toLowerCase();
  const at = e.indexOf("@");
  if (at < 1) return "-";
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!domain) return "-";
  const hint =
    local.length <= 1
      ? "•••"
      : local.length === 2
        ? `${local[0]}•`
        : `${local[0]}•••${local[local.length - 1]!}`;
  return `${hint}@${domain}`;
}
