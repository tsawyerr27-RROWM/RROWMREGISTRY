import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { studioLayoutGuardSkipsPath } from "@/lib/studio-route-access";

const ADMIN_ROUTE_PREFIXES = ["/admin", "/internal"];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Supabase SSR session refresh + studio/admin route gates.
 *
 * Every request refreshes auth cookies so server components see the session.
 * Studio routes require authentication — unauthenticated visitors are redirected
 * to /login with a return path. Admin/internal routes use the admin session gate.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (process.env.NODE_ENV === "development") {
    const cookieNames = request.cookies.getAll().map((c) => c.name);
    const hasSupabaseCookie = cookieNames.some((name) =>
      name.includes("-auth-token")
    );
    const supabase_cookie_names = cookieNames.filter((name) =>
      name.includes("-auth-token")
    );
    console.info("[RROWM middleware auth]", {
      pathname,
      has_user: Boolean(user),
      auth_error: authError?.message ?? null,
      cookie_count: cookieNames.length,
      has_supabase_cookie: hasSupabaseCookie,
      supabase_cookie_names,
      skipped_studio_guard: studioLayoutGuardSkipsPath(pathname),
    });
  }

  if (
    pathname.startsWith("/studio") &&
    !studioLayoutGuardSkipsPath(pathname) &&
    !user
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(request.nextUrl.pathname)) {
    const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin/");
    const isAdminLogin = request.nextUrl.pathname === "/admin";
    if (!isAdminApi && !isAdminLogin) {
      const adminSession = request.cookies.get("rrowm_admin_session");
      if (!adminSession?.value) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
