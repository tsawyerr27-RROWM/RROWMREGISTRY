import type { ArchivalProvenanceBundle, ArchivalTimelineEvent } from "@/lib/provenance-timeline";
import type { RecordCompletenessLevel } from "@/lib/record-completeness";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";

type TFn = (key: MessageKey) => string;

const EVENT_TITLE_KEYS: Record<string, MessageKey> = {
  "Work entered into registry": "provenance.event.registration",
  "Institutional relationship recorded": "provenance.event.institutional",
  "Participant confirmation added": "provenance.event.artistConfirmation",
  "Participant confirmation recorded": "provenance.event.confirmation",
  "Certificate documented on file": "provenance.event.certificate",
  "Custody reflected in chronology": "provenance.event.custody",
  "Chronology continued · Custodial chapter recorded":
    "provenance.event.continuationGeneric",
  "Record reviewed · formal channel opened": "provenance.event.disputeOpen",
  "Supporting material attached": "provenance.event.supportingMaterial",
  "Formal review concluded": "provenance.event.disputeResolved",
  "Ownership transfer": "provenance.transfer.ownership",
  "Initial record": "provenance.transfer.initial",
  "Record update": "provenance.transfer.update",
  "Ownership event": "provenance.transfer.event",
};

const CONTINUATION_CATEGORY_KEYS: Record<string, MessageKey> = {
  "Private transfer": "provenance.category.privateTransfer",
  Sale: "provenance.category.sale",
  Gift: "provenance.category.gift",
  Inheritance: "provenance.category.inheritance",
  Continuation: "provenance.category.continuation",
};

const PARTICIPANT_LABEL_KEYS: Record<string, MessageKey> = {
  "Attributed to registered artist": "provenance.participant.registeredArtist",
  "Represented institution": "provenance.participant.representedInstitution",
  "Attributed artist": "provenance.participant.attributedArtist",
  "Issuing authority recorded": "provenance.participant.issuingAuthority",
  "Independent registry review": "provenance.participant.independentReview",
};

const VERIFICATION_LABEL_KEYS: Record<string, MessageKey> = {
  "Opening facts on file": "provenance.verification.openingFacts",
  "Participant confirmation on file": "provenance.verification.participantConfirmation",
  "On file · artist attestation": "provenance.verification.artistAttestation",
  "Confirmation on file": "provenance.verification.confirmation",
  "Document on file": "provenance.verification.document",
  "Participant-confirmed on file": "provenance.verification.participantConfirmed",
  "On file · claim": "provenance.verification.claim",
  "On file · recorded": "provenance.verification.recorded",
  "Review process on file": "provenance.verification.reviewProcess",
  "Appended to review file": "provenance.verification.appendedReview",
  "Outcome on file": "provenance.verification.outcome",
  "Outcome on file · dismissed": "provenance.verification.outcomeDismissed",
};

const CONTINUITY_KEYS: Record<string, MessageKey> = {
  "Chronological custody chain without recorded breaks":
    "provenance.continuity.chainIntact",
  "Participant-confirmed custody milestone on file":
    "provenance.continuity.custodyMilestone",
  "Supporting material on file": "provenance.continuity.supportingMaterial",
  "Institutional or artist confirmations align with verified custody":
    "provenance.continuity.alignsWithCustody",
  "Chronology continued by recorded participants":
    "provenance.continuity.continuedByParticipants",
};

export function translateEventTitle(ev: ArchivalTimelineEvent, t: TFn): string {
  const mapped = EVENT_TITLE_KEYS[ev.displayTitle];
  if (mapped) return t(mapped);

  if (ev.displayTitle.startsWith("Chronology continued · ")) {
    const inner = ev.displayTitle
      .replace("Chronology continued · ", "")
      .replace(/ recorded$/, "");
    const categoryKey = CONTINUATION_CATEGORY_KEYS[inner];
    if (categoryKey) {
      return fillMessage(t("provenance.event.continuationCategory"), {
        category: t(categoryKey),
      });
    }
    return t("provenance.event.continuationGeneric");
  }

  return ev.displayTitle;
}

export function translateParticipantLabel(
  label: string | null,
  t: TFn
): string | null {
  if (!label) return null;
  const mapped = PARTICIPANT_LABEL_KEYS[label];
  if (mapped) return t(mapped);
  if (label.startsWith("Attributed to ")) {
    return fillMessage(t("provenance.participant.attributedTo"), {
      name: label.slice("Attributed to ".length),
    });
  }
  if (label.startsWith("From ") && label.includes(" to ")) {
    const match = /^From (.+) to (.+)$/.exec(label);
    if (match) {
      return fillMessage(t("provenance.participant.fromTo"), {
        from: match[1],
        to: match[2],
      });
    }
  }
  return label;
}

export function translateVerificationLabel(label: string, t: TFn): string {
  const key = VERIFICATION_LABEL_KEYS[label];
  return key ? t(key) : label;
}

export function translateContinuityIndicator(line: string, t: TFn): string {
  const key = CONTINUITY_KEYS[line];
  return key ? t(key) : line;
}

export function recordCompletenessLabelKey(
  level: RecordCompletenessLevel
): MessageKey {
  switch (level) {
    case "high":
      return "provenance.completeness.high";
    case "moderate":
      return "provenance.completeness.moderate";
    default:
      return "provenance.completeness.limited";
  }
}

export function recordCompletenessDescriptionKey(
  level: RecordCompletenessLevel
): MessageKey {
  switch (level) {
    case "high":
      return "provenance.completeness.highDesc";
    case "moderate":
      return "provenance.completeness.moderateDesc";
    default:
      return "provenance.completeness.limitedDesc";
  }
}

function safeYear(iso: string): number | null {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return new Date(iso).getUTCFullYear();
}

export function chronologyTemporalRecallLinesI18n(
  bundle: ArchivalProvenanceBundle | null | undefined,
  t: TFn
): string[] {
  if (!bundle?.events?.length) return [];

  const isos = bundle.events.map((e) => e.dateIso);
  const years = isos.map(safeYear).filter((y): y is number => y != null);
  const openedYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

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
    lines.push(
      fillMessage(t("provenance.temporal.sinceYear"), { year: openedYear })
    );
  }

  if (custodialChapters >= 2) {
    lines.push(t("provenance.temporal.multipleChapters"));
  } else if (
    openedYear != null &&
    maxYear != null &&
    maxYear - openedYear >= 1
  ) {
    lines.push(t("provenance.temporal.spanYears"));
  }

  if (lines.length < 2 && hasInstitution) {
    lines.push(t("provenance.temporal.institutionContinuity"));
  }

  return lines.slice(0, 2);
}

export function formatArchivalDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const INSIGHT_MESSAGE_KEYS: Record<string, MessageKey> = {
  "This work has no verification signals.": "provenance.insight.noVerification",
  "Current ownership is unverified.": "provenance.insight.ownershipUnverified",
  "Sale recorded. Ownership transfer incomplete.":
    "provenance.insight.saleIncomplete",
  "Fully verified record.": "provenance.insight.fullyVerified",
  "No recent activity recorded.": "provenance.insight.noRecentActivity",
};

export function translateProvenanceInsight(message: string, t: TFn): string {
  const key = INSIGHT_MESSAGE_KEYS[message];
  return key ? t(key) : message;
}
