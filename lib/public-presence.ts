export type PublicPresence = {
  profile: boolean;
  ownership: boolean;
  values: boolean;
  location: boolean;
};

export const DEFAULT_PUBLIC_PRESENCE: PublicPresence = {
  profile: true,
  ownership: true,
  values: true,
  location: true,
};

export function parsePublicPresence(raw: unknown): PublicPresence {
  if (raw == null || typeof raw !== "object") {
    return { ...DEFAULT_PUBLIC_PRESENCE };
  }
  const o = raw as Record<string, unknown>;
  return {
    profile: o.profile !== false,
    ownership: o.ownership !== false,
    values: o.values !== false,
    location: o.location !== false,
  };
}

export function toPublicPresenceJson(p: PublicPresence): Record<string, boolean> {
  return {
    profile: p.profile,
    ownership: p.ownership,
    values: p.values,
    location: p.location,
  };
}
