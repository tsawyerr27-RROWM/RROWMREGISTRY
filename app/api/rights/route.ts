import { NextResponse } from "next/server";

import { loadStudioRightsLedger } from "@/lib/rights-ledger";
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
  const licenses = await loadStudioRightsLedger(service, user.id);

  return NextResponse.json({ licenses });
}
