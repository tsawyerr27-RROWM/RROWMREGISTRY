"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  type ArchiveInputModality,
  type ArchiveMoveCommand,
  type ArchiveVisibleRange,
  createLivingArchiveState,
  livingArchiveReducer,
} from "@/lib/living-archive";

type Options = {
  orderedIds: readonly string[];
  preferredId?: string | null;
};

/**
 * React controller for the headless Living Archive reducer.
 *
 * Renderers own measurement and scrolling; this hook is the single production
 * state-transition boundary for active, selected, modality and visible range.
 */
export function useArchiveController({
  orderedIds,
  preferredId = null,
}: Options) {
  const [state, dispatch] = useReducer(
    livingArchiveReducer,
    { orderedIds, preferredId },
    ({ orderedIds: initialIds, preferredId: initialPreferredId }) =>
      createLivingArchiveState(initialIds, initialPreferredId)
  );
  const orderedIdsKey = orderedIds.join("\u001f");

  useEffect(() => {
    const nextIds = [...orderedIds];
    const frame = window.requestAnimationFrame(() => {
      dispatch({
        type: "items-changed",
        orderedIds: nextIds,
        preferredId,
      });
    });
    return () => window.cancelAnimationFrame(frame);
    // The stable identity fingerprint prevents object-array churn from
    // dispatching an equivalent item update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedIdsKey, preferredId]);

  const activeIndex = useMemo(
    () =>
      state.activeId ? state.orderedIds.indexOf(state.activeId) : -1,
    [state.activeId, state.orderedIds]
  );

  const setActive = useCallback(
    (id: string, modality: ArchiveInputModality) => {
      dispatch({ type: "set-active", id, modality });
    },
    []
  );

  const move = useCallback(
    (
      command: ArchiveMoveCommand,
      modality: ArchiveInputModality,
      options: { columns?: number; pageSize?: number } = {}
    ) => {
      dispatch({
        type: "move",
        command,
        columns: options.columns ?? 1,
        pageSize: options.pageSize,
        modality,
      });
    },
    []
  );

  const open = useCallback(
    (
      id: string | null,
      returnScrollOffset: number,
      modality: ArchiveInputModality
    ) => {
      dispatch({
        type: "open-focus",
        id,
        returnScrollOffset,
        modality,
      });
    },
    []
  );

  const close = useCallback((modality: ArchiveInputModality) => {
    dispatch({ type: "close-focus", modality });
  }, []);

  const restore = useCallback(
    (args: {
      activeId: string | null;
      selectedId?: string | null;
      returnScrollOffset?: number;
    }) => {
      dispatch({
        type: "restore",
        activeId: args.activeId,
        selectedId: args.selectedId ?? null,
        returnScrollOffset: args.returnScrollOffset ?? 0,
      });
    },
    []
  );

  const setVisibleRange = useCallback((range: ArchiveVisibleRange) => {
    dispatch({ type: "set-visible-range", range });
  }, []);

  return {
    state,
    activeIndex,
    setActive,
    move,
    open,
    close,
    restore,
    setVisibleRange,
  };
}
