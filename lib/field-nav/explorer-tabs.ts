import type { MessageKey } from "@/lib/locale-messages";
import {
  FIELD_EXPLORER_CREATIVES,
  FIELD_EXPLORER_ORGANISATIONS,
  FIELD_EXPLORER_RECORDS,
  type FieldExplorerTabId,
} from "@/lib/field-nav/paths";

export type FieldExplorerTab = {
  id: FieldExplorerTabId;
  href: string;
  labelKey: MessageKey;
};

/** Creatives first during PR1 rollout (phase-2a-pr1-field-foundation-plan §7). */
export const FIELD_EXPLORER_TABS: readonly FieldExplorerTab[] = [
  {
    id: "creatives",
    href: FIELD_EXPLORER_CREATIVES,
    labelKey: "field.explorer.tab.creatives",
  },
  {
    id: "organisations",
    href: FIELD_EXPLORER_ORGANISATIONS,
    labelKey: "field.explorer.tab.organisations",
  },
  {
    id: "records",
    href: FIELD_EXPLORER_RECORDS,
    labelKey: "field.explorer.tab.records",
  },
] as const;
