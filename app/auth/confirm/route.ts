import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { PASSWORD_RESET_RETURN_PATH } from "@/lib/auth-callback-url";
import { resolvePostAuthRedirectPath } from "@/lib/post-auth-redirect";

/**
 * Handles Supabase email links that arrive with `token_hash` + `type` query params
 * (recovery, signup, email change) instead of PKCE `code`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const safeNext = sanitizeAuthReturnPath(nextParam);
  const isPasswordRecovery =
    type === "recovery" || safeNext === PASSWORD_RESET_RETURN_PATH;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon || !tokenHash || !type) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth_confirm");
    return NextResponse.redirect(loginUrl);
  }

  let destination =
    isPasswordRecovery ? PASSWORD_RESET_RETURN_PATH : safeNext ?? "/onboarding";

  const response = NextResponse.redirect(new URL(destination, origin));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (verifyError) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth_confirm");
    if (isPasswordRecovery) {
      loginUrl.searchParams.set("view", "forgot");
    }
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !isPasswordRecovery) {
    destination = await resolvePostAuthRedirectPath(supabase, user.id, {
      explicitNext: nextParam,
    });
  }

  const finalResponse = NextResponse.redirect(new URL(destination, origin));
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie);
  });

  return finalResponse;
}
