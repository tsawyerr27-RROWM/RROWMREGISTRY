import type { SupabaseClient } from "@supabase/supabase-js";

import {
  pickLatestOwnershipEvent,
  resolveHolderUserIdFromEvent,
} from "@/lib/ownership-canonical";
import {
  OWNERSHIP_EVENT_METRICS_SELECT,
} from "@/lib/ownership-events-schema";

export type StudioCatalogueRole = "artist" | "collector" | "gallery";

export type ArtworkMetricsRow = {
  id: string;
  title?: string | null;
  created_at?: string | null;
  artist_id?: string | null;
  initial_value?: number | null;
  latest_value?: number | null;
  initial_currency?: string | null;
  latest_currency?: string | null;
  ownership_transfer_count?: number | null;
  first_transfer_at?: string | null;
  latest_transfer_at?: string | null;
  ledger_latest_owner_id?: string | null;
  current_owner_id?: string | null;
  test_owner_id?: string | null;
};

export type WorkGrowth = {
  id: string;
  title: string;
  growthPercent: number;
  currency: string;
};

export type ValueProgressionMetrics = {
  comparableWorks: number;
  averageGrowthPercent: number | null;
  worksIncreased: number;
  worksDeclined: number;
  worksStable: number;
  perWork: WorkGrowth[];
  fastestAppreciating: WorkGrowth | null;
};

export type OwnershipIntelligenceMetrics = {
  totalTransfers: number;
  worksHeld: number;
  avgHoldDays: number | null;
};

export type CatalogueHighlightMetrics = {
  mostTransferred: { id: string; title: string; transferCount: number } | null;
  longestHeld: { id: string; title: string; holdDays: number } | null;
  fastestAppreciating: WorkGrowth | null;
};

export type StudioCatalogueMetrics = {
  valueProgression: ValueProgressionMetrics;
  ownership: OwnershipIntelligenceMetrics;
  highlights: CatalogueHighlightMetrics;
};

type ValueEventRow = {
  artwork_id: string;
  declared_value: number | string | null;
  currency: string | null;
  created_at: string | null;
};

type OwnershipEventRow = {
  artwork_id: string;
  created_at: string | null;
  id?: string | null;
  to_user_id?: string | null;
};

const DAY_MS = 1000 * 60 * 60 * 24;

function artworkTitle(row: ArtworkMetricsRow): string {
  return row.title?.trim() || "Untitled";
}

function buildLatestHolderByArtwork(
  ownershipEvents: OwnershipEventRow[]
): Map<string, string | null> {
  const byArt = new Map<string, OwnershipEventRow[]>();

  for (const row of ownershipEvents) {
    const artworkId = String(row.artwork_id || "");
    if (!artworkId) continue;
    const list = byArt.get(artworkId) ?? [];
    list.push(row);
    byArt.set(artworkId, list);
  }

  const holders = new Map<string, string | null>();
  for (const [artworkId, rows] of byArt) {
    holders.set(
      artworkId,
      resolveHolderUserIdFromEvent(pickLatestOwnershipEvent(rows))
    );
  }
  return holders;
}

function resolveEffectiveHolder(
  artwork: ArtworkMetricsRow,
  latestHolderByArt: Map<string, string | null>
): string | null {
  return latestHolderByArt.get(String(artwork.id)) ?? null;
}

function isWorkHeldByUser(args: {
  role: StudioCatalogueRole;
  userId: string;
  artwork: ArtworkMetricsRow;
  latestHolderByArt: Map<string, string | null>;
  transferCount: number;
}): boolean {
  const { role, userId, artwork, latestHolderByArt, transferCount } = args;
  const holder = resolveEffectiveHolder(artwork, latestHolderByArt);
  if (holder === userId) return true;

  // Match studio ownership filters: authored inventory with no transfers yet.
  if (role === "artist" && transferCount === 0) {
    const authored = String(artwork.artist_id || "") === userId;
    const holder = resolveEffectiveHolder(artwork, latestHolderByArt);
    if (authored && (holder === userId || holder === null)) {
      return true;
    }
  }

  return false;
}

function computePerWorkGrowth(
  events: ValueEventRow[]
): Map<string, WorkGrowth> {
  const byArt = new Map<string, ValueEventRow[]>();

  for (const row of events) {
    const id = String(row.artwork_id || "");
    if (!id) continue;
    const list = byArt.get(id) || [];
    list.push(row);
    byArt.set(id, list);
  }

  const growthByArt = new Map<string, WorkGrowth>();

  for (const [artworkId, rows] of byArt) {
    const sorted = rows
      .slice()
      .sort(
        (a, b) =>
          new Date(String(a.created_at || 0)).getTime() -
          new Date(String(b.created_at || 0)).getTime()
      );

    const latest = sorted[sorted.length - 1];
    const latestCurrency = String(latest?.currency || "").toUpperCase();
    if (!latestCurrency) continue;

    const sameCurrency = sorted.filter(
      (row) => String(row.currency || "").toUpperCase() === latestCurrency
    );
    if (sameCurrency.length < 2) continue;

    const first = sameCurrency[0];
    const last = sameCurrency[sameCurrency.length - 1];
    const firstValue = Number(first.declared_value);
    const lastValue = Number(last.declared_value);
    if (!Number.isFinite(firstValue) || firstValue === 0 || !Number.isFinite(lastValue)) {
      continue;
    }

    growthByArt.set(artworkId, {
      id: artworkId,
      title: "",
      growthPercent: ((lastValue - firstValue) / firstValue) * 100,
      currency: latestCurrency,
    });
  }

  return growthByArt;
}

function summarizeValueProgression(
  artworks: ArtworkMetricsRow[],
  growthByArt: Map<string, WorkGrowth>
): ValueProgressionMetrics {
  const perWork = artworks
    .map((row) => {
      const growth = growthByArt.get(String(row.id));
      if (!growth) return null;
      return { ...growth, title: artworkTitle(row) };
    })
    .filter((row): row is WorkGrowth => row != null);

  const worksIncreased = perWork.filter((row) => row.growthPercent > 0).length;
  const worksDeclined = perWork.filter((row) => row.growthPercent < 0).length;
  const worksStable = perWork.filter((row) => row.growthPercent === 0).length;

  const averageGrowthPercent =
    perWork.length > 0
      ? Math.round(
          perWork.reduce((sum, row) => sum + row.growthPercent, 0) / perWork.length
        )
      : null;

  const fastestAppreciating =
    perWork.length > 0
      ? perWork.reduce((best, row) =>
          row.growthPercent > best.growthPercent ? row : best
        )
      : null;

  return {
    comparableWorks: perWork.length,
    averageGrowthPercent,
    worksIncreased,
    worksDeclined,
    worksStable,
    perWork,
    fastestAppreciating,
  };
}

function computeHoldDaysForWork(args: {
  role: StudioCatalogueRole;
  artwork: ArtworkMetricsRow;
  userId: string;
  ownershipEvents: OwnershipEventRow[];
  latestHolderByArt: Map<string, string | null>;
  transferCount: number;
}): number | null {
  const {
    role,
    artwork,
    userId,
    ownershipEvents,
    latestHolderByArt,
    transferCount,
  } = args;
  const artworkId = String(artwork.id);
  if (
    !isWorkHeldByUser({
      role,
      userId,
      artwork,
      latestHolderByArt,
      transferCount,
    })
  ) {
    return null;
  }

  const events = ownershipEvents
    .filter((row) => String(row.artwork_id) === artworkId)
    .slice()
    .sort(
      (a, b) =>
        new Date(String(a.created_at || 0)).getTime() -
        new Date(String(b.created_at || 0)).getTime()
    );

  let acquiredAt: number | null = null;

  for (const event of events) {
    if (resolveHolderUserIdFromEvent(event) === userId) {
      acquiredAt = new Date(String(event.created_at || "")).getTime();
    }
  }

  if (!acquiredAt && artwork.created_at) {
    acquiredAt = new Date(String(artwork.created_at)).getTime();
  }

  if (!acquiredAt || Number.isNaN(acquiredAt)) return null;
  return Math.max(0, (Date.now() - acquiredAt) / DAY_MS);
}

function computeRegistryTenureDays(artwork: ArtworkMetricsRow): number | null {
  if (!artwork.created_at) return null;
  const created = new Date(String(artwork.created_at)).getTime();
  if (Number.isNaN(created)) return null;
  return Math.max(0, (Date.now() - created) / DAY_MS);
}

function countTransfersPerWork(
  ownershipEvents: OwnershipEventRow[],
  artworkIds: string[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of artworkIds) counts.set(id, 0);

  const eventsByArt = new Map<string, OwnershipEventRow[]>();
  for (const row of ownershipEvents) {
    const id = String(row.artwork_id || "");
    if (!id) continue;
    const list = eventsByArt.get(id) || [];
    list.push(row);
    eventsByArt.set(id, list);
  }

  for (const [artworkId, rows] of eventsByArt) {
    const transferCount = Math.max(0, rows.length - 1);
    counts.set(artworkId, transferCount);
  }

  return counts;
}

export function buildStudioCatalogueMetrics(args: {
  role: StudioCatalogueRole;
  userId: string;
  artworks: ArtworkMetricsRow[];
  valueEvents: ValueEventRow[];
  ownershipEvents: OwnershipEventRow[];
}): StudioCatalogueMetrics {
  const { role, userId, artworks, valueEvents, ownershipEvents } = args;
  const artworkIds = artworks.map((row) => String(row.id)).filter(Boolean);
  const growthByArt = computePerWorkGrowth(valueEvents);
  const valueProgression = summarizeValueProgression(artworks, growthByArt);

  const transferCounts = countTransfersPerWork(ownershipEvents, artworkIds);
  const totalTransfers = Array.from(transferCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const latestHolderByArt = buildLatestHolderByArtwork(ownershipEvents);

  let worksHeld = 0;
  if (role === "gallery") {
    worksHeld = artworks.length;
  } else {
    worksHeld = artworks.filter((row) =>
      isWorkHeldByUser({
        role,
        userId,
        artwork: row,
        latestHolderByArt,
        transferCount: transferCounts.get(String(row.id)) || 0,
      })
    ).length;
  }

  const holdSamples: number[] = [];
  if (role === "gallery") {
    for (const artwork of artworks) {
      const days = computeRegistryTenureDays(artwork);
      if (days != null) holdSamples.push(days);
    }
  } else {
    for (const artwork of artworks) {
      const days = computeHoldDaysForWork({
        role,
        artwork,
        userId,
        ownershipEvents,
        latestHolderByArt,
        transferCount: transferCounts.get(String(artwork.id)) || 0,
      });
      if (days != null) holdSamples.push(days);
    }
  }

  const avgHoldDays =
    holdSamples.length > 0
      ? holdSamples.reduce((sum, days) => sum + days, 0) / holdSamples.length
      : null;

  const ownership: OwnershipIntelligenceMetrics = {
    totalTransfers,
    worksHeld,
    avgHoldDays,
  };

  let mostTransferred: CatalogueHighlightMetrics["mostTransferred"] = null;
  for (const artwork of artworks) {
    const transferCount = transferCounts.get(String(artwork.id)) || 0;
    if (transferCount <= 0) continue;
    if (
      !mostTransferred ||
      transferCount > mostTransferred.transferCount
    ) {
      mostTransferred = {
        id: String(artwork.id),
        title: artworkTitle(artwork),
        transferCount,
      };
    }
  }

  let longestHeld: CatalogueHighlightMetrics["longestHeld"] = null;
  if (role === "gallery") {
    for (const artwork of artworks) {
      const holdDays = computeRegistryTenureDays(artwork);
      if (holdDays == null) continue;
      if (!longestHeld || holdDays > longestHeld.holdDays) {
        longestHeld = {
          id: String(artwork.id),
          title: artworkTitle(artwork),
          holdDays,
        };
      }
    }
  } else {
    for (const artwork of artworks) {
      const holdDays = computeHoldDaysForWork({
        role,
        artwork,
        userId,
        ownershipEvents,
        latestHolderByArt,
        transferCount: transferCounts.get(String(artwork.id)) || 0,
      });
      if (holdDays == null) continue;
      if (!longestHeld || holdDays > longestHeld.holdDays) {
        longestHeld = {
          id: String(artwork.id),
          title: artworkTitle(artwork),
          holdDays,
        };
      }
    }
  }

  const highlights: CatalogueHighlightMetrics = {
    mostTransferred,
    longestHeld,
    fastestAppreciating: valueProgression.fastestAppreciating,
  };

  return {
    valueProgression,
    ownership,
    highlights,
  };
}

export async function fetchStudioCatalogueMetrics(
  supabase: SupabaseClient,
  args: {
    role: StudioCatalogueRole;
    userId: string;
    artworks: ArtworkMetricsRow[];
  }
): Promise<StudioCatalogueMetrics> {
  const artworkIds = args.artworks.map((row) => String(row.id)).filter(Boolean);

  if (artworkIds.length === 0) {
    return buildStudioCatalogueMetrics({
      role: args.role,
      userId: args.userId,
      artworks: [],
      valueEvents: [],
      ownershipEvents: [],
    });
  }

  const [{ data: valueRows }, { data: ownershipRows }] = await Promise.all([
    supabase
      .from("value_events")
      .select("artwork_id, declared_value, currency, created_at")
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("ownership_events")
      .select(OWNERSHIP_EVENT_METRICS_SELECT)
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: true }),
  ]);

  return buildStudioCatalogueMetrics({
    role: args.role,
    userId: args.userId,
    artworks: args.artworks,
    valueEvents: (valueRows || []) as ValueEventRow[],
    ownershipEvents: (ownershipRows || []) as OwnershipEventRow[],
  });
}

export function formatGrowthPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "–";
  const rounded = Math.round(value);
  if (rounded > 0) return `↑ ${rounded}%`;
  if (rounded < 0) return `↓ ${Math.abs(rounded)}%`;
  return "0%";
}

export function formatHighlightGrowth(work: WorkGrowth | null): string {
  if (!work) return "–";
  return `${work.title} · ${formatGrowthPercent(work.growthPercent)}`;
}
