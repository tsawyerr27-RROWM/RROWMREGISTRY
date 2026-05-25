import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROUTE_PREFIXES = ["/admin", "/internal"];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Supabase SSR session refresh + admin route gate.
 *
 * Every request refreshes auth cookies so server components see the session.
 * Admin/internal routes additionally require authentication — unauthenticated
 * visitors are redirected to /login.
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
  } = await supabase.auth.getUser();

  if (isAdminRoute(request.nextUrl.pathname)) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
