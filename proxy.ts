import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { verifyAdminToken } from "@/lib/admin-session";
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
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-rrowm-pathname", pathname);

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
  } = await supabase.auth.getUser();

  if (
    pathname.startsWith("/studio") &&
    !studioLayoutGuardSkipsPath(pathname) &&
    !user
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname)) {
    const isAdminApi = pathname.startsWith("/api/admin/");
    const isAdminLogin = pathname === "/admin";
    if (!isAdminApi && !isAdminLogin) {
      const adminSession = request.cookies.get("rrowm_admin_session");
      const payload = await verifyAdminToken(adminSession?.value);
      if (!payload) {
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
