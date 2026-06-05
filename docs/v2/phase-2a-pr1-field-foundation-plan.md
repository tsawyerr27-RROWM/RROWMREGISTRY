# Phase 2A PR1 — Field Surface Foundation Plan

**Document status:** IMPLEMENTATION SOURCE OF TRUTH  
**Effective:** 31 May 2026  
**Authority:** [Phase 2A Field Foundations Spec](./phase-2a-field-foundations-spec.md) (LOCKED DRAFT), [Phase 2A Founder Decisions Freeze](./phase-2a-founder-decisions-freeze.md) (FROZEN), [Phase 2 Blueprint — The Field](./phase-2-the-field-blueprint.md) (DRAFT), [Phase 2 Architecture Decisions](./phase-2-architecture-decisions.md) (DRAFT)  
**Predecessor:** Phase 1 Studio Foundation — production-certified @ `checkpoint-phase1-production`

**Golden rule (Phase 1 PR4 discipline):** **Move, then redirect.** Legacy App Router routes become `permanentRedirect` stubs in the **same commit** as the canonical Field move.

**Constraints for this document:** No database schema. No migrations. No code. No visual UI design.

---

## SECTION 1 — Objective

### 1.1 Ecosystem transition

| Surface | Role today | After PR1 |
|---------|------------|-----------|
| **Registry** | System of record; public list at `/registry` | **Unchanged ledger semantics**; public list **migrates host** to Field Record Explorer |
| **Studio** | Authenticated identity, stewardship, account | **Unchanged** canonical `/studio/*` (Phase 1) |
| **The Field** | Terminology label only | **Third public surface** — discovery, presence, verify entry |

**Target ecosystem:**

```
Registry (truth)  ←── reads ──  The Field (public discovery & presence)
       ↑                              │
       └── RPC/API ── Studio (edit & stewardship)
```

### 1.2 PR1 deliverable

Establish **The Field** as the **public discovery and presence layer**:

- Canonical **`/field/*`** App Router namespace with Field layout (no Studio workspace sidebar).
- **Creative Presence** and **Creative Explorer** shipped **first** (priority order).
- Organisation and Collector presence, Organisation and Record explorers, verify surfaces follow in PR1 sequence after Creative path is validated.
- Legacy public URLs **301** to Field canonical paths.
- **Read-only** projection of existing participant and registry data — Studio remains edit source.

### 1.3 PR1 north star (from 2A spec)

> A user can discover a Creative, understand their practice, trust their credentials, and navigate toward Registry records.

Record detail canonical URL (`/field/record/[registry_id]`) may remain on legacy paths until **PR2**; PR1 must not block navigation via legacy `/registry/[id]` links from profiles.

### 1.4 Explicit PR1 non-goals

No opportunities, briefs, programmes, commissions, messaging, payments, recommendations, production workflows, marketplace, practice-type taxonomy editor, full-text search engine, or API namespace migration.

---

## SECTION 2 — Route architecture

### 2.1 App Router target tree

```
app/field/
├── layout.tsx                      # Field chrome contract
├── page.tsx                        # → /field/explorer
├── explorer/
│   ├── page.tsx                    # Hub (Record default) — may defer if creatives-first
│   ├── creatives/page.tsx          # PRIORITY
│   ├── organisations/page.tsx
│   └── records/page.tsx
├── creative/[slug]/page.tsx        # PRIORITY (move from app/artist/[artist_id])
├── organisation/[slug]/page.tsx      # move from app/institutional-studio/[slug]
├── collector/[slug]/page.tsx       # move from app/collector-studio/[slug]
├── verify/
│   ├── page.tsx                    # Verify entry hub
│   └── [registry_id]/page.tsx      # move from app/verify/[registry_id]
└── record/[registry_id]/page.tsx   # PR2 scaffold optional in PR1
```

### 2.2 Route catalogue

#### `/field`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Surface entry point; orients user to The Field |
| **Audience** | Anonymous and authenticated |
| **Content source** | None — redirect only |
| **Authentication** | None required |
| **Implementation** | `permanentRedirect('/field/explorer')` or `/field/explorer/creatives` during creatives-first rollout window (see §7) |

---

#### `/field/explorer`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Explorer hub; default tab hosts primary explorer view |
| **Audience** | Anonymous and authenticated |
| **Content source** | Delegates to default explorer (Record list post-full rollout; see §7 priority) |
| **Authentication** | None required |
| **Implementation** | Render hub with sub-nav (§6); default child route content inline or redirect to `/field/explorer/records` |

---

#### `/field/explorer/creatives`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Creative Explorer** — browse public Creative profiles |
| **Audience** | Anonymous and authenticated |
| **Content source** | Query `artists` where `public_presence.profile` true; paginated index |
| **Authentication** | None required |
| **Legacy** | **New route** (no legacy list URL) |
| **Priority** | **P0 — ship before Organisation/Record explorers in PR1 sequence** |

---

#### `/field/explorer/organisations`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Organisation Explorer** — browse public Organisation profiles |
| **Audience** | Anonymous and authenticated |
| **Content source** | Query `galleries` where `public_presence.profile` true; paginated index |
| **Authentication** | None required |
| **Legacy** | **New route** |

---

#### `/field/explorer/records`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Record Explorer** — browse Registry records (works) |
| **Audience** | Anonymous and authenticated |
| **Content source** | Existing verified artwork list pipeline (`fetchVerifiedArtworkList`, `artwork_read_model`) — same as `app/registry/page.tsx` |
| **Authentication** | None required |
| **Legacy** | Move from `app/registry/page.tsx`; stub `/registry` → here |
| **Layout** | **Must not** use `SignedInCatalogueShellLayout` on Field route |

---

#### `/field/creative/[slug]`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Creative Presence** — public practice and registry footprint |
| **Audience** | Anonymous; owner may view when profile disabled (Studio only for edit — Field 404 for anonymous) |
| **Content source** | `artists` row by slug; `fetchArtistArtworkList`; representation RPCs; existing artist page components |
| **Authentication** | None required for public profile; owner session does not change public URL |
| **Legacy** | Move from `app/artist/[artist_id]/page.tsx`; stub 301 |
| **Param** | `[slug]` replaces misnamed `[artist_id]` |
| **Priority** | **P0 — first presence surface** |

---

#### `/field/organisation/[slug]`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Organisation Presence** — public org, roster, catalogue |
| **Audience** | Anonymous and authenticated |
| **Content source** | `galleries` by slug; roster `artists`; catalogue via `artwork_read_model`; `GalleryPublic*` components |
| **Authentication** | None required |
| **Legacy** | Move from `app/institutional-studio/[slug]/page.tsx`; update `next.config` `/gallery/:slug` chain to Field URL |

---

#### `/field/collector/[slug]`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Collector Presence (limited)** — public collection/custody narrative |
| **Audience** | Anonymous and authenticated |
| **Content source** | `collector_profiles`; owned artwork ids; certificate status map; existing collector public components |
| **Authentication** | None required |
| **Legacy** | Move from `app/collector-studio/[slug]/page.tsx` only (**not** exact `/collector-studio` dashboard) |
| **Scope limit** | No patron, marketplace, or commissioning UI |

---

#### `/field/verify`

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Verify **entry** — orient user to certificate/status checking |
| **Audience** | Anonymous and authenticated |
| **Content source** | Static copy + link to Record Explorer; optional registry ID input that navigates to `/field/verify/[registry_id]` |
| **Authentication** | None required |
| **Implementation** | Does not perform verification by itself — routes to per-record verify |

---

#### `/field/verify/[registry_id]` (companion — spec-required)

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Public certificate / verification status for one record |
| **Audience** | Anonymous and authenticated |
| **Content source** | Existing `app/verify/[registry_id]/page.tsx` logic |
| **Authentication** | Public status yes; **full certificate document** authenticated only (ADR-32-A, founder freeze §3) |
| **Legacy** | Move + stub `/verify/[registry_id]` |

---

#### `/field/record/[registry_id]` (PR2 — scaffold note)

| Attribute | Definition |
|-----------|------------|
| **Purpose** | **Field Record** — single work trust page |
| **PR1** | Optional empty scaffold or legacy redirect; **full move in PR2** |
| **Reason** | PR1 prioritises Creative path; record move is high-risk, high-traffic |

### 2.3 Legacy redirect matrix (301)

| Legacy | Canonical | When |
|--------|-----------|------|
| `/artist/:slug` | `/field/creative/:slug` | Same commit as creative move |
| `/institutional-studio/:slug` | `/field/organisation/:slug` | Same commit as org move |
| `/gallery/:slug` | `/field/organisation/:slug` | `next.config.ts` update |
| `/collector-studio/:slug` | `/field/collector/:slug` | Same commit as collector move |
| `/registry` | `/field/explorer/records` | Same commit as record explorer move |
| `/verify/:id` | `/field/verify/:id` | Same commit as verify move |
| `/registry/:id`, `/artwork/:id` | `/field/record/:id` | **PR2** |

**Retention:** Permanent 301 preferred (founder freeze §7, ADR-29).

### 2.4 Routes explicitly unchanged

| Path | Reason |
|------|--------|
| `/studio/*` | Studio namespace |
| `/collector-studio` (exact) | Dashboard → `/studio/collector` |
| `/collector-studio/artwork/*`, claim, provenance | Transitional flows |
| `/login`, `/signup`, `/onboarding`, `/api/*` | Auth and API |

---

## SECTION 3 — Presence architecture

**Principle (founder freeze §1):** Studio edits; Field reads. Visibility gated by **`public_presence`** JSON flags on participant rows.

### 3.1 Creative Presence

| Dimension | Specification |
|-----------|---------------|
| **Canonical URL** | `/field/creative/[slug]` |
| **Required content** | Display name; bio when set; paginated works list from registry read model; link each work to record URL (legacy `/registry/[id]` OK in PR1) |
| **Optional content** | Website, Instagram; participation layers strip when RPC returns data; representing Organisation name/link when org profile public |
| **Visibility rules** | Anonymous: 404 if `public_presence.profile` false. Owner: edit in Studio account only — Field URL stays 404 for anonymous. Works list respects existing artwork visibility on read model. |
| **Relationship to Registry** | Read-only footprint; representation/participation from Registry RPCs; verification status per work; factual verified-work count allowed, not a score |
| **Relationship to Studio** | All mutable fields (`bio`, links, presence toggles) edited in `/studio/account`; Studio “view public page” link targets Field URL; Creative dashboard unchanged |

**Move source:** `app/artist/[artist_id]/page.tsx` → preserve `fetchArtistArtworkList`, `parseListParams`, `ParticipationLayersStrip`, filter form behaviour.

---

### 3.2 Organisation Presence

| Dimension | Specification |
|-----------|---------------|
| **Canonical URL** | `/field/organisation/[slug]` |
| **Required content** | Organisation name; verified badge when `galleries.verified`; stats (artist count, work count, verified work count) |
| **Optional content** | Location, description, website — each gated by existing `public_presence` sub-flags (`location`, `description`, etc.); roster section when `presence.ownership`; catalogue grid |
| **Visibility rules** | 404 when `public_presence.profile` false for anonymous; sub-sections respect granular flags (same as current gallery public page) |
| **Relationship to Registry** | Catalogue reads `artwork_read_model`; roster links to Creative Presence when creative public; verified works emphasised in counts |
| **Relationship to Studio** | Org edits in `/studio/organisation` and `/studio/account`; no Field-side editing |

**Move source:** `app/institutional-studio/[slug]/page.tsx` + `GalleryPublicHero`, `GalleryPublicSections`.

---

### 3.3 Collector Presence (limited)

| Dimension | Specification |
|-----------|---------------|
| **Canonical URL** | `/field/collector/[slug]` |
| **Required content** | Collection display name; public works grid when works exist |
| **Optional content** | Bio, location — suppressed when `anonymous_on_public` / anonymity settings apply |
| **Visibility rules** | `public_presence.profile` + collector public flags; anonymity hides identifying narrative per existing logic |
| **Relationship to Registry** | Owned works via ownership resolution; certificate public status on cards; custody/ownership badges — **not** org-style verification |
| **Relationship to Studio** | Edit in `/studio/account`; collector dashboard at `/studio/collector` unchanged |

**Explicit absence:** Patron briefs, marketplace, commissioning, production reputation (anti-features §9).

**Move source:** `app/collector-studio/[slug]/page.tsx`.

---

## SECTION 4 — Explorer architecture

**Principle (founder freeze §2, §8):** Three explorers, no recommendation engine, no popularity ranking.

### 4.1 Creative Explorer

| Dimension | Specification |
|-----------|---------------|
| **Route** | `/field/explorer/creatives` |
| **Index unit** | One row/card per public Creative (`public_presence.profile`) |
| **Card minimum fields** | Display name; slug link; optional bio excerpt (truncated); optional verified work count |
| **Filtering** | Optional case-insensitive name substring match (query param `q`) — **no discipline filter in PR1** |
| **Sorting** | Default: alphabetical by `display_name` ascending; optional: `sort=recent` if `updated_at` or proxy available — **never** popularity |
| **Pagination** | Required; page size consistent with registry list norms (reuse `REGISTRY_PAGE_SIZE` or dedicated `FIELD_PROFILE_PAGE_SIZE` constant in implementation) |
| **Empty state** | Copy: no public Creatives yet; link to `/get-started` or marketing — **no** “recommended Creatives” |
| **Visibility** | Only profiles with `public_presence.profile` true |

---

### 4.2 Organisation Explorer

| Dimension | Specification |
|-----------|---------------|
| **Route** | `/field/explorer/organisations` |
| **Index unit** | One row/card per public Organisation |
| **Card minimum fields** | Name; location if public; verified badge; roster/work counts |
| **Filtering** | `verified=1` toggle (optional filter — **default shows all public orgs** per AC-XO3); optional location text match |
| **Sorting** | Alphabetical by name default |
| **Pagination** | Required |
| **Empty state** | No public Organisations; neutral copy |
| **Visibility** | `public_presence.profile` true on gallery row |

---

### 4.3 Record Explorer

| Dimension | Specification |
|-----------|---------------|
| **Route** | `/field/explorer/records` (alias of hub default) |
| **Index unit** | Registry record (artwork read model row) |
| **Filtering** | **Preserve** existing registry filters: verification status (`status`), text query `q` on title/registry_id, sort param |
| **Sorting** | **Preserve** existing registry sort options |
| **Pagination** | **Preserve** `redirectIfPageOutOfRange` behaviour with base path `/field/explorer/records` |
| **Empty state** | **Preserve** existing registry empty/filter-empty messaging |
| **Visibility** | Same visibility rules as current `/registry` — verified emphasis unchanged |
| **Layout** | Field layout — **remove** `SignedInCatalogueShellLayout` from this route |

**Move source:** `app/registry/page.tsx` + registry list components (`RegistryExplorerHero`, filters, pagination).

---

### 4.4 Cross-explorer rules

| Rule | Detail |
|------|--------|
| No recommendations | No “suggested”, “for you”, or similarity rows |
| No paid rank | Subscription tier does not sort order |
| Hub navigation | Tabs: Records \| Creatives \| Organisations (§6) |
| Graph links | Creative/Org explorer → Presence → works → record URL |

---

## SECTION 5 — Verification layer

### 5.1 Terminology (ADR-31-A, founder freeze §3)

| Term | Meaning on Field |
|------|------------------|
| **Field verification UX** | Public-facing **presentation** of trust at `/field/verify` and on record/profile surfaces |
| **Registry verification** | **Authoritative** verification state on ledger/read model (`verification_status`, events) |
| **Certificate verification** | Public cert status via existing RPC/batch helpers; verify page per `registry_id` |

Field does **not** define a separate verification authority — it **displays** Registry truth.

### 5.2 Trust hierarchy (display order — ADR-13, founder freeze §3)

1. Record verification status  
2. Certificate public status  
3. Provenance / continuity summary (on record — PR2 full page)  
4. Participation chronology (confirmed events only)  
5. Organisation verified badge  

**Forbidden in PR1 UI:** stars, likes, followers, NFT badges, pay-to-boost, Field production badges.

### 5.3 `/field/verify` (entry)

| Behaviour | Specification |
|-----------|---------------|
| Purpose | Explain how to check a Registry record; entry to per-record verify |
| Content | Static instructional copy; link to Record Explorer; optional input: user enters `registry_id` → navigate to `/field/verify/[registry_id]` |
| Auth | None |

### 5.4 `/field/verify/[registry_id]` (per-record)

| Behaviour | Specification |
|-----------|---------------|
| Purpose | Show **public** verification/certificate status for one record |
| Content source | Move existing verify page server logic unchanged |
| Link to record | Prefer `/field/record/[id]` when PR2 live; else legacy `/registry/[id]` in PR1 |
| Full certificate | Redirect or gate to authenticated `/certificate/[id]` — not public on Field |

### 5.5 Profile-level verification signals

| Surface | Signals |
|---------|---------|
| Creative Presence | Per-work verification in list; optional aggregate verified count |
| Organisation Presence | `verified` badge; verified works count in catalogue |
| Collector Presence | Ownership/custody status on works — not org verification |

---

## SECTION 6 — Navigation

**No UI design** — behavioural and structural requirements only.

### 6.1 Ecosystem navigation (three surfaces)

| From | To Studio | To Field | To Registry truth |
|------|-----------|----------|-------------------|
| Marketing header | `/studio/*` via role home when signed in | `/field/explorer` | N/A — Registry is accessed via Field record surfaces |
| Signed-out header | `/login` | `/field/explorer` | — |
| Copy | “Studio” label | “The Field” label | “Registry record” / “Registry ID” on trust copy |

**Header changes (implementation):**

- Add `isFieldSurface`: `pathname.startsWith('/field')`.
- **Exclude** `/field/*` from `isAppShell` (no Studio sidebar treatment).
- Extend or replace `isRegistrySurface` so legacy `/registry` redirects do not require duplicate chrome logic long-term.

### 6.2 Field navigation (within `/field/*`)

| Element | Specification |
|---------|---------------|
| **Field layout** | `app/field/layout.tsx` — wraps children with site Header + Footer; **no** `WorkspaceShell`, **no** `SignedInCatalogueShellLayout` |
| **Explorer sub-nav** | Three links: Records, Creatives, Organisations — active state from pathname |
| **Breadcrumbs** | Conceptual: The Field → {Explorer tab} → {entity name} on profiles — implement when QA requires |
| **Module** | `lib/field-nav/` — tab config, href builders, `isFieldPath()` |

### 6.3 Relationship to Studio

| Rule | Detail |
|------|--------|
| Edit | Always deep-link to `/studio/account` or role dashboard |
| Auth CTAs | Sign in → `/login?next=` current Field path |
| Signed-in on Field | Header account/Studio entry only — **no** role sidebar |
| Personal archive save | CTA may appear on record (PR2) — mutation via existing Studio/API |

### 6.4 Relationship to Registry

| Rule | Detail |
|------|--------|
| Reads | Field pages use existing read models and RPCs |
| Writes | Never from Field routes — register, verify, claim via Studio or existing flow URLs |
| URLs | Internal links progressively adopt `/field/record/[id]` (PR2 grep) |
| Terminology | Field is surface; Registry is trust system on record copy |

### 6.5 Internal link migration (grep pass — PR1 exit)

Update primary navigation targets:

- Landing/marketing `/registry` → `/field/explorer/records`
- Studio heroes `/registry` → Field explorer
- Account “browse registry” → Field explorer
- Organisation dashboard artist links → `/field/creative/[slug]`
- Pagination `basePath` props on moved list pages

**Baseline command:**

```bash
rg '"/registry"|`/registry|/artist/|/institutional-studio/|/collector-studio/[a-z]' --glob '*.{ts,tsx}'
```

---

## SECTION 7 — Rollout sequence

**Priority mandate:** **`/field` → Creative Presence → Creative Explorer`** before Organisation Presence, Collector Presence, Record Explorer, and verify moves.

### 7.1 Implementation order

| Step | Deliverable | Exit criterion |
|------|-------------|----------------|
| **1** | **Preflight** — branch `pr/phase2a-field-pr1`, tsc clean, link grep baseline | Branch pushed |
| **2** | **Field scaffold** — `app/field/layout.tsx`, `/field` → redirect, empty `lib/field-nav/` | `/field` resolves; layout renders Header without sidebar |
| **3** | **Creative Presence move** — move artist page → `/field/creative/[slug]`; stub `/artist/*` | AC-FC1, AC-FC2; anonymous 404 when presence off |
| **4** | **Creative Explorer** — `/field/explorer/creatives` index + pagination | AC-XC1, AC-XC2; **first explorer live** |
| **5** | **Field explorer hub** — `/field/explorer` with sub-nav; default tab **Creatives** during early rollout OR parallel Records default per founder freeze — **implementation default: hub with Creatives linked first in nav until step 8** | Hub navigates between tabs |
| **6** | **Organisation Presence move** — institutional-studio → `/field/organisation/[slug]`; gallery config redirect | AC-FO1, AC-FO2 |
| **7** | **Organisation Explorer** — `/field/explorer/organisations` | AC-XO1–XO3 |
| **8** | **Record Explorer move** — registry list → `/field/explorer/records`; remove registry layout shell; stub `/registry` | AC-FS1, AC-FS2; hub default may switch to Records |
| **9** | **Collector Presence move** — `[slug]` only | AC-FK1, AC-FK2 |
| **10** | **Verify move** — `/field/verify` hub + `/field/verify/[registry_id]`; stub legacy | AC-FV2 path exists |
| **11** | **Header + link grep** — `isFieldSurface`, marketing/studio/account links | AC-FP2; no stale primary `/registry` links |
| **12** | **Validation** — redirect smoke, manual QA, tsc, lint | §8 acceptance gate |

**Commit discipline:** One step or logical group per commit; **move + stub atomically** per route family.

### 7.2 Parallel work forbidden

- Do not move Record Explorer before Creative Presence + Creative Explorer validated (steps 3–4 complete).
- Do not add brief/open-call nav items.
- Do not introduce `SignedInCatalogueShellLayout` on any `/field/*` route.

### 7.3 PR2 handoff (out of PR1 scope)

- `/field/record/[registry_id]` full move from `/registry/[id]` and `/artwork/[id]`
- Full AC-FL*, AC-FV1, AC-FV3 on Field Record page
- Complete internal link grep to `/field/record/*`
- Redirect smoke archive for all §2.3 rows

---

## SECTION 8 — Acceptance criteria

Measurable completion for **PR1 merge**. Mapped to [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md).

### 8.1 Routing

| ID | Criterion | Measure |
|----|-----------|---------|
| R-1 | `/field` returns 301/308 to explorer | HTTP check |
| R-2 | `/field/creative/[slug]` 200 for public profile | curl/browser |
| R-3 | `/artist/[slug]` 301 to `/field/creative/[slug]` | HTTP check |
| R-4 | `/field/explorer/creatives` 200 | HTTP check |
| R-5 | `/field/explorer/organisations` 200 | HTTP check |
| R-6 | `/field/explorer/records` 200; `/registry` 301 | HTTP check |
| R-7 | Organisation and collector profile canonical + legacy 301 | HTTP check |
| R-8 | `/field/verify/[registry_id]` 200 for sample id | HTTP check |

### 8.2 Presence rendering

| ID | Criterion | Measure |
|----|-----------|---------|
| P-1 | Creative name, bio, works list render on Field URL | Manual QA |
| P-2 | Participation layers when data exists | Manual QA |
| P-3 | Organisation verified badge when `verified=true` | Manual QA |
| P-4 | Collector anonymity respected | Manual QA |
| P-5 | Disabled profile → 404 anonymous | Manual QA |
| P-6 | No Studio sidebar on any Field presence page | Visual/ DOM QA |

### 8.3 Explorer functionality

| ID | Criterion | Measure |
|----|-----------|---------|
| E-1 | Creative explorer lists only presence-enabled profiles | Data QA |
| E-2 | Creative explorer paginates | Query param `page=2` |
| E-3 | Org explorer verified filter toggles result set | Query param |
| E-4 | Record explorer preserves verification filter | Same as legacy registry |
| E-5 | No recommendation/similarity UI | Code review + QA |

### 8.4 Verification surface

| ID | Criterion | Measure |
|----|-----------|---------|
| V-1 | `/field/verify` entry reachable | HTTP 200 |
| V-2 | Per-record verify shows public status | Sample `registry_id` |
| V-3 | Trust copy includes “Registry record/ID” where applicable | Copy review |
| V-4 | No excluded reputation signals (§5.2) | QA checklist |

### 8.5 Navigation integrity

| ID | Criterion | Measure |
|----|-----------|---------|
| N-1 | Explorer hub tabs switch routes | Click QA |
| N-2 | Creative explorer → profile → work link resolves | Click QA |
| N-3 | Header Studio link works signed-in | Session QA |
| N-4 | `npm run validate:phase1-static` passes or documented delta | CI script |
| N-5 | Grep: no primary internal links to bare `/registry` except stubs/legacy record until PR2 | rg diff vs baseline |

### 8.6 PR1 merge gate

**PR1 is complete when:** R-1–R-8, P-1–P-6, E-1–E-5, V-1–V-4, N-1–N-5 pass on staging; founder freeze anti-features absent; Phase 1 registry smoke (RP-10 list path) unchanged in behaviour.

---

## SECTION 9 — Explicit exclusions

### 9.1 Deferred to Phase 2B — Discovery enrichment

| Exclusion |
|-----------|
| Practice type / discipline tags on profiles |
| Discipline filters on Creative Explorer |
| Full-text search across bios and metadata |
| Geo/regional hub pages |
| Programme stub landing pages |
| i18n pass beyond minimum new `field.*` keys |

### 9.2 Deferred to Phase 2C — Opportunity

| Exclusion |
|-----------|
| Briefs, programmes, open calls |
| Applications and apply CTAs |
| Commissions and awards |
| `/field/open-calls`, `/field/programmes/[slug]` |
| Studio Creative/Org inbox |
| Org publishing permissions and subscription gates for briefs |
| Saved opportunities |

### 9.3 Deferred to Phase 2D — Production

| Exclusion |
|-----------|
| Projects, teams, milestones, deliverables |
| Film/crew brief templates |
| Field production credits on records |
| “Delivered via RROWM commission” badge |
| Party-visible `/field/commissions/[id]` |
| Deliverable → register bridge with commission link |

### 9.4 Deferred to Phase 2E — Patron / Commerce

| Exclusion |
|-----------|
| Patron-funded briefs |
| Collector commissioning |
| Marketplace listings UX (`market_listings`) |
| Payments, checkout, facilitation fees on Field |
| Field: Commerce lane decision (ADR-25) |

### 9.5 Deferred to PR2 within 2A (Field Record migration)

| Exclusion |
|-----------|
| `/field/record/[registry_id]` full move |
| `/registry/[id]` and `/artwork/[id]` 301 to Field Record |
| Removal of `app/registry/layout.tsx` catalogue shell |
| Full AC-FL* and AC-FV1 record-page criteria |
| Field Record trust band ordering on dedicated page |

### 9.6 Permanent anti-features (founder freeze §10 — never in PR1)

Applications; messaging/DMs; recommendation feeds; pay-to-rank discovery; pay-to-verify; social follower counts; NFT reputation; Field ledger writes; Studio workspace sidebar on Field; placeholder “coming soon” for excluded capabilities in primary nav.

---

## Appendix A — File move reference (implementation)

| Canonical | Move from | Stub legacy |
|-----------|-----------|-------------|
| `app/field/creative/[slug]/page.tsx` | `app/artist/[artist_id]/page.tsx` | `app/artist/[artist_id]/page.tsx` redirect |
| `app/field/organisation/[slug]/page.tsx` | `app/institutional-studio/[slug]/page.tsx` | institutional-studio redirect |
| `app/field/collector/[slug]/page.tsx` | `app/collector-studio/[slug]/page.tsx` | collector-studio `[slug]` redirect |
| `app/field/explorer/records/page.tsx` | `app/registry/page.tsx` | `app/registry/page.tsx` redirect |
| `app/field/verify/[registry_id]/page.tsx` | `app/verify/[registry_id]/page.tsx` | verify redirect |

## Appendix B — Related documents

| Document | Role |
|----------|------|
| [phase-2a-field-foundations-spec.md](./phase-2a-field-foundations-spec.md) | Full 2A AC-* |
| [phase-2a-founder-decisions-freeze.md](./phase-2a-founder-decisions-freeze.md) | Frozen philosophy |
| [phase-1-pr4-execution-package.md](./phase-1-pr4-execution-package.md) | Move-then-redirect pattern |
| [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) | This doc = IMPLEMENTATION SOURCE OF TRUTH for PR1 |

## Revision history

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 2.0 | 31 May 2026 | IMPLEMENTATION SOURCE OF TRUTH | Restructured §1–§9; creatives-first rollout; implementation detail |
