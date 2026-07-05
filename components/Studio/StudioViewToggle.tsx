"use client";

import {
  ArchiveViewSwitcher,
  useArchiveViewMode,
  type ArchiveViewOption,
} from "@/components/Studio/ArchiveViewSwitcher";

export type StudioViewMode = "ledger" | "gallery";

const LEDGER_GALLERY_MODES = ["ledger", "gallery"] as const;

/** Session-persisted Ledger/Gallery view mode. */
export function useStudioViewMode(
  storageKey: string,
  fallback: StudioViewMode = "ledger"
): [StudioViewMode, (mode: StudioViewMode) => void] {
  const [mode, setMode] = useArchiveViewMode(storageKey, fallback, LEDGER_GALLERY_MODES);
  return [
    mode as StudioViewMode,
    (next) => setMode(next),
  ];
}

type Props = {
  mode: StudioViewMode;
  onChange: (mode: StudioViewMode) => void;
  label: string;
  ledgerLabel: string;
  galleryLabel: string;
};

/** Ledger ↔ Gallery toggle — thin wrapper over `ArchiveViewSwitcher`. */
export function StudioViewToggle({
  mode,
  onChange,
  label,
  ledgerLabel,
  galleryLabel,
}: Props) {
  const options: ArchiveViewOption[] = [
    { id: "ledger", label: ledgerLabel },
    { id: "gallery", label: galleryLabel },
  ];

  return (
    <ArchiveViewSwitcher
      label={label}
      mode={mode}
      onChange={(next) => onChange(next as StudioViewMode)}
      options={options}
    />
  );
}
