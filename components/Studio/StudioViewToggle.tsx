"use client";

import {
  ArchiveViewSwitcher,
  useArchiveViewMode,
  type ArchiveViewOption,
} from "@/components/Studio/ArchiveViewSwitcher";
import {
  normalizeArchivePresentationMode,
  type ArchivePresentationMode,
} from "@/lib/living-archive";

export type StudioViewMode = ArchivePresentationMode;

const LEDGER_ARCHIVE_MODES = ["ledger", "archive"] as const;

function migrateLegacyGalleryMode(stored: string): string {
  return normalizeArchivePresentationMode(stored);
}

/** Session-persisted Ledger/Archive view mode. */
export function useStudioViewMode(
  storageKey: string,
  fallback: StudioViewMode = "archive"
): [StudioViewMode, (mode: StudioViewMode) => void, boolean] {
  const [mode, setMode, ready] = useArchiveViewMode(
    storageKey,
    fallback,
    LEDGER_ARCHIVE_MODES,
    migrateLegacyGalleryMode
  );
  return [
    mode as StudioViewMode,
    (next) => setMode(next),
    ready,
  ];
}

type Props = {
  mode: StudioViewMode;
  onChange: (mode: StudioViewMode) => void;
  label: string;
  ledgerLabel: string;
  archiveLabel: string;
};

/** Ledger ↔ Archive toggle — thin wrapper over `ArchiveViewSwitcher`. */
export function StudioViewToggle({
  mode,
  onChange,
  label,
  ledgerLabel,
  archiveLabel,
}: Props) {
  const options: ArchiveViewOption[] = [
    { id: "ledger", label: ledgerLabel },
    { id: "archive", label: archiveLabel },
  ];

  const handleChange = (next: StudioViewMode) => {
    onChange(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    if (next === "ledger") {
      url.searchParams.delete("work");
      url.searchParams.delete("detail");
    }
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <ArchiveViewSwitcher
      label={label}
      mode={mode}
      onChange={(next) => handleChange(next as StudioViewMode)}
      options={options}
    />
  );
}
