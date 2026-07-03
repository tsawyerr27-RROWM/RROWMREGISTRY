/** Canonical `/field` path segments — single source for App Router and href builders. */

export const FIELD_ROOT = "/field" as const;

export const FIELD_EXPLORER = `${FIELD_ROOT}/explorer` as const;
export const FIELD_EXPLORER_CREATIVES = `${FIELD_EXPLORER}/creatives` as const;
export const FIELD_EXPLORER_ORGANISATIONS = `${FIELD_EXPLORER}/organisations` as const;
export const FIELD_EXPLORER_RECORDS = `${FIELD_EXPLORER}/records` as const;

export const FIELD_VERIFY = `${FIELD_ROOT}/verify` as const;

export const FIELD_OPPORTUNITIES = `${FIELD_ROOT}/opportunities` as const;
export const FIELD_PROGRAMMES = `${FIELD_ROOT}/programmes` as const;

export type FieldExplorerTabId =
  | "creatives"
  | "organisations"
  | "opportunities"
  | "records";

export function isFieldPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === FIELD_ROOT || pathname.startsWith(`${FIELD_ROOT}/`);
}

export function isFieldExplorerPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === FIELD_EXPLORER || pathname.startsWith(`${FIELD_EXPLORER}/`);
}

export function isFieldOpportunitiesPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === FIELD_OPPORTUNITIES || pathname.startsWith(`${FIELD_OPPORTUNITIES}/`);
}

/** Routes that show the Field subheader (Records · Creatives · Organisations · Opportunities). */
export function isFieldSubnavPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === FIELD_ROOT || pathname === FIELD_EXPLORER) return false;
  return isFieldExplorerPath(pathname) || isFieldOpportunitiesPath(pathname);
}

export function fieldExplorerTabFromPath(
  pathname: string | null | undefined
): FieldExplorerTabId | null {
  if (!pathname) return null;
  if (
    pathname === FIELD_EXPLORER_CREATIVES ||
    pathname.startsWith(`${FIELD_EXPLORER_CREATIVES}/`)
  ) {
    return "creatives";
  }
  if (
    pathname === FIELD_EXPLORER_ORGANISATIONS ||
    pathname.startsWith(`${FIELD_EXPLORER_ORGANISATIONS}/`)
  ) {
    return "organisations";
  }
  if (
    pathname === FIELD_EXPLORER_RECORDS ||
    pathname.startsWith(`${FIELD_EXPLORER_RECORDS}/`)
  ) {
    return "records";
  }
  if (
    pathname === FIELD_OPPORTUNITIES ||
    pathname.startsWith(`${FIELD_OPPORTUNITIES}/`)
  ) {
    return "opportunities";
  }
  if (pathname === FIELD_EXPLORER) return null;
  return null;
}
