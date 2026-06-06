# Phase 2A PR1 — Completion Review

**Document status:** IMPLEMENTATION REVIEW  
**Effective:** 31 May 2026  
**Branch reviewed:** `pr/phase2a-field-pr1` (HEAD `5fb37f2`)  
**Authority:** [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2A PR1 Field Foundation Plan](./phase-2a-pr1-field-foundation-plan.md) (IMPLEMENTATION SOURCE OF TRUTH), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN)

**Scope:** Read-only audit of branch state against frozen PR1 acceptance criteria. No code, schema, or migration changes in this document.

---

## Executive summary

The branch delivers the **core Field surface**: layout and chrome, Creative and Organisation presence and explorers, Record explorer, verification layer, and an **early Field Record page** (planned as PR2 in the PR1 plan but implemented in PR1G). Move-then-redirect is applied for the primary legacy families that were moved (artist, institutional-studio, gallery, registry list, verify).

**Strict PR1 merge gate (plan §8.6) does not fully pass.** Two rollout steps from §7.1 remain open: **Collector Presence (step 9)** and **Header + internal link grep (step 11)**. Redirect smoke and static validation on this branch were not re-run as part of this review.

| Verdict area | Status |
|--------------|--------|
| Creative path (presence + explorer) | **Complete** |
| Organisation path (presence + explorer) | **Complete** |
| Record discovery (explorer + Field Record) | **Complete** (Field Record ahead of plan PR2 deferral) |
| Verification (`/field/verify/*`) | **Complete** |
| Collector Presence | **Not started** (stub only) |
| Navigation / link canonicalisation | **Incomplete** |
| `/field` entry redirect policy | **Partial** (homepage at `/field`, hub at `/field/explorer`) |

### Recommendation

**B. PR1 complete with minor follow-ups**

Ship or tag this branch only after the follow-ups below, or explicitly document them as **PR1H** before calling Phase 2A Field Foundations complete:

1. **Collector Presence** — move `app/collector-studio/[slug]` → `/field/collector/[slug]` + legacy 301 (plan step 9; AC-FK*, P-4, R-7 collector leg).
2. **Header + link grep** — primary nav and Field surfaces should target `/field/explorer/records` (or hub) instead of bare `/registry`; Studio “view public page” links should target Field organisation URL (plan step 11; N-5, AC-FM2).
3. **Optional polish** — adopt `/field/record/[registry_id]` as primary CTA on Field presence cards (AC-FC4 / AC-FL4); resolve `/field` vs `/field/explorer` redirect policy (R-1 vs PR1A homepage).

Teams requiring **literal §8.6 pass with zero open steps** should treat recommendation as **C. Collector Presence required before PR1 completion** until step 9 (and preferably step 11) land.

---

## Branch deliverables (commits)

| Commit | Deliverable |
|--------|-------------|
| `ba3cb20` | PR1A — Field scaffold, layout, `/field` homepage |
| `5960d20` | PR1B — Creative Presence + `/artist/*` redirect |
| `129e50b` | PR1C — Creative Explorer |
| `1459605` | Practice foundation review (doc only) |
| `2d553b7` | Trust audit review (doc only) |
| `b528958` | PR1D — Verification hub + per-record verify + legacy `/verify/*` redirect |
| `841ad07` | PR1E — Organisation Presence + legacy institutional/gallery redirects |
| `a04240f` | PR1F — Organisation Explorer + explorer hub |
| `5fb37f2` | PR1G — Record Explorer + Field Record + `/registry` list redirect |

**Review docs on branch:** `phase-2a-practice-foundation-review.md`, `phase-2a-trust-audit.md`

---

## Rollout sequence (plan §7.1)

| Step | Deliverable | Status | Notes |
|------|-------------|--------|-------|
| 1 | Preflight — branch, tsc | **Pass** | `npx tsc --noEmit` passes on HEAD |
| 2 | Field scaffold — layout, `/field`, `lib/field-nav/` | **Pass** | `/field` renders homepage (not 301 to explorer — see R-1) |
| 3 | Creative Presence move | **Pass** | `/field/creative/[slug]`; `/artist/*` 301 |
| 4 | Creative Explorer | **Pass** | Filters include practice (ahead of spec §10.3 2B deferral) |
| 5 | Explorer hub + sub-nav | **Pass** | `/field/explorer` operational; `FieldExplorerSubNav` on explorer paths |
| 6 | Organisation Presence move | **Pass** | `/field/organisation/[slug]`; institutional + gallery redirects |
| 7 | Organisation Explorer | **Pass** | Full filter set per PR1F |
| 8 | Record Explorer move | **Pass** | `/field/explorer/records`; `/registry` 301; **bonus:** `/field/record/[id]` |
| 9 | Collector Presence move | **Fail** | `/field/collector/[slug]` is `FieldRouteStub` only |
| 10 | Verify move | **Pass** | Hub + per-record; `/verify/[id]` 301 |
| 11 | Header + link grep | **Fail** | Header/footer/marketing still link to `/registry`; Studio account org preview URL legacy |
| 12 | Validation — smoke, QA, tsc | **Partial** | tsc pass; redirect smoke / `validate:phase1-static` not evidenced on branch |

---

## Pass / fail matrix — PR1 plan §8

### §8.1 Routing

| ID | Criterion | Result | Evidence / gap |
|----|-----------|--------|----------------|
| R-1 | `/field` returns 301/308 to explorer | **Fail** | `app/field/page.tsx` renders `FieldHomeContent` (200). Hub lives at `/field/explorer`. Plan §2.1 allows creatives-first window; founder freeze prefers explorer entry — policy unresolved. |
| R-2 | `/field/creative/[slug]` 200 for public profile | **Pass** | `loadCreativePresencePageData` + `CreativePresenceView`; 404 when `public_presence.profile` false |
| R-3 | `/artist/[slug]` 301 to Field creative | **Pass** | `app/artist/[artist_id]/page.tsx` `permanentRedirect` + query preserve |
| R-4 | `/field/explorer/creatives` 200 | **Pass** | Operational index + pagination |
| R-5 | `/field/explorer/organisations` 200 | **Pass** | Operational index + pagination |
| R-6 | `/field/explorer/records` 200; `/registry` 301 | **Pass** | Record explorer operational; `app/registry/page.tsx` redirects to `/field/explorer/records` |
| R-7 | Organisation and collector profile canonical + legacy 301 | **Partial** | Organisation: **Pass** (`institutional-studio`, `gallery` → Field). Collector: **Fail** — no move; `/collector-studio/[slug]` still serves legacy page; `/field/collector/[slug]` stub |
| R-8 | `/field/verify/[registry_id]` 200 for sample id | **Pass** | `FieldVerifyRecordView` + `loadFieldVerifyRecordData`; not-found UX for unknown IDs |

### §8.2 Presence rendering

| ID | Criterion | Result | Evidence / gap |
|----|-----------|--------|----------------|
| P-1 | Creative name, bio, works on Field URL | **Pass** | PR1B |
| P-2 | Participation layers when data exists | **Pass** | `ParticipationLayersStrip` on Creative Presence; org verification band on Organisation Presence |
| P-3 | Organisation verified badge when `verified=true` | **Pass** | Organisation Presence + Explorer cards |
| P-4 | Collector anonymity respected | **Fail** | No Field Collector page — cannot validate on canonical route |
| P-5 | Disabled profile → 404 anonymous | **Pass** | Creative + Organisation loaders gate on `public_presence.profile` |
| P-6 | No Studio sidebar on Field presence | **Pass** | `FieldLayoutChrome` only; no `WorkspaceShell` on `/field/*` |

### §8.3 Explorer functionality

| ID | Criterion | Result | Evidence / gap |
|----|-----------|--------|----------------|
| E-1 | Creative explorer lists presence-enabled only | **Pass** | Client-side filter on `public_presence.profile` + slug |
| E-2 | Creative explorer paginates | **Pass** | `FieldExplorerPagination` |
| E-3 | Org explorer verified filter toggles set | **Pass** | `verified=1` in `fetchOrganisationExplorerList` |
| E-4 | Record explorer preserves verification filter | **Pass** | `verified=1` supported; **note:** default list is all public artworks (legacy `/registry` listed verified-only — behavioural delta, filter restores verified-only view) |
| E-5 | No recommendation / similarity UI | **Pass** | No match scores, feeds, or sponsored placement in Field explorers |

### §8.4 Verification surface

| ID | Criterion | Result | Evidence / gap |
|----|-----------|--------|----------------|
| V-1 | `/field/verify` entry reachable | **Pass** | `FieldVerifyHubContent` |
| V-2 | Per-record verify shows public status | **Pass** | Tiered trust in `FieldVerifyRecordView`; certificate + revoked handling |
| V-3 | Trust copy uses Registry record / Registry ID | **Pass** | Hub education + verify record copy; ADR-31-A language present |
| V-4 | No excluded reputation signals | **Pass** | No stars, followers, NFT badges, pay-to-rank on Field surfaces reviewed |

### §8.5 Navigation integrity

| ID | Criterion | Result | Evidence / gap |
|----|-----------|--------|----------------|
| N-1 | Explorer hub tabs switch routes | **Pass** | `FieldExplorerSubNav` + three explorer routes |
| N-2 | Creative explorer → profile → work link resolves | **Partial** | Graph navigable; presence work CTAs still use `/registry/[id]` and `/artwork/[id]` (redirect-safe via legacy routes, not AC-FL4-canonical) |
| N-3 | Header Studio link when signed in | **Pass** | Existing Header behaviour; `isFieldSurface` present |
| N-4 | `validate:phase1-static` passes or documented delta | **Not verified** | Script exists; not run in this review |
| N-5 | No primary internal links to bare `/registry` except stubs/legacy | **Fail** | Header, Footer, Hero, Field presence footers, `RegistryExplorerContent` empty state still use `/registry` (list redirect mitigates breakage, not canonical intent) |

### §8.6 PR1 merge gate (composite)

**Does not pass as written** until P-4, R-7 (collector), N-5, and rollout steps 9–11 are closed.

---

## Pass / fail matrix — Field Foundations Spec (AC-*)

### Creative (AC-FC*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FC1 | Profile at `/field/creative/[slug]` when enabled | **Pass** | |
| AC-FC2 | Legacy `/artist/[slug]` 301 | **Pass** | |
| AC-FC3 | Participation / representation signals | **Pass** | |
| AC-FC4 | Each work links to `/field/record/[registry_id]` | **Partial** | Primary CTAs on Creative Presence use `/registry/[id]` (plan §3.1 allowed legacy in PR1; spec AC-FC4 prefers Field Record) |
| AC-FC5 | No Studio sidebar | **Pass** | |

### Organisation (AC-FO*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FO1 | Profile at `/field/organisation/[slug]` | **Pass** | |
| AC-FO2 | Legacy institutional/gallery 301 | **Pass** | incl. `next.config` `/gallery/:slug` |
| AC-FO3 | Verified badge when `verified=true` | **Pass** | |
| AC-FO4 | Roster links to public Creative profiles | **Pass** | `/field/creative/[slug]` when public |
| AC-FO5 | Works link to Field Record | **Partial** | Same legacy `/registry` + `/artwork` pattern as Creative Presence |

### Collector (AC-FK*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FK1 | Collector profile at `/field/collector/[slug]` | **Fail** | Stub only |
| AC-FK2 | Legacy `/collector-studio/[slug]` 301 to canonical | **Fail** | Legacy page still canonical |
| AC-FK3 | No commissioning / marketplace surfaces | **Pass** | On legacy page; Field route not implemented |
| AC-FK4 | Custody CTAs to existing flows | **N/A on Field** | Legacy collector page unchanged |

### Explorers (AC-XC*, AC-XO*, AC-FS*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-XC1 | Anonymous browse Creatives | **Pass** | |
| AC-XC2 | Links to `/field/creative/[slug]` | **Pass** | |
| AC-XC3 | No recommendation feed | **Pass** | |
| AC-XO1 | Anonymous browse Organisations | **Pass** | |
| AC-XO2 | Links to `/field/organisation/[slug]` | **Pass** | |
| AC-XO3 | Verified filter without hiding unverified by default | **Pass** | Default shows all public orgs |
| AC-FS1 | Record Explorer verification filter | **Pass** | `verified=1` |
| AC-FS2 | All explorers paginate | **Pass** | |
| AC-FS3 | No recommendation UI | **Pass** | |

### Verification (AC-FV*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FV1 | Field Record shows verification before secondary metadata | **Pass** | PR1G `FieldRecordView` — delivered ahead of plan PR2 deferral |
| AC-FV2 | `/field/verify/[registry_id]` available | **Pass** | |
| AC-FV3 | Registry record / Registry ID copy | **Pass** | |
| AC-FV4 | No excluded reputation signals | **Pass** | |

### Linking graph (AC-FL*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FL1 | Field Record → public Creative when profile public | **Pass** | `FieldRecordView` |
| AC-FL2 | Field Record → public Organisation when public | **Pass** | |
| AC-FL3 | Connected browse graph | **Partial** | Explorers + profiles + Field Record connect; presence pages still anchor works on legacy Registry URLs |
| AC-FL4 | All record links use `/field/record/[registry_id]` | **Partial** | Record Explorer cards + explorer row `href` use Field Record; presence surfaces and several CTAs do not |

### Platform (AC-FP*, AC-FM*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FP1 | Discover → profile → record journey | **Pass** | Anonymous path works end-to-end via Field routes |
| AC-FP2 | No Studio sidebar on Field | **Pass** | |
| AC-FP3 | No Field ledger mutation | **Pass** | Read-only loaders |
| AC-FM1 | §9.2 redirects active | **Partial** | Core moves done; **missing:** `/collector-studio/[slug]` → Field; **deferred by plan:** `/registry/[id]`, `/artwork/[id]` → Field Record |
| AC-FM2 | No broken header/footer links to old `/registry` as primary | **Fail** | Marketing chrome still points to `/registry` |
| AC-FM3 | Registry ledger behaviour unchanged | **Not verified** | Detail routes `/registry/[id]` unchanged; assumes RP smoke still valid |

---

## Route and redirect inventory

### Operational Field routes

| Route | Status |
|-------|--------|
| `/field` | Homepage (200) |
| `/field/explorer` | Hub (200) |
| `/field/explorer/creatives` | Operational |
| `/field/explorer/organisations` | Operational |
| `/field/explorer/records` | Operational |
| `/field/creative/[slug]` | Operational |
| `/field/organisation/[slug]` | Operational |
| `/field/collector/[slug]` | **Stub** |
| `/field/verify` | Operational |
| `/field/verify/[registry_id]` | Operational |
| `/field/record/[registry_id]` | Operational (PR1G; plan had deferred to PR2) |

### Move-then-redirect applied

| Legacy | Canonical | Status |
|--------|-----------|--------|
| `/artist/:slug` | `/field/creative/:slug` | **Done** |
| `/institutional-studio/:slug` | `/field/organisation/:slug` | **Done** |
| `/gallery/:slug` | `/field/organisation/:slug` | **Done** (next.config + page) |
| `/registry` (list) | `/field/explorer/records` | **Done** |
| `/verify/:id` | `/field/verify/:id` | **Done** |
| `/collector-studio/:slug` | `/field/collector/:slug` | **Not done** |
| `/registry/:id`, `/artwork/:id` | `/field/record/:id` | **Not done** (explicit PR2 in plan; Field Record page exists without legacy redirect) |

### Registry routes unchanged (as required)

| Route | Status |
|-------|--------|
| `/registry/[registry_id]` | Unchanged — authoritative ledger view |
| `/artwork/[registry_id]` | Unchanged |

---

## Trust and verification assessment

| Requirement | Status |
|-------------|--------|
| Verification hub educates hierarchy | **Pass** — PR1D |
| Per-record verify reads Registry RPCs only | **Pass** — `loadFieldVerifyRecordData` |
| Certificate visibility on Field surfaces | **Pass** — verify, org presence, record explorer, Field Record |
| Registry evidence before marketing copy on presence | **Pass** — Creative + Organisation layout (trust audit R-3/R-4 addressed in PR1D/E) |
| No new verification authority on Field | **Pass** |
| No reputation scores / rankings | **Pass** |

**Open trust-adjacent gap:** Field presence work cards should prefer `/field/record/[id]` as primary discovery CTA now that PR1G shipped Field Record (trust audit R-8 partially addressed).

---

## Anti-features and scope exclusions

| Forbidden in PR1 (plan §9.6 / founder freeze) | Present on branch? |
|-------------------------------------------------|-------------------|
| Opportunities, programmes, applications | **No** |
| Messaging / DMs | **No** |
| Recommendation feeds / pay-to-rank | **No** |
| Studio sidebar on Field | **No** |
| Field ledger writes | **No** |
| Placeholder “coming soon” in primary nav for excluded features | **No** — collector stub is a route stub, not nav bait |

---

## Is Collector Presence required for PR1 completion?

**Yes — under the frozen PR1 plan and foundations gate.**

| Source | Requirement |
|--------|-------------|
| Plan §7.1 step **9** | Explicit deliverable before validation step 12 |
| Plan §8.2 **P-4** | Collector anonymity on Field URL |
| Plan §8.1 **R-7** | Collector canonical + legacy 301 |
| Foundations **AC-FK1, AC-FK2** | Listed in §12 acceptance gate summary |
| Appendix A | File move from `collector-studio/[slug]` |

Collector is **limited scope** (public collection narrative only — no patron/marketplace). Implementation source exists at `app/collector-studio/[slug]/page.tsx`; move pattern matches PR1B/PR1E.

**Not required for Creative-first north star**, but **required for formal PR1 completion** unless the team explicitly descopes step 9 and updates the plan gate (would violate current IMPLEMENTATION SOURCE OF TRUTH without unlock).

---

## Open requirements summary

### Must-close for strict PR1 (recommended before merge tag)

1. **PR1H — Collector Presence** — loader + view + move + `/collector-studio/[slug]` redirect.
2. **PR1I — Navigation grep** — Header, Footer, landing CTAs, Studio account public preview URLs, Field internal “Browse registry” links → `/field/explorer/records`; stale `/artist/` links in legacy Registry components (lower priority if Registry routes unchanged).
3. **Validation** — Re-run redirect smoke + `npm run validate:phase1-static`; document any delta.

### Should-close (polish, low risk)

4. Field presence + org catalogue primary work CTA → `fieldRecordHref()` (AC-FC4, AC-FL4).
5. `/field` → `/field/explorer` redirect vs homepage policy (R-1 / founder freeze hub default).
6. Record Explorer default scope — document verified-only vs all-records default for RP parity.

### Explicitly out of PR1 (unchanged)

- Legacy `/registry/[id]` and `/artwork/[id]` redirects to Field Record (plan PR2).
- Full provenance / ledger UI on Field Record (Registry page remains authoritative).
- Phase 2B practice taxonomy editor; practice filters on explorers are already shipped ahead of spec deferral.

---

## Summary scorecard

| Category | Pass | Partial | Fail | Not verified |
|----------|------|---------|------|--------------|
| Plan §8 routing (R-1–R-8) | 6 | 1 | 1 | 0 |
| Plan §8 presence (P-1–P-6) | 5 | 0 | 1 | 0 |
| Plan §8 explorers (E-1–E-5) | 5 | 0 | 0 | 0 |
| Plan §8 verify (V-1–V-4) | 4 | 0 | 0 | 0 |
| Plan §8 nav (N-1–N-5) | 2 | 1 | 1 | 1 |
| Foundations AC-* (aggregate) | ~28 | ~6 | ~4 | ~2 |
| Rollout steps 1–12 | 9 complete | 2 partial | 2 not done | — |

---

## Final recommendation

| Option | Assessment |
|--------|------------|
| **A. PR1 complete** | **No** — Collector stub, navigation grep, and composite §8.6 gate remain open. |
| **B. PR1 complete with minor follow-ups** | **Yes (recommended)** — Core Field discovery, presence (Creative + Organisation), verification, and Record explorer are production-quality on branch; close Collector + nav grep as bounded follow-ups before `checkpoint-phase2a-field-foundations`. |
| **C. Collector Presence required before PR1 completion** | **Yes (strict interpretation)** — Plan step 9 and AC-FK* / P-4 / R-7 cannot pass without it; treat as blocking if merge gate must be literal. |

---

## Related documents

| Document | Role |
|----------|------|
| [phase-2a-pr1-field-foundation-plan.md](./phase-2a-pr1-field-foundation-plan.md) | PR1 rollout and §8 gate |
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Full AC-* catalogue |
| [phase-2a-trust-audit.md](./phase-2a-trust-audit.md) | Pre-PR1D trust review |
| [phase-2a-practice-foundation-review.md](./phase-2a-practice-foundation-review.md) | Practice proxy audit |

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | IMPLEMENTATION REVIEW | Branch `pr/phase2a-field-pr1` @ `5fb37f2` |
