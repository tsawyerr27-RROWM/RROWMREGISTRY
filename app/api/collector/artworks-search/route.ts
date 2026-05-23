import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

const MAX = 18;

/**
 * Registry-only artwork lookup for collector declaration flow.
 * No free-text creation — results are existing verified rows only.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (String(actor?.role || "").toLowerCase() !== "collector") {
    return NextResponse.json(
      { error: "Collector accounts only." },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const raw = String(url.searchParams.get("q") || "").trim().toLowerCase();
  const q = raw.replace(/[^a-z0-9\s._-]/g, "").slice(0, 64);
  if (q.length < 2) {
    return NextResponse.json({ artworks: [] as const });
  }

  const service = createSupabaseServiceClient();
  const like = `%${q}%`;
  const sel =
    "id, title, registry_id, image_url, verification_status, created_at" as const;

  const [byReg, byTitle] = await Promise.all([
    service
      .from("artworks")
      .select(sel)
      .eq("verification_status", "verified")
      .ilike("registry_id", like)
      .order("created_at", { ascending: false })
      .limit(MAX),
    service
      .from("artworks")
      .select(sel)
      .eq("verification_status", "verified")
      .ilike("title", like)
      .order("created_at", { ascending: false })
      .limit(MAX),
  ]);

  if (byReg.error || byTitle.error) {
    console.error("[collector/artworks-search]", byReg.error, byTitle.error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  const seen = new Set<string>();
  const merged: NonNullable<typeof byReg.data> = [];
  for (const row of [...(byReg.data || []), ...(byTitle.data || [])]) {
    const id = String((row as { id?: string }).id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(row as (typeof merged)[number]);
  }
  merged.sort(
    (a, b) =>
      new Date(String((b as { created_at?: string }).created_at || 0)).getTime() -
      new Date(String((a as { created_at?: string }).created_at || 0)).getTime()
  );

  const rows = merged.slice(0, MAX).map((r) => ({
    id: r.id as string,
    title: (r.title as string | null) ?? null,
    registry_id: (r.registry_id as string | null) ?? null,
    image_url: (r.image_url as string | null) ?? null,
  }));

  return NextResponse.json({ artworks: rows });
}
