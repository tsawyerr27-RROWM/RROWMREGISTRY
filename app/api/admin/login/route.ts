import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_MAX_AGE_S, signAdminToken } from "@/lib/admin-session";
import { checkRegistryActionRateLimit } from "@/lib/registry-action-security/rate-limit";

export const runtime = "nodejs";

/** Constant-time string compare that does not leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Best-effort client IP for rate-limiting. */
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Admin-only sign-in endpoint.
 * Validates credentials against ADMIN_USERNAME + ADMIN_PASSWORD env vars,
 * then issues a short-lived httpOnly session cookie (`rrowm_admin_session`).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Throttle brute force: 10 attempts per IP per 5 minutes.
    const allowed = await checkRegistryActionRateLimit(
      "admin_login",
      clientIp(req),
      10,
      300
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait and try again." },
        { status: 429 }
      );
    }

    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD?.trim();

    if (!envUser || !envPass) {
      return NextResponse.json(
        { error: "Admin access is not configured." },
        { status: 503 }
      );
    }

    // Constant-time compare both fields to avoid leaking them via timing.
    // Evaluate both regardless of the first result (no short-circuit).
    const usernameMatch = safeEqual(username.toLowerCase(), envUser.toLowerCase());
    const passwordMatch = safeEqual(password, envPass);

    if (!usernameMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await signAdminToken();
    if (!token) {
      return NextResponse.json(
        { error: "Admin access is not configured." },
        { status: 503 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("rrowm_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_S,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[admin/login]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
