"use client";

import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  ArchiveActions,
  ArchiveEmptyState,
  ArchiveImage,
  ArchiveLayout,
  ArchiveMetadata,
  ArchiveNavigation,
} from "@/components/Studio/ArchiveEnginePrimitives";
import { useArchiveController } from "@/components/Studio/useArchiveController";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  LIVING_ARCHIVE_PERFORMANCE_BUDGET,
  archiveCommandForKey,
  archiveImageIntent,
  indexForArchiveMove,
} from "@/lib/living-archive";
import {
  computeArchiveLinearWindow,
  createArchiveLocationCodec,
  shouldPrefetchArchiveImages,
} from "@/lib/archive-engine";

export type LivingArchiveViewportItem = {
  id: string;
  registryId?: string | null;
  title: string;
  creator?: string | null;
  registryState?: ReactNode;
  medium?: string | null;
  year?: string | number | null;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  href?: string;
  onOpen?: () => void;
  openLabel?: string;
  actions?: ReactNode;
};

type Props = {
  items: readonly LivingArchiveViewportItem[];
  ariaLabel: string;
  emptyLabel: string;
  sectionQueryValue: string;
  onActiveChange?: (item: LivingArchiveViewportItem, index: number) => void;
};

type HistoryState = {
  id: string;
};

const MAXIMUM_RENDERED_ITEMS = 17;
const ITEM_GAP_PX = 16;

function subscribeToMobileArchive(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function mobileArchiveSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function archiveConnectionPolicy() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return {
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType ?? null,
  };
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest("a,button,input,select,textarea,[role='button']"))
  );
}

function imageFailureKey(item: LivingArchiveViewportItem): string {
  return `${item.id}:${item.imageUrl ?? ""}`;
}

function archiveHistoryState(value: unknown): HistoryState | null {
  if (!value || typeof value !== "object") return null;
  const livingArchive = (value as { livingArchive?: unknown }).livingArchive;
  if (!livingArchive || typeof livingArchive !== "object") return null;
  const candidate = livingArchive as { id?: unknown };
  if (typeof candidate.id !== "string") return null;
  return { id: candidate.id };
}

export function LivingArchiveViewport({
  items,
  ariaLabel,
  emptyLabel,
  sectionQueryValue,
  onActiveChange,
}: Props) {
  const { t } = useLocalePreferences();
  const router = useRouter();
  const [itemExtent, setItemExtent] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set()
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const scrollFrameRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldScrollToActiveRef = useRef(true);
  const inputModalityRef = useRef<"keyboard" | "mouse" | "touch" | "programmatic">(
    "programmatic"
  );
  const restoredInitialLocationRef = useRef(false);
  const orderedIds = useMemo(() => items.map((item) => item.id), [items]);
  const {
    activeIndex: controlledActiveIndex,
    setActive,
    open,
    restore,
  } = useArchiveController({ orderedIds });
  const activeIndex =
    controlledActiveIndex >= 0 ? controlledActiveIndex : 0;
  const activeItem = items[activeIndex] ?? items[0] ?? null;
  const isMobileArchive = useSyncExternalStore(
    subscribeToMobileArchive,
    mobileArchiveSnapshot,
    () => false
  );
  const prefetchRadius = isMobileArchive
      ? LIVING_ARCHIVE_PERFORMANCE_BUDGET.mobilePrefetchRadius
      : LIVING_ARCHIVE_PERFORMANCE_BUDGET.desktopPrefetchRadius;
  const locationCodec = useMemo(
    () => createArchiveLocationCodec(sectionQueryValue),
    [sectionQueryValue]
  );

  const windowRange = useMemo(() => {
    const window = computeArchiveLinearWindow({
      itemCount: items.length,
      activeIndex,
      maximumRenderedItems: MAXIMUM_RENDERED_ITEMS,
    });
    return {
      start: window.startIndex,
      end: window.endIndex + 1,
    };
  }, [activeIndex, items.length]);

  const visibleItems = items.slice(windowRange.start, windowRange.end);

  const syncHistory = useCallback(
    (
      item: LivingArchiveViewportItem,
      scrollLeft: number,
      method: "push" | "replace"
    ) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      url.search = locationCodec
        .build(url.searchParams, {
          activeRegistryId: item.registryId ?? null,
          view: "archive",
        })
        .toString();
      const state = {
        ...(window.history.state ?? {}),
        livingArchive: { id: item.id, scrollLeft },
      };
      if (method === "push") {
        window.history.pushState(state, "", url);
      } else {
        window.history.replaceState(state, "", url);
      }
    },
    [locationCodec]
  );

  const announce = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      setAnnouncement(
        `${item.title}. ${t("studio.archive.position")} ${index + 1} ${t(
          "studio.archive.positionOf"
        )} ${items.length}.`
      );
    },
    [items, t]
  );

  const activateIndex = useCallback(
    (
      index: number,
      options: {
        scroll: boolean;
        focus: boolean;
        history: "push" | "replace" | "none";
        announce: boolean;
      }
    ) => {
      if (items.length === 0) return;
      const nextIndex = Math.max(0, Math.min(index, items.length - 1));
      const item = items[nextIndex];
      if (!item) return;
      shouldScrollToActiveRef.current = options.scroll;
      setActive(item.id, inputModalityRef.current);
      onActiveChange?.(item, nextIndex);
      if (options.announce) announce(nextIndex);
      if (options.history !== "none") {
        syncHistory(
          item,
          scrollerRef.current?.scrollLeft ?? 0,
          options.history
        );
      }
      if (options.focus) {
        window.requestAnimationFrame(() => itemRefs.current.get(item.id)?.focus());
      }
    },
    [announce, items, onActiveChange, setActive, syncHistory]
  );

  useEffect(() => {
    if (restoredInitialLocationRef.current || items.length === 0) return;
    restoredInitialLocationRef.current = true;
    const location = locationCodec.parse(
      new URLSearchParams(window.location.search)
    );
    const registryId = location.activeRegistryId;
    const linkedIndex = registryId
      ? items.findIndex((item) => item.registryId === registryId)
      : -1;
    if (registryId && linkedIndex < 0) {
      const url = new URL(window.location.href);
      url.search = locationCodec
        .build(url.searchParams, { activeRegistryId: null })
        .toString();
      window.history.replaceState(window.history.state, "", url);
      const frame = window.requestAnimationFrame(() =>
        setAnnouncement(emptyLabel)
      );
      return () => window.cancelAnimationFrame(frame);
    }
    if (linkedIndex < 0) return;
    const frame = window.requestAnimationFrame(() => {
      restore({ activeId: items[linkedIndex]?.id ?? null });
      activateIndex(linkedIndex, {
        scroll: true,
        focus: false,
        history: "replace",
        announce: false,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [
    activateIndex,
    emptyLabel,
    items,
    locationCodec,
    restore,
  ]);

  useLayoutEffect(() => {
    if (!activeItem) return;
    const element = itemRefs.current.get(activeItem.id);
    if (!element) return;

    const measure = () => {
      const nextExtent = element.getBoundingClientRect().width + ITEM_GAP_PX;
      if (nextExtent > ITEM_GAP_PX) {
        setItemExtent((current) =>
          Math.abs(current - nextExtent) > 1 ? nextExtent : current
        );
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeItem, windowRange.start]);

  useLayoutEffect(() => {
    if (!activeItem || !shouldScrollToActiveRef.current) return;
    const element = itemRefs.current.get(activeItem.id);
    const scroller = scrollerRef.current;
    if (!element || !scroller) return;
    shouldScrollToActiveRef.current = false;
    const itemRect = element.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const itemLeft =
      itemRect.left - scrollerRect.left + scroller.scrollLeft;
    scroller.scrollTo({
      left: itemLeft - (scroller.clientWidth - itemRect.width) / 2,
      behavior: "auto",
    });
  }, [activeItem, itemExtent, windowRange.start]);

  useEffect(() => {
    if (!activeItem) return;
    if (!shouldPrefetchArchiveImages(archiveConnectionPolicy())) return;
    const preloaders: HTMLImageElement[] = [];
    const start = Math.max(0, activeIndex - prefetchRadius);
    const end = Math.min(items.length - 1, activeIndex + prefetchRadius);
    for (let index = start; index <= end; index += 1) {
      if (index === activeIndex) continue;
      const item = items[index];
      if (!item?.imageUrl) continue;
      const image = new Image();
      image.decoding = "async";
      image.src = item.imageUrl;
      preloaders.push(image);
    }
    return () => {
      preloaders.forEach((image) => {
        image.removeAttribute("src");
      });
    };
  }, [activeIndex, activeItem, items, prefetchRadius]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 20
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * scroller.clientWidth
            : event.deltaY;
      const canMove =
        (delta > 0 && scroller.scrollLeft < maxScroll - 1) ||
        (delta < 0 && scroller.scrollLeft > 1);
      if (!canMove) return;
      event.preventDefault();
      inputModalityRef.current = "mouse";
      scroller.scrollLeft += delta;
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = archiveHistoryState(event.state);
      const registryId = locationCodec.parse(
        new URLSearchParams(window.location.search)
      ).activeRegistryId;
      const index = state
        ? items.findIndex((item) => item.id === state.id)
        : registryId
          ? items.findIndex((item) => item.registryId === registryId)
          : -1;
      if (index < 0) {
        if (registryId) {
          const url = new URL(window.location.href);
          url.search = locationCodec
            .build(url.searchParams, { activeRegistryId: null })
            .toString();
          window.history.replaceState(window.history.state, "", url);
          setAnnouncement(emptyLabel);
        }
        return;
      }
      inputModalityRef.current = "programmatic";
      restore({ activeId: items[index]?.id ?? null });
      activateIndex(index, {
        scroll: true,
        focus: false,
        history: "none",
        announce: true,
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    activateIndex,
    emptyLabel,
    items,
    locationCodec,
    restore,
  ]);

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller || items.length === 0) return;
      const paddingLeft =
        Number.parseFloat(window.getComputedStyle(scroller).paddingLeft) || 0;
      const itemWidth = Math.max(1, itemExtent - ITEM_GAP_PX);
      const centeredPosition =
        scroller.scrollLeft + scroller.clientWidth / 2 - paddingLeft;
      const nearestIndex =
        itemExtent > 0
          ? Math.max(
              0,
              Math.min(
                items.length - 1,
                Math.round((centeredPosition - itemWidth / 2) / itemExtent)
              )
            )
          : activeIndex;
      if (nearestIndex !== activeIndex) {
        shouldScrollToActiveRef.current = false;
        const item = items[nearestIndex];
        if (item) {
          setActive(item.id, inputModalityRef.current);
          onActiveChange?.(item, nearestIndex);
        }
      }
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = setTimeout(() => {
        const item = items[nearestIndex];
        if (!item) return;
        syncHistory(item, scroller.scrollLeft, "replace");
        announce(nearestIndex);
      }, 140);
    });
  }, [
    activeIndex,
    announce,
    itemExtent,
    items,
    onActiveChange,
    setActive,
    syncHistory,
  ]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    },
    []
  );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    index: number,
    item: LivingArchiveViewportItem
  ) => {
    const command = archiveCommandForKey(event.key, "browse");
    if (command && command !== "open" && command !== "close") {
      const nextIndex = indexForArchiveMove({
        currentIndex: index,
        itemCount: items.length,
        command,
        columns: 1,
        pageSize: 3,
      });
      event.preventDefault();
      inputModalityRef.current = "keyboard";
      activateIndex(nextIndex, {
        scroll: true,
        focus: true,
        history: "replace",
        announce: true,
      });
      return;
    }

    if (command === "open" && item.onOpen) {
      event.preventDefault();
      open(item.id, scrollerRef.current?.scrollLeft ?? 0, "keyboard");
      item.onOpen();
    } else if (command === "open" && item.href) {
      event.preventDefault();
      open(item.id, scrollerRef.current?.scrollLeft ?? 0, "keyboard");
      router.push(item.href);
    }
  };

  const handleCardClick = (
    event: MouseEvent<HTMLElement>,
    index: number
  ) => {
    if (isInteractiveTarget(event.target)) return;
    inputModalityRef.current = "mouse";
    activateIndex(index, {
      scroll: true,
      focus: true,
      history: "replace",
      announce: true,
    });
  };

  if (items.length === 0) {
    return <ArchiveEmptyState>{emptyLabel}</ArchiveEmptyState>;
  }

  const beforeWidth =
    windowRange.start > 0
      ? Math.max(0, windowRange.start * itemExtent - ITEM_GAP_PX)
      : 0;
  const remainingItems = Math.max(0, items.length - windowRange.end);
  const afterWidth =
    remainingItems > 0
      ? Math.max(0, remainingItems * itemExtent - ITEM_GAP_PX)
      : 0;

  return (
    <ArchiveLayout
      ariaLabel={ariaLabel}
      navigation={
        <ArchiveNavigation
          positionLabel={`${t("studio.archive.position")} ${
            activeIndex + 1
          } ${t("studio.archive.positionOf")} ${items.length}`}
          hint={t("studio.archive.navigationHint")}
        />
      }
    >
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onPointerDown={(event) => {
          inputModalityRef.current =
            event.pointerType === "touch" ? "touch" : "mouse";
        }}
        className="flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain px-[5%] pb-4 pt-1 [scrollbar-color:var(--v2-border-strong)_transparent] [scrollbar-width:thin] motion-reduce:scroll-auto"
        role="list"
        aria-roledescription={t("studio.archive.roledescription")}
        aria-label={ariaLabel}
      >
        {beforeWidth > 0 ? (
          <div
            className="shrink-0"
            style={{ width: beforeWidth }}
            aria-hidden
          />
        ) : null}

        {visibleItems.map((item, offset) => {
          const index = windowRange.start + offset;
          const isActive = index === activeIndex;
          const imageIntent = archiveImageIntent({
            index,
            activeIndex,
            visibleRange: {
              startIndex: Math.max(0, activeIndex - 2),
              endIndex: Math.min(items.length - 1, activeIndex + 2),
            },
            prefetchRadius,
          });

          return (
            <article
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              tabIndex={isActive ? 0 : -1}
              role="listitem"
              aria-roledescription={t("studio.archive.roledescription")}
              aria-label={`${item.title}, ${index + 1} ${t(
                "studio.archive.positionOf"
              )} ${items.length}`}
              aria-current={isActive ? "true" : undefined}
              aria-posinset={index + 1}
              aria-setsize={items.length}
              onFocus={() => {
                if (index === activeIndex) return;
                inputModalityRef.current = "keyboard";
                activateIndex(index, {
                  scroll: true,
                  focus: false,
                  history: "replace",
                  announce: true,
                });
              }}
              onClick={(event) => handleCardClick(event, index)}
              onKeyDown={(event) => handleKeyDown(event, index, item)}
              className={`living-archive-viewport__item group relative flex h-[82svh] min-h-[32rem] max-h-[46rem] shrink-0 basis-[88%] snap-center flex-col overflow-hidden rounded-xl border bg-[var(--v2-paper-bone,#f4efe6)] shadow-[var(--v2-shadow-paper)] outline-none transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--v2-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--v2-paper-bone)] motion-reduce:transition-none sm:h-[min(74dvh,46rem)] sm:min-h-[31rem] sm:basis-[82%] lg:grid lg:h-[min(72dvh,48rem)] lg:min-h-[36rem] lg:basis-[76%] lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.55fr)] xl:basis-[72%] ${
                isActive
                  ? "border-[var(--v2-border-strong)]"
                  : "border-[var(--v2-border)] opacity-80"
              }`}
              style={
                {
                  contentVisibility: isActive ? "visible" : "auto",
                  containIntrinsicSize: "720px",
                } as CSSProperties
              }
            >
              <ArchiveImage
                title={item.title}
                imageUrl={item.imageUrl}
                imageWidth={item.imageWidth}
                imageHeight={item.imageHeight}
                intent={imageIntent}
                failed={failedImageIds.has(imageFailureKey(item))}
                unavailableLabel={t("studio.archive.imageUnavailable")}
                onError={() =>
                  setFailedImageIds((current) => {
                    const next = new Set(current);
                    next.add(imageFailureKey(item));
                    return next;
                  })
                }
              />

              <ArchiveMetadata
                registryState={item.registryState}
                registryId={item.registryId}
                title={item.title}
                creator={item.creator}
                year={item.year}
                medium={item.medium}
                actions={
                  isActive ? (
                    <ArchiveActions
                      href={item.href}
                      onOpen={item.onOpen}
                      onBeforeOpen={() =>
                        open(
                          item.id,
                          scrollerRef.current?.scrollLeft ?? 0,
                          inputModalityRef.current
                        )
                      }
                      openLabel={
                        item.openLabel ?? t("studio.archive.openWork")
                      }
                    >
                      {item.actions}
                    </ArchiveActions>
                  ) : null
                }
              />
            </article>
          );
        })}

        {afterWidth > 0 ? (
          <div className="shrink-0" style={{ width: afterWidth }} aria-hidden />
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </ArchiveLayout>
  );
}
