import type { SupabaseClient } from "@supabase/supabase-js";

export type TrendPoint = { month: string } & Record<string, number | null | string>;

function monthKey(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthsBack(n: number) {
  const out: string[] = [];
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCMonth(d.getUTCMonth() - i);
    out.push(monthKey(x));
  }
  return out;
}

export async function getValueTrend(
  supabase: SupabaseClient,
  artworkIds: string[],
  opts: { months?: number } = {}
): Promise<{
  series: TrendPoint[];
  currencies: string[];
  latestValues: Record<string, number>;
  growthDirection: "up" | "down" | "stable";
}> {
  const months = opts.months ?? 12;
  if (artworkIds.length === 0) {
    return { series: [], currencies: [], latestValues: {}, growthDirection: "stable" };
  }

  const { data } = await supabase
    .from("value_events")
    .select("artwork_id, declared_value, currency, created_at, value_type")
    .in("artwork_id", artworkIds)
    .order("created_at", { ascending: true });

  const points = monthsBack(months);
  const byCurMonth: Record<string, Record<string, number>> = {};
  const currencies = new Set<string>();
  const curChron: Record<string, Array<{ at: number; value: number }>> = {};

  for (const row of data || []) {
    const cur = String((row as any).currency || "").toUpperCase();
    if (!cur) continue;
    const created = new Date(String((row as any).created_at || ""));
    if (Number.isNaN(created.getTime())) continue;
    const mk = monthKey(created);
    if (!points.includes(mk)) continue;
    const valNum = Number((row as any).declared_value);
    if (!Number.isFinite(valNum)) continue;

    currencies.add(cur);
    if (!byCurMonth[cur]) byCurMonth[cur] = {};
    // Keep the latest value in that month (data is ascending; overwrite ok)
    byCurMonth[cur][mk] = valNum;

    if (!curChron[cur]) curChron[cur] = [];
    curChron[cur].push({ at: created.getTime(), value: valNum });
  }

  const currencyList = Array.from(currencies).sort();
  const series: TrendPoint[] = points.map((m) => {
    const r: TrendPoint = { month: m };
    for (const c of currencyList) r[c] = byCurMonth[c]?.[m] ?? null;
    return r;
  });

  const latestValues: Record<string, number> = {};
  let anyUp = false;
  let anyDown = false;

  for (const c of currencyList) {
    const list = (curChron[c] || []).slice().sort((a, b) => a.at - b.at);
    const last = list[list.length - 1];
    const prev = list[list.length - 2];
    if (last) latestValues[c] = last.value;
    if (last && prev) {
      if (last.value > prev.value) anyUp = true;
      else if (last.value < prev.value) anyDown = true;
    }
  }

  const growthDirection: "up" | "down" | "stable" =
    anyUp && !anyDown ? "up" : anyDown && !anyUp ? "down" : "stable";

  return { series, currencies: currencyList, latestValues, growthDirection };
}

export async function getArtworkCountTrend(
  supabase: SupabaseClient,
  artworkIds: string[],
  opts: { months?: number } = {}
): Promise<{ series: { month: string; works: number }[] }> {
  const months = opts.months ?? 12;
  if (artworkIds.length === 0) return { series: [] };

  const { data } = await supabase
    .from("artworks")
    .select("id, created_at")
    .in("id", artworkIds)
    .order("created_at", { ascending: true });

  const points = monthsBack(months);
  const createdMonths = (data || [])
    .map((r: any) => monthKey(new Date(String(r.created_at || ""))))
    .filter(Boolean);

  const counts: Record<string, number> = {};
  for (const m of points) counts[m] = 0;
  for (const m of createdMonths) {
    if (counts[m] != null) counts[m] += 1;
  }

  let running = 0;
  const series = points.map((m) => {
    running += counts[m] || 0;
    return { month: m, works: running };
  });
  return { series };
}

export async function getActivityTimeline(
  supabase: SupabaseClient,
  userId: string,
  opts: { months?: number } = {}
): Promise<{ series: { month: string; events: number }[] }> {
  const months = opts.months ?? 12;
  const { data } = await supabase
    .from("activity_events")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const points = monthsBack(months);
  const counts: Record<string, number> = {};
  for (const m of points) counts[m] = 0;
  for (const r of data || []) {
    const created = new Date(String((r as any).created_at || ""));
    if (Number.isNaN(created.getTime())) continue;
    const m = monthKey(created);
    if (counts[m] != null) counts[m] += 1;
  }

  return { series: points.map((m) => ({ month: m, events: counts[m] || 0 })) };
}

