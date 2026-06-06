# Phase 2B PR3 — Relationship Context and Graph Navigation — Acceptance Notes

**Branch:** `pr/phase2b-pr3-graph`  
**Commit:** PR3 Relationship Context and Graph Navigation  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md` §6.2–6.3, `phase-2b-discovery-expansion-plan.md`

---

## Scope delivered

Deterministic relationship context panels across Field discovery surfaces. All connections derive from Registry evidence; no social graph, recommendations, ranking, or engagement ordering.

| Surface | Enhancement |
|---------|-------------|
| **Field Record** | Same Creative, Same Organisation, shared medium, practice explorer link, Registry continuity (Verify + Ledger) |
| **Creative Presence** | Organisation representation panel; practice discovery navigation |
| **Organisation Presence** | Roster context (≤6 public Creatives); catalogue context (≤6 records) |
| **Lib** | `lib/field-relationship-context.ts` — loaders, sort (verified-first, then recency), cap 6 |
| **UI** | `FieldRelationshipContextSection`, `FieldRelationshipContextPanel` |
| **i18n** | `field.context.*` keys (en/de/fr/ja) |

---

## Relationship types covered

| Type | Where |
|------|--------|
| Creative ↔ Record | Record “More works by {name}”; Org catalogue links |
| Creative ↔ Organisation | Creative org panel; Record org panel + profile links |
| Organisation ↔ Record | Record “More from {name}”; Org catalogue panel |
| Record ↔ Verify | Registry continuity panel |
| Record ↔ Ledger | Registry continuity panel |

---

## Product rules preserved

| Rule | Implementation |
|------|----------------|
| Registry-evidence only | Queries on `artwork_read_model`, roster, representation/filing gallery links |
| Deterministic panels | Fixed rules per spec §6.3; no similarity scores |
| Cap ≤6 per panel | `FIELD_RELATIONSHIP_CONTEXT_MAX` |
| Order verified-first, then recency | `sortContextArtworks` |
| Medium label not ML | Copy: “exact medium string” / not algorithmic similarity |
| Private profiles omitted | Links only when `public_presence.profile`; names still shown elsewhere |
| No social / recommendations / ranking | Section lede + panel rules; no new sort modes |
| Profile completeness unchanged | Studio-only (PR2); no Field completeness UI |
| PR1 search contract | Unchanged |
| PR1 redirects | Unchanged |
| Verified-default Record Explorer | Unchanged |

---

## Acceptance criteria mapping

### AC-GN*

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **AC-GN1** §6.2 edge matrix navigable | **Pass** | Existing graph links preserved; context panels add capped cross-navigation with “View all” explorer CTAs |
| **AC-GN2** Context panels deterministic only | **Pass** | `loadRecordRelationshipContextPanels`, `buildCreativeRelationshipContextPanels`, `buildOrganisationRelationshipContextPanels` — rule-based queries only |
| **AC-GN3** Legacy record URLs 301 to Field Record | **Pass** | Unchanged from PR1B |
| **AC-GN4** No broken links when profile private | **Pass** | `href` omitted when profile not public; org/creative context panels filter to linkable targets only |

### Plan §12.3 / PR3 exit (partial 2B graph)

| Item | Status |
|------|--------|
| Context panels on Record + presence pages | **Pass** |
| Practice explorer link from record context | **Pass** (when `primary_practice` on file) |
| Registry Verify + Ledger continuity panel | **Pass** |
| AC-PC* / AC-VT* | Unchanged (PR2 / PR4 scope) |

---

## Signoff mapping (PR1 → PR3)

| PR1 signoff gap | PR3 resolution |
|-----------------|----------------|
| AC-GN1 partial — context panels deferred | Context panels on Record, Creative, Organisation |
| AC-GN2 deferred | Deterministic panel rules implemented |
| Plan §12.2 PR3 row | Delivered |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| PR1 search contract (`lib/field-search-contract.ts`) | Unchanged |
| Redirects (`app/registry/[id]`, `app/artwork/[id]`) | Unchanged |
| Verified-default Record Explorer | Unchanged |
| Schema / migrations | None |

---

## Manual QA checklist

- [ ] Field Record with peer works: “More works by {Creative}” panel (≤6, verified-first)
- [ ] Field Record with org link: “More from {Organisation}” panel when related records exist
- [ ] Field Record with medium: shared-medium panel; copy does not imply ML similarity
- [ ] Field Record with primary practice: practice explorer CTA
- [ ] Field Record: Registry continuity links open Verify + Ledger
- [ ] Creative profile with public org: organisation context panel
- [ ] Creative profile with practice: practice discovery panel
- [ ] Organisation profile: roster + catalogue context panels; “View full roster” anchor when >6
- [ ] Private creative/org targets: no broken links in context panels

---

## Files touched (summary)

- `lib/field-relationship-context.ts` (new)
- `lib/field-record-page.ts`, `lib/field-creative-presence.ts`, `lib/field-organisation-presence.ts`
- `components/Field/FieldRelationshipContextSection.tsx`, `FieldRelationshipContextPanel.tsx`
- `components/Field/FieldRecordView.tsx`, `CreativePresenceView.tsx`, `OrganisationPresenceView.tsx`
- `lib/locale-messages.ts`
