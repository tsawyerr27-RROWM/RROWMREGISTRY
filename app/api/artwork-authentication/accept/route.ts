import { NextResponse } from "next/server";

import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(
    (body as { token?: string }).token ?? ""
  ).trim();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("accept_artwork_authentication_invite", {
    p_token: token,
  });

  if (error) {
    const msg = summarizeRpcError(error);
    const code = String((error as { code?: string }).code ?? "");
    const status =
      code === "42501" || msg.toLowerCase().includes("not authenticated")
        ? 403
        : 400;
    return NextResponse.json({ error: msg || "Could not complete authentication." }, { status });
  }

  const o =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return NextResponse.json({
    ok: true,
    artwork_id: o.artwork_id ?? null,
    already_authenticated: Boolean(o.already_authenticated),
  });
}
