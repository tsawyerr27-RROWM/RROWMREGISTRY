/**
 * Headless Living Archive foundation.
 *
 * This module deliberately contains no React, DOM, routing, animation, data
 * fetching, or presentation code. It defines deterministic archive navigation,
 * focus/selection state, virtual windows, deep-link state, and image intent so
 * future renderers can share one interaction contract without replacing Ledger.
 */

export type LivingArchiveItem = {
  /** Stable database identity used for React keys and local state. */
  id: string;
  /** Public canonical identity used in URLs and record links. */
  registryId: string | null;
  title: string;
  imageUrl: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
};

export type ArchiveInputModality =
  | "keyboard"
  | "mouse"
  | "trackpad"
  | "touch"
  | "programmatic";

export type ArchiveMoveCommand =
  | "previous"
  | "next"
  | "row-previous"
  | "row-next"
  | "page-previous"
  | "page-next"
  | "first"
  | "last";

export type ArchiveMode = "browse" | "focus";

export type ArchivePresentationMode = "ledger" | "archive";

/** Preserves legacy Gallery preferences while adopting Archive terminology. */
export function normalizeArchivePresentationMode(
  stored: string | null | undefined,
  fallback: ArchivePresentationMode = "archive"
): ArchivePresentationMode {
  if (stored === "gallery" || stored === "archive") return "archive";
  if (stored === "ledger") return "ledger";
  return fallback;
}

export type ArchiveVisibleRange = {
  startIndex: number;
  endIndex: number;
};

export type LivingArchiveState = {
  orderedIds: readonly string[];
  activeId: string | null;
  selectedId: string | null;
  mode: ArchiveMode;
  modality: ArchiveInputModality;
  visibleRange: ArchiveVisibleRange;
  /** Pixel offset owned by the renderer and preserved for focus return. */
  returnScrollOffset: number;
};

export type LivingArchiveAction =
  | {
      type: "items-changed";
      orderedIds: readonly string[];
      preferredId?: string | null;
    }
  | {
      type: "move";
      command: ArchiveMoveCommand;
      columns: number;
      pageSize?: number;
      modality: ArchiveInputModality;
    }
  | {
      type: "set-active";
      id: string;
      modality: ArchiveInputModality;
    }
  | {
      type: "open-focus";
      id?: string | null;
      returnScrollOffset: number;
      modality: ArchiveInputModality;
    }
  | { type: "close-focus"; modality: ArchiveInputModality }
  | { type: "set-visible-range"; range: ArchiveVisibleRange }
  | {
      type: "restore";
      activeId: string | null;
      selectedId: string | null;
      returnScrollOffset: number;
    };

export const LIVING_ARCHIVE_QUERY_KEYS = {
  section: "section",
  view: "view",
  work: "work",
} as const;

export const LIVING_ARCHIVE_QUERY_VALUES = {
  section: "artworks",
  view: "archive",
} as const;

export const LIVING_ARCHIVE_PERFORMANCE_BUDGET = {
  interactionLatencyMs: 100,
  focusTransitionMs: 240,
  reducedMotionTransitionMs: 0,
  mobileDecodedImageBudgetMb: 64,
  desktopDecodedImageBudgetMb: 160,
  mobilePrefetchRadius: 1,
  desktopPrefetchRadius: 2,
  defaultOverscanRows: 2,
  maximumRenderedItems: 120,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function normalizedRange(
  range: ArchiveVisibleRange,
  itemCount: number
): ArchiveVisibleRange {
  if (itemCount <= 0) return { startIndex: 0, endIndex: -1 };
  const startIndex = clamp(Math.floor(range.startIndex), 0, itemCount - 1);
  const endIndex = clamp(
    Math.max(startIndex, Math.floor(range.endIndex)),
    startIndex,
    itemCount - 1
  );
  return { startIndex, endIndex };
}

function existingOrFallbackId(
  orderedIds: readonly string[],
  candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (candidate && orderedIds.includes(candidate)) return candidate;
  }
  return orderedIds[0] ?? null;
}

export function createLivingArchiveState(
  orderedIds: readonly string[],
  preferredId: string | null = null
): LivingArchiveState {
  return {
    orderedIds: [...orderedIds],
    activeId: existingOrFallbackId(orderedIds, [preferredId]),
    selectedId: null,
    mode: "browse",
    modality: "programmatic",
    visibleRange: normalizedRange(
      { startIndex: 0, endIndex: Math.min(orderedIds.length - 1, 11) },
      orderedIds.length
    ),
    returnScrollOffset: 0,
  };
}

/** Resolves a stable active work after filtering, sorting, or data refresh. */
export function resolveArchiveActiveIndex(
  orderedIds: readonly string[],
  activeId: string | null,
  fallbackIndex = 0
): number {
  if (orderedIds.length === 0) return -1;
  if (activeId) {
    const preservedIndex = orderedIds.indexOf(activeId);
    if (preservedIndex >= 0) return preservedIndex;
  }
  return clamp(Math.floor(fallbackIndex), 0, orderedIds.length - 1);
}

export function indexForArchiveMove(args: {
  currentIndex: number;
  itemCount: number;
  command: ArchiveMoveCommand;
  columns: number;
  pageSize?: number;
}): number {
  const { itemCount, command } = args;
  if (itemCount <= 0) return -1;

  const currentIndex = clamp(args.currentIndex, 0, itemCount - 1);
  const columns = Math.max(1, Math.floor(args.columns));
  const pageSize = Math.max(
    columns,
    Math.floor(args.pageSize ?? columns * 3)
  );

  switch (command) {
    case "previous":
      return Math.max(0, currentIndex - 1);
    case "next":
      return Math.min(itemCount - 1, currentIndex + 1);
    case "row-previous":
      return Math.max(0, currentIndex - columns);
    case "row-next":
      return Math.min(itemCount - 1, currentIndex + columns);
    case "page-previous":
      return Math.max(0, currentIndex - pageSize);
    case "page-next":
      return Math.min(itemCount - 1, currentIndex + pageSize);
    case "first":
      return 0;
    case "last":
      return itemCount - 1;
    default:
      return currentIndex;
  }
}

export function livingArchiveReducer(
  state: LivingArchiveState,
  action: LivingArchiveAction
): LivingArchiveState {
  switch (action.type) {
    case "items-changed": {
      const orderedIds = [...action.orderedIds];
      const activeId = existingOrFallbackId(orderedIds, [
        action.preferredId,
        state.activeId,
      ]);
      const selectedId =
        state.selectedId && orderedIds.includes(state.selectedId)
          ? state.selectedId
          : null;
      return {
        ...state,
        orderedIds,
        activeId,
        selectedId,
        mode: selectedId ? "focus" : "browse",
        visibleRange: normalizedRange(state.visibleRange, orderedIds.length),
      };
    }
    case "move": {
      if (state.orderedIds.length === 0) return state;
      const currentIndex = Math.max(
        0,
        state.activeId ? state.orderedIds.indexOf(state.activeId) : 0
      );
      const nextIndex = indexForArchiveMove({
        currentIndex,
        itemCount: state.orderedIds.length,
        command: action.command,
        columns: action.columns,
        pageSize: action.pageSize,
      });
      return {
        ...state,
        activeId: state.orderedIds[nextIndex] ?? state.activeId,
        modality: action.modality,
      };
    }
    case "set-active":
      if (!state.orderedIds.includes(action.id)) return state;
      return {
        ...state,
        activeId: action.id,
        modality: action.modality,
      };
    case "open-focus": {
      const selectedId = existingOrFallbackId(state.orderedIds, [
        action.id,
        state.activeId,
      ]);
      if (!selectedId) return state;
      return {
        ...state,
        activeId: selectedId,
        selectedId,
        mode: "focus",
        modality: action.modality,
        returnScrollOffset: Math.max(0, action.returnScrollOffset),
      };
    }
    case "close-focus":
      return {
        ...state,
        activeId: state.selectedId ?? state.activeId,
        selectedId: null,
        mode: "browse",
        modality: action.modality,
      };
    case "set-visible-range":
      return {
        ...state,
        visibleRange: normalizedRange(
          action.range,
          state.orderedIds.length
        ),
      };
    case "restore": {
      const activeId = existingOrFallbackId(state.orderedIds, [
        action.activeId,
        action.selectedId,
      ]);
      const selectedId =
        action.selectedId && state.orderedIds.includes(action.selectedId)
          ? action.selectedId
          : null;
      return {
        ...state,
        activeId,
        selectedId,
        mode: selectedId ? "focus" : "browse",
        modality: "programmatic",
        returnScrollOffset: Math.max(0, action.returnScrollOffset),
      };
    }
    default:
      return state;
  }
}

export function archiveCommandForKey(
  key: string,
  mode: ArchiveMode
): ArchiveMoveCommand | "open" | "close" | null {
  if (key === "Escape") return mode === "focus" ? "close" : null;
  if (key === "Enter" || key === " ") return mode === "browse" ? "open" : null;
  if (key === "ArrowLeft") return "previous";
  if (key === "ArrowRight") return "next";
  if (key === "ArrowUp") return "row-previous";
  if (key === "ArrowDown") return "row-next";
  if (key === "PageUp") return "page-previous";
  if (key === "PageDown") return "page-next";
  if (key === "Home") return "first";
  if (key === "End") return "last";
  return null;
}

export type ArchiveVirtualWindow = {
  startIndex: number;
  endIndex: number;
  beforeHeight: number;
  afterHeight: number;
  renderedItemCount: number;
};

/**
 * Computes a bounded uniform-grid window. The renderer owns measurement and
 * scroll; this function remains deterministic and safe for 10,000+ items.
 */
export function computeArchiveVirtualWindow(args: {
  itemCount: number;
  columns: number;
  rowHeight: number;
  viewportHeight: number;
  scrollTop: number;
  overscanRows?: number;
  maximumRenderedItems?: number;
}): ArchiveVirtualWindow {
  const itemCount = Math.max(0, Math.floor(args.itemCount));
  if (itemCount === 0) {
    return {
      startIndex: 0,
      endIndex: -1,
      beforeHeight: 0,
      afterHeight: 0,
      renderedItemCount: 0,
    };
  }

  const columns = Math.max(1, Math.floor(args.columns));
  const rowHeight = Math.max(1, args.rowHeight);
  const totalRows = Math.ceil(itemCount / columns);
  const viewportHeight = Math.max(1, args.viewportHeight);
  const scrollTop = Math.max(0, args.scrollTop);
  const overscanRows = Math.max(
    0,
    Math.floor(
      args.overscanRows ??
        LIVING_ARCHIVE_PERFORMANCE_BUDGET.defaultOverscanRows
    )
  );
  const maximumRenderedItems = Math.max(
    columns,
    Math.floor(
      args.maximumRenderedItems ??
        LIVING_ARCHIVE_PERFORMANCE_BUDGET.maximumRenderedItems
    )
  );

  const firstVisibleRow = clamp(
    Math.floor(scrollTop / rowHeight),
    0,
    totalRows - 1
  );
  const visibleRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
  const desiredStartRow = Math.max(0, firstVisibleRow - overscanRows);
  const desiredEndRow = Math.min(
    totalRows - 1,
    firstVisibleRow + visibleRows + overscanRows - 1
  );
  const maximumRows = Math.max(
    1,
    Math.floor(maximumRenderedItems / columns)
  );
  const startRow = desiredStartRow;
  const endRow = Math.min(desiredEndRow, startRow + maximumRows - 1);
  const startIndex = startRow * columns;
  const endIndex = Math.min(itemCount - 1, (endRow + 1) * columns - 1);

  return {
    startIndex,
    endIndex,
    beforeHeight: startRow * rowHeight,
    afterHeight: Math.max(0, (totalRows - endRow - 1) * rowHeight),
    renderedItemCount: endIndex - startIndex + 1,
  };
}

export type ArchiveImageIntent =
  | "priority"
  | "prefetch"
  | "visible"
  | "deferred";

/**
 * Image intent is independent of the image renderer. Only the focused work is
 * priority; near neighbors may prefetch; visible cells lazy-load; all others
 * remain unrequested.
 */
export function archiveImageIntent(args: {
  index: number;
  activeIndex: number;
  visibleRange: ArchiveVisibleRange;
  prefetchRadius: number;
}): ArchiveImageIntent {
  if (args.index === args.activeIndex) return "priority";
  if (
    args.activeIndex >= 0 &&
    Math.abs(args.index - args.activeIndex) <=
      Math.max(0, Math.floor(args.prefetchRadius))
  ) {
    return "prefetch";
  }
  if (
    args.index >= args.visibleRange.startIndex &&
    args.index <= args.visibleRange.endIndex
  ) {
    return "visible";
  }
  return "deferred";
}

export type LivingArchiveLocation = {
  enabled: boolean;
  registryId: string | null;
};

export function parseLivingArchiveLocation(
  params: URLSearchParams
): LivingArchiveLocation {
  return {
    enabled:
      params.get(LIVING_ARCHIVE_QUERY_KEYS.section)?.toLowerCase() ===
        LIVING_ARCHIVE_QUERY_VALUES.section &&
      params.get(LIVING_ARCHIVE_QUERY_KEYS.view)?.toLowerCase() ===
        LIVING_ARCHIVE_QUERY_VALUES.view,
    registryId:
      params.get(LIVING_ARCHIVE_QUERY_KEYS.work)?.trim() || null,
  };
}

export function buildLivingArchiveLocation(
  current: URLSearchParams,
  registryId: string | null
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  next.set(
    LIVING_ARCHIVE_QUERY_KEYS.section,
    LIVING_ARCHIVE_QUERY_VALUES.section
  );
  next.set(
    LIVING_ARCHIVE_QUERY_KEYS.view,
    LIVING_ARCHIVE_QUERY_VALUES.view
  );
  if (registryId) {
    next.set(LIVING_ARCHIVE_QUERY_KEYS.work, registryId);
  } else {
    next.delete(LIVING_ARCHIVE_QUERY_KEYS.work);
  }
  return next;
}
