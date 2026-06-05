# Phase 2B PR1 — Search & Discovery — Acceptance Signoff

**Document status:** ACCEPTANCE SIGNOFF  
**Effective:** 31 May 2026  
**Branch:** `pr/phase2b-field-pr1`  
**Authority:** [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md), [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md), [Phase 2B PR1 Search & Discovery Plan](./phase-2b-pr1-search-and-discovery-plan.md)

**Scope:** PR1F validation and acceptance close-out. No feature work, schema changes, migrations, or UI redesign.

---

## Executive summary

Phase 2B PR1 (Search & Discovery train) is **complete at code level** and **recommended for merge** to `main`. All PR1 rollout steps (plan §8.1 steps 1–9) are implemented across commits PR1A–PR1E. Static validation passes. Staging HTTP redirect smoke and manual QA journeys (plan §10.4) remain **pre-tag gates** — not executed in this local validation pass.

| Verdict | Status |
|---------|--------|
| PR1 merge gate (plan §9.8) — code & static | **Pass** |
| Founder freeze §10 anti-features on Field | **Pass** (grep + route review) |
| Static validation | **Pass** (`npx tsc --noEmit`, `npm run validate:phase1-static`) |
| Deployed HTTP redirect smoke (RD-2B-*) | **Not run locally** — requires staging host |
| Manual QA journeys §10.4 | **Pending staging sign-off** |
| Full Phase 2B spec AC-* (PR2–PR4) | **Out of PR1 scope** — documented deferrals |

### Checkpoint recommendation

| Action | Recommendation |
|--------|----------------|
| Merge `pr/phase2b-field-pr1` → `main` | **Yes** — PR1 train complete |
| Deploy to staging | **Required next** |
| Run §10 validation on staging (RD-2B-*, manual QA) | **Required before interim tag** |
| Tag `checkpoint-phase2b-pr1-search-discovery` | **Yes, after staging pass** at merge commit |
| Tag `checkpoint-phase2b-field-discovery` | **No** — requires PR2–PR4 (plan §11.2) |

---

## Branch deliverables (commits)

| Commit | Deliverable | Acceptance notes |
|--------|-------------|------------------|
| `870fcaa` | Phase 2B governance docs freeze | Authority baseline |
| `b1f83f1` | **PR1A** — Search Foundation | [phase-2b-pr1a-acceptance-notes.md](./phase-2b-pr1a-acceptance-notes.md) |
| `2846b99` | **PR1B** — Record Discovery Policy | [phase-2b-pr1b-acceptance-notes.md](./phase-2b-pr1b-acceptance-notes.md) |
| `dd91e29` | **PR1C** — Creative Discovery Enrichment | [phase-2b-pr1c-acceptance-notes.md](./phase-2b-pr1c-acceptance-notes.md) |
| `5cc57ea` | Discovery expansion rollout plan (doc) | Planning artefact |
| `6a6b65c` | **PR1D** — Organisation Discovery Enrichment | [phase-2b-pr1d-acceptance-notes.md](./phase-2b-pr1d-acceptance-notes.md) |
| `3171189` | **PR1E** — Explorer IA & Discovery Cohesion | [phase-2b-pr1e-acceptance-notes.md](./phase-2b-pr1e-acceptance-notes.md) |
| *(PR1F)* | **PR1F** — Validation and acceptance signoff | This document |

---

## PR1 acceptance matrix

Legend: **Pass** = implemented and statically verified · **Partial** = read-side or spot-check only · **Deferred** = explicit PR2+ scope · **N/A** = not in PR1 · **Staging** = requires deployed host

### Plan §9.1 — Redirects and URLs (R2B-*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| R2B-1 | `/registry/[id]` 301 → `/field/record/[id]` | **Pass** (code) / **Staging** | `app/registry/[registry_id]/page.tsx` → `fieldRecordHref()` |
| R2B-2 | `/artwork/[id]` 301 → `/field/record/[id]` | **Pass** (code) / **Staging** | `app/artwork/[registry_id]/page.tsx` |
| R2B-3 | Query string preserved on record redirects | **Pass** (code) / **Staging** | Both stubs rebuild `searchParams` into redirect URL |
| R2B-4 | §4.2 existing 2A redirects still pass | **Pass** (code) | `/field`, `/registry` list, `/artist`, `/gallery`, `/institutional-studio`, `/collector-studio`, `/verify` stubs present |
| R2B-5 | Primary discovery links → Field Record | **Pass** | `components/Field/**` uses `fieldRecordHref()`; no primary `href="/registry/[id]"` on Field surfaces; ledger secondary via `registryLedgerHref()` |

### Plan §9.2 — Search (S-* / AC-SR*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| S-1 / AC-SR1 | Record Explorer `q` on title, registry_id, artist name | **Pass** | `lib/fetch-record-explorer-list.ts` + `fieldSearchIlikePattern` |
| S-2 / AC-SR1 | Creative Explorer `q` on name, slug, bio | **Pass** | `lib/fetch-creative-explorer-list.ts` |
| S-3 / AC-SR1 | Organisation Explorer `q` on name, location, description | **Pass** | `lib/fetch-organisation-explorer-list.ts` |
| S-4 / AC-SR2 | Active query + filters visible; no hidden ranking | **Pass** | Explorer heroes show scope at zero results (PR1E); filter forms + empty states |
| S-5 / AC-SR3 | No recommendation / similarity / “for you” UI | **Pass** | Field explorer grep clean; copy explicitly negates recommendations |
| S-6 / AC-SR4 | Hub Registry ID → Field Record | **Pass** | `resolveFieldHubSearchRoute()` in `lib/field-search-contract.ts` |
| AC-SR5 | Sort defaults per §1.4 | **Pass** | Alpha/recent defaults; no engagement-based sort |

### Plan §9.3 — Record discovery (D-* / AC-DR*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| D-1 / AC-DR1 | Default emphasises verified records | **Pass** | `parseRecordExplorerVerifiedParam()` — absent `verified` → verified-only |
| D-2 / AC-DR1 | Explicit broaden to all public records | **Pass** | `verified=0` filter + empty-state browse-all link |
| D-3 / AC-DR3 | Record cards show verification before secondary metadata | **Pass** | `RecordExplorerCard` verification band first |
| D-4 / AC-DR4 | No recommendation rows | **Pass** | Record Explorer grid is filter/sort only |

### Plan §9.4 — Organisation discovery (O-* / AC-DO*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| O-1 / AC-DO1 | Organisation Explorer text search | **Pass** | PR1A loader + PR1D enrichment |
| O-2 / AC-DO2 | Verified toggle unchanged from 2A | **Pass** | Filter param `verified=1`; default all orgs |
| AC-DO3 | Org roster + catalogue → Creative / Field Record graph | **Pass** | PR1D presence view + footprint cards |
| AC-DO4 | No paid placement or tier sort | **Pass** | Sort: name/recent only |

### Plan §9.5 — Explorer IA (I-* / AC-IA*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| I-1 / AC-IA1 | Sub-nav URL-driven; Records default | **Pass** | `FIELD_EXPLORER_TABS` Records first; hub no false active tab (PR1E) |
| I-2 / AC-IA3 | Hub search routes per §1.5 | **Pass** | `FieldExplorerHubSearch` + contract |
| I-3 | Cross-tab `q` preservation; `page` reset | **Pass** | `fieldExplorerTabHref()` preserves `q`; omits `page` |
| I-4 / AC-IA4 | 2A Field chrome unchanged | **Pass** | `FieldLayoutChrome` — sub-nav only; no Studio sidebar |

### Plan §9.6 — Graph (G-* / AC-GN*)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| G-1 / AC-GN3 | Legacy record URLs redirect | **Pass** (code) / **Staging** | PR1B stubs |
| G-2 | Ledger artist links → Field Creative | **Pass** | `PublicRegistryRecordView` → `fieldCreativeHref()` (PR1B) |
| G-3 / AC-GN4 | Private profile targets omitted | **Pass** (code) | Presence loaders omit `href` when profile not public |
| AC-GN1 | Full edge matrix navigable | **Partial** | Core graph pass; context panels deferred PR3 |
| AC-GN2 | Context panels deterministic only | **Deferred** | PR3 |

### Plan §9.7 — Anti-features (X-* / founder freeze §10)

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| X-1 | No opportunities, briefs, programmes, applications UI on Field | **Pass** | Field route grep clean |
| X-2 | No recommendations, social metrics, marketplace CTAs on Field discovery | **Pass** | Field explorer surfaces clean |
| X-3 | No practice Studio edit in PR1 | **Pass** | No Studio practice editor shipped |

### 2A open issues (plan §9.8 closure)

| Issue | Description | Status |
|-------|-------------|--------|
| O-1 | Organisation Explorer text search (2A gap) | **Closed** — PR1A |
| O-3 | Record Explorer verified-default | **Closed** — PR1A |
| O-5 | Registry ledger artist links → Field Creative | **Closed** — PR1B |

### Spec AC-* beyond PR1 merge gate

| Group | PR1 status | Notes |
|-------|------------|-------|
| **AC-PR*** | **Partial** | Read-side practices (PR1C); Studio declare/save → PR2 |
| **AC-DC*** | **Partial** | DC2/DC3/DC4 pass; DC1 chips pass; full facet lock → PR2 |
| **AC-VT*** | **Partial** | VT1/VT3/VT4 pass on PR1 surfaces; VT2 full → PR3 |
| **AC-PC*** | **Partial** | PC2/PC4 pass (Field); PC1 Studio meter → PR3 |
| **AC-IA*** | **Pass** | PR1E |
| **AC-SR*** | **Pass** | PR1A + PR1E |
| **AC-DR*** | **Pass** | PR1A + PR1B |
| **AC-DO*** | **Pass** | PR1A + PR1D |
| **AC-GN*** | **Partial** | GN3/GN4 pass; GN1/GN2 → PR3 |

---

## Founder freeze alignment

| Freeze decision | PR1 compliance |
|-----------------|----------------|
| §2 Registry authority — Field reads; Studio writes | **Pass** — no Field mutations |
| §5 Record detail canonical URL → Field Record | **Pass** — PR1B redirects + link policy |
| §7 Profile completeness — no public score | **Pass** — owner-only stewardship checklists (PR1C/PR1D) |
| §8 Explorer IA — Records default tab | **Pass** — PR1E sub-nav + hub |
| §10 Anti-features | **Pass** — no excluded UI on Field discovery |
| §11 PR sequencing — PR1 search/discovery only | **Pass** — PR2–PR4 explicitly deferred |

---

## Static validation (PR1F run)

| Check | Command | Result | Date |
|-------|---------|--------|------|
| TypeScript | `npx tsc --noEmit` | **Pass** | 31 May 2026 |
| Phase 1 static guard | `npm run validate:phase1-static` | **Pass** (18/18) | 31 May 2026 |
| Field primary `/registry/[id]` href grep | `components/Field/**` | **Pass** — none | 31 May 2026 |
| Field anti-feature grep | opportunities / programmes on `/field` | **Pass** — none | 31 May 2026 |
| Search contract module | `lib/field-search-contract.ts` | **Present** — hub route + tab href | 31 May 2026 |
| Verified-default params | `lib/field-record-explorer-params.ts` | **Pass** | 31 May 2026 |

### Not run in PR1F (staging gates)

| Check | Expectation | Status |
|-------|-------------|--------|
| HTTP redirect smoke RD-2B-1–3 | 301 + Location on staging | **Pending** |
| §4.2 redirect regression on staging | All 2A routes | **Pending** |
| Registry registration / verify smoke | No regression vs 2A | **Pending** |
| Manual QA §10.4 (8 journeys) | Documented pass on staging | **Pending** |

---

## PR1 open issues register

| ID | Severity | Issue | Owner | Resolution |
|----|----------|-------|-------|------------|
| **OI-1** | Gate | Staging HTTP redirect smoke not executed in PR1F | Engineering | Run curl/`validate:phase1-staging-http` on staging before interim tag |
| **OI-2** | Gate | Manual QA journeys §10.4 not signed off on staging | Product/Eng | Complete checklist on staging sample data |
| **OI-3** | Low | Registry registration/verify end-to-end smoke not re-run post-PR1 | Engineering | Spot-check on staging deploy |
| **OI-4** | Info | `field.explorer.records.link.verifyHub` superseded by `field.explorer.link.verifyHub` in heroes — legacy key retained | Engineering | Optional cleanup in PR4 i18n pass |

No **blocking code defects** identified in PR1F static audit.

---

## Deferred and out-of-scope register

### Deferred within Phase 2B (by design)

| Train | Items | Spec reference |
|-------|-------|----------------|
| **PR2** | Studio Practice section; declared practice save; `practice=` facet completion; AC-PR* full | Plan §12.1 |
| **PR3** | Context panels (“More from…”); Studio completeness meter; AC-GN1–2 full; AC-PC1 | Plan §12.2 |
| **PR4** | Full i18n pass; composite AC gate; `checkpoint-phase2b-field-discovery` | Plan §12.3 |

### Out of scope (Phase 2C+)

Opportunities, briefs, programmes, applications, open calls, platform matching, sector taxonomy editor, marketplace, commissioning — founder freeze §10.

---

## Registry authority model — validation summary

| Rule | Status |
|------|--------|
| Field discovery primary CTAs → `/field/record/[id]` | **Pass** |
| Registry ledger secondary → `/registry/[id]/ledger` | **Pass** |
| Legacy detail URLs redirect; ledger route preserved | **Pass** (code) |
| Verify hub reads Registry truth; does not grant verification | **Unchanged from 2A** |
| No Field write paths introduced | **Pass** |

---

## Deterministic discovery — validation summary

| Rule | Status |
|------|--------|
| No recommendation or similarity UI on Field explorers | **Pass** |
| Sort: alphabetical / recent / explicit user filters only | **Pass** |
| Hub search is routing + param preservation — not blended results | **Pass** |
| Empty states explain active filters; offer clear — no “did you mean” | **Pass** |
| No popularity, follower, or pay-to-rank signals | **Pass** |

---

## Manual QA checklist (staging sign-off)

Copy for staging validation owner. Mark on deploy.

- [ ] RD-2B-1: `/registry/{id}` → 301 Field Record
- [ ] RD-2B-2: `/artwork/{id}` → 301 Field Record
- [ ] RD-2B-3: query preserved on redirect
- [ ] §4.2: `/field`, `/registry`, `/artist`, org/collector legacy routes
- [ ] Record Explorer default verified; broaden via `verified=0`
- [ ] Record/Creative/Organisation search by `q`
- [ ] Hub: Registry ID → record; text → Record Explorer `q`
- [ ] Tab switch preserves `q`; page resets
- [ ] Sub-nav order Records \| Creatives \| Organisations
- [ ] Discovery strip + Verify hub on all explorer surfaces
- [ ] Creative/Organisation presence: registry evidence before descriptive copy
- [ ] Private Creative links omitted on org roster / record cards
- [ ] No opportunities, programmes, or recommendation UI on Field

---

## Related documents

| Document | Purpose |
|----------|---------|
| [phase-2b-pr1a-acceptance-notes.md](./phase-2b-pr1a-acceptance-notes.md) | Search foundation |
| [phase-2b-pr1b-acceptance-notes.md](./phase-2b-pr1b-acceptance-notes.md) | Record discovery policy |
| [phase-2b-pr1c-acceptance-notes.md](./phase-2b-pr1c-acceptance-notes.md) | Creative enrichment |
| [phase-2b-pr1d-acceptance-notes.md](./phase-2b-pr1d-acceptance-notes.md) | Organisation enrichment |
| [phase-2b-pr1e-acceptance-notes.md](./phase-2b-pr1e-acceptance-notes.md) | Explorer IA cohesion |
| [phase-2b-discovery-expansion-plan.md](./phase-2b-discovery-expansion-plan.md) | Full 2B rollout |
| [phase-2a-pr1-signoff.md](./phase-2a-pr1-signoff.md) | Prior Field foundation baseline |

---

## Signoff

| Role | Name | Date | PR1 merge | Interim tag |
|------|------|------|-----------|-------------|
| Engineering | — | 31 May 2026 | **Recommended** | After staging §10 |
| Product | — | Pending staging QA | Pending | Pending |

**PR1F conclusion:** Implementation across PR1A–PR1E satisfies the PR1 merge gate at code and static validation level. **Recommend merge** of `pr/phase2b-field-pr1` to `main`, staging deploy, §10 validation, then tag **`checkpoint-phase2b-pr1-search-discovery`**.
