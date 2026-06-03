import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const ACCOUNT_CSRF_COOKIE = "rrowm_account_csrf";

export async function issueAccountCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(ACCOUNT_CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return token;
}

export async function validateAccountCsrf(req: Request): Promise<boolean> {
  const header = req.headers.get("x-csrf-token")?.trim();
  if (!header) return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ACCOUNT_CSRF_COOKIE)?.value;
  return Boolean(cookie && cookie === header);
}
