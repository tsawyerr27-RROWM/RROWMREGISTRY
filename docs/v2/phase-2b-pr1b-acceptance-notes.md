# Phase 2B PR1B — Record Discovery Policy — Acceptance Notes

**Branch:** `pr/phase2b-field-pr1`  
**Commit:** PR1B Record Discovery Policy  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-pr1-search-and-discovery-plan.md`

---

## Scope delivered

PR1B completes Record discovery policy and canonical navigation for Phase 2B PR1:

| Deliverable | Status |
|-------------|--------|
| Legacy record detail redirects (RD-2B-*) | `/registry/[id]`, `/artwork/[id]` → `/field/record/[id]` (301, query preserved) |
| Registry ledger secondary surface | `/registry/[id]/ledger` — authoritative ledger view (avoids redirect loop) |
| Field Record discovery refinement | Cross-links to Explorer, profiles, Verify, ledger |
| Record Explorer refinement | Verify hub link in hero; ledger secondary on cards |
| Canonical Field navigation | Field surfaces use `fieldRecordHref()` primary, `registryLedgerHref()` secondary |
| Ledger artist links (O-5) | `PublicRegistryRecordView` → `/field/creative/[slug]` |

---

## Redirect matrix (PR1B additions)

| Check | From | Expected |
|-------|------|----------|
| RD-2B-1 | `/registry/{id}` | 301 → `/field/record/{id}` |
| RD-2B-2 | `/artwork/{id}` | 301 → `/field/record/{id}` |
| RD-2B-3 | `/registry/{id}?tab=foo` | 301 → `/field/record/{id}?tab=foo` |

**Ledger access:** Secondary CTAs use `/registry/[id]/ledger` (not bare `/registry/[id]`, which now redirects to Field Record per founder freeze §5).

---

## Navigation policy

| Surface | Primary discovery | Secondary authoritative |
|---------|-------------------|------------------------|
| Field Record | `/field/record/[id]` | Registry ledger at `/registry/[id]/ledger` |
| Record Explorer cards | `row.href` → Field Record | Registry ledger link |
| Creative / Org / Collector presence | Field Record on work cards | Registry ledger where shown |
| Field Verify record | Field Record + Registry ledger | — |
| Registry ledger view | Link to Field Record banner | Artist → Field Creative |

**Preserved:** PR1A Search Contract (`q`, verified-default). No recommendations, popularity ranking, schema changes, or migrations.

**Out of scope:** Context panels (“More from…”), graph panels (PR3).

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| Field `components/Field/**` legacy `/registry/` or `/artwork/` primary hrefs | None |
| Search contract | Unchanged from PR1A |
| Existing 2A redirects (`/field`, `/registry` list, `/artist`, etc.) | Unchanged |

---

## Manual QA checklist

- [ ] `/registry/{sample_id}` → 301 Field Record
- [ ] `/artwork/{sample_id}` → 301 Field Record
- [ ] `/registry/{sample_id}?tab=foo` preserves query on redirect
- [ ] `/registry/{sample_id}/ledger` renders full ledger view
- [ ] Field Record → Creative, Organisation, Verify, Record Explorer, ledger
- [ ] Ledger view → Field Record banner; artist links to Field Creative
- [ ] Record Explorer cards primary → Field Record; secondary → ledger
- [ ] PR1A search + verified-default still behave correctly

---

## Files touched (summary)

- `lib/registry-nav.ts`, `lib/load-public-registry-ledger-page.ts`
- `app/registry/[registry_id]/page.tsx` (redirect stub)
- `app/registry/[registry_id]/ledger/page.tsx` (ledger)
- `app/artwork/[registry_id]/page.tsx` (redirect stub)
- `components/Field/FieldRecordView.tsx`, presence views, explorer card/hero
- `components/Registry/PublicRegistryRecordView.tsx`
- `components/Field/FieldVerifyRecordView.tsx`
- `lib/locale-messages.ts`
