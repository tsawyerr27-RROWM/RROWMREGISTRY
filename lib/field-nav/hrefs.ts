import {
  FIELD_EXPLORER,
  FIELD_EXPLORER_CREATIVES,
  FIELD_EXPLORER_ORGANISATIONS,
  FIELD_EXPLORER_RECORDS,
  FIELD_ROOT,
  FIELD_VERIFY,
} from "@/lib/field-nav/paths";

function encodeSlug(slug: string): string {
  return encodeURIComponent(slug.trim());
}

export function fieldHomeHref(): string {
  return FIELD_ROOT;
}

export function fieldExplorerHref(): string {
  return FIELD_EXPLORER;
}

export function fieldExplorerCreativesHref(): string {
  return FIELD_EXPLORER_CREATIVES;
}

export function fieldExplorerOrganisationsHref(): string {
  return FIELD_EXPLORER_ORGANISATIONS;
}

export function fieldExplorerRecordsHref(): string {
  return FIELD_EXPLORER_RECORDS;
}

export function fieldCreativeHref(slug: string): string {
  return `${FIELD_ROOT}/creative/${encodeSlug(slug)}`;
}

export function fieldOrganisationHref(slug: string): string {
  return `${FIELD_ROOT}/organisation/${encodeSlug(slug)}`;
}

export function fieldCollectorHref(slug: string): string {
  return `${FIELD_ROOT}/collector/${encodeSlug(slug)}`;
}

export function fieldVerifyHref(): string {
  return FIELD_VERIFY;
}

export function fieldVerifyRecordHref(registryId: string): string {
  return `${FIELD_VERIFY}/${encodeSlug(registryId)}`;
}

export function fieldRecordHref(registryId: string): string {
  return `${FIELD_ROOT}/record/${encodeSlug(registryId)}`;
}
