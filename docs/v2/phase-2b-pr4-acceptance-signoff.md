# Phase 2B — Field Discovery Expansion — Acceptance Signoff

**Document status:** ACCEPTANCE SIGNOFF  
**Effective:** 31 May 2026  
**Branch:** `pr/phase2b-pr4-acceptance`  
**Authority:** [Phase 2B Founder Decisions Freeze](./phase-2b-founder-decisions-freeze.md), [Phase 2B Discovery Expansion Spec](./phase-2b-discovery-expansion-spec.md), [Phase 2B Discovery Expansion Plan](./phase-2b-discovery-expansion-plan.md)

**Scope:** PR4 acceptance audit and Phase 2B closure. No new product features, schema changes, migrations, or excluded surfaces (§13).

---

## Executive summary

Phase 2B (PR1–PR4) is **complete at code and static validation level** and **recommended for merge** to `main`. All rollout steps in plan §8 are implemented. Composite acceptance criteria pass statically except **AC-VT2** (documented partial — practice chip styling adjacent to verification green). **Staging sign-off** and **founder LOCKED promotion** remain pre-tag gates.

| Verdict | Status |
|---------|--------|
| Phase 2B code train (PR1–PR4) | **Pass** (static) |
| Plan §6 composite gate G-1 | **Pass** (code) / **Staging** (sign-off) |
| Plan §6 G-2 (O-1, O-3, O-5) | **Pass** |
| Plan §6 G-3 (exclusions) | **Pass** |
| Plan §6 G-4 (Registry preservation) | **Staging** |
| Plan §6 G-5 (redirect smoke) | **Staging** — script extended; HTTP not run locally |
| Plan §6 G-6 (DRAFT → LOCKED) | **Pending** — founder/product |
| Anti-features (§13 / freeze §10) | **Pass** |

### Checkpoint recommendation

| Action | Recommendation |
|--------|----------------|
| Merge `pr/phase2b-pr4-acceptance` → `main` | **Yes** — after PR review |
| Deploy to staging | **Required next** |
| Run staging HTTP smoke with `STAGING_SAMPLE_REGISTRY_ID` | **Required before tag** |
| Execute Step 13 manual QA journeys | **Required before tag** |
| Registry registration/verify spot-check | **Required before tag** |
| Founder promote spec DRAFT → LOCKED | **Required before tag** |
| Tag **`checkpoint-phase2b-field-discovery`** | **Yes, after staging pass** at acceptance merge commit on `main` |
| Tag `checkpoint-phase2b-pr1-search-discovery` | **Superseded** by composite tag (optional retain for history) |

---

## Branch deliverables (commits)

| Train | Deliverable | Document |
|-------|-------------|----------|
| PR1A–PR1F | Search & Discovery | [phase-2b-pr1-signoff.md](./phase-2b-pr1-signoff.md) |
| PR2 | Practice & profile completeness | [phase-2b-pr2-acceptance-notes.md](./phase-2b-pr2-acceptance-notes.md) |
| PR3 | Relationship context & graph | [phase-2b-pr3-acceptance-notes.md](./phase-2b-pr3-acceptance-notes.md) |
| PR4 | Acceptance audit & closure | [phase-2b-pr4-acceptance-notes.md](./phase-2b-pr4-acceptance-notes.md) |

---

## Composite acceptance matrix

Legend: **Pass** = static code evidence · **Partial** = documented tension · **Staging** = deployed QA · **Pending** = not in scope

### AC-SR — Search architecture

| ID | Status | Evidence |
|----|--------|----------|
| AC-SR1 | **Pass** | `lib/fetch-*-explorer-list.ts`, `fieldSearchIlikePattern` |
| AC-SR2 | **Pass** | Explorer heroes + filter scope at zero results |
| AC-SR3 | **Pass** | No recommendation UI on Field |
| AC-SR4 | **Pass** | `resolveFieldHubSearchRoute()` |
| AC-SR5 | **Pass** | Alpha/recent defaults only |

### AC-PR — Practice taxonomy

| ID | Status | Evidence |
|----|--------|----------|
| AC-PR1 | **Pass** | `AccountPracticeSection`, max 5 |
| AC-PR2 | **Pass** | `primary_practice` + chip ordering |
| AC-PR3 | **Pass** | Declared vs registry source labels |
| AC-PR4 | **Pass** | `practices_visible` toggle |
| AC-PR5 | **Pass** | `creativeMatchesPracticeFilter` |
| AC-PR6 | **Pass** | Studio save path only |

### AC-DC — Creative discovery

| ID | Status | Evidence |
|----|--------|----------|
| AC-DC1 | **Pass** | Practice chips on cards/presence |
| AC-DC2 | **Pass** | Creative explorer text search |
| AC-DC3 | **Pass** | `fieldRecordHref` on footprint |
| AC-DC4 | **Pass** | No social/recommendation paths |

### AC-DO — Organisation discovery

| ID | Status | Evidence |
|----|--------|----------|
| AC-DO1 | **Pass** | Organisation explorer search |
| AC-DO2 | **Pass** | Verified toggle |
| AC-DO3 | **Pass** | Roster + catalogue graph |
| AC-DO4 | **Pass** | Name/recent sort only |

### AC-DR — Record discovery

| ID | Status | Evidence |
|----|--------|----------|
| AC-DR1 | **Pass** | Verified-default + explicit broaden |
| AC-DR2 | **Pass** | Title, registry_id, artist name |
| AC-DR3 | **Pass** | Cards → Field Record |
| AC-DR4 | **Pass** | No recommendation rows |

### AC-GN — Relationship graph

| ID | Status | Evidence |
|----|--------|----------|
| AC-GN1 | **Pass** / **Staging** | Graph + context panels; navigability QA on staging |
| AC-GN2 | **Pass** | `lib/field-relationship-context.ts` |
| AC-GN3 | **Pass** / **Staging** | Redirect stubs; RD-2B HTTP smoke |
| AC-GN4 | **Pass** | Private profiles omit `href` |

### AC-PC — Profile completeness

| ID | Status | Evidence |
|----|--------|----------|
| AC-PC1 | **Pass** | Studio completeness in account hero |
| AC-PC2 | **Pass** | No Field completeness meter |
| AC-PC3 | **Pass** | Explorer gated on profile flag only |
| AC-PC4 | **Pass** | Owner practice guidance on Field |

### AC-VT — Verification visibility

| ID | Status | Evidence |
|----|--------|----------|
| AC-VT1 | **Pass** | Verification band first on cards/records |
| AC-VT2 | **Partial** | Registry-evidence practice chips use emerald styling — visually adjacent to verification; product waiver or restyle optional |
| AC-VT3 | **Pass** | Verified-default Record Explorer |
| AC-VT4 | **Pass** | No follower/like/tier signals |

### AC-IA — Explorer IA

| ID | Status | Evidence |
|----|--------|----------|
| AC-IA1 | **Pass** | URL-driven sub-nav |
| AC-IA2 | **Pass** | Records first; verified emphasis |
| AC-IA3 | **Pass** | Hub search routing |
| AC-IA4 | **Pass** | Field chrome unchanged |

**Static tally:** 44 Pass · 1 Partial · Staging gates separate

---

## Redirect audit

| ID | Route | Target | Code | Staging |
|----|-------|--------|------|---------|
| RD-2B-1 | `/registry/[id]` | `/field/record/[id]` | **Pass** | Pending |
| RD-2B-2 | `/artwork/[id]` | `/field/record/[id]` | **Pass** | Pending |
| RD-2B-3 | Query preserved | Yes | **Pass** | Pending |
| R2B-4 | 2A legacy routes | Field/Studio targets | **Pass** | Pending |
| — | `/registry` list | Record Explorer | **Pass** | Pending |
| — | `/field` | Explorer hub | **Pass** | Pending |
| — | `/registry/[id]/ledger` | Preserved | **Pass** | — |

**Tooling:** `scripts/phase-1-staging-http-smoke.ts` — RD-2B-1..3 when `STAGING_SAMPLE_REGISTRY_ID` set.

---

## Link audit (Field discovery graph)

| Check | Result |
|-------|--------|
| Primary record CTAs use `fieldRecordHref()` | **Pass** |
| Secondary ledger uses `registryLedgerHref()` | **Pass** |
| No primary `href="/registry/[id]"` on Field surfaces | **Pass** |
| Registry ledger artist links → Field Creative (O-5) | **Pass** |
| Context panels omit private profile hrefs (AC-GN4) | **Pass** |
| Opportunities / programmes / applications on `/field` | **None** |

**Out of Field gate:** Legacy `/artist/` links on Studio/gallery/provenance surfaces — not blocking 2B Field discovery.

---

## Discovery graph QA (Step 13 journeys)

Mark on staging with sample public data:

1. [ ] Hub → Record search → Field Record → Verify → Creative → Record Explorer  
2. [ ] Creative Explorer → `practice=` → profile → chips → work → Field Record  
3. [ ] Organisation Explorer → org → roster Creative → record  
4. [ ] Legacy `/registry/[id]` bookmark → Field Record  
5. [ ] Confirm no recommendations, social metrics, or opportunity CTAs on Field  
6. [ ] Context panels: same Creative / Organisation / medium / practice / continuity  
7. [ ] Studio Practice save → Field chips + explorer filter  

---

## Anti-features audit (§13 / freeze §10)

| Exclusion | Field grep | Status |
|-----------|------------|--------|
| Opportunities, briefs, programmes, applications | Clean | **Pass** |
| Recommendations, similarity, “for you” | Clean | **Pass** |
| Social feeds, followers, DMs | Clean | **Pass** |
| Marketplace, payments, commissioning | Clean | **Pass** |
| Pay-to-boost / ranking | Clean | **Pass** |

---

## i18n audit (Plan Step 12)

| Item | PR4 action | Status |
|------|------------|--------|
| OI-4 duplicate `field.explorer.records.link.verifyHub` | Removed | **Closed** |
| Unused `field.stub.preparing` | Removed | **Closed** |
| `field.context.*` (PR3) | en/de/fr/ja | **Pass** |
| Studio Practice / completeness hardcoded strings | Documented | **OI-5 open** |
| Explorer card count fragments | Documented | **OI-5 open** |

---

## Static validation (PR4 run)

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | **Pass** |
| Phase 1 static guard | `npm run validate:phase1-static` | **Pass** |
| Field anti-feature grep | `components/Field`, `app/field` | **Pass** |
| Search contract | `lib/field-search-contract.ts` | **Present, unchanged** |
| Verified-default | `lib/field-record-explorer-params.ts` | **Pass** |

---

## Open issues register

| ID | Severity | Issue | Blocker for tag |
|----|----------|-------|-----------------|
| OI-1 | Gate | Staging HTTP redirect smoke not executed | Yes |
| OI-2 | Gate | Step 13 manual QA undocumented on staging | Yes |
| OI-3 | Gate | Registry registration/verify regression smoke | Yes |
| OI-4 | Info | Duplicate verify-hub locale key | **Closed** (PR4) |
| OI-5 | Low | Residual hardcoded English on Studio practice + explorer cards | No |
| OI-6 | Gate | Spec DRAFT → LOCKED founder sign-off (G-6) | Yes |
| OI-7 | Soft | AC-VT2 practice chip vs verification visual distinction | No — waiver OK |

No **blocking code defects** identified in PR4 static audit.

---

## 2A open issues closure

| Issue | Description | Status |
|-------|-------------|--------|
| O-1 | Organisation Explorer text search | **Closed** — PR1A |
| O-3 | Record Explorer verified-default | **Closed** — PR1A |
| O-5 | Registry ledger artist links → Field Creative | **Closed** — PR1B |

---

## Registry authority model

| Rule | Status |
|------|--------|
| Field primary CTAs → `/field/record/[id]` | **Pass** |
| Registry ledger secondary | **Pass** |
| Legacy detail URLs redirect; ledger preserved | **Pass** |
| Verify reads Registry truth | **Unchanged from 2A** |
| No Field write paths in 2B discovery | **Pass** |

---

## Pre-tag checklist (`checkpoint-phase2b-field-discovery`)

1. [ ] Merge PR4 to `main`  
2. [ ] Deploy staging  
3. [ ] `STAGING_URL=… STAGING_SAMPLE_REGISTRY_ID=… npx tsx scripts/phase-1-staging-http-smoke.ts`  
4. [ ] Step 13 manual QA journeys (above) — document pass  
5. [ ] Registry registration/verify spot-check  
6. [ ] Founder/product sign-off — spec LOCKED  
7. [ ] Tag `main` at merge commit: `checkpoint-phase2b-field-discovery`  

---

## Related documents

| Document | Purpose |
|----------|---------|
| [phase-2b-pr1-signoff.md](./phase-2b-pr1-signoff.md) | PR1 train |
| [phase-2b-pr2-acceptance-notes.md](./phase-2b-pr2-acceptance-notes.md) | PR2 |
| [phase-2b-pr3-acceptance-notes.md](./phase-2b-pr3-acceptance-notes.md) | PR3 |
| [phase-2b-discovery-expansion-plan.md](./phase-2b-discovery-expansion-plan.md) | Full rollout |
| [phase-2a-pr1-signoff.md](./phase-2a-pr1-signoff.md) | Prior baseline |

---

## Signoff

| Role | Name | Date | 2B merge | Tag |
|------|------|------|----------|-----|
| Engineering | — | 31 May 2026 | **Recommended** | After staging gates |
| Product | — | Pending staging QA | Pending | Pending |

**PR4 conclusion:** Phase 2B implementation is **code-complete**. Recommend merge of `pr/phase2b-pr4-acceptance`, staging validation, founder LOCKED promotion, then tag **`checkpoint-phase2b-field-discovery`** on `main`.
