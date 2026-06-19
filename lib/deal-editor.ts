import { rrowmEconomicSurface } from "@/styles/rrowm-theme";

export const DEAL_EDITOR_INPUT_CLASS = rrowmEconomicSurface.input;

export const DEAL_EDITOR_CORRESPONDENCE_CLASS = `${DEAL_EDITOR_INPUT_CLASS} min-h-[14rem] resize-y text-[15px] leading-relaxed`;

export type DealEditorSectionId =
  | "deal-type"
  | "counterparty"
  | "terms"
  | "correspondence"
  | "review";

export type DealEditorSection = {
  id: DealEditorSectionId;
  label: string;
  lead: string;
};

export const DEAL_EDITOR_SECTIONS: DealEditorSection[] = [
  {
    id: "deal-type",
    label: "Deal type",
    lead: "Choose the formal intent for this proposal. Each type files different terms on the deal record.",
  },
  {
    id: "counterparty",
    label: "Counterparty",
    lead: "Identify the Field participant this proposal is addressed to.",
  },
  {
    id: "terms",
    label: "Terms",
    lead: "Define the commercial and documentary terms that will appear on the deal record.",
  },
  {
    id: "correspondence",
    label: "Correspondence",
    lead: "Draft the first entry in the negotiation ledger. This letter is shared with your counterparty.",
  },
  {
    id: "review",
    label: "Review",
    lead: "Confirm the proposal before it is issued to the counterparty.",
  },
];

export function dealEditorSections(requireCounterparty: boolean): DealEditorSection[] {
  if (requireCounterparty) return DEAL_EDITOR_SECTIONS;
  return DEAL_EDITOR_SECTIONS.filter((section) => section.id !== "counterparty");
}

export const DEAL_EDITOR_SECTION_CARD = `${rrowmEconomicSurface.section} scroll-mt-32`;
