import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyAdminToken } from "@/lib/admin-session";

/**
 * Checks whether the caller has a valid, signed admin session cookie.
 * The cookie is set by POST /api/admin/login after credential verification.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("rrowm_admin_session");
    const payload = await verifyAdminToken(session?.value);
    return NextResponse.json({ isAdmin: payload !== null });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
