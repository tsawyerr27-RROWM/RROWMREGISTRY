import type { ProvenanceTimelineRow } from "@/lib/get-public-provenance";

/** Headlines from the public timeline that reflect participant or institutional confirmations. */
export function participantConfirmationLinesFromTimeline(
  rows: ProvenanceTimelineRow[]
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (s: string) => {
    const t = s.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };

  for (const row of rows) {
    if (row.kind === "single") {
      if (isConfirmationLikeTitle(row.title)) add(row.title);
    } else {
      for (const it of row.items) {
        if (isConfirmationLikeTitle(it.title)) add(it.title);
      }
    }
  }
  return out;
}

function isConfirmationLikeTitle(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("confirmation") ||
    t.includes("attestation") ||
    t.includes("institutional") ||
    t.includes("gallery") ||
    t.includes("certificate") ||
    t.includes("chronology continued") ||
    t.includes("custody reflected") ||
    t.includes("custodial") ||
    t.includes("participant") ||
    (t.includes("verified") && !t.includes("not verified")) ||
    (t.includes("issued") && t.includes("certificate"))
  );
}
