import { NextResponse } from "next/server";

import { listPendingAcquisitionsForUser } from "@/lib/acquisition-ownership-loop";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const pending = await listPendingAcquisitionsForUser(service, user.id);

  return NextResponse.json({ pending_acquisitions: pending });
}
