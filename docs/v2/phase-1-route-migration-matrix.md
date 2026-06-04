# Phase 1 Route Migration Matrix

**Document status:** FROZEN  
**Effective:** 31 May 2026  
**Authority:** [Phase 1 Implementation Specification](./phase-1-studio-foundation-spec.md) (LOCKED) §2.3, [Phase 1 Feasibility Review](./phase-1-feasibility-review.md) §2  
**Scope:** PR4 canonical `/studio/*` restructuring — pre-implementation inventory  
**Use:** Implementation checklist, grep pass (RT-13), redirect configuration, QA (AC-R1–R7)

---

## 1. Canonical routes (target state)

| Role / surface | Canonical URL | Legacy URL(s) |
|----------------|---------------|---------------|
| Creative dashboard | `/studio/creative` | `/studio`, `/dashboard` |
| Collector dashboard | `/studio/collector` | `/collector-studio` (exact path only) |
| Organisation dashboard | `/studio/organisation` | `/institutional-studio-dashboard`, `/gallery-dashboard` |
| Account (all roles) | `/studio/account` | `/account` |
| Personal Archive (all roles) | `/studio/archive` | `/personal-archive` |

**App structure (RT-1–5):** page modules under `app/studio/{creative,collector,organisation,account,archive}/`; `app/studio/layout.tsx` auth guard (AG-1–3).

---

## 2. Permanent redirects

### 2.1 Required new redirects (spec §4.4)

| ID | From | To | Notes |
|----|------|-----|-------|
| R-01 | `/studio` | `/studio/creative` | Replace creative page at `app/studio/page.tsx` with redirect stub |
| R-02 | `/collector-studio` | `/studio/collector` | **Exact path only** — do not blanket `/collector-studio/*` |
| R-03 | `/institutional-studio-dashboard` | `/studio/organisation` | |
| R-04 | `/account` | `/studio/account` | |
| R-05 | `/personal-archive` | `/studio/archive` | |

### 2.2 Existing `next.config.ts` — update destinations

| ID | From | Current destination | Phase 1 destination |
|----|------|---------------------|---------------------|
| R-06 | `/dashboard` | `/studio` | `/studio/creative` (direct or via R-01) |
| R-07 | `/gallery-dashboard` | `/institutional-studio-dashboard` | `/studio/organisation` (direct or via R-03) |
| R-08 | `/gallery/onboarding` | `/institutional-studio/onboarding` | **Unchanged** (client → `/onboarding?focus=gallery`) |
| R-09 | `/gallery/:slug` | `/institutional-studio/:slug` | **Unchanged** (public organisation profile) |
| R-10 | `/collector/:slug` | `/collector-studio/:slug` | **Unchanged** (public collector profile) |
| R-11 | `/studio/artwork/:registry_id` | `/collector-studio/artwork/:registry_id` | **Keep** (collector work detail; not creative dashboard) |

### 2.3 Account subtree (recommended)

| ID | From | To | Notes |
|----|------|-----|-------|
| R-12 | `/account/restore` | `/studio/account/restore` | Deletion email CTA (`app/api/account/delete/request/route.ts`) |
| R-13 | `/account/setup` | `/onboarding` | Already client-redirect; optional config alias |
| R-14 | `/account/*` (other) | `/studio/account/*` | If routes live under `app/studio/account/` |

### 2.4 Explicitly unchanged (spec §2.3.4)

| Path | Reason |
|------|--------|
| `/collector-studio/[slug]` | Public collector catalogue |
| `/collector-studio/artwork/[registry_id]` | Collector work workspace |
| `/collector-studio/claim-ownership` | Claim flow |
| `/collector-studio/continue-provenance` | Provenance continuation |
| `/institutional-studio/[slug]` | Public organisation page |
| `/artist/[artist_id]` | Public creative page |
| `/registry`, `/artwork`, `/certificate`, `/verify`, `/onboarding`, `/login`, `/signup`, `/admin`, `/internal/*` | Outside studio namespace |
| `/authenticate-record`, `/provenance/accept` | Cross-role / pre-studio flows |
| `/api/account/*`, `/api/personal-archive/*` | API paths unchanged |

---

## 3. Migration matrix by surface

**Legend — Action:** `redirect` | `move-page` | `update-link` | `update-logic` | `unchanged` | `new-guard`

### 3.1 App routes (page modules)

| ID | Current | Canonical | Action | Primary file(s) |
|----|---------|-----------|--------|-----------------|
| P-01 | `/studio` | `/studio/creative` | move-page + redirect | `app/studio/page.tsx` → `app/studio/creative/page.tsx` |
| P-02 | `/collector-studio` | `/studio/collector` | move-page | `app/collector-studio/page.tsx` |
| P-03 | `/institutional-studio-dashboard` | `/studio/organisation` | move-page | `app/institutional-studio-dashboard/page.tsx` |
| P-04 | `/account` | `/studio/account` | move-page | `app/account/page.tsx` |
| P-05 | `/personal-archive` | `/studio/archive` | move-page | `app/personal-archive/page.tsx` |
| P-06 | — | `/studio/*` | new-guard | `app/studio/layout.tsx` |

### 3.2 Post-auth and onboarding

| ID | Trigger | Current | Canonical | Source |
|----|---------|---------|-----------|--------|
| A-01 | `homePathForRole('artist')` | `/studio` | `/studio/creative` | `lib/onboarding.ts` |
| A-02 | `homePathForRole('collector')` | `/collector-studio` | `/studio/collector` | `lib/onboarding.ts` |
| A-03 | `homePathForRole('gallery')` | `/institutional-studio-dashboard` | `/studio/organisation` | `lib/onboarding.ts` |
| A-04 | `resolvePostAuthRedirectPath` fallback | `/studio` | `/studio/creative` | `lib/post-auth-redirect.ts` |
| A-05 | Login no-user fallback | `/studio` | `/studio/creative` | `app/login/LoginClient.tsx` |
| A-06 | Signup complete fallback | `homePathForRole \|\| /studio` | canonical homes | `app/signup/complete/page.tsx` |
| A-07 | Onboarding finish (generic) | `homePathForRole \|\| /studio` | canonical homes | `app/onboarding/OnboardingClient.tsx` |
| A-08 | Onboarding collector submit | `/collector-studio` | `/studio/collector` | `OnboardingClient.tsx` |
| A-09 | Onboarding gallery submit | `/institutional-studio-dashboard` | `/studio/organisation` | `OnboardingClient.tsx` |
| A-10 | `getOnboardingRedirectPath` | `/onboarding` | **unchanged** | `lib/onboarding.ts` |
| A-11 | Auth callback default `next` | `/onboarding` | **unchanged** | `app/auth/callback/route.ts` |
| A-12 | Creative dashboard role guard | cross-role legacy homes | canonical homes | `app/studio/page.tsx` |
| A-13 | Collector dashboard role guard | cross-role legacy homes | canonical homes | `app/collector-studio/page.tsx` |
| A-14 | Organisation dashboard role guard | cross-role legacy homes | canonical homes | `app/institutional-studio-dashboard/page.tsx` |
| A-15 | Account onboarding gate | `/onboarding` | **unchanged** | `app/account/page.tsx` |
| A-16 | Disputes unauthenticated | `next` = current path | preserve (legacy redirects after login) | `app/disputes/[id]/page.tsx` |
| A-17 | Disputes redirect | `/account` | `/studio/account` | `app/disputes/[id]/page.tsx` |
| A-18 | Accept provenance success | `/account` | `/studio/account` | `components/provenance/AcceptProvenanceClient.tsx` |
| A-19 | Internal replay debugger | `/studio` | `/studio/creative` | `app/internal/replay-debugger/page.tsx` |
| A-20 | `sanitizeAuthReturnPath` | safe relative paths | **unchanged** | `lib/auth-return-path.ts` |

### 3.3 Login `?next=` parameters

| ID | Current `next` | Lands via redirect | Source |
|----|----------------|-------------------|--------|
| N-01 | `/studio` | `/studio/creative` | `components/Header.tsx` |
| N-02 | `/studio` | `/studio/creative` | `components/LandingPage/Footer.tsx` |
| N-03 | `/studio` | `/studio/creative` | `components/DashboardNavLink.tsx` |
| N-04 | `/studio` | `/studio/creative` | `app/studio/page.tsx` |
| N-05 | `/collector-studio` | `/studio/collector` | `app/collector-studio/page.tsx` |
| N-06 | `/institutional-studio-dashboard` | `/studio/organisation` | `institutional dashboard`, `GalleryPricingModal.tsx` |
| N-07 | `/account` | `/studio/account` | `app/account/page.tsx` |
| N-08 | `/personal-archive` (dynamic) | `/studio/archive` | `components/archive/PersonalArchiveShell.tsx` |
| N-09 | `/collector-studio/claim-ownership` | **unchanged** | `ClaimOwnershipFlow.tsx` |
| N-10 | `/collector-studio/continue-provenance?...` | **unchanged** | `ContinueProvenanceFlow.tsx` |
| N-11 | `/collector-studio/artwork/:id` | **unchanged** | `StudioArtworkClient.tsx` |
| N-12–N-15 | `/onboarding`, `/authenticate-record`, `/provenance/accept`, `/certificate/:id` | **unchanged** | respective flows |

### 3.4 Sign-out `?next=`

| ID | Role | Current | Canonical | Source |
|----|------|---------|-----------|--------|
| S-01 | artist | `/studio` | `/studio/creative` | `components/Studio/StudioShell.tsx` |
| S-02 | collector | `/collector-studio` | `/studio/collector` | `StudioShell.tsx` |
| S-03 | gallery | `/institutional-studio-dashboard` | `/studio/organisation` | `StudioShell.tsx` |

### 3.5 Section navigation (sessionStorage keys unchanged)

| ID | Helper | Current push base | Canonical base | Source |
|----|--------|-------------------|----------------|--------|
| V-01 | `navigateToCreativeSection` | `/studio` | `/studio/creative` | `lib/studio-nav/creative-nav.ts` |
| V-02 | `navigateToCollectorSection` | `/collector-studio` | `/studio/collector` | `lib/studio-nav/collector-nav.ts` |
| V-03 | `navigateToOrganisationSection` | `/institutional-studio-dashboard` | `/studio/organisation` | `lib/studio-nav/organisation-nav.ts` |
| V-04 | Personal Archive nav `href` | `/personal-archive` | `/studio/archive` | `lib/studio-nav/personal-archive.ts` |

### 3.6 Header

| ID | Element | Current | PR4 action | Source |
|----|---------|---------|------------|--------|
| H-01 | Studio CTA href | role legacy homes | canonical homes | `components/Header.tsx` |
| H-02 | Account link | `/account` | `/studio/account` | `Header.tsx` |
| H-03 | Default login CTA | `?next=/studio` | `?next=/studio/creative` or role-aware | `Header.tsx` |
| H-04 | `isAppShell` | broad `/studio`, `/collector-studio` prefixes | canonical paths only; avoid public slug false-positive | `Header.tsx` |
| H-05 | Creative studio active | `/studio`, `/dashboard` | `/studio/creative` | `Header.tsx` |
| H-06 | Silver atmosphere | under `/studio` | scope to creative canonical routes | `Header.tsx` |

### 3.7 Footer and get-started CTAs

| ID | Element | Current | Canonical | Source |
|----|---------|---------|-----------|--------|
| F-01 | Footer sign in | `?next=/studio` | `?next=/studio/creative` or role-aware | `Footer.tsx` |
| F-02 | `DashboardNavLink` | `/studio` when signed in | `homePathForRole` | `DashboardNavLink.tsx` |
| F-03 | Registry / About / Contact | — | **unchanged** | `Footer.tsx` |
| F-04 | Get started signup links | `?role=artist|collector|gallery` | **unchanged** (query only) | `GetStartedView.tsx` |
| F-05 | Gallery pricing login | `?next=/institutional-studio-dashboard` | `?next=/studio/organisation` | `GalleryPricingModal.tsx` |

### 3.8 Workspace shell and dashboard CTAs

| ID | Element | Current | Canonical | Source |
|----|---------|---------|-----------|--------|
| W-01 | My Account link | `/account` | `/studio/account` | `WorkspaceShell.tsx` |
| W-02 | `accountActive` | `/account` | `/studio/account` | `WorkspaceShell.tsx`, layouts |
| W-03 | Browse catalogue | `/registry` | **unchanged** | `WorkspaceShell.tsx` |
| W-04–W-06 | Hero → Account | `/account` | `/studio/account` | `*WorkspaceHero.tsx`, `GalleryInstitutionalHero.tsx` |
| W-07 | Account workspace href | legacy homes | canonical homes | `app/account/page.tsx` |
| W-08 | Org empty onboarding CTA | `/onboarding?focus=gallery` | **unchanged** | `institutional-studio-dashboard/page.tsx` |
| W-09 | Artist review CTA | `/studio` | `/studio/creative` | `ArtworkRecordReviewView.tsx` |
| W-10–W-11 | Claim / continue provenance → studio | `/collector-studio` | `/studio/collector` | `ClaimOwnershipFlow.tsx`, `ContinueProvenanceFlow.tsx` |
| W-12 | Collector public profile nav | `/collector-studio`, `/account` | `/studio/collector`, `/studio/account` | `collector-studio/[slug]/page.tsx` |
| W-13 | Activity feed artwork links | `/collector-studio/artwork/:id` | **unchanged** | activity feed components |
| W-14 | `StudioActivityFeed` default base | `/collector-studio` | `/studio/collector` | `StudioActivityFeed.tsx` |
| W-15 | `StudioArtworkClient` wrong-role | `/studio` | `/studio/creative` | `StudioArtworkClient.tsx` |

### 3.9 Account, privacy, legal cross-links

| ID | Current | Canonical | Source |
|----|---------|-----------|--------|
| C-01 | `/account#account-visibility` | `/studio/account#account-visibility` | `app/privacy/page.tsx` |
| C-02 | `/account#account-privacy-data` | `/studio/account#account-privacy-data` | `privacy`, `terms` |
| C-03 | Collector public page href | `/collector-studio/:slug` | **unchanged** | `app/account/page.tsx` |
| C-04 | In-page `#account-*` anchors | same on new URL | `AccountPresenceHero.tsx` |

### 3.10 Email and server-generated URLs

| ID | Context | Current | Canonical | Source |
|----|---------|---------|-----------|--------|
| E-01 | Deletion restore CTA | `/account/restore?token=` | `/studio/account/restore?token=` | `app/api/account/delete/request/route.ts` |
| E-02 | Gallery verified notify CTA | `/institutional-studio-dashboard` | `/studio/organisation` | `app/api/invite/complete-verification/route.ts` |
| E-03–E-05 | Signup invite, artwork auth, provenance accept | — | **unchanged** | respective API routes |
| E-06 | Data export download | `/api/account/export/:id` | **unchanged** | `app/api/account/export/route.ts` |

### 3.11 Registry links (secondary)

| ID | Link | Current | PR4 | Source |
|----|------|---------|-----|--------|
| G-01 | Owner collector slug | `/collector-studio/:slug` | **unchanged** | `artwork/[registry_id]/page.tsx`, `PublicRegistryRecordView.tsx` |
| G-02 | Signed-in catalogue shell | role layouts | update nav hrefs only | `SignedInCatalogueShellLayout.tsx` |

### 3.12 Breadcrumbs and back-navigation

No dedicated breadcrumb component. Context links:

| ID | UI | Current | Canonical | Source |
|----|-----|---------|-----------|--------|
| B-01 | Collector public profile | Studio → `/collector-studio` | `/studio/collector` | `collector-studio/[slug]/page.tsx` |
| B-02 | Collector artwork login return | `/collector-studio/artwork/:id` | **unchanged** | `StudioArtworkClient.tsx` |
| B-03 | Archive shell login `next` | `pathname \|\| /personal-archive` | `/studio/archive` | `PersonalArchiveShell.tsx` |

---

## 4. Implementation order

1. Move pages + `app/studio/layout.tsx` guard (P-01–P-06, AG-1–3).
2. Update `homePathForRole`, nav helpers, `StudioShell` sign-out (A-*, V-*, S-*).
3. Add/update `next.config.ts` redirects (R-01–R-14).
4. Grep pass: Header, Footer, shells, account, emails (RT-13; all `update-link` rows).
5. Fix `isAppShell` and active-state detection (H-04–H-06).

---

## 5. Risk register

| Risk | Mitigation |
|------|------------|
| Blanket `/collector-studio/*` redirect breaks artwork/claim/provenance | R-02 exact match only |
| `/studio/artwork` redirect (R-11) vs `/studio/creative` namespace | Keep R-11; creative home is `/studio/creative` |
| Header treats public `/collector-studio/[slug]` as app shell | H-04: narrow `isAppShell` |
| Old `/account/restore` emails | R-12 + E-01 |
| `DashboardNavLink` always `/studio` | F-02: `homePathForRole` |
| Legacy `?next=` bookmarks | Permanent redirects after auth (AC-R2) |

---

## 6. Spec task crosswalk

| Spec | Matrix IDs |
|------|------------|
| RT-1–5 | P-01–P-05 |
| RT-6 | R-01–R-14 |
| RT-7 | A-01–A-03 |
| RT-8 | A-04–A-06 |
| RT-9 | H-01–H-06 |
| RT-10 | N-01–N-08, F-01, F-05 |
| RT-11 | V-01–V-04 |
| RT-12 | S-01–S-03 |
| RT-13 | All `update-link` rows |
| AG-1–3 | P-06, A-10–A-15 |

---

## 7. Out of scope for PR4

- Blueprint future: `/studio/collector/works/[registry_id]` (later phase).
- Field routes (`/field/*`).
- Public profile URL renames (`/artist`, `/institutional-studio`, `/collector-studio/[slug]`).
- API route path changes.

---

## Unlock procedure

Changes require explicit unlock and engineering lead sign-off. Redirect inventory changes must stay aligned with Phase 1 Spec §2.3; expanding scope (e.g. moving collector artwork URLs) requires Phase 1 Spec unlock.
