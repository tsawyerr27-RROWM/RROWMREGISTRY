"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_FIELD_EXPLORER_DENSITY,
  type FieldExplorerDensity,
  type FieldExplorerKind,
  fieldExplorerDensityStorageKey,
  parseFieldExplorerDensity,
} from "@/lib/field-explorer-density";

export function useFieldExplorerDensity(kind: FieldExplorerKind) {
  const storageKey = fieldExplorerDensityStorageKey(kind);
  const [density, setDensityState] = useState<FieldExplorerDensity>(
    DEFAULT_FIELD_EXPLORER_DENSITY
  );

  useEffect(() => {
    setDensityState(
      parseFieldExplorerDensity(window.localStorage.getItem(storageKey))
    );
  }, [storageKey]);

  const setDensity = useCallback(
    (next: FieldExplorerDensity) => {
      setDensityState(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* ignore quota / private mode */
      }
    },
    [storageKey]
  );

  return { density, setDensity };
}
