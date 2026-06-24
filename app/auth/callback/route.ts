import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import { PASSWORD_RESET_RETURN_PATH } from "@/lib/auth-callback-url";
import { resolvePostAuthRedirectPath } from "@/lib/post-auth-redirect";

/**
 * Supabase PKCE callback — exchanges `code` for a session cookie, then redirects.
 * Used by email confirmation, magic links, and password recovery.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const safeNext = sanitizeAuthReturnPath(nextParam);
  const isPasswordRecovery = safeNext === PASSWORD_RESET_RETURN_PATH;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.redirect(
      new URL("/login?error=auth_config", request.url)
    );
  }

  if (!code) {
    const fallback = safeNext ?? "/login";
    return NextResponse.redirect(new URL(fallback, origin));
  }

  let destination = safeNext ?? "/onboarding";

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

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth_callback");
    if (isPasswordRecovery) {
      loginUrl.searchParams.set("view", "forgot");
    }
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (isPasswordRecovery) {
      destination = PASSWORD_RESET_RETURN_PATH;
    } else {
      destination = await resolvePostAuthRedirectPath(supabase, user.id, {
        explicitNext: nextParam,
      });
    }
  }

  const finalResponse = NextResponse.redirect(new URL(destination, origin));
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie);
  });

  return finalResponse;
}
