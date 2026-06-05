# Phase 2A PR1 — Field Surface Foundation Plan

**Document status:** IMPLEMENTATION SOURCE OF TRUTH  
**Effective:** 31 May 2026  
**Authority:** [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT)  
**PR scope:** Phase 2A **PR1 only** — canonical Field route structure, Field navigation architecture, presence page mapping, migration impacts, rollout sequence, acceptance criteria.  
**Golden rule (inherited from Phase 1 PR4):** **Move, then redirect.** Legacy routes become redirect stubs in the **same commit** as the canonical move. Never delete a route and add redirects later.

**Out of scope for PR1 (document only — do not implement):** Database schema, visual UI design, Opportunity objects, `/field/open-calls`, Studio inbox, API namespace migration, `/field/record/[registry_id]` **content move** (see §1.2 — scaffold only in PR1 unless PR1 extended by unlock).

**Document type:** Implementation plan — **no code, no database tables, no visual UI specification.**

---

## 0. PR1 objective

Establish **The Field** as the **third ecosystem surface** by:

1. Creating the canonical **`/field/*` App Router namespace** with shared Field layout (no Studio workspace sidebar).
2. Introducing **Field navigation architecture** (explorer hub + cross-surface links).
3. **Moving** public profile and explorer implementations into Field routes with **301 legacy stubs**.
4. Defining **presence → page** data mapping so Studio remains edit source and Field remains read projection.
5. Preparing **migration and link-grep** inventory for downstream PRs (record detail, verify, full redirect matrix).

**PR1 success statement:**

> Anonymous and signed-in users can reach Field explorer and profile canonical URLs; legacy public URLs 301 correctly; Field chrome applies (header-only, no Studio sidebar); presence rules match founder freeze §1.

---

## 1. Canonical Field route structure

### 1.1 PR1 canonical routes (user-facing)

| Route | Role | PR1 behaviour target |
|-------|------|----------------------|
| `/field` | Surface entry | **Redirect** → `/field/explorer` (permanent) |
| `/field/explorer` | Explorer hub | **Render** — default view = Record Explorer content |
| `/field/explorer/records` | Record Explorer | **Render** — same product behaviour as current `/registry` list |
| `/field/explorer/creatives` | Creative Explorer | **Render** — public Creative index |
| `/field/explorer/organisations` | Organisation Explorer | **Render** — public Organisation index |
| `/field/creative/[slug]` | Creative presence | **Render** — same product behaviour as `/artist/[slug]` |
| `/field/organisation/[slug]` | Organisation presence | **Render** — same product behaviour as `/institutional-studio/[slug]` |
| `/field/collector/[slug]` | Collector presence (limited) | **Render** — same product behaviour as `/collector-studio/[slug]` |
| `/field/verify` | Verify entry | **Redirect** → `/field/explorer/records` **or** minimal static “enter registry ID” hub (product pick at implementation — must not require auth) |

**Dynamic verify path (spec-required, PR1 scaffold or PR2 move):**

| Route | Role | PR1 target |
|-------|------|------------|
| `/field/verify/[registry_id]` | Public verify | **Scaffold stub** in PR1 if verify page not moved; **full move** in PR2 |

### 1.2 Spec companion route (not in PR1 move unless unlocked)

| Route | Role | PR1 target |
|-------|------|------------|
| `/field/record/[registry_id]` | Field Record | **Scaffold only** in PR1 (route exists, optional `permanentRedirect` to legacy until PR2) |

**Rationale:** PR1 focuses on **surface foundation** (namespace, layout, explorers, profiles, verify entry). Single-record pages are high-traffic and high-risk; spec AC-FL* and AC-FV* for record detail may land in **PR2 — Field Record migration**. PR1 must not block PR2: internal links **may** still point at legacy `/registry/[id]` until PR2 grep pass — document in §4.

### 1.3 App Router module map (target tree)

```
app/field/
├── layout.tsx                 # Field layout — shared chrome contract (no Studio sidebar)
├── page.tsx                   # permanentRedirect → /field/explorer
├── explorer/
│   ├── page.tsx               # Hub — Record Explorer default
│   ├── records/page.tsx       # Record list (from app/registry/page.tsx)
│   ├── creatives/page.tsx     # Creative index (new server page)
│   └── organisations/page.tsx # Organisation index (new server page)
├── creative/[slug]/page.tsx   # from app/artist/[artist_id]/page.tsx
├── organisation/[slug]/page.tsx # from app/institutional-studio/[slug]/page.tsx
├── collector/[slug]/page.tsx  # from app/collector-studio/[slug]/page.tsx
├── verify/
│   ├── page.tsx               # Hub or redirect
│   └── [registry_id]/page.tsx # from app/verify/[registry_id]/page.tsx (PR1 or PR2)
└── record/[registry_id]/page.tsx  # scaffold; PR2 move from registry/artwork
```

**Slug param naming:** Use `[slug]` on Field profile routes (spec). Legacy `artist/[artist_id]` param name is **slug in practice** — rename param in move for clarity.

### 1.4 Legacy stub routes (after move)

| Legacy path | Stub action |
|-------------|-------------|
| `app/registry/page.tsx` | `permanentRedirect('/field/explorer/records')` or `/field/explorer` |
| `app/artist/[artist_id]/page.tsx` | `permanentRedirect('/field/creative/[slug]')` |
| `app/institutional-studio/[slug]/page.tsx` | `permanentRedirect('/field/organisation/[slug]')` |
| `app/gallery/[slug]/page.tsx` | Already redirects to institutional — update chain to Field org URL in `next.config.ts` |
| `app/collector-studio/[slug]/page.tsx` | `permanentRedirect('/field/collector/[slug]')` |

**Do not stub:** `app/collector-studio/page.tsx` (exact — Studio dashboard redirect per Phase 1).

---

## 2. Field navigation architecture

### 2.1 Navigation layers

| Layer | Owner | PR1 deliverable |
|-------|-------|-----------------|
| **Global header** | Shared `Header` | Extend surface detection: `isFieldSurface` for `/field/*` |
| **Field sub-nav** | Field layout | Explorer hub tabs — conceptual module `lib/field-nav/` |
| **In-page links** | Route pages | Profile ↔ record links (legacy URLs OK until PR2) |
| **Footer** | Shared footer | Field explorer links use canonical paths |

### 2.2 Field layout contract (`app/field/layout.tsx`)

| Requirement | Source |
|-------------|--------|
| **No** `SignedInCatalogueShellLayout` | Founder freeze §6, ADR-28-C |
| **No** `*WorkspaceShellLayout` | Blueprint chrome rule |
| **Yes** site `Header` + `Footer` (or Field-specific footer slot) | Spec §8.2 |
| Auth-aware header: Sign in / Studio entry | Spec §11.2 |
| Children render full-width public content | Field atmosphere (existing narrative/registry tokens — not visual spec here) |

**Explicit removal (PR1 or coordinated PR2):** `app/registry/layout.tsx` must **not** wrap Field routes. After record move, registry layout either deleted or stub-only.

### 2.3 Explorer hub navigation (information architecture)

```
/field/explorer
├── [Records]      → /field/explorer/records   (default active on hub)
├── [Creatives]    → /field/explorer/creatives
└── [Organisations] → /field/explorer/organisations
```

| Nav item | Label (i18n key — provisional) | Active when |
|----------|----------------------------------|-------------|
| Records | `field.nav.records` | `/field/explorer`, `/field/explorer/records` |
| Creatives | `field.nav.creatives` | `/field/explorer/creatives` |
| Organisations | `field.nav.organisations` | `/field/explorer/organisations` |

**Rules:**

- Hub at `/field/explorer` and `/field/explorer/records` show **equivalent** record list (alias — no duplicate logic long-term; one imports shared server component).
- No fourth tab for Collector in 2A (collectors discovered via records or direct slug).
- No brief/open-call nav items (anti-features freeze §10).

### 2.4 Field nav module (conceptual — `lib/field-nav/`)

| Export | Purpose |
|--------|---------|
| `FIELD_EXPLORER_TABS` | Tab id, href, label key |
| `isFieldPath(pathname)` | Header/layout surface detection |
| `fieldCreativeProfileHref(slug)` | `/field/creative/${slug}` |
| `fieldOrganisationProfileHref(slug)` | `/field/organisation/${slug}` |
| `fieldCollectorProfileHref(slug)` | `/field/collector/${slug}` |
| `fieldRecordHref(registryId)` | `/field/record/${id}` — for PR2 link grep |
| `fieldVerifyHref(registryId)` | `/field/verify/${id}` |

### 2.5 Header integration impacts

| Current | PR1 change |
|---------|------------|
| `isRegistrySurface` paths | Add parallel `isFieldSurface` OR extend registry paths to include `/field/*` for chrome styling |
| `isAppShell` | **Exclude** `/field/*` — Field is not Studio shell |
| Marketing links to `/registry` | Grep pass → `/field/explorer` |

### 2.6 Breadcrumbs (conceptual)

| Page | Trail |
|------|-------|
| Creative profile | The Field → Creatives → {name} |
| Organisation profile | The Field → Organisations → {name} |
| Record (PR2) | The Field → Records → {registry_id} |

Implementation: optional in PR1; required before 2A sign-off if spec QA demands orientation.

---

## 3. Presence page data mapping

Studio owns edit; Field pages **read** the same sources as legacy public pages. No new Field-owned tables in PR1.

### 3.1 Creative presence — `/field/creative/[slug]`

| Field block | Data source | Visibility gate |
|-------------|-------------|-----------------|
| Headline | `artists.display_name` | `public_presence.profile` |
| Bio | `artists.bio` | profile enabled |
| Website / Instagram | `artists.website`, `artists.instagram` | profile enabled |
| Participation layers | RPC `get_artist_representation_state` + existing parsers | when data exists |
| Representing Organisation link | `artists.galleries` join | org public profile only |
| Works list | `fetchArtistArtworkList` / `artwork_read_model` | public works; link targets PR2 canonical |
| List filters | `registry-list-params` (q, sort, page, status) | preserve behaviour |
| Owner preview | auth.uid === artist.id | bypass 404 when profile disabled |

**404 rule:** Anonymous + profile disabled → `notFound()` (spec AC-FC1).

### 3.2 Organisation presence — `/field/organisation/[slug]`

| Field block | Data source | Visibility gate |
|-------------|-------------|-----------------|
| Name | `galleries.name` | `public_presence.profile` |
| Location | `galleries.location` | `presence.location` flag |
| Description | `galleries.description` | `presence.description` |
| Website | `galleries.website_url` | when set |
| Verified badge | `galleries.verified` | always show when true on public profile |
| Stats | roster + artwork counts | derived |
| Roster | `artists` where `gallery_id` | `presence.ownership` (existing gallery public sections) |
| Catalogue works | `artwork_read_model` for roster artists | verification filter as today |
| Creative links | artist slug | `/field/creative/[slug]` when creative public |

**Legacy note:** `app/gallery/[slug]` redirects via config — update destination to `/field/organisation/[slug]`.

### 3.3 Collector presence (limited) — `/field/collector/[slug]`

| Field block | Data source | Visibility gate |
|-------------|-------------|-----------------|
| Collection identity | `collector_profiles` + slug | `public_presence.profile` |
| Bio / location | collector profile fields | presence + anonymity rules |
| Public works | collector catalogue query (existing page logic) | as today |
| Anonymous mode | `collectorAnonymous` equivalent | hide identifying narrative |
| Commission / marketplace | — | **Absent** (anti-features) |

**Scope limit:** No patron, no production, no marketplace (founder freeze §1, §10).

### 3.4 Explorer index data mapping

| Explorer | Query concept | Inclusion rule |
|----------|---------------|----------------|
| **Records** | Existing verified artwork list | Same as `/registry` |
| **Creatives** | `artists` where `public_presence.profile` | Paginated; name sort default |
| **Organisations** | `galleries` where `public_presence.profile` | Paginated; verified filter optional toggle |

**PR1 note:** Creative and Organisation explorers are **new index pages** — not moves. They aggregate presence-enabled profiles only; no new discovery algorithm.

### 3.5 Verify mapping — `/field/verify/[registry_id]`

| Field block | Data source |
|-------------|-------------|
| Public cert status | Existing verify page RPC/queries |
| Link to record | `/field/record/[id]` when PR2 live; legacy until then |
| Full certificate | Auth-gated — unchanged |

---

## 4. Migration impacts

### 4.1 Route and config redirects

| ID | From | To | Mechanism |
|----|------|-----|-----------|
| F-01 | `/field` | `/field/explorer` | App Router |
| F-02 | `/registry` | `/field/explorer/records` | App stub after move |
| F-03 | `/artist/:slug` | `/field/creative/:slug` | App stub |
| F-04 | `/institutional-studio/:slug` | `/field/organisation/:slug` | App stub |
| F-05 | `/gallery/:slug` | `/field/organisation/:slug` | `next.config.ts` update (replace intermediate hop) |
| F-06 | `/collector-studio/:slug` | `/field/collector/:slug` | App stub |
| F-07 | `/verify/:id` | `/field/verify/:id` | App stub (PR1 or PR2) |
| F-08 | `/registry/:id` | `/field/record/:id` | **PR2** stub |
| F-09 | `/artwork/:id` | `/field/record/:id` | **PR2** stub |

**Retention:** Permanent `301` preferred (founder freeze §7, ADR-29).

### 4.2 Layout migration

| File | Action |
|------|--------|
| `app/registry/layout.tsx` | Remove shell after record list moves to Field; legacy registry stub has **no** layout or minimal passthrough |
| `app/field/layout.tsx` | **Create** — Field chrome contract |

### 4.3 Internal link grep categories (PR1 pass)

| Category | Example paths to update |
|----------|-------------------------|
| Marketing / landing | `CTASection`, `HeroSection`, `Footer` |
| Header | registry surface detection, nav links |
| Studio heroes | `/registry` links → `/field/explorer` |
| Account presence hero | public page preview hrefs |
| Organisation dashboard | artist links, registry links |
| Registry components | pagination base path props |
| Artist page self-links | base path → `/field/creative/[slug]` |

**Grep patterns (baseline before PR1):**

```bash
rg '"/registry"|`/registry|/artist/|/institutional-studio/|/collector-studio/[a-z]' --glob '*.{ts,tsx}'
rg 'isRegistrySurface|isAppShell' components/Header.tsx
```

Save baseline to `docs/v2/baselines/field-pr1-link-grep-baseline.txt` (artifact — optional).

### 4.4 i18n and copy

| Area | PR1 action |
|------|------------|
| Surface name | “The Field” in explorer hub and header |
| Trust copy | Retain “Registry record”, “Registry ID” on record surfaces (ADR-31-A) |
| New keys | `field.nav.*`, `field.explorer.*` — EN minimum; DE/FR/JA follow existing locale pass |

### 4.5 SEO and sitemap

| Impact | Mitigation |
|--------|------------|
| `/registry` indexed URLs | 301 to Field explorer |
| Profile slug URLs change | 301 per participant type |
| `registry_id` URLs | Stable across PR2 record move |

### 4.6 Registry preservation

| Rule | PR1 |
|------|-----|
| Ledger RPCs | Unchanged |
| List/read queries | Same functions, new route hosts |
| RLS | Unchanged |
| RP smoke | RP-10, RP-11 after PR1+PR2 on staging |

### 4.7 Phase 1 documents touched (reference only)

| Doc | Update timing |
|-----|---------------|
| Route migration matrix | Supplement with Field redirect appendix post-PR1 |
| Phase 2A spec | Mark PR1 complete in future execution log |

---

## 5. Rollout sequence

### 5.1 Preconditions (gate before PR1)

| ID | Check |
|----|-------|
| G-1 | Phase 1 `checkpoint-phase1-production` on `main` |
| G-2 | Founder freeze + 2A spec reviewed |
| G-3 | `npx tsc --noEmit` clean |
| G-4 | Branch: `pr/phase2a-field-pr1` from `main` |
| G-5 | Link grep baseline saved (optional) |

### 5.2 Implementation phases (commits)

| Phase | Name | Goal | Exit criterion |
|-------|------|------|----------------|
| **0** | Preflight | Branch, baseline grep | Branch pushed |
| **1** | Field scaffold | Create `app/field/` tree + `layout.tsx` + `/field` redirect | Routes resolve; empty or placeholder OK |
| **2** | Field nav module | `lib/field-nav/` + explorer tab contract | Tabs link between explorer routes |
| **3** | Record Explorer move | Move `app/registry/page.tsx` → `app/field/explorer/records/page.tsx`; hub re-exports; registry stub | `/field/explorer/records` works; `/registry` 301 |
| **4** | Profile moves | Move artist, institutional-studio, collector-studio `[slug]` pages atomically with stubs | Canonical profile URLs work; legacy 301 |
| **5** | Explorer indexes | Implement creatives + organisations index pages | AC-XC*, AC-XO* ready for QA |
| **6** | Header + chrome | `isFieldSurface`; remove catalogue shell from moved routes; verify no sidebar on Field | ADR-28-C satisfied on Field routes |
| **7** | Config redirects | Update `next.config.ts` F-05 gallery chain | One-hop to Field org URL |
| **8** | Internal links | Grep pass — marketing, header, studio heroes, account | No stale `/registry` as primary internal target |
| **9** | Verify route | Move or stub `/field/verify/[registry_id]` | AC-FV2 path exists |
| **10** | Validation | Redirect smoke, tsc, lint, manual explorer/profile QA | §6 acceptance gate |

**Commit discipline:** One phase = one commit (or split Phase 4 per profile family: creative, org, collector).

### 5.3 PR2 handoff (explicit boundary)

| Item | Owner |
|------|-------|
| `/field/record/[registry_id]` move from `registry/[id]` + `artwork/[id]` | PR2 |
| `app/registry/layout.tsx` deletion | PR2 |
| Full internal link migration to `/field/record/*` | PR2 grep |
| Redirect smoke archive | PR2 validation |

### 5.4 Deployment

| Step | Action |
|------|--------|
| D-1 | Merge to `main` after review |
| D-2 | Deploy Vercel production |
| D-3 | Smoke: legacy URLs 301, canonical 200 |
| D-4 | Monitor 404 rate on `/registry`, `/artist/*` for 48h |

---

## 6. Acceptance criteria

Mapped to [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md). **PR1 satisfies subset**; full 2A requires PR2+.

### 6.1 PR1 must pass

| ID | Criterion | PR1 |
|----|-----------|-----|
| AC-FC1 | Creative profile at `/field/creative/[slug]` when presence on | Yes |
| AC-FC2 | `/artist/[slug]` 301 | Yes |
| AC-FC5 | No Studio sidebar on Field profile | Yes |
| AC-FO1 | Organisation profile at `/field/organisation/[slug]` | Yes |
| AC-FO2 | Legacy org/gallery public 301 | Yes |
| AC-FO3 | Verified badge shown | Yes |
| AC-FK1 | Collector profile at `/field/collector/[slug]` | Yes |
| AC-FK2 | `/collector-studio/[slug]` 301 | Yes |
| AC-FK3 | No commissioning/marketplace UI | Yes |
| AC-XC1 | Browse public Creatives | Yes |
| AC-XC2 | Links to Field creative profiles | Yes |
| AC-XC3 | No recommendation feed | Yes |
| AC-XO1 | Browse public Organisations | Yes |
| AC-XO2 | Links to Field org profiles | Yes |
| AC-XO3 | Verified filter on org explorer | Yes |
| AC-FP1 | Anonymous discover → profile journey | Yes |
| AC-FP2 | Signed-in Field without Studio sidebar | Yes |
| AC-FM1 | §9.2 redirects for profiles + registry list | Partial — record detail PR2 |
| AC-FS1 | Record explorer verification filter | Yes |
| AC-FS2 | Explorers paginate | Yes |
| AC-FS3 | No recommendation UI | Yes |

### 6.2 PR2 required for full 2A spec

| ID | Criterion |
|----|-----------|
| AC-FC3, AC-FC4 | Participation layers; works link to Field Record |
| AC-FO4, AC-FK4 | Work links; custody CTAs |
| AC-FV1–AC-FV4 | Record trust hierarchy on Field Record |
| AC-FL1–AC-FL4 | Full profile ↔ record graph |
| AC-FM1 (complete) | All record redirects |
| AC-FM3 | RP smoke no regression |

### 6.3 PR1 validation checklist (operator)

- [ ] `/field` → `/field/explorer` → records list
- [ ] `/field/explorer/creatives` and `/organisations` paginate
- [ ] Sample public creative, org, collector profiles load on Field URLs
- [ ] Legacy profile URLs 301
- [ ] `/registry` 301 to Field explorer
- [ ] Signed-in user on Field: no workspace sidebar
- [ ] Header Studio link works for authenticated role
- [ ] `npm run validate:phase1-static` still passes (redirect rules extended manually if needed)
- [ ] No brief/apply/messaging placeholders in nav

### 6.4 Suggested checkpoint tag (post full 2A, not PR1 alone)

`checkpoint-phase2a-field-foundations` — after PR1 **and** PR2 acceptance.

---

## 7. Risks and mitigations (PR1)

| Risk | Mitigation |
|------|------------|
| Breaking shared registry list component | Move file only; shared imports unchanged |
| Gallery redirect chain double-hop | Update `next.config.ts` to single hop to Field |
| Header mis-classifies Field as Studio shell | Explicit `isFieldSurface`; test signed-in |
| Creative explorer empty on small DB | Accept; index only presence-enabled |
| Partial link grep leaves stale `/registry` | Phase 8 mandatory; baseline diff |
| PR1 scope creep into record move | §1.2 scaffold only; PR2 boundary §5.3 |

---

## 8. Related documents

| Document | Role |
|----------|------|
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Full 2A acceptance criteria |
| [phase-2a-founder-decisions-freeze.md](./phase-2a-founder-decisions-freeze.md) | Frozen philosophy |
| [phase-1-pr4-execution-package.md](./phase-1-pr4-execution-package.md) | Move-then-redirect pattern reference |
| [phase-1-route-migration-matrix.md](./phase-1-route-migration-matrix.md) | Prior redirect discipline |

---

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 31 May 2026 | IMPLEMENTATION SOURCE OF TRUTH | Initial PR1 plan |
