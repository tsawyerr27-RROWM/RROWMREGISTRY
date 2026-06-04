import type { MessageKey } from "@/lib/locale-messages";

/** Database / API role identifiers — never rename in Phase 1. */
export type SystemRole = "artist" | "gallery" | "collector";

/** Product surface identifiers (presentation only). */
export type ProductSurface = "studio" | "field" | "registry";

export type TranslateFn = (key: MessageKey) => string;

const ROLE_LABEL_KEYS: Record<SystemRole, MessageKey> = {
  artist: "ecosystem.role.creative",
  gallery: "ecosystem.role.organisation",
  collector: "ecosystem.role.collector",
};

const SURFACE_LABEL_KEYS: Record<ProductSurface, MessageKey> = {
  studio: "ecosystem.surface.studio",
  field: "ecosystem.surface.field",
  registry: "ecosystem.surface.registry",
};

const WORKSPACE_LABEL_KEYS: Record<SystemRole, MessageKey> = {
  artist: "ecosystem.workspace.studio",
  collector: "ecosystem.workspace.studio",
  gallery: "ecosystem.workspace.organisationStudio",
};

/** Participant label shown in account chrome, signup, get-started, etc. */
export function productRoleLabel(role: SystemRole, t: TranslateFn): string {
  return t(ROLE_LABEL_KEYS[role]);
}

/** Product surface label (Studio, The Field, Registry). */
export function productSurfaceLabel(surface: ProductSurface, t: TranslateFn): string {
  return t(SURFACE_LABEL_KEYS[surface]);
}

/** Workspace link label on account and related chrome. */
export function productWorkspaceLabel(role: SystemRole, t: TranslateFn): string {
  return t(WORKSPACE_LABEL_KEYS[role]);
}

export function isSystemRole(
  value: string | null | undefined
): value is SystemRole {
  return value === "artist" || value === "gallery" || value === "collector";
}
