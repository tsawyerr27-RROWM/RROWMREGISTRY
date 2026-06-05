# Phase 2A PR1 — Acceptance Signoff

**Document status:** ACCEPTANCE SIGNOFF  
**Effective:** 31 May 2026  
**Branch:** `pr/phase2a-field-pr1` (PR1I pending commit)  
**Authority:** [Phase 2A PR1 Field Foundation Plan](./phase-2a-pr1-field-foundation-plan.md), [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md), [Phase 2A PR1 Completion Review](./phase-2a-pr1-completion-review.md)

**Scope:** PR1I canonicalisation and acceptance close-out. No new features, schema, or migrations.

---

## Executive summary

PR1 Field Surface Foundation is **complete for merge** after PR1I. All rollout steps (§7.1 steps 1–12) are closed. Primary navigation and Field presence surfaces now target canonical Field URLs. `/field` redirects to the explorer hub. Collector Presence (PR1H) and link canonicalisation (PR1I) resolve the open gaps identified in the completion review.

| Verdict | Status |
|---------|--------|
| PR1 merge gate (plan §8.6) | **Pass** |
| Strict foundations spec gate | **Pass** with documented PR2 deferrals |
| Static validation | **Pass** (`npx tsc --noEmit`, `npm run validate:phase1-static`) |
| Deployed HTTP redirect smoke | **Not run locally** — requires staging host; static redirect inventory verified |

---

## Branch deliverables (commits)

| Commit | Deliverable |
|--------|-------------|
| `ba3cb20` | PR1A — Field scaffold, layout, `/field` homepage |
| `5960d20` | PR1B — Creative Presence + `/artist/*` redirect |
| `129e50b` | PR1C — Creative Explorer |
| `1459605` | Practice foundation review (doc) |
| `2d553b7` | Trust audit review (doc) |
| `b528958` | PR1D — Verification hub + per-record verify + legacy `/verify/*` redirect |
| `841ad07` | PR1E — Organisation Presence + legacy institutional/gallery redirects |
| `a04240f` | PR1F — Organisation Explorer + explorer hub |
| `5fb37f2` | PR1G — Record Explorer + Field Record + `/registry` list redirect |
| `5452c56` | PR1H — Collector Presence + `/collector-studio/[slug]` redirect |
| *(PR1I)* | PR1I — Canonicalisation and acceptance signoff |

---

## PR1I changes

### Header / footer / marketing canonicalisation (N-5, AC-FM2)

Primary “Registry” / browse-catalogue links updated from bare `/registry` to `fieldExplorerRecordsHref()` (`/field/explorer/records`):

- `components/Header.tsx` (desktop + mobile)
- `components/LandingPage/Footer.tsx`, `HeroSection.tsx`, `CTASection.tsx`, `PortfolioWorkspaceSection.tsx`
- `components/Navbar.tsx`

Studio and account surfaces:

- `components/Studio/ArtistWorkspaceHero.tsx`, `CollectorWorkspaceHero.tsx`, `WorkspaceShell.tsx`
- `components/account/AccountPresenceHero.tsx`
- `app/studio/collector/page.tsx`
- `components/archive/PersonalArchivePageContent.tsx`
- `components/gallery/GalleryInstitutionalHero.tsx` — public page → `fieldOrganisationHref(slug)`
- `app/studio/account/page.tsx` — public preview → `fieldOrganisationHref` / `fieldCollectorHref` / `fieldCreativeHref`

Legacy registry list components (redirect-only route; updated for grep consistency):

- `components/Registry/RegistryExplorerHero.tsx`, `RegistryExplorerContent.tsx`
- `components/gallery/GalleryPublicHero.tsx`

### Field presence work cards (AC-FC4, AC-FL4)

Primary discovery CTAs on presence surfaces use `fieldRecordHref()`:

- `components/Field/CreativePresenceView.tsx`
- `components/Field/OrganisationPresenceView.tsx`

Browse / empty-state links on Field surfaces use `fieldExplorerRecordsHref()`.

Secondary “Open Registry ledger” links on Field Record, verify, collector, and record explorer cards intentionally remain `/registry/[registry_id]` — Registry ledger authority unchanged.

### `/field` entry redirect (R-1)

- `app/field/page.tsx` — `permanentRedirect(FIELD_EXPLORER)` → `/field/explorer`

### Field verify not-found

- `app/field/verify/[registry_id]/not-found.tsx` — browse link → Field Record Explorer

---

## Field route grep pass

**Bare `/registry` list links:** none remain in `href="/registry"` or `action="/registry"` across `*.{ts,tsx}` (verified PR1I).

**Remaining `/registry/[id]` references:** authoritative ledger surfaces only — `app/registry/[registry_id]`, `app/artwork/*`, certificate/provenance pages, and secondary Field ledger CTAs. Explicitly deferred to PR2 for legacy detail redirects.

**Legacy profile URLs in non-Field components:** `/artist/[slug]` remains in `PublicRegistryRecordView` (Registry ledger); `/artist/*` 301 to Field creative. No primary nav links to `/institutional-studio/` or `/collector-studio/[slug]`.

---

## Explorer link audit

| Surface | Primary record link | Profile links | Browse empty state |
|---------|--------------------|--------------|--------------------|
| Creative Presence | `/field/record/[id]` | N/A | `/field/explorer/records` |
| Organisation Presence | `/field/record/[id]` | `/field/creative/[slug]` | `/field/explorer/records` |
| Collector Presence | `/field/record/[id]` (via loader) | N/A | `/field/explorer/records` |
| Record Explorer cards | `/field/record/[id]` (`row.href`) | creative/org when present | N/A |
| Field Record view | self | Field presence when public | verify hub |
| Registry list (legacy stub) | `/field/record/[id]` | `/field/creative/[slug]` | `/field/explorer/records` |

---

## Redirect audit (static)

| Legacy | Canonical | Mechanism | Status |
|--------|-----------|-----------|--------|
| `/field` | `/field/explorer` | `app/field/page.tsx` `permanentRedirect` | **Done (PR1I)** |
| `/artist/:slug` | `/field/creative/:slug` | `app/artist/[artist_id]/page.tsx` | **Done** |
| `/institutional-studio/:slug` | `/field/organisation/:slug` | page stub | **Done** |
| `/gallery/:slug` | `/field/organisation/:slug` | page + `next.config` | **Done** |
| `/registry` (list) | `/field/explorer/records` | `app/registry/page.tsx` | **Done** |
| `/verify/:id` | `/field/verify/:id` | page stub | **Done** |
| `/collector-studio/:slug` | `/field/collector/:slug` | page stub | **Done (PR1H)** |
| `/registry/:id`, `/artwork/:id` | `/field/record/:id` | — | **Deferred PR2** (Field Record page exists; ledger routes unchanged) |

Phase 1 legacy stubs (`/studio`, `/account`, `/personal-archive`, etc.) unchanged and still pass `validate:phase1-static`.

---

## Validation rerun

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | **Pass** | PR1I |
| `npm run validate:phase1-static` | **Pass** | 18/18 checks |
| Deployed redirect HTTP smoke | **Not run** | `scripts/phase-1-staging-http-smoke.ts` requires `STAGING_BASE_URL`; run on staging before production tag |

---

## Acceptance matrix — plan §8

### §8.1 Routing

| ID | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| R-1 | `/field` returns 301/308 to explorer | **Pass** | PR1I `permanentRedirect(FIELD_EXPLORER)` |
| R-2 | `/field/creative/[slug]` 200 for public profile | **Pass** | PR1B |
| R-3 | `/artist/[slug]` 301 to Field creative | **Pass** | PR1B |
| R-4 | `/field/explorer/creatives` 200 | **Pass** | PR1C |
| R-5 | `/field/explorer/organisations` 200 | **Pass** | PR1F |
| R-6 | `/field/explorer/records` 200; `/registry` 301 | **Pass** | PR1G |
| R-7 | Organisation and collector profile canonical + legacy 301 | **Pass** | PR1E + PR1H |
| R-8 | `/field/verify/[registry_id]` 200 for sample id | **Pass** | PR1D |

### §8.2 Presence rendering

| ID | Criterion | Result |
|----|-----------|--------|
| P-1 | Creative name, bio, works on Field URL | **Pass** |
| P-2 | Participation layers when data exists | **Pass** |
| P-3 | Organisation verified badge when `verified=true` | **Pass** |
| P-4 | Collector anonymity respected | **Pass** (PR1H) |
| P-5 | Disabled profile → 404 anonymous | **Pass** |
| P-6 | No Studio sidebar on Field presence | **Pass** |

### §8.3 Explorer functionality

| ID | Criterion | Result |
|----|-----------|--------|
| E-1 | Creative explorer lists presence-enabled only | **Pass** |
| E-2 | Creative explorer paginates | **Pass** |
| E-3 | Org explorer verified filter toggles set | **Pass** |
| E-4 | Record explorer preserves verification filter | **Pass** |
| E-5 | No recommendation / similarity UI | **Pass** |

### §8.4 Verification surface

| ID | Criterion | Result |
|----|-----------|--------|
| V-1 | `/field/verify` entry reachable | **Pass** |
| V-2 | Per-record verify shows public status | **Pass** |
| V-3 | Trust copy uses Registry record / Registry ID | **Pass** |
| V-4 | No excluded reputation signals | **Pass** |

### §8.5 Navigation integrity

| ID | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| N-1 | Explorer hub tabs switch routes | **Pass** | PR1F |
| N-2 | Creative explorer → profile → work link resolves | **Pass** | PR1I primary CTAs → Field Record |
| N-3 | Header Studio link when signed in | **Pass** | unchanged |
| N-4 | `validate:phase1-static` passes or documented delta | **Pass** | PR1I rerun |
| N-5 | No primary internal links to bare `/registry` | **Pass** | PR1I grep |

### §8.6 PR1 merge gate

**Pass** — all §8.1–§8.5 criteria met; rollout steps 1–12 complete.

---

## Acceptance matrix — foundations spec (AC-*)

| ID | Criterion | Result | Notes |
|----|-----------|--------|-------|
| AC-FC1 | Profile at `/field/creative/[slug]` | **Pass** | |
| AC-FC2 | Legacy `/artist/[slug]` 301 | **Pass** | |
| AC-FC3 | Participation / representation signals | **Pass** | |
| AC-FC4 | Each work links to `/field/record/[registry_id]` | **Pass** | PR1I primary CTAs |
| AC-FC5 | No Studio sidebar | **Pass** | |
| AC-FO1–FO5 | Organisation presence + explorer | **Pass** | FO4/FO5 work links PR1I |
| AC-FK1–FK2 | Collector presence + legacy 301 | **Pass** | PR1H |
| AC-FK3 | No commissioning / marketplace on Field | **Pass** | |
| AC-XC1–XC3 | Creative explorer | **Pass** | |
| AC-XO1–XO3 | Organisation explorer | **Pass** | |
| AC-FS1–FS3 | Record explorer | **Pass** | |
| AC-FV1–FV4 | Verification | **Pass** | AC-FV1 via PR1G Field Record |
| AC-FL1–FL2 | Field Record → public profiles | **Pass** | |
| AC-FL3 | Connected browse graph | **Pass** | PR1I |
| AC-FL4 | Record links use `/field/record/[registry_id]` | **Pass** | Primary discovery; ledger secondary links remain `/registry/[id]` by design |
| AC-FP1–FP3 | Platform journeys | **Pass** | |
| AC-FM1 | §9.2 redirects active | **Partial** | Detail record redirects deferred PR2 |
| AC-FM2 | No broken header/footer links to old `/registry` | **Pass** | PR1I |
| AC-FM3 | Registry ledger behaviour unchanged | **Pass** | Detail routes unchanged |

---

## Rollout sequence (plan §7.1) — final

| Step | Deliverable | Status |
|------|-------------|--------|
| 1 | Preflight | **Pass** |
| 2 | Field scaffold | **Pass** (R-1 closed PR1I) |
| 3 | Creative Presence | **Pass** |
| 4 | Creative Explorer | **Pass** |
| 5 | Explorer hub | **Pass** |
| 6 | Organisation Presence | **Pass** |
| 7 | Organisation Explorer | **Pass** |
| 8 | Record Explorer | **Pass** |
| 9 | Collector Presence | **Pass** (PR1H) |
| 10 | Verify move | **Pass** |
| 11 | Header + link grep | **Pass** (PR1I) |
| 12 | Validation | **Pass** (static); HTTP smoke on staging recommended |

---

## Open issues

| ID | Issue | Severity | Target |
|----|-------|----------|--------|
| O-1 | Legacy `/registry/[id]` and `/artwork/[id]` detail routes not 301 to Field Record | Low | PR2 (plan §7.3) |
| O-2 | Secondary Field “Open Registry ledger” CTAs still use `/registry/[id]` | None | By design — Registry authority |
| O-3 | Record Explorer default lists all public records; legacy list was verified-only by default | Low | Document / filter UX; `verified=1` restores parity |
| O-4 | Deployed HTTP redirect smoke not executed in PR1I | Medium | Run `npm run validate:phase1-staging-http` on staging before production tag |
| O-5 | `PublicRegistryRecordView` artist links use `/artist/[slug]` (redirect-safe) | Low | PR2 link grep |
| O-6 | `FieldHomeContent` component unused after `/field` redirect | Low | Remove or repurpose in PR2 cleanup |

---

## Recommendation for checkpoint tag

After PR1I merges to main and staging redirect smoke passes:

```
checkpoint-phase2a-field-foundations
```

Per [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) §12 — independent of Phase 1 checkpoint ancestry (`checkpoint-phase1-production`).

**Pre-tag checklist:**

1. Merge `pr/phase2a-field-pr1` to main.
2. Deploy to staging.
3. Run `STAGING_BASE_URL=… npm run validate:phase1-staging-http` (or project equivalent) — confirm R-1, R-3, R-6, R-7 redirect matrix.
4. Manual smoke: anonymous discover → creative profile → Field Record → verify.
5. Tag main at merge commit.

---

## Signoff

PR1 Field Surface Foundation meets the frozen PR1 acceptance gate. PR2 may proceed with Field Record detail move, legacy detail redirects, and full ledger link grep.
