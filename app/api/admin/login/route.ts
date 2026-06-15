import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD?.trim();

    if (!envUser || !envPass) {
      return NextResponse.json(
        { error: "Admin access is not configured." },
        { status: 503 }
      );
    }

    const usernameMatch =
      username.toLowerCase() === envUser.toLowerCase();
    const passwordMatch = password === envPass;

    if (!usernameMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = generateSessionToken();
    const maxAge = 60 * 60 * 8; // 8 hours

    const response = NextResponse.json({ ok: true });
    response.cookies.set("rrowm_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[admin/login]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
