# RC1 Platform Consistency Audit

**Date:** 2026-07-04  
**Scope:** Full platform audit — routes, navigation, Studio visual parity, shared components, legacy surfaces, route health, mobile, production parity, known bug sweep.  
**Constraints:** No feature work, no redesign, no schema/API changes. Remediation limited to RC1-critical consistency fixes.

---

## Executive Summary

RROWM is **RC1-ready locally** with a coherent v2 design language on primary Studio overviews (Creative, Collector, Organisation, Deals) and Field surfaces. Batch 1 + Batch 2 remediation resolved all launch-blocking consistency issues in code. **One deploy remains** to bring production 404 and Batch 1 Studio fixes live.

**Resolved in Batch 1 + 2:**

- Studio error boundary, blank-page races, footer sign-in, activity loading copy, dead feed removal
- Institutional root 404 (`ArchiveNotFoundShell`)
- Canonical collector artwork links via `studioCollectorArtworkHref()`
- Organisation presentation alignment (gradients removed, v2 CTAs, field-nav links, metric typography)
- `public/rrowm-mobile.png` tracked and served on production

**Deferred (Sprint 7A+):**

- Creative subsections (Works, Ownership, Certificates) still use legacy `Dashboard/*` sections
- `StudioRightsWorkspace` legacy panels
- Activity feed unification, creative gallery toggle, rights/archive deep polish

**Production vs local:** Landing, About, Footer, Auth, Field, and mobile logo are **aligned on production**. Root **404 still bare HTML on production** until Batch 2 deploy. `/studio/deals/new` was never a 404 — auth redirect or blank-page bug (fixed Batch 1).

**Overall readiness:** **RC1-ready after deploy.** Primary flows work; remaining debt is concentrated in Creative subsections and Rights ledger — documented as Medium/Low, not launch-blocking.

---

## Phase 1 — Route Inventory

**Summary:** 70 routes. 19 redirect-only legacy aliases. No duplicate conflicting routes. No orphan unreachable `page.tsx` files found.

**Auth model:**

| Area | Requirement |
|------|-------------|
| `/studio/*` (except `/studio/account/restore`) | Session required — middleware + `StudioRouteGuard` |
| `/internal/*`, `/admin` | Admin session cookie |
| `/field/*`, `/`, `/about`, auth pages | Public (record pages may gate actions) |
| Legacy aliases | Redirect to canonical targets |

**Loading / error boundaries:**

| Segment | `loading.tsx` | `error.tsx` |
|---------|---------------|-------------|
| `/studio/*` | ✅ `app/studio/loading.tsx` | ❌ **Missing** |
| `/field/*` | ✅ `app/field/loading.tsx` | ✅ `app/field/error.tsx` |
| `/field/record/[id]` | ✅ nested | ✅ nested |
| `/registry/[id]/ledger` | ✅ nested | ✅ nested |
| Auth (`/login`, `/signup`, etc.) | ❌ | ❌ |
| Marketing (`/`, `/about`) | ❌ | ❌ |

### Public & Marketing

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/` | ✅ | ✅ | Public | Modern | v2 landing redesign |
| `/about` | ✅ | ✅ | Public | Modern | Cryptographic "why" section |
| `/contact` | ✅ | ✅ | Public | Legacy | Basic form surface |
| `/terms` | ✅ | ✅ | Public | Transitional | Legal prose |
| `/privacy` | ✅ | ✅ | Public | Transitional | Legal prose |
| `/disclaimer` | ✅ | ✅ | Public | Transitional | Legal prose |
| `/get-started` | ✅ | ✅ | Public | Transitional | Onboarding entry |

### Auth

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/login` | ✅ | ✅ | Public | Transitional | No loading/error boundary |
| `/signup` | ✅ | ✅ | Public | Transitional | |
| `/signup/complete` | ✅ | ✅ | Session | Transitional | |
| `/signup/complete-profile` | ✅ | ✅ | Session | Transitional | |
| `/reset-password` | ✅ | ✅ | Public | Transitional | |
| `/logout` | ✅ | ✅ | Session | OK | Action route |
| `/onboarding` | ✅ | ✅ | Session | Transitional | Post-signup role setup |
| `/verify/[registry_id]` | ✅ | ✅ | Public | OK | Redirects → `/field/verify/[id]` |

### Field

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/field` | ✅ | ✅ | Public | Modern | Root explorer hub |
| `/field/explorer` | ✅ | ✅ | Public | Modern | Redirects from `/field/explorer` smoke script expectation is **inverted** — app redirects `/field/explorer` → `/field` |
| `/field/explorer/records` | ✅ | ✅ | Public | Modern | |
| `/field/explorer/creatives` | ✅ | ✅ | Public | Modern | |
| `/field/explorer/organisations` | ✅ | ✅ | Public | Modern | |
| `/field/record/[registry_id]` | ✅ | ✅ | Public | Modern | Canonical record view |
| `/field/creative/[slug]` | ✅ | ✅ | Public | Modern | |
| `/field/collector/[slug]` | ✅ | ✅ | Public | Modern | |
| `/field/organisation/[slug]` | ✅ | ✅ | Public | Modern | |
| `/field/opportunities` | ✅ | ✅ | Public | Modern | |
| `/field/opportunities/[id]` | ✅ | ✅ | Public | Modern | |
| `/field/verify` | ✅ | ✅ | Public | Modern | |
| `/field/verify/[registry_id]` | ✅ | ✅ | Public | Modern | |
| `/field/programmes/[slug]` | ✅ | ✅ | Public | Transitional | |

### Registry (legacy aliases → Field)

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/registry` | ✅ | Redirect | Public | OK | → `/field/explorer/records` |
| `/registry/[registry_id]` | ✅ | Redirect | Public | OK | → `/field/record/[id]` |
| `/registry/[registry_id]/ledger` | ✅ | ✅ | Public | Transitional | Ledger view; has loading+error |
| `/artwork/[registry_id]` | ✅ | Redirect | Public | OK | → field record |
| `/certificate/[registry_id]` | ✅ | ✅ | Mixed | Transitional | May redirect to login for private certs |

### Studio (canonical)

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/studio` | ✅ | Redirect | Session | OK | → `/studio/creative` |
| `/studio/creative` | ✅ | ✅ | Session | Modern overview / Legacy subsections | Overview v2; Works/Ownership/Certificates legacy |
| `/studio/collector` | ✅ | ✅ | Session | Modern overview / Legacy links | `return null` if !userId after load |
| `/studio/organisation` | ✅ | ✅ | Session | Modern overview | `return null` if !userId after load |
| `/studio/deals` | ✅ | ✅ | Session | Modern | **Blank page bug** — `return null` when !userId \|\| !role |
| `/studio/deals/new` | ✅ | ✅ | Session | Transitional | **Not 404**; same blank-page bug |
| `/studio/rights` | ✅ | ✅ | Session | Legacy | `StudioRightsWorkspace` pre-v2 panels |
| `/studio/inbox` | ✅ | ✅ | Session | Transitional | Utility surface |
| `/studio/archive` | ✅ | ✅ | Session | Transitional | Personal archive |
| `/studio/account` | ✅ | ✅ | Session | Transitional | Account settings |
| `/studio/account/restore` | ✅ | ✅ | Token | Transitional | Skips StudioRouteGuard |

### Studio legacy aliases (redirect)

| Route | Exists | Target | Status |
|-------|--------|--------|--------|
| `/account` | ✅ | `/studio/account` | OK |
| `/account/restore` | ✅ | `/studio/account/restore` | OK |
| `/account/setup` | ✅ | onboarding path | OK |
| `/personal-archive` | ✅ | `/studio/archive` | OK |
| `/collector-studio` | ✅ | `/studio/collector` | OK |
| `/collector-studio/[slug]` | ✅ | field collector | OK |
| `/institutional-studio-dashboard` | ✅ | `/studio/organisation` | OK |
| `/institutional-studio/[slug]` | ✅ | field organisation | OK |
| `/artist/[artist_id]` | ✅ | field creative | OK |
| `/gallery/[slug]` | ✅ | field organisation | OK |

### Studio legacy routes (still live — not redirect-only)

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/collector-studio/artwork/[registry_id]` | ✅ | ✅ | Session | Transitional | Legacy URL; renders `StudioArtworkClient` |
| `/collector-studio/claim-ownership` | ✅ | ✅ | Session | Transitional | Claim flow |
| `/collector-studio/continue-provenance` | ✅ | ✅ | Session | Transitional | Provenance flow |

### Internal / Admin

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/admin` | ✅ | ✅ | Admin cookie | Legacy | Admin login gate |
| `/internal/analytics` | ✅ | ✅ | Admin | Transitional | |
| `/internal/verify` | ✅ | ✅ | Admin | Transitional | |
| `/internal/replay-debugger` | ✅ | ✅ | Admin | Dev tool | |

### Other

| Route | Exists | Renders | Auth | Status | Notes |
|-------|--------|---------|------|--------|-------|
| `/accept-steward-invite` | ✅ | ✅ | Mixed | Transitional | |
| `/authenticate-record` | ✅ | ✅ | Public | Transitional | |
| `/provenance/accept` | ✅ | ✅ | Mixed | Transitional | |
| `/disputes/[id]` | ✅ | ✅ | Session | Transitional | |
| `/artwork/.../provenance/*` | ✅ | Mixed | Mixed | Legacy | Provenance sub-routes |

### Flags

| Flag | Finding |
|------|---------|
| 404s | None on canonical routes. `/studio/deals/new` reported 404 is **auth redirect or blank page**, not missing route |
| Duplicate routes | Legacy aliases redirect; no conflicting handlers |
| Orphan pages | None — all `page.tsx` reachable via redirect or direct nav |
| Unreachable | `StudioActivityFeed.tsx` is dead component code, not a route |
| Stale redirects | `scripts/phase-1-staging-http-smoke.ts` expects `/field` → `/field/explorer`; app does opposite |

---

## Phase 2 — Navigation Audit

**Summary:** All primary navigation destinations resolve. Issues are **stale URL patterns** (still work via redirects or legacy pages) and **hardcoded role assumptions**, not broken 404 links.

### Header (`components/Header.tsx`)

| Source | Destination | OK | Issue | File |
|--------|-------------|----|-------|------|
| Logo | `/` | ✅ | — | `components/Header.tsx` |
| Nav items | `/studio/*`, `/field`, `/about` | ✅ | — | `components/Header.tsx` |
| Account | `/studio/account` | ✅ | — | `components/Header.tsx` |
| Sign in | `/login?next=…` | ✅ | Dynamic next from pathname | `components/Header.tsx` |

### Footer (`components/LandingPage/Footer.tsx`)

| Source | Destination | OK | Issue | File |
|--------|-------------|----|-------|------|
| Studio | `/studio/creative` | ✅ | Assumes creative as default Studio entry | `Footer.tsx` |
| Registry | `fieldExplorerRecordsHref()` | ✅ | — | `Footer.tsx` |
| Field | `/field` | ✅ | — | `Footer.tsx` |
| Deals | `/studio/deals` | ✅ | — | `Footer.tsx` |
| Ownership | `/studio/collector` | ✅ | — | `Footer.tsx` |
| Rights ledger | `/studio/rights` | ✅ | — | `Footer.tsx` |
| Sign in | `/login?next=/studio/creative` | ⚠️ | Hardcoded creative; should use neutral `/login` or current path | `Footer.tsx:156` |
| Account | `DashboardNavLink` → `/studio/account` | ✅ | — | `Footer.tsx` |

### Studio navigation (`lib/studio-nav/*`, `StudioShell`)

| Source | Destination | OK | Issue | File |
|--------|-------------|----|-------|------|
| Role home links | `/studio/creative`, `/studio/collector`, `/studio/organisation` | ✅ | — | `lib/studio-nav` |
| Utility nav | deals, rights, inbox, archive, account | ✅ | All routes exist | `studio-utility-nav.ts` |
| Deal create | `/studio/deals/new` | ✅ | Route exists; blank-page edge case | `lib/deal-create-nav.ts` |

### Stale / pre-v2 link patterns (still resolve)

| Source | Destination | OK | Issue | File |
|--------|-------------|----|-------|------|
| Collector activity preview | `/collector-studio/artwork/[id]` | ⚠️ | Legacy URL; should use canonical holding route | `CollectorStudioActivityPreview.tsx` |
| Collector studio holdings | `/collector-studio/artwork/[id]` | ⚠️ | Same | `app/studio/collector/page.tsx` |
| Studio artwork client | `/registry/[id]`, `/collector-studio/artwork/[id]` | ⚠️ | Pre-v2 patterns | `StudioArtworkClient.tsx` |
| Notifications | `/registry/[id]/ledger` | ⚠️ | Works; ledger is canonical | `lib/notifications.ts` |
| Provenance pages | `/artist/[slug]`, `/registry/[id]` | ⚠️ | Redirect to Field | `app/artwork/.../provenance/page.tsx` |
| Public registry view | `/collector-studio/[slug]` | ⚠️ | Redirects | `PublicRegistryRecordView.tsx` |
| Claim ownership | `/collector-studio/claim-ownership` | ⚠️ | Legacy path in login next | `ClaimOwnershipFlow.tsx` |

### Dead locale keys

| Key | Status |
|-----|--------|
| `footer.navigate` | Unused |
| `footer.access` | Unused |
| `footer.register` | Unused |

---

## Phase 3 — Studio Visual Parity Matrix

Classification: **Modern** = v2 hero + slabs + institutional typography; **Transitional** = mixed v2 shell + older inner sections; **Legacy** = pre-v2 cards, panels, gradients.

### Creative (`/studio/creative`)

| Section | Hero | Sections | Visual Status | Notes |
|---------|------|----------|---------------|-------|
| Overview | ✅ `ArtistWorkspaceHero` + `StudioRoleBand` | ✅ v2 slabs | **Modern** | Reference surface |
| Works | ✅ | ❌ `ArtworksSection` | **Legacy** | Legacy gallery cards, old filters |
| Ownership | ✅ | ❌ `OwnershipSection` | **Legacy** | Pre-v2 table/cards |
| Certificates | ✅ | ❌ `CertificatesSection` | **Legacy** | Pre-v2 list |
| Catalogue metrics | — | ✅ `StudioCatalogueMetricsPanels` | **Modern** | |
| Activity | — | Inline fetch | **Transitional** | Differs from collector/org feeds |

### Collector (`/studio/collector`)

| Section | Hero | Sections | Visual Status | Notes |
|---------|------|----------|---------------|-------|
| Overview | ✅ `CollectorWorkspaceHero` | ✅ v2 | **Modern** | |
| Holdings | ✅ | ✅ `CollectorHoldingSlab` + gallery | **Modern** | Has `StudioViewToggle` |
| Activity | — | ✅ `CollectorStudioActivityPreview` | **Modern** | Links use legacy URLs |
| Metrics | — | ✅ `StudioCatalogueMetricsPanels` | **Modern** | |

### Organisation (`/studio/organisation`)

| Section | Hero | Sections | Visual Status | Notes |
|---------|------|----------|---------------|-------|
| Overview | ✅ Gallery hero + role band | ✅ v2 slabs | **Modern** | |
| Verification | ✅ | ✅ `OrganisationVerificationSlab` | **Modern** | |
| Metrics | — | ⚠️ `StudioInsightTile` vs `StudioMetricTile` | **Transitional** | Inconsistent metric primitive |
| Activity | — | ✅ `WorkspaceSidebarActivityFeed` | **Transitional** | Collector loading copy default |

### Utility Studio routes

| Route | Hero | Sections | Visual Status | Notes |
|-------|------|----------|---------------|-------|
| `/studio/deals` | ✅ v2 workspace | ✅ `StudioDealsWorkspace` | **Modern** | |
| `/studio/deals/new` | ✅ | ✅ `DealEditorWorkspace` | **Transitional** | Filing form; less hero polish |
| `/studio/rights` | ⚠️ | ❌ `workspace.panel.shell` | **Legacy** | Highest-priority Studio legacy pocket |
| `/studio/inbox` | ⚠️ | Mixed | **Transitional** | |
| `/studio/archive` | ⚠️ | ❌ `PersonalArchivePageContent` | **Legacy** | |
| `/studio/account` | ⚠️ | Mixed account forms | **Transitional** | |
| `/studio/account/restore` | Minimal | Form only | **Transitional** | Intentionally minimal |

---

## Phase 4 — Shared Component Audit

### Adoption status

| Primitive | Creative | Collector | Organisation | Notes |
|-----------|----------|-----------|--------------|-------|
| `StudioShell` | ✅ | ✅ | ✅ | Consistent |
| `StudioRoleBand` | ✅ | ✅ | ✅ | |
| `StudioHeroSlab` / role heroes | ✅ | ✅ | ✅ | Role-specific hero components |
| `StudioContentSlab` | ✅ overview | ✅ | ✅ | |
| `StudioMetricTile` | ✅ | ✅ | ⚠️ org uses `StudioInsightTile` | Consolidate org metrics |
| `StudioViewToggle` | ❌ | ✅ | ❌ | Only collector holdings |
| `CollectorHoldingSlab` | — | ✅ | — | |
| `CreativeArtworkSlab` | ❌ | — | — | Not adopted; uses `ArtworksSection` |
| `OrganisationVerificationSlab` | — | — | ✅ | |
| `ArtworkTrustBadge` | Partial | Partial | Partial | Trust tier surfacing inconsistent |
| `WorkspaceShell` / footer links | ✅ | ✅ | ✅ | |

### Duplicate / legacy implementations

| Issue | Files | Minimal fix |
|-------|-------|-------------|
| Legacy dashboard sections | `ArtworksSection`, `OwnershipSection`, `CertificatesSection` | Adopt v2 slabs incrementally per section (post-RC1) |
| Three activity implementations | creative inline, `CollectorStudioActivityPreview`, `WorkspaceSidebarActivityFeed` | Unify on shared feed component |
| Dead activity feed | `StudioActivityFeed.tsx` | Delete (zero imports) |
| Rights workspace panels | `StudioRightsWorkspace.tsx` | Wrap in `StudioContentSlab` (post-RC1) |

---

## Phase 5 — Legacy Surface Inventory

| Component | File | Reason | Recommended Fix | Priority |
|-----------|------|--------|-----------------|----------|
| `ArtworksSection` | `components/Dashboard/ArtworksSection.tsx` | Pre-v2 cards, old section headers | Migrate to `CreativeArtworkSlab` pattern | High |
| `OwnershipSection` | `components/Dashboard/OwnershipSection.tsx` | Legacy table/cards | v2 filing sheet | High |
| `CertificatesSection` | `components/Dashboard/CertificatesSection.tsx` | Legacy list layout | v2 slab | High |
| `StudioRightsWorkspace` | `components/Studio/Rights/StudioRightsWorkspace.tsx` | `workspace.panel.shell`, old metrics | `StudioContentSlab` wrapper | High |
| `PersonalArchivePageContent` | `components/archive/PersonalArchivePageContent.tsx` | Old archive cards | v2 archive sheet | Medium |
| `StudioActivityFeed` | `components/Studio/StudioActivityFeed.tsx` | Dead code + legacy links | Delete | Medium |
| Root not-found | `app/not-found.tsx` | Unstyled bare HTML | `RouteErrorShell` or v2 404 | Medium |
| Gradient loading bars | Various collector/creative loaders | Decorative gradient dividers | Neutral v2 dividers | Low |
| Auth pages | `app/login/page.tsx`, etc. | Pre-v2 form chrome | v2 auth shell (Sprint 7A+) | Low |
| `contact` page | `app/contact/page.tsx` | Basic layout | v2 legal/contact shell | Low |

---

## Phase 6 — Route Health

| Route segment | loading.tsx | error.tsx | Empty state | Retry | Notes |
|---------------|-------------|-----------|-------------|-------|-------|
| `/studio/*` | ✅ | ❌ **Critical** | Per-page | Partial | Add `app/studio/error.tsx` |
| `/field/*` | ✅ | ✅ | Per-page | ✅ | Reference implementation |
| `/field/record/[id]` | ✅ | ✅ | ✅ | ✅ | |
| Auth routes | ❌ | ❌ | N/A | N/A | Acceptable for RC1 |
| Marketing | ❌ | ❌ | N/A | N/A | Acceptable for RC1 |
| Global 404 | — | — | ❌ | — | Bare `not-found.tsx` |

---

## Phase 7 — Mobile Audit

| Area | Status | Notes |
|------|--------|-------|
| Header logo | ✅ Fixed locally | `RrowmLogo` `header` variant uses `rrowm-mobile.png` below `md`; **must deploy asset** |
| Footer logo | ✅ | `mark` variant at 88px with `--on-dark` filter |
| Studio mobile switcher | ✅ | Role band + shell nav |
| Forms (auth, account) | ⚠️ | Touch targets OK; visual language pre-v2 |
| Creative/collector galleries | ⚠️ | Toggle only on collector; creative works grid differs |
| Field explorer | ✅ | Responsive grids |
| Deals workspace | ✅ | Scrollable command layout |
| Overflow | ⚠️ Minor | Long registry IDs in mono can overflow without truncate in some legacy sections |
| Touch targets | ✅ | v2 CTAs use `min-h-[44px]` in modern surfaces |

---

## Phase 8 — Production vs Local

| Surface | Production (2026-07-04) | Local | Cause |
|---------|-------------------------|-------|-------|
| `/studio/deals/new` | HTTP **307** → `/login?next=…` | Route exists | **Not 404** — unauthenticated redirect; blank page when authenticated is code bug |
| `/rrowm-mobile.png` | HTTP **200** | File present | Asset deployed; local changes to `RrowmLogo` need deploy for header variant |
| Landing / About | Prior deploy | Redesigned copy + sections | **Stale deployment** until next push |
| Footer | Prior deploy | Archive footer + logo mark variant | **Stale deployment** |
| Studio overviews | v2 (prior sprint) | Same + in-progress fixes | Aligned |
| `/field` vs `/field/explorer` | Redirect behavior matches local | `/field/explorer` → `/field` | Smoke script outdated, not production mismatch |

**Method:** `curl -sI` against `https://rrowm.io` for deals route and mobile asset; code comparison for UI changes in modified git files.

---

## Phase 9 — Known Bug Sweep

| Area | Finding | Severity | Root cause | Fix |
|------|---------|----------|------------|-----|
| `/studio/deals/new` 404 | **False alarm** | — | Auth redirect (307) or blank page | Fix null return |
| Blank deals page | Confirmed | **Critical** | `return null` when `!userId \|\| !role` | Show loading shell (match `rights/page.tsx`) |
| Collector panel on unrelated pages | **Not confirmed** | — | Collector components scoped to `/studio/collector` | No fix required |
| Old Studio sections | Confirmed | High | Creative subsections + Rights | Post-RC1 migration |
| Old footer/auth refs | Partial | Medium | Footer sign-in hardcodes creative | Neutral `next` |
| Pre-v2 cards | Confirmed | High | `Dashboard/*` sections | Incremental adoption |
| Role consistency | Partial | Medium | Org metric tile differs | Use `StudioMetricTile` |
| Works gallery toggle | Partial | Medium | Only collector has toggle | Align post-RC1 |
| Opportunities visual | OK | — | Field opportunities v2 | — |
| Landing/About consistency | OK locally | — | Deploy pending | Deploy |
| Mobile logo | Fixed locally | High | PNG + `RrowmLogo` variant | Commit + deploy |
| Activity monitor | Inconsistent | Medium | Three implementations + wrong loading copy | Role-neutral loading key |
| Stale Studio links | Confirmed | Medium | `/collector-studio/artwork/*` in collector page | Update hrefs |
| `StudioActivityFeed.tsx` | Dead code | Low | Never imported | Delete |

---

## Batch 1 Remediation (2026-07-04)

### Issues fixed

| Issue | Fix |
|-------|-----|
| Missing Studio error boundary | Added `app/studio/error.tsx` (`RouteErrorShell`, `surface="studio"`) |
| Blank-page race on Studio pages | Replaced `return null` with loading shells on deals, deals/new, collector, organisation |
| Collector-specific activity loading copy | `WorkspaceSidebarActivityFeed` → `studio.activity.loading` (EN/DE/FR/JA) |
| Footer sign-in hardcoded creative | Plain `/login` link |
| Dead `StudioActivityFeed.tsx` | Deleted |

### Files changed

- `app/studio/error.tsx` (new)
- `app/studio/deals/page.tsx`
- `app/studio/deals/new/page.tsx`
- `app/studio/collector/page.tsx`
- `app/studio/organisation/page.tsx`
- `components/Studio/WorkspaceSidebarActivityFeed.tsx`
- `components/LandingPage/Footer.tsx`
- `lib/locale-messages.ts` (`studio.activity.loading`)
- `components/Studio/StudioActivityFeed.tsx` (deleted)

### Verification

`npx tsc --noEmit` ✅ · `npm run build` ✅ · `npm test` ✅ (60/60)

---

## Batch 2 Remediation (2026-07-04)

### Issues fixed

| Priority | Issue | Fix |
|----------|-------|-----|
| P1 Critical | Bare root `not-found.tsx` | `ArchiveNotFoundShell` — filing-sheet surface, mono ARCHIVE rail, serif heading, v2 CTAs to Studio/Registry/Field/Home |
| P2 High | Inconsistent collector artwork links | `studioCollectorArtworkHref()` → `/studio/artwork/:id` (redirect preserves legacy handler); updated all Studio emitters |
| P2 High | Collector public profile links | `fieldCollectorHref()` replaces `/collector-studio/:slug` |
| P2 High | Registry record links in Studio | `fieldRecordHref()` replaces `/registry/:id` in org catalogue + artwork client |
| P2 High | Artist profile links in org roster | `fieldCreativeHref()` replaces `/artist/:slug` |
| P3 High | Organisation legacy presentation | Removed gradients from roster empty state, roster cards, catalogue thumbnails; v2 CTAs; aligned insight metric typography |
| P5 | Asset verification | `public/rrowm-mobile.png` tracked in git (160×160 PNG); `RrowmLogo` uses integer 88px mobile / 160 intrinsic; `.rrowm-logo-crisp` without backdrop blur |
| P4 | Production 404 gap | Root cause: production still serves pre-Batch-2 bare HTML; local fix ready for deploy |

### Files changed

- `app/not-found.tsx`
- `components/ui/ArchiveNotFoundShell.tsx` (new)
- `lib/locale-messages.ts` (`notFound.*` EN/DE/FR/JA)
- `lib/studio-nav/collector-nav.ts` — `studioCollectorArtworkHref()`
- `lib/studio-nav/index.ts`
- `app/studio/collector/page.tsx`
- `components/Studio/CollectorStudioActivityPreview.tsx`
- `components/Studio/StudioStatusBar.tsx`
- `components/Studio/StudioArtworkClient.tsx`
- `components/Registry/PublicRegistryRecordView.tsx`
- `app/studio/organisation/page.tsx`

### Collector link canonicalization

All Studio-facing artwork links now emit `/studio/artwork/:registry_id`. `next.config.ts` redirect (`/studio/artwork/:id` → `/collector-studio/artwork/:id`) preserves the legacy page handler and existing deep links. Flow routes (`/collector-studio/claim-ownership`, `/collector-studio/continue-provenance`) unchanged — dedicated handlers, not holding detail.

### Production parity audit (2026-07-04, `curl` against `https://rrowm.io`)

| Surface | Production | Local | Cause / status |
|---------|------------|-------|----------------|
| Landing | ✅ `archive-footer`, `rrowm-mobile`, OS section | Same | **Aligned** — prior deploy includes footer/logo/OS |
| About | ✅ SHA-256 / cryptographic section | Same | **Aligned** |
| Footer | ✅ Archive footer chrome | Same | **Aligned** |
| Auth (login) | ✅ `auth-page-shell` + narrative panel | Same | **Aligned** |
| Signup / reset-password | ✅ v2 auth shell (same component family) | Same | **Aligned** (auth shared via `AuthPageShell`) |
| Studio surfaces | ✅ v2 overviews (auth-gated) | Same + Batch 1 fixes | **Aligned** after Batch 1 deploy |
| Field / Registry | ✅ Field v2 explorer | Same | **Aligned** |
| Deals | ✅ Route exists (307 when unauthenticated) | Same + blank-page fix | **Aligned** after Batch 1 deploy |
| 404 | ❌ `<h1>Not found</h1>` bare HTML | ✅ `ArchiveNotFoundShell` | **Stale deployment** — Batch 2 not yet deployed |
| `rrowm-mobile.png` | ✅ HTTP 200, 3784 bytes | ✅ 160×160, git-tracked | **Aligned** |

### Verification

`npx tsc --noEmit` ✅ · `npm run build` ✅ · `npm test` ✅ (60/60)

---

## Final RC1 Status Summary

### Critical — Resolved / Remaining

| Item | Status |
|------|--------|
| Missing `app/studio/error.tsx` | ✅ **Resolved** (Batch 1) |
| Blank-page `return null` on Studio pages | ✅ **Resolved** (Batch 1) |
| Bare root 404 | ✅ **Resolved locally** (Batch 2) — **deploy pending** |
| `rrowm-mobile.png` in repo | ✅ **Resolved** — tracked, production serves 200 |

### High — Resolved / Remaining

| Item | Status |
|------|--------|
| Collector artwork link inconsistency | ✅ **Resolved** (Batch 2) |
| Footer sign-in hardcoded `next` | ✅ **Resolved** (Batch 1) |
| Activity feed loading copy | ✅ **Resolved** (Batch 1) |
| Dead `StudioActivityFeed.tsx` | ✅ **Resolved** (Batch 1) |
| Organisation gradient/card legacy pockets | ✅ **Resolved** (Batch 2 — roster, catalogue, metrics typography) |
| Stale `/registry/*` and `/artist/*` in org Studio | ✅ **Resolved** (Batch 2) |
| Creative Works/Ownership/Certificates legacy sections | ⏳ **Remaining** — defer to Sprint 7A+ |
| `StudioRightsWorkspace` legacy panels | ⏳ **Remaining** — defer |

### Medium — Deferred

| Item | Notes |
|------|-------|
| Creative subsection v2 slab migration | `ArtworksSection`, `OwnershipSection`, `CertificatesSection` |
| `StudioInsightTile` → `StudioMetricTile` for interactive chart tiles | Typography aligned; full primitive swap deferred |
| Activity feed unification (3 implementations) | Functional; cosmetic consistency |
| Field verify nested `not-found.tsx` | Still pre-v2 styling |
| `scripts/phase-1-staging-http-smoke.ts` `/field` redirect expectation | Test script stale, not app bug |
| `StudioViewToggle` on creative works | Collector-only today |
| Claim/provenance flow URLs (`/collector-studio/claim-ownership`, etc.) | Intentional dedicated routes |

### Low — Deferred

| Item | Notes |
|------|-------|
| `StudioStatusBar.tsx` | Unused component with `liquid-glass-tile` |
| Auth/contact page polish | Functional v2 auth; contact page basic |
| Creative gallery toggle parity | Sprint 7A+ |
| Personal archive legacy cards | `PersonalArchivePageContent` |
| Dead locale keys (`footer.navigate`, etc.) | Cleanup only |

---

## Critical Issues (must fix before beta)

1. ~~**Add `app/studio/error.tsx`**~~ ✅ Batch 1
2. ~~**Remove blank-page `return null`**~~ ✅ Batch 1
3. ~~**Commit `public/rrowm-mobile.png`**~~ ✅ tracked
4. **Deploy Batch 1 + Batch 2** — production 404 still bare HTML until deploy

## High Priority (should fix before beta)

5. ~~Replace collector artwork links~~ ✅ Batch 2
6. ~~Footer sign-in hardcoded creative~~ ✅ Batch 1
7. ~~Activity feed loading copy~~ ✅ Batch 1
8. ~~Delete dead `StudioActivityFeed.tsx`~~ ✅ Batch 1
9. ~~Organisation gradient/card legacy~~ ✅ Batch 2 (partial — overview sections aligned)
10. Creative subsection legacy — **deferred** (not launch-blocking; overviews are v2)

## Medium (polish)

11. ~~Upgrade root `app/not-found.tsx`~~ ✅ Batch 2 (deploy pending)
12. Organisation chart tiles — typography aligned; full `StudioMetricTile` swap deferred
13. ~~Update stale link patterns in activity/artwork clients~~ ✅ Batch 2
14. Fix `scripts/phase-1-staging-http-smoke.ts` redirect expectation for `/field`
15. Migrate Creative Works/Ownership/Certificates to v2 slabs

## Low (future / Sprint 7A+)

16. Modernize `StudioRightsWorkspace`, `PersonalArchivePageContent`
17. Unify activity feed implementations
18. Add `StudioViewToggle` to creative works gallery
19. Delete unused `StudioStatusBar.tsx`
20. Contact page v2 chrome

---

## Recommended Remediation Order

1. ~~Critical broken UX~~ ✅ Batch 1
2. ~~Broken navigation~~ ✅ Batch 1 + 2
3. ~~Shared components~~ ✅ Batch 1
4. ~~Root 404 + org presentation~~ ✅ Batch 2
5. **Deploy** — push Batch 1 + 2 to production (404, Studio error boundary, blank-page fixes)
6. Sprint 7A+ — Creative subsections, Rights ledger, activity feed unification

---

## Appendix — Full route file list

70 `app/**/page.tsx` files (2026-07-04):

`app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/disclaimer/page.tsx`, `app/get-started/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/signup/complete/page.tsx`, `app/signup/complete-profile/page.tsx`, `app/reset-password/page.tsx`, `app/logout/page.tsx`, `app/onboarding/page.tsx`, `app/verify/[registry_id]/page.tsx`, `app/field/page.tsx`, `app/field/explorer/page.tsx`, `app/field/explorer/records/page.tsx`, `app/field/explorer/creatives/page.tsx`, `app/field/explorer/organisations/page.tsx`, `app/field/record/[registry_id]/page.tsx`, `app/field/creative/[slug]/page.tsx`, `app/field/collector/[slug]/page.tsx`, `app/field/organisation/[slug]/page.tsx`, `app/field/opportunities/page.tsx`, `app/field/opportunities/[id]/page.tsx`, `app/field/verify/page.tsx`, `app/field/verify/[registry_id]/page.tsx`, `app/field/programmes/[slug]/page.tsx`, `app/registry/page.tsx`, `app/registry/[registry_id]/page.tsx`, `app/registry/[registry_id]/ledger/page.tsx`, `app/artwork/[registry_id]/page.tsx`, `app/artwork/[registry_id]/provenance/page.tsx`, `app/artwork/[registry_id]/provenance/studio/page.tsx`, `app/artwork/[registry_id]/provenance/stewardship/page.tsx`, `app/certificate/[registry_id]/page.tsx`, `app/studio/page.tsx`, `app/studio/creative/page.tsx`, `app/studio/collector/page.tsx`, `app/studio/organisation/page.tsx`, `app/studio/deals/page.tsx`, `app/studio/deals/new/page.tsx`, `app/studio/rights/page.tsx`, `app/studio/inbox/page.tsx`, `app/studio/archive/page.tsx`, `app/studio/account/page.tsx`, `app/studio/account/restore/page.tsx`, `app/account/page.tsx`, `app/account/restore/page.tsx`, `app/account/setup/page.tsx`, `app/personal-archive/page.tsx`, `app/collector-studio/page.tsx`, `app/collector-studio/[slug]/page.tsx`, `app/collector-studio/artwork/[registry_id]/page.tsx`, `app/collector-studio/claim-ownership/page.tsx`, `app/collector-studio/continue-provenance/page.tsx`, `app/institutional-studio/[slug]/page.tsx`, `app/institutional-studio/onboarding/page.tsx`, `app/institutional-studio-dashboard/page.tsx`, `app/artist/[artist_id]/page.tsx`, `app/gallery/[slug]/page.tsx`, `app/admin/page.tsx`, `app/internal/analytics/page.tsx`, `app/internal/verify/page.tsx`, `app/internal/replay-debugger/page.tsx`, `app/accept-steward-invite/page.tsx`, `app/authenticate-record/page.tsx`, `app/provenance/accept/page.tsx`, `app/disputes/[id]/page.tsx`.
