# Phase 2B PR1A — Search Foundation — Acceptance Notes

**Branch:** `pr/phase2b-field-pr1`  
**Commit:** PR1A Search Foundation  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-pr1-search-and-discovery-plan.md`

---

## Scope delivered

PR1A implements the **Field Search Contract** across existing explorer surfaces without schema changes, migrations, recommendations, or popularity ranking.

| Surface | Search (`q`) | Notes |
|---------|--------------|-------|
| Explorer Hub (`/field/explorer`) | Unified entry | Registry-ID-shaped input → Field Record; general text → Record Explorer with `q` |
| Record Explorer | title, `registry_id`, artist display name | Verified-only default; `verified=0` broadens to all public records |
| Creative Explorer | display name, slug, bio | Existing filters/pagination preserved |
| Organisation Explorer | name, location, description | Existing filters/pagination preserved |

---

## Implementation summary

### Search contract (`lib/field-search-contract.ts`)

- Canonical param: `q`
- `normalizeFieldSearchTerm`, `fieldSearchIlikePattern` for Postgres ilike filters
- `resolveFieldHubSearchRoute` — hub routing only (no ranked results)
- `fieldExplorerTabHref` — preserves compatible `q` (and record `verified=0` / org `verified=1`) across explorer tabs

### Data loaders

- `lib/fetch-record-explorer-list.ts` — merged title/registry_id + artist name search
- `lib/fetch-creative-explorer-list.ts` — `display_name`, `slug`, `bio`
- `lib/fetch-organisation-explorer-list.ts` — `name`, `location`, `description`

### Verified-default Record Explorer

- `lib/field-record-explorer-params.ts` — absent `verified` → verified-only; `verified=0` → all public records
- Filter UI inverted: default option is verified-only (no param); broaden emits `verified=0`
- Hero scope line: “Verified records on file” vs “All public records”
- Empty-state “Browse all records” preserves active `q`/facets and sets `verified=0`

### UI

- `FieldExplorerHubSearch` on hub
- `FieldExplorerSubNav` preserves `q` when switching tabs
- i18n keys for hub search and verified scope (en, de, fr, ja)

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| Search param naming (`q`, `verified=0`) | Per Search Contract |
| Pagination preserves `q` and `verified=0` | Via `recordExplorerQueryString` / explorer pagination helpers |
| No recommendations / popularity ranking | No new ranking logic |
| No schema / migrations | None |
| Existing redirects | Unchanged in PR1A (record detail redirects deferred to PR1 step 2) |

---

## Manual QA checklist

- [ ] Hub: enter `RROWM-…` → navigates to `/field/record/[id]`
- [ ] Hub: enter plain text → `/field/explorer/records?q=…`
- [ ] Record Explorer default URL shows verified-only scope copy
- [ ] Select “All records” → URL includes `verified=0`; unverified records appear
- [ ] Search by title, Registry ID, artist name returns expected rows
- [ ] Creative / Organisation search on name, slug/bio, location/description
- [ ] Switch explorer tabs with `q` set — param preserved on compatible tabs
- [ ] Paginate with active `q` — param preserved in page links
- [ ] `/field` → `/field/explorer`, `/registry` list redirect still work

---

## Out of scope (later PR1 steps)

- `/registry/[id]` and `/artwork/[id]` permanent redirects (PR1 step 2)
- Graph link grep / ledger artist links (PR1 step 7)
- Practice Studio edit, context panels (PR2 / PR3)
