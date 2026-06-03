import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Checks whether the caller has a valid admin session cookie.
 * The cookie is set by POST /api/admin/login after credential verification.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("rrowm_admin_session");
    return NextResponse.json({ isAdmin: Boolean(session?.value) });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
