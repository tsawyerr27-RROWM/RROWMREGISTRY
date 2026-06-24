import { escapeHtml } from "@/lib/html-escape";
import {
  buildRrowmEmailHtml,
  rrowmEmailInnerFromOpts,
  type RrowmEmailLayoutOpts,
} from "@/lib/emails/rrowm-email-layout";
import { PROVENANCE_REGISTRY_DISCLAIMER } from "@/lib/provenance-transfer";

export type AcquisitionOwnershipEmailParams = {
  artworkTitle: string;
  registryId: string;
  recipientEmail: string;
  counterpartyLabel: string;
  actionHref: string;
};

export function buildBuyerStewardshipClaimEmail(
  p: AcquisitionOwnershipEmailParams
): { subject: string; html: string; text: string } {
  const title = escapeHtml(p.artworkTitle.trim() || "Untitled work");
  const reg = escapeHtml(p.registryId.trim());
  const seller = escapeHtml(p.counterpartyLabel.trim() || "Recorded custodian");
  const disclaimer = escapeHtml(PROVENANCE_REGISTRY_DISCLAIMER);

  const layout: RrowmEmailLayoutOpts = {
    preheader: "Claim stewardship of your newly acquired work on the RROWM Registry.",
    blocks: [
      { type: "kicker", text: "Acquisition stewardship" },
      {
        type: "p",
        html: `Your acquisition is ready for registry continuity. Claim stewardship to complete the handoff.`,
      },
      {
        type: "p",
        html: `<strong>Work</strong><br/>${title}<br/><span style="font-size:12px;color:#64748b;">Catalogue record · ${reg}</span>`,
      },
      {
        type: "p",
        html: `<strong>From</strong><br/>${seller}`,
      },
      { type: "hr" },
      {
        type: "p",
        html: `Accepting continues the historical record associated with the work. It is not legal transfer of title.`,
      },
      {
        type: "p",
        html: `<span style="font-size:12px;color:#64748b;">${disclaimer}</span>`,
      },
    ],
    cta: { label: "Claim stewardship", url: p.actionHref },
    footnoteHtml: "If you did not expect this message, you may ignore it.",
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = `RROWM Registry · claim stewardship · ${p.artworkTitle.trim() || "Work"}`.slice(
    0,
    120
  );

  const text = [
    subject,
    "",
    "Claim stewardship of your newly acquired work.",
    "",
    `Work: ${p.artworkTitle.trim() || "Untitled"}`,
    `Catalogue record: ${p.registryId.trim()}`,
    `From: ${p.counterpartyLabel.trim() || "Recorded custodian"}`,
    "",
    PROVENANCE_REGISTRY_DISCLAIMER,
    "",
    "Claim stewardship:",
    p.actionHref,
    "",
    `This message was sent to ${p.recipientEmail}.`,
  ].join("\n");

  return { subject, html: buildRrowmEmailHtml(inner, layout.preheader), text };
}

export function buildSellerTransferConfirmationEmail(
  p: AcquisitionOwnershipEmailParams
): { subject: string; html: string; text: string } {
  const title = escapeHtml(p.artworkTitle.trim() || "Untitled work");
  const reg = escapeHtml(p.registryId.trim());
  const buyer = escapeHtml(p.counterpartyLabel.trim() || "Acquiring participant");

  const layout: RrowmEmailLayoutOpts = {
    preheader: "Confirm transfer of stewardship for your completed acquisition deal.",
    blocks: [
      { type: "kicker", text: "Transfer confirmation" },
      {
        type: "p",
        html: `You have issued a stewardship transfer for this acquisition. The buyer has been invited to claim stewardship on the registry.`,
      },
      {
        type: "p",
        html: `<strong>Work</strong><br/>${title}<br/><span style="font-size:12px;color:#64748b;">Catalogue record · ${reg}</span>`,
      },
      {
        type: "p",
        html: `<strong>Acquiring participant</strong><br/>${buyer}`,
      },
      { type: "hr" },
      {
        type: "p",
        html: `Track the deal workspace until the buyer accepts and the registry ledger updates.`,
      },
    ],
    cta: { label: "Open deal workspace", url: p.actionHref },
    footnoteHtml: "This is a registry continuity record, not legal transfer of title.",
  };

  const inner = rrowmEmailInnerFromOpts(layout);
  const subject = `RROWM Registry · confirm transfer · ${p.artworkTitle.trim() || "Work"}`.slice(
    0,
    120
  );

  const text = [
    subject,
    "",
    "Confirm transfer of stewardship.",
    "",
    `Work: ${p.artworkTitle.trim() || "Untitled"}`,
    `Catalogue record: ${p.registryId.trim()}`,
    `Acquiring participant: ${p.counterpartyLabel.trim() || "Acquiring participant"}`,
    "",
    "Open deal workspace:",
    p.actionHref,
    "",
    `This message was sent to ${p.recipientEmail}.`,
  ].join("\n");

  return { subject, html: buildRrowmEmailHtml(inner, layout.preheader), text };
}
