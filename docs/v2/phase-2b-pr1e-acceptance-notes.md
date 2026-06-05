# Phase 2B PR1E — Explorer IA & Discovery Cohesion — Acceptance Notes

**Branch:** `pr/phase2b-field-pr1`  
**Commit:** PR1E Explorer IA and Discovery Cohesion  
**Authority:** `phase-2b-founder-decisions-freeze.md`, `phase-2b-discovery-expansion-spec.md`, `phase-2b-pr1-search-and-discovery-plan.md`

---

## Scope delivered

PR1E completes the PR1 Explorer information architecture layer — harmonising wayfinding, language, empty states, and sub-nav behaviour across all Field discovery surfaces without schema changes, migrations, recommendations, or popularity ranking.

| Surface | Enhancement |
|---------|-------------|
| **Explorer sub-nav** | Records \| Creatives \| Organisations order per spec §9.1; no active tab on hub |
| **Explorer Hub** | Records card first (Registry default); orientation lines on cards; `q` preserved on card links; Verify hub CTA |
| **Discovery strip** | Shared `FieldExplorerDiscoveryStrip` on hub + all three explorers — cross-links + Verify hub |
| **Explorer heroes** | Active query/filter scope shown even at zero results; unified `field.explorer.link.verifyHub` label |
| **Empty states** | Creative Explorer filtered empty matches Records/Organisations (clear filters + browse all) |
| **`fieldExplorerHref()`** | Points to `/field/explorer` hub (was incorrectly `/field/explorer/creatives`) |

---

## Product rules preserved

| Rule | Implementation |
|------|----------------|
| Deterministic discovery | No ranking, recommendations, or blended results page |
| Search contract | `q` preservation via `fieldExplorerTabHref`; hub Registry-ID routing unchanged |
| Verified-default Record Explorer | Default verified scope unchanged; broaden via `verified=0` |
| Registry authority | Header nav still defaults to Record Explorer; hub copy Registry-first |
| URL-driven tabs | Sub-nav active state from pathname only; hub returns `null` active tab |
| Field chrome | No Studio sidebar; existing Field layout unchanged |

---

## Navigation edges (Explorer graph)

| From | To |
|------|-----|
| Explorer Hub | Records / Creatives / Organisations (with `q` when set) |
| Explorer Hub search | Registry ID → Field Record; text → Record Explorer `q` |
| Sub-nav tabs | Compatible params preserved; `page` reset on tab switch (existing) |
| Discovery strip | Hub, other explorers, Verify hub |
| All explorer heroes | Verify hub |

---

## Acceptance criteria mapping

### AC-IA* (Explorer information architecture)

| Criterion | PR1E evidence |
|-----------|---------------|
| **AC-IA1** Sub-nav URL-driven | Tab order Records \| Creatives \| Organisations; href from path; hub has no false active tab |
| **AC-IA2** Records default tab | Sub-nav Records first; hub Records card featured; header links to Record Explorer |
| **AC-IA3** Hub search routing | Unchanged from PR1A — no blended ranking page |
| **AC-IA4** Field chrome preserved | Layout/chrome unchanged; orientation copy via i18n keys |

### AC-SR* (search — preserved)

| Criterion | Status |
|-----------|--------|
| **AC-SR1** Full-text `q` on all explorers | Unchanged |
| **AC-SR2** Active query/filters visible | Heroes show scope at zero results; empty states name filtered vs none |
| **AC-SR4** Registry ID hub routing | Unchanged |
| **AC-SR5** Sort defaults | Unchanged |

### AC-DR* / AC-DO* / AC-VT* (preserved)

| Area | Status |
|------|--------|
| Record verified-default | Unchanged |
| Organisation/Creative search | Unchanged |
| Verification-first card layout | Unchanged from PR1C/PR1D |
| PR1B redirects | Unchanged |

### PR1 merge gate (I-1–I-4, S-4, S-6)

| ID | Status |
|----|--------|
| I-1 | Pass — URL-driven sub-nav, Records first |
| I-2 | Pass — hub search unchanged |
| I-3 | Pass — `fieldExplorerTabHref` on hub cards + sub-nav |
| I-4 | Pass — Field chrome unchanged |

---

## Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| Search contract | Preserved |
| Verified-default records | Preserved |
| PR1B redirects | Unchanged |
| No schema / migrations | Application-layer only |

---

## Manual QA checklist

- [ ] Sub-nav order: Records \| Creatives \| Organisations
- [ ] On `/field/explorer`, no sub-nav tab appears active
- [ ] Hub Records card is first and visually emphasised
- [ ] Hub card links preserve `?q=` when present
- [ ] Hub search: Registry ID → Field Record; text → Record Explorer
- [ ] Discovery strip on hub and all three explorer pages
- [ ] Verify hub link on hub, all heroes, and discovery strip
- [ ] Zero-result search shows active query/filter line in hero
- [ ] Creative filtered empty shows clear filters + browse all
- [ ] Tab switch with `q` preserves search on compatible explorers
- [ ] `fieldExplorerHref()` resolves to `/field/explorer`

---

## Out of scope (later PRs)

- Context panels (“More from…”) (PR3)
- Relationship graph implementation (PR3+)
- Default tab analytics review (founder unlock only)
- Full i18n completeness pass (PR4)
