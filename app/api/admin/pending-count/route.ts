import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { verifyAdminToken } from "@/lib/admin-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("rrowm_admin_session");
    const payload = await verifyAdminToken(session?.value);
    if (!payload) {
      return NextResponse.json({ count: null }, { status: 401 });
    }

    const service = createSupabaseServiceClient();
    const { count } = await service
      .from("artworks")
      .select("id", { count: "exact", head: true })
      .in("verification_status", ["filed", "self_attested"]);

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: null });
  }
}
