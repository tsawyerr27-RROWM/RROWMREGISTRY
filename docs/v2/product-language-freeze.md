# Product Language Freeze

**Document status:** FROZEN  
**Effective:** 31 May 2026  
**Authority:** Product Blueprint v1.1 (APPROVED), Phase 1 Studio Foundation Specification (LOCKED)  
**Scope:** Presentation language only — no database, role enum, permission, route, or API changes

---

## Product surfaces (public-facing)

| Surface | Public label (EN) | Internal system term |
|---------|-------------------|----------------------|
| Studio | **Studio** | `studio` |
| The Field | **The Field** | `field` |
| Registry | **Registry** | `registry` |

Phase 1 introduces terminology support for all three surfaces. **The Field** has no user-facing routes or functionality in Phase 1; labels exist for consistent chrome only.

---

## Participant language (public-facing)

| Internal role (`actor_profiles.role`) | Public label (EN) | Legacy UI term (pre–Phase 1) |
|---------------------------------------|-------------------|------------------------------|
| `artist` | **Creative** | Artist |
| `gallery` | **Organisation** | Gallery, institutional studio |
| `collector` | **Collector** | Collector (unchanged) |

---

## Internal system language (unchanged)

The following remain **code, schema, and API identifiers** — not shown as primary user-facing role labels in Phase 1 chrome:

| Domain | Terms |
|--------|--------|
| Roles | `artist`, `gallery`, `collector` |
| Surfaces / paths | `studio`, `field`, `registry` |
| Tables / RPCs | `artists`, `galleries`, `actor_profiles`, etc. |

---

## Implementation rules

1. **Presentation only** — use `lib/studio-terminology.ts` and locale keys (`ecosystem.role.*`, `ecosystem.surface.*`); do not rename DB columns, enums, or route segments in Phase 1.
2. **Chrome scope** — Header, signup, get-started, account role displays, workspace link labels, welcome modals, and navigation chrome where a role or surface name is shown.
3. **Preserved** — Section nav keys (`studio.nav.*`, `gallery.nav.*`), registry record copy, legal/technical uses of “gallery” where verification authority is described, and roster/artist references to represented persons.
4. **No Phase 1 expansion** — Field Opportunity, Practice, Sector, Project, Brief, Programme strings.

---

## Unlock procedure

Changes to this freeze require explicit unlock and a documented version bump (e.g. v1.1 → v1.2), same governance tier as Blueprint amendments for product-facing renames.

---

## Related documents

| Document | Role |
|----------|------|
| [Product Blueprint v1.1](./product-blueprint-v1.1.md) | Strategic naming |
| [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) | TM-1–TM-6 tasks |
| [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) | Document hierarchy |
