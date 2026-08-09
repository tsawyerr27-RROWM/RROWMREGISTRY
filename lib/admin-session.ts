/**
 * Admin session tokens — signed, stateless, verifiable.
 *
 * The admin cookie used to be a random string that nothing validated: any
 * non-empty `rrowm_admin_session` value was accepted. These helpers replace
 * that with an HMAC-signed token so a forged or edited cookie is rejected.
 *
 * Uses Web Crypto (`crypto.subtle`) so the SAME verifier runs in both the
 * Node route handlers and the Edge middleware (proxy.ts). Do NOT switch to
 * `node:crypto` — it is unavailable in the Edge runtime.
 *
 * Token format: `<base64url(payload)>.<base64url(hmac)>`
 * payload = JSON { sub:"admin", iat:<sec>, exp:<sec> }
 */

const ENC = new TextEncoder();
const DEC = new TextDecoder();

export const ADMIN_SESSION_MAX_AGE_S = 60 * 60 * 8; // 8 hours

type AdminTokenPayload = {
  sub: "admin";
  iat: number;
  exp: number;
};

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(text: string): Uint8Array {
  const pad = text.length % 4 === 0 ? "" : "=".repeat(4 - (text.length % 4));
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    ENC.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return null;
  return secret;
}

/** Constant-time byte comparison. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Sign a fresh admin token. Returns null if ADMIN_SESSION_SECRET is unset —
 * callers must treat that as "admin auth not configured" (503), never as success.
 */
export async function signAdminToken(
  now = Date.now()
): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const iatSec = Math.floor(now / 1000);
  const payload: AdminTokenPayload = {
    sub: "admin",
    iat: iatSec,
    exp: iatSec + ADMIN_SESSION_MAX_AGE_S,
  };
  const payloadBytes = ENC.encode(JSON.stringify(payload));
  const payloadB64 = base64urlEncode(payloadBytes);

  const key = await importKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, ENC.encode(payloadB64))
  );
  return `${payloadB64}.${base64urlEncode(sig)}`;
}

/**
 * Verify an admin token. Returns the payload on success, null on any failure
 * (missing secret, malformed token, bad signature, expired). Fails closed.
 */
export async function verifyAdminToken(
  token: string | undefined | null,
  now = Date.now()
): Promise<AdminTokenPayload | null> {
  const secret = getSecret();
  if (!secret || !token) return null;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;

  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  let expectedSig: Uint8Array;
  let providedSig: Uint8Array;
  try {
    const key = await importKey(secret);
    expectedSig = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, ENC.encode(payloadB64))
    );
    providedSig = base64urlDecode(sigB64);
  } catch {
    return null;
  }

  if (!timingSafeEqual(expectedSig, providedSig)) return null;

  let payload: AdminTokenPayload;
  try {
    payload = JSON.parse(DEC.decode(base64urlDecode(payloadB64)));
  } catch {
    return null;
  }

  if (payload.sub !== "admin") return null;
  if (typeof payload.exp !== "number" || payload.exp * 1000 <= now) return null;

  return payload;
}
