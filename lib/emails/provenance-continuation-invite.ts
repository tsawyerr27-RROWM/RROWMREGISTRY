import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import {
  PROVENANCE_REGISTRY_DISCLAIMER,
  chronologyContinuationKindLabel,
  type ProvenanceTransferType,
} from "@/lib/provenance-transfer";

export type ProvenanceContinuationEmailParams = {
  artworkTitle: string;
  registryId: string;
  recipientEmail: string;
  /** How the current participant is described (e.g. collector display name). */
  fromParticipantLabel: string;
  categoryLabel: string;
  acceptLink: string;
};

export function provenanceContinuationSubject(artworkTitle: string): string {
  const t = artworkTitle.trim() || "Work";
  return `RROWM Registry · chronology continuation · ${t.slice(0, 60)}`;
}

export function buildProvenanceContinuationEmail(
  p: ProvenanceContinuationEmailParams
): { subject: string; html: string; text: string } {
  const title = escapeHtml(p.artworkTitle.trim() || "Untitled work");
  const reg = escapeHtml(p.registryId.trim());
  const holder = escapeHtml(p.fromParticipantLabel.trim() || "Recorded custodian");
  const cat = escapeHtml(p.categoryLabel.trim());
  const disclaimer = escapeHtml(PROVENANCE_REGISTRY_DISCLAIMER);

  const layout: RrowmEmailLayoutOpts = {
    preheader:
      "Formal invitation to extend the chronology of a work on the RROWM Registry.",
    blocks: [
      { type: "kicker", text: "Chronology continuation" },
      {
        type: "p",
        html: `You have been identified as the next recorded custodian of this work.`,
      },
      {
        type: "p",
        html: `<strong>Work</strong><br/>${title}<br/><span style="font-size:12px;color:#64748b;">Catalogue record · ${reg}</span>`,
      },
      {
        type: "p",
        html: `<strong>Offering participant</strong> (on file today)<br/>${holder}`,
      },
      {
        type: "p",
        html: `<strong>Transition narrated as</strong><br/>${cat}`,
      },
      { type: "hr" },
      {
        type: "p",
        html: `This invitation continues the historical record associated with the work. It is not legal transfer of title, a ruling on ownership, or a marketplace transaction. Participation is voluntary; accepted steps become part of the durable chronology.`,
      },
      {
        type: "p",
        html: `<span style="font-size:12px;color:#64748b;">${disclaimer}</span>`,
      },
    ],
    cta: { label: "Open invitation", url: p.acceptLink },
    footnoteHtml:
      "If you did not expect this message, you may ignore it. Do not forward the link.",
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = provenanceContinuationSubject(p.artworkTitle);

  const text = [
    subject,
    "",
    "You have been identified as the next recorded custodian of this work.",
    "",
    `Work: ${p.artworkTitle.trim() || "Untitled"}`,
    `Catalogue record: ${p.registryId.trim()}`,
    `Offering participant (on file today): ${p.fromParticipantLabel.trim() || "Recorded custodian"}`,
    `Transition narrated as: ${p.categoryLabel.trim()}`,
    "",
    "This invitation continues the historical record associated with the work.",
    "It is not legal transfer of title, a ruling on ownership, or a marketplace transaction.",
    "",
    PROVENANCE_REGISTRY_DISCLAIMER,
    "",
    "Open invitation:",
    p.acceptLink,
    "",
    `This message was sent to ${p.recipientEmail}.`,
  ].join("\n");

  return {
    subject,
    html: buildRrowmEmailHtml(inner, layout.preheader),
    text,
  };
}

export function categoryLabelForEmail(t: ProvenanceTransferType): string {
  return chronologyContinuationKindLabel(t);
}
