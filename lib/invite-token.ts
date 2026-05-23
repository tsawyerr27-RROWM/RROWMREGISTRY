import { randomBytes } from "crypto";

/** Opaque single-use invitation token: 256-bit CSPRNG (hex). Not a JWT — no readable claims in the URL. */
export function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export function inviteExpiryDate(now = new Date(), days?: number): Date {
  const d = Number(process.env.INVITE_TOKEN_EXPIRY_DAYS);
  const resolved =
    typeof days === "number" ? days : Number.isFinite(d) && d > 0 ? d : 30;
  const t = now.getTime() + resolved * 24 * 60 * 60 * 1000;
  return new Date(t);
}
