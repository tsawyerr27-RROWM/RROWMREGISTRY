import { timingSafeEqual } from "node:crypto";

/**
 * Authorises a Vercel cron (or manual) request against CRON_SECRET.
 *
 * Single source of truth — was previously copy-pasted into each cron route and
 * drifted. Fails CLOSED: if CRON_SECRET is unset the request is rejected in
 * every environment (the old helper returned `true` outside production, which
 * left preview deploys wide open). Constant-time compare avoids leaking the
 * secret via response timing.
 */
export function authorizeCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!header) return false;

  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
