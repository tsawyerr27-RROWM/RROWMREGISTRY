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

/** Records first — Registry default tab (phase-2b-discovery-expansion-spec §9.1). */
export const FIELD_EXPLORER_TABS: readonly FieldExplorerTab[] = [
  {
    id: "records",
    href: FIELD_EXPLORER_RECORDS,
    labelKey: "field.explorer.tab.records",
  },
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
] as const;
