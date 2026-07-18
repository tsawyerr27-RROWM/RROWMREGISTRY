/**
 * Role-neutral contracts for the production Living Archive.
 *
 * The engine owns identity, navigation, location and rendering policy only.
 * Role queries, permissions, mutations, routes and Ledger behavior stay with
 * their Creative, Collector, Organisation, public or exhibition adapters.
 */

export type ArchiveSurface =
  | "creative"
  | "collector"
  | "organisation"
  | "public"
  | "exhibition";

export type ArchiveRecordSummary = {
  /** Stable source identity used for state and rendering. */
  id: string;
  /** Canonical external identity where the source record is addressable. */
  registryId: string | null;
  title: string;
  creator: string | null;
  medium: string | null;
  year: string | number | null;
  image: {
    url: string | null;
    width?: number | null;
    height?: number | null;
  };
};

export type ArchiveRoleAdapter<Source> = {
  surface: ArchiveSurface;
  toSummary: (source: Source) => ArchiveRecordSummary;
};

export type AdaptedArchiveRecord<Source> = {
  source: Source;
  summary: ArchiveRecordSummary;
};

export function adaptArchiveRecords<Source>(
  sources: readonly Source[],
  adapter: ArchiveRoleAdapter<Source>
): AdaptedArchiveRecord<Source>[] {
  return sources.map((source) => ({
    source,
    summary: adapter.toSummary(source),
  }));
}

export type ArchiveLocation = {
  enabled: boolean;
  activeRegistryId: string | null;
  detailRegistryId: string | null;
};

export type ArchiveLocationCodec = {
  sectionValue: string;
  parse: (params: URLSearchParams) => ArchiveLocation;
  build: (
    current: URLSearchParams,
    update: {
      activeRegistryId?: string | null;
      detailRegistryId?: string | null;
      view?: "archive" | "ledger";
    }
  ) => URLSearchParams;
};

/**
 * Creates a route-scoped codec. It preserves unrelated query parameters and
 * keeps the browse cursor (`work`) distinct from explicit detail (`detail`).
 */
export function createArchiveLocationCodec(
  sectionValue: string
): ArchiveLocationCodec {
  return {
    sectionValue,
    parse(params) {
      return {
        enabled:
          params.get("section") === sectionValue &&
          params.get("view") === "archive",
        activeRegistryId: params.get("work")?.trim() || null,
        detailRegistryId: params.get("detail")?.trim() || null,
      };
    },
    build(current, update) {
      const next = new URLSearchParams(current.toString());
      const view = update.view ?? "archive";
      next.set("section", sectionValue);
      next.set("view", view);

      if (view === "ledger") {
        next.delete("work");
        next.delete("detail");
        return next;
      }

      if ("activeRegistryId" in update) {
        if (update.activeRegistryId) {
          next.set("work", update.activeRegistryId);
        } else {
          next.delete("work");
        }
      }
      if ("detailRegistryId" in update) {
        if (update.detailRegistryId) {
          next.set("detail", update.detailRegistryId);
        } else {
          next.delete("detail");
        }
      }
      return next;
    },
  };
}

export type ArchiveLinearWindow = {
  startIndex: number;
  endIndex: number;
  beforeCount: number;
  afterCount: number;
  renderedItemCount: number;
};

/** Bounded renderer plan for a uniform horizontal or vertical archive rail. */
export function computeArchiveLinearWindow(args: {
  itemCount: number;
  activeIndex: number;
  maximumRenderedItems: number;
}): ArchiveLinearWindow {
  const itemCount = Math.max(0, Math.floor(args.itemCount));
  if (itemCount === 0) {
    return {
      startIndex: 0,
      endIndex: -1,
      beforeCount: 0,
      afterCount: 0,
      renderedItemCount: 0,
    };
  }

  const maximumRenderedItems = Math.max(
    1,
    Math.min(itemCount, Math.floor(args.maximumRenderedItems))
  );
  const activeIndex = Math.max(
    0,
    Math.min(itemCount - 1, Math.floor(args.activeIndex))
  );
  const radiusBefore = Math.floor((maximumRenderedItems - 1) / 2);
  const preferredStart = activeIndex - radiusBefore;
  const startIndex = Math.max(
    0,
    Math.min(preferredStart, itemCount - maximumRenderedItems)
  );
  const endIndex = startIndex + maximumRenderedItems - 1;

  return {
    startIndex,
    endIndex,
    beforeCount: startIndex,
    afterCount: itemCount - endIndex - 1,
    renderedItemCount: endIndex - startIndex + 1,
  };
}

export type ArchiveConnectionPolicy = {
  saveData: boolean;
  effectiveType: string | null;
};

/** Avoids speculative image work on explicit data-saving or slow connections. */
export function shouldPrefetchArchiveImages(
  policy: ArchiveConnectionPolicy
): boolean {
  if (policy.saveData) return false;
  return policy.effectiveType !== "slow-2g" && policy.effectiveType !== "2g";
}
