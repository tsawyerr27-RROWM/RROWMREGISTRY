# Phase 2B PR1 — Search and Discovery Plan

**Document status:** IMPLEMENTATION SOURCE OF TRUTH  
**Effective:** 31 May 2026  
**Authority:** [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md) (LOCKED DRAFT), [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md) (FROZEN), [Phase 2B Discovery Expansion Plan](./phase-2b-discovery-expansion-plan.md) (DRAFT), [Phase 2A PR1 Signoff](./phase-2a-pr1-signoff.md), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md)  
**Predecessor:** Phase 2A Field Foundations @ `checkpoint-phase2a-field-foundations`

**Golden rule (inherited from Phase 1 / 2A):** **Move, then redirect.** Legacy record detail routes become `permanentRedirect` stubs in the **same commit** as canonical link canonicalisation updates.

**Constraints for this document:** No database schema. No migrations. No code. No visual UI design.

---

## SECTION 1 — Objective

### 1.1 Ecosystem transition

| Surface | After 2A (PR1 signoff) | After 2B PR1 |
|---------|------------------------|--------------|
| **Registry** | Ledger authoritative; list redirected; detail URLs legacy | Detail URLs **301** to Field Record; ledger view secondary |
| **Studio** | Unchanged stewardship | Unchanged — no PR1 Studio feature scope |
| **The Field** | Filter-only explorers; partial text on records | **Full-text search contract** across explorers; verified-default records; hub search entry |

### 1.2 PR1 deliverable

Close **2A discovery deferrals** and ship **explainable search** without practice taxonomy or graph context panels:

- Permanent **301 redirects** from `/registry/[id]` and `/artwork/[id]` to `/field/record/[id]`.
- **Field Search Contract** (`q`, `verified`, `sort`, `page`) on Record, Creative, and Organisation explorers.
- **Record Explorer verified-default** policy with explicit broaden control (O-3).
- **Explorer hub search entry** with Registry ID routing and cross-tab param preservation.
- **Primary graph link canonicalisation** on Registry ledger views (O-5 partial).
- **No** practice Studio edit, **no** context panels, **no** completeness meter — deferred PR2/PR3.

### 1.3 PR1 north star

> A visitor can **search** Registry records, Creatives, and Organisations on Field, land on the **canonical Field Record** from legacy shared links, and navigate the **existing** 2A graph without algorithmic ranking.

### 1.4 Explicit PR1 non-goals

No practice declaration UI, no `public_presence.practices` flag, no `practice=` facet enforcement beyond preserving any existing PR1 interim UI, no context panels, no Studio completeness meter, no opportunities/briefs/programmes, no recommendations, no marketplace, no payments, no managed search index, no certificate route migration, no medium/year record facets (2B.1).

---

## SECTION 2 — Route impacts

### 2.1 Routes unchanged (canonical — no new App Router tree)

PR1 does **not** introduce new top-level routes. All work enriches existing 2A routes:

| Route | PR1 change |
|-------|------------|
| `/field/explorer` | Hub search entry; param preservation |
| `/field/explorer/records` | Search contract; verified-default |
| `/field/explorer/creatives` | Text `q` scope expansion (name, slug, bio) |
| `/field/explorer/organisations` | Text `q` on name, location, description |
| `/field/record/[registry_id]` | Primary target of new redirects — page unchanged |
| `/field/creative/[slug]` | Unchanged in PR1 |
| `/field/organisation/[slug]` | Unchanged in PR1 |
| `/field/collector/[slug]` | Unchanged in PR1 |
| `/field/verify`, `/field/verify/[id]` | Hub ID routing target — unchanged |
| `/studio/*` | Unchanged |

### 2.2 Routes affected (redirect stubs only)

| Legacy route | PR1 behaviour |
|--------------|---------------|
| `app/registry/[registry_id]/page.tsx` | Becomes **301 stub** → `/field/record/[registry_id]` (query string preserved) |
| `app/artwork/[registry_id]/page.tsx` | Becomes **301 stub** → `/field/record/[registry_id]` (query string preserved) |

**Note:** Registry ledger **content** may remain implemented behind redirect decision — product default is **redirect-only stub** per founder freeze §5. If ledger view retained temporarily, it must not be primary discovery target in internal links.

### 2.3 Routes explicitly not added

| Route | Deferred |
|-------|----------|
| `/field/open-calls` | 2C |
| `/field/programmes/[slug]` | 2C |
| `/field/search` (global ranked results) | **Rejected** — hub routes only |
| Any `/api/field/*` BFF | Optional — not PR1 |

---

## SECTION 3 — Canonical URL impacts

### 3.1 Primary discovery URLs (unchanged)

| Resource | Canonical URL |
|----------|---------------|
| Explorer hub | `/field/explorer` |
| Record Explorer | `/field/explorer/records` |
| Creative Explorer | `/field/explorer/creatives` |
| Organisation Explorer | `/field/explorer/organisations` |
| Field Record | `/field/record/[registry_id]` |
| Creative profile | `/field/creative/[slug]` |
| Organisation profile | `/field/organisation/[slug]` |

### 3.2 Primary discovery URL promotion (PR1)

| Former primary link target | New primary target |
|----------------------------|-------------------|
| `/registry/[registry_id]` (internal discovery CTAs) | `/field/record/[registry_id]` |
| `/artwork/[registry_id]` (internal discovery CTAs) | `/field/record/[registry_id]` |
| `/artist/[slug]` on Registry ledger views | `/field/creative/[slug]` |

**Secondary authoritative link:** “Open Registry ledger” may remain `/registry/[registry_id]` where 2A signoff documents intentional ledger authority — not primary card/hub navigation.

### 3.3 Query param canonical vocabulary (Field Search Contract)

| Param | Record Explorer | Creative Explorer | Organisation Explorer |
|-------|-----------------|---------------------|------------------------|
| `q` | title, registry_id, artist name | name, slug, bio | name, location, description |
| `verified` | **default emphasised** | N/A (PR1) | optional toggle (unchanged) |
| `practice` | N/A | preserve if present — **no new PR1 requirement** | N/A |
| `sort` | registry sort set | alpha default | alpha default |
| `page` | required | required | required |

---

## SECTION 4 — Redirect requirements

### 4.1 New redirects (PR1 — closes O-1)

| From | To | Method | Query preserve |
|------|-----|--------|----------------|
| `/registry/[registry_id]` | `/field/record/[registry_id]` | `permanentRedirect` (301) | Yes |
| `/artwork/[registry_id]` | `/field/record/[registry_id]` | `permanentRedirect` (301) | Yes |

**Same commit rule:** Redirect stub lands with internal link grep updating primary CTAs to Field Record.

### 4.2 Existing redirects (unchanged — must remain passing)

| From | To |
|------|-----|
| `/field` | `/field/explorer` |
| `/registry` (list) | `/field/explorer/records` |
| `/artist/[slug]` | `/field/creative/[slug]` |
| `/institutional-studio/[slug]`, `/gallery/[slug]` | `/field/organisation/[slug]` |
| `/collector-studio/[slug]` | `/field/collector/[slug]` |
| `/verify/[id]` | `/field/verify/[id]` |

### 4.3 Redirect retention

Minimum **two release cycles**; **prefer permanent 301** (2A/2B founder freeze). PR1 must not introduce 302 temporary redirects for record detail paths.

### 4.4 Redirect smoke matrix (PR1 additions)

| Check ID | From | Expected |
|----------|------|----------|
| RD-2B-1 | `/registry/{sample_id}` | 301 → `/field/record/{sample_id}` |
| RD-2B-2 | `/artwork/{sample_id}` | 301 → `/field/record/{sample_id}` |
| RD-2B-3 | `/registry/{sample_id}?tab=foo` | 301 → `/field/record/{sample_id}?tab=foo` |

---

## SECTION 5 — Search architecture (PR1 scope)

### 5.1 Field Search Contract

PR1 implements spec §1.2–§1.6 for **Record, Creative, Organisation explorers** and hub entry §1.5:

| Requirement | PR1 |
|-------------|-----|
| Explainable active filters + `q` displayed | Yes |
| No recommendation / similarity UI | Yes |
| Registry ID hub routing | Yes |
| Sort defaults per §1.4 | Yes |
| Empty states with clear filters | Yes |
| External search index | **No** |

### 5.2 Full-text scopes (PR1)

| Explorer | Searchable fields |
|----------|-------------------|
| Record | `registry_id`, title, artist display name |
| Creative | display name, slug, bio |
| Organisation | name, location (if public), description |

### 5.3 Record Explorer verified-default (PR1)

| Behaviour | Rule |
|-----------|------|
| Default entry | Verified records emphasised |
| Broaden | Explicit control — user opts in to all public records |
| Copy | States scope when unverified included |

---

## SECTION 6 — Explorer IA (PR1 scope)

| Element | PR1 delivery |
|---------|--------------|
| Hub search entry on `/field/explorer` | Route Registry ID vs general `q` |
| Sub-nav URL truth | Unchanged — Records default |
| Cross-tab `q` preservation | Compatible explorers |
| `page` reset on tab switch | Yes |
| `practice` param | Drop outside Creative tab |
| Orientation copy | One line per explorer (i18n keys — minimum English + locale hook) |

**Excluded:** Default tab change; open calls nav item.

---

## SECTION 7 — Relationship graph (PR1 partial)

PR1 delivers **link canonicalisation** only — not context panels (PR3).

| Edge | PR1 |
|------|-----|
| Explorers → presence/record | Unchanged — verify no regression |
| Field Record → profiles | Unchanged |
| Registry ledger view → artist link | **Update to** `/field/creative/[slug]` (O-5) |
| Primary work CTAs | Already Field Record from 2A PR1I — verify grep |
| Context panels (“More from…”) | **Deferred PR3** |

---

## SECTION 8 — Rollout sequence

**Branch:** `pr/phase2b-field-pr1`  
**Commit discipline:** One step or logical group per commit; **redirect + link grep atomically** for record detail family.

### 8.1 Implementation order

| Step | Deliverable | Exit criterion |
|------|-------------|----------------|
| **1** | **Preflight** — 2A checkpoint tagged; 2B freeze read; branch clean; link grep baseline | `checkpoint-phase2a-field-foundations` verified |
| **2** | **Record detail redirects** — stub `/registry/[id]`, `/artwork/[id]` → Field Record | RD-2B-1–3 pass; AC-GN3 |
| **3** | **Record Explorer search + verified-default** — `q` scope; default verified emphasis; broaden control | AC-SR1 (records), AC-DR1–AC-DR4; O-3 closed |
| **4** | **Creative Explorer text search** — `q` on name, slug, bio | AC-SR1 (creatives), AC-DC2 |
| **5** | **Organisation Explorer text search** — `q` on name, location, description | AC-SR1 (orgs), AC-DO1 |
| **6** | **Hub search + IA** — unified entry, param preservation, orientation copy | AC-IA1–AC-IA4; AC-SR4 |
| **7** | **Graph link grep** — ledger view artist links → Field creative; primary record links audit | O-5 closed; AC-GN4 spot-check |
| **8** | **Verification visibility spot-check** — practice-neutral; search cards show verification first | AC-VT1, AC-VT3 spot-check on new UI |
| **9** | **Validation** — tsc, static acceptance, redirect smoke, manual QA | §9 PR1 merge gate |

### 8.2 Parallel work forbidden

- Do not ship practice Studio edit in PR1 (PR2).
- Do not ship context panels in PR1 (PR3).
- Do not add open-call nav or CTAs.
- Do not introduce recommendation or similarity UI.
- Do not add managed search index.
- Do not change ledger RPC semantics.

### 8.3 PR2 handoff (within 2B — out of PR1 scope)

| Deliverable | Train |
|-------------|-------|
| Studio Practice section; `public_presence.practices` | PR2 |
| Field practice chips; Creative Explorer `practice=` product lock | PR2 |
| Context panels; completeness meter | PR3 |
| Full AC-VT*, AC-PC*, AC-GN1–2 | PR3–PR4 |
| i18n completeness pass | PR4 |
| `checkpoint-phase2b-field-discovery` | PR4 acceptance |

---

## SECTION 9 — Acceptance criteria

Measurable completion for **PR1 merge**. Mapped to [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md).

### 9.1 Redirects and URLs

| ID | Criterion | Measure |
|----|-----------|---------|
| R2B-1 | `/registry/[id]` 301 → `/field/record/[id]` | HTTP smoke RD-2B-1 |
| R2B-2 | `/artwork/[id]` 301 → `/field/record/[id]` | HTTP smoke RD-2B-2 |
| R2B-3 | Query string preserved on record redirects | HTTP smoke RD-2B-3 |
| R2B-4 | All §4.2 existing 2A redirects still pass | Redirect regression suite |
| R2B-5 | Primary internal discovery links target Field Record — not bare legacy detail | Link grep |

### 9.2 Search (AC-SR* subset)

| ID | Criterion | Measure |
|----|-----------|---------|
| S-1 | Record Explorer accepts `q` within title, registry_id, artist name | Manual + automated query tests |
| S-2 | Creative Explorer accepts `q` on name, slug, bio | Manual + automated |
| S-3 | Organisation Explorer accepts `q` on name, location, description | Manual + automated |
| S-4 | Active query + filters visible in UI; no hidden ranking | QA checklist |
| S-5 | No recommendation, similarity, or “for you” UI | Code review + QA |
| S-6 | Hub Registry ID entry routes to record or verify not-found | Manual QA |

### 9.3 Record discovery (AC-DR*)

| ID | Criterion | Measure |
|----|-----------|---------|
| D-1 | Default entry emphasises verified records | Default URL behaviour |
| D-2 | User can explicitly broaden to all public records | Filter toggle QA |
| D-3 | Record cards show verification before secondary metadata | Visual QA |
| D-4 | No recommendation rows on Record Explorer | QA |

### 9.4 Organisation discovery (AC-DO1 partial)

| ID | Criterion | Measure |
|----|-----------|---------|
| O-1 | Organisation Explorer text search operational | `q` param QA |
| O-2 | Verified toggle behaviour unchanged from 2A | Regression QA |

### 9.5 Explorer IA (AC-IA*)

| ID | Criterion | Measure |
|----|-----------|---------|
| I-1 | Hub sub-nav URL-driven; Records default | Click + URL QA |
| I-2 | Hub search routes per §6 | Manual QA |
| I-3 | Cross-tab `q` preservation; `page` reset on tab switch | Param QA |
| I-4 | 2A Field chrome unchanged — no Studio sidebar | Visual QA |

### 9.6 Graph (partial AC-GN*)

| ID | Criterion | Measure |
|----|-----------|---------|
| G-1 | Legacy record URLs redirect — bookmarks resolve | RD-2B-* |
| G-2 | Registry ledger artist links target Field creative URL | Link grep |
| G-3 | Private profile targets omitted — no leak | Sample data QA |

### 9.7 Anti-features (founder freeze §10)

| ID | Criterion | Measure |
|----|-----------|---------|
| X-1 | No opportunities, briefs, programmes, applications UI | QA + grep |
| X-2 | No recommendations, social metrics, marketplace CTAs | QA + grep |
| X-3 | No practice Studio edit shipped in PR1 | Scope review |

### 9.8 PR1 merge gate

**PR1 is complete when:** R2B-1–R2B-5, S-1–S-6, D-1–D-4, O-1–O-2, I-1–I-4, G-1–G-3, X-1–X-3 pass on staging; 2A open issues **O-1, O-3, O-5** closed; Registry registration/verify smoke shows no regression; founder freeze §10 anti-features absent.

---

## SECTION 10 — Validation requirements

### 10.1 Static validation

| Check | Command / artefact | PR1 expectation |
|-------|-------------------|-----------------|
| TypeScript | `npx tsc --noEmit` | Pass |
| Phase 1 static guard | `npm run validate:phase1-static` | Pass — no regression |
| Link grep baseline | No primary `href="/registry/[id]"` on Field discovery surfaces except secondary ledger CTAs | Document delta in signoff |

### 10.2 Redirect smoke

| Check | Command / artefact | PR1 expectation |
|-------|-------------------|-----------------|
| Staging HTTP smoke | `STAGING_BASE_URL=… npm run validate:phase1-staging-http` (or project equivalent) | Pass all §4.1–§4.2 routes including RD-2B-* |
| Local redirect spot-check | Manual curl `-I` on sample `registry_id` | 301 + Location header |

### 10.3 Registry preservation

| Check | Expectation |
|-------|-------------|
| RP public read paths | No new errors on verify RPC |
| Registration flow | No regression vs 2A baseline |
| Ledger detail semantics | Unchanged — redirect only |

### 10.4 Manual QA journeys (anonymous)

1. Legacy bookmark `/registry/{id}` → Field Record → verify → Creative profile.  
2. Record Explorer default → verified list → broaden filter → unverified visible with copy.  
3. Record Explorer search by title and by registry_id.  
4. Creative Explorer search by name and bio fragment.  
5. Organisation Explorer search by name.  
6. Hub search: Registry ID → record; general text → active tab with `q`.  
7. Tab switch preserves `q`; resets `page`.  
8. Confirm no recommendations, social counts, opportunity CTAs.

### 10.5 Signoff artefact

PR1 close-out document: `docs/v2/phase-2b-pr1-signoff.md` (created at acceptance — not in PR1 plan scope).

---

## SECTION 11 — Checkpoint recommendation

### 11.1 PR1 interim tag (optional)

After PR1 merge gate pass on staging:

```
checkpoint-phase2b-pr1-search-discovery
```

Tags **PR1 train only** — not full Phase 2B completion.

### 11.2 Full Phase 2B tag (after PR4)

```
checkpoint-phase2b-field-discovery
```

Requires all 2B spec AC-* and founder freeze §11 PR2–PR4 trains — **not** PR1 alone.

### 11.3 Pre-tag checklist (PR1)

1. Merge `pr/phase2b-field-pr1` to main.  
2. Deploy to staging.  
3. Run §10 validation suite including RD-2B-*.  
4. Manual QA journeys §10.4 documented.  
5. Publish `phase-2b-pr1-signoff.md`.  
6. Tag at merge commit if interim checkpoint desired.

---

## SECTION 12 — Explicit exclusions (PR1)

### 12.1 Deferred to PR2 (Practice — within 2B)

| Exclusion |
|-----------|
| Studio Practice section |
| `public_presence.practices` visibility toggle |
| Declared practice save path |
| Field practice chip source semantics lock |
| Creative Explorer `practice=` facet product completion |
| AC-PR*, AC-DC1 full |

### 12.2 Deferred to PR3 (Graph + completeness — within 2B)

| Exclusion |
|-----------|
| Context panels (“More from…”) |
| Studio completeness meter |
| AC-PC*, AC-GN1–2 full, AC-VT2 |

### 12.3 Deferred to PR4 (2B acceptance)

| Exclusion |
|-----------|
| Full i18n pass for all 2B strings |
| Full composite AC gate G-1–G-6 |
| `checkpoint-phase2b-field-discovery` |

### 12.4 Deferred to Phase 2C+

| Exclusion |
|-----------|
| Opportunities, briefs, programmes, applications |
| Open calls routes |
| Platform matching |
| Sector/capability editor |

### 12.5 Permanent anti-features (founder freeze §10)

Recommendations; social feeds; pay-to-rank; Field ledger writes; Studio sidebar on Field; marketplace; payments.

---

## Appendix A — Link grep checklist (PR1)

Update primary targets:

| Pattern | Target |
|---------|--------|
| Primary record CTAs | `fieldRecordHref()` / `/field/record/` |
| Creative links on ledger views | `fieldCreativeHref()` / `/field/creative/` |
| Browse / empty state | `fieldExplorerRecordsHref()` |

**Allowlisted secondary:** “Open Registry ledger” → `/registry/[id]`.

**Baseline command:**

```bash
rg 'href=["'\''](/registry/|/artwork/)' --glob '*.{ts,tsx}' \
  --glob '!app/registry/**' --glob '!app/artwork/**'
```

Field discovery surfaces should show **zero** primary matches after PR1.

---

## Appendix B — Related documents

| Document | Role |
|----------|------|
| [phase-2b-discovery-expansion-spec.md](./phase-2b-discovery-expansion-spec.md) | Full 2B AC-* |
| [phase-2b-founder-decisions-freeze.md](./phase-2b-founder-decisions-freeze.md) | Frozen philosophy |
| [phase-2b-discovery-expansion-plan.md](./phase-2b-discovery-expansion-plan.md) | Full 2B rollout |
| [phase-2a-pr1-signoff.md](./phase-2a-pr1-signoff.md) | 2A baseline + O-* issues |
| [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) | Registry |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | IMPLEMENTATION SOURCE OF TRUTH | Initial Phase 2B PR1 search and discovery plan |
