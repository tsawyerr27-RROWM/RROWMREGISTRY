import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";

function safeYear(iso: string): number | null {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(iso).getUTCFullYear();
}

function minMaxYears(isos: string[]): { min: number; max: number } | null {
  const years = isos
    .map(safeYear)
    .filter((y): y is number => y != null);
  if (!years.length) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

/**
 * Observational, duration-aware copy for chronology surfaces. Not anniversaries,
 * notifications, or engagement resurfacing.
 */
export function chronologyTemporalRecallLines(
  bundle: ArchivalProvenanceBundle | null | undefined
): string[] {
  if (!bundle?.events?.length) return [];

  const isos = bundle.events.map((e) => e.dateIso);
  const mm = minMaxYears(isos);
  const openedYear = mm?.min ?? null;

  const custodialChapters = bundle.events.filter(
    (e) =>
      e.narrativeKind === "transfer" ||
      e.narrativeKind === "provenance_continuation"
  ).length;

  const hasInstitution = bundle.events.some(
    (e) => e.narrativeKind === "institutional_confirmation"
  );

  const lines: string[] = [];

  if (openedYear != null) {
    lines.push(`Continuously documented since ${openedYear}.`);
  }

  if (custodialChapters >= 2) {
    lines.push(
      "This chronology has expanded across multiple custodial chapters."
    );
  } else if (mm && mm.max - mm.min >= 1) {
    lines.push("Chronology filings span more than one calendar year.");
  }

  if (lines.length < 2 && hasInstitution) {
    lines.push("Institution-linked continuity remains on file.");
  }

  return lines.slice(0, 2);
}

export function institutionEnduranceNote(args: {
  documentedSinceYear: number | null;
  verified: boolean;
  representedWorkCount: number;
}): string | null {
  const { documentedSinceYear, verified, representedWorkCount } = args;
  if (!verified) return null;
  let note =
    documentedSinceYear != null
      ? `Institution-linked continuity remains on file; catalogue presence since ${documentedSinceYear}.`
      : "Institution-linked continuity remains on file.";
  if (representedWorkCount >= 3) {
    note +=
      " Enduring representation across multiple registry records on file.";
  }
  return note;
}

export type ArtistTemporalAnchor = {
  earliestWorkYear: number | null;
  worksOnFile: number;
};

export function artistTemporalRecallLines(
  anchor: ArtistTemporalAnchor | null
): string[] {
  if (!anchor || anchor.worksOnFile < 1) return [];
  const lines: string[] = [];
  if (anchor.earliestWorkYear != null) {
    lines.push(
      `Attributed works on this catalogue have been filed since ${anchor.earliestWorkYear}.`
    );
  }
  if (anchor.worksOnFile >= 4 && lines.length < 2) {
    lines.push(
      "Participation recurs across several distinct catalogue records on file."
    );
  }
  return lines.slice(0, 2);
}

export type CollectorTemporalStats = {
  total_owned: number;
  verified_owned: number;
};

/** Discreet copy for public collector surfaces. Not prestige or social recognition. */
export function collectorTemporalPresenceLines(
  stats: CollectorTemporalStats | null
): string[] {
  if (!stats || stats.total_owned < 1) return [];
  if (stats.total_owned >= 3) {
    return [
      "Chronology participation recurs across several distinct catalogue records on file.",
    ];
  }
  if (stats.total_owned >= 2) {
    return ["Holdings on file span more than one catalogue chronology."];
  }
  return [];
}
