# Phase 1 PR4 — Execution Package

**Document status:** FROZEN (implementation build package)  
**Effective:** 31 May 2026  
**Authority:** [Phase 1 Route Migration Matrix](./phase-1-route-migration-matrix.md) (FROZEN), [Phase 1 Spec](./phase-1-studio-foundation-spec.md) §2.3 (RT-1–13), [Feasibility Review](./phase-1-feasibility-review.md) PR4/PR5 split  
**PR scope:** RT-1–13 only. **AG-1–3** (`app/studio/layout.tsx` auth guard) → **PR5** (do not implement in PR4).  
**Golden rule:** **Move, then redirect.** Legacy routes become redirect stubs in the **same commit** as the canonical move. Never remove a route and add redirects later.

---

## 0. Preconditions (gate before Phase 1)

| Check | Requirement |
|-------|-------------|
| G-1 | PR1 (`lib/studio-nav`), PR2 (`StudioShell`), PR3 (terminology) merged on target branch |
| G-2 | `npx tsc --noEmit` clean on `main` |
| G-3 | Baseline grep saved: `rg '"/studio"|/collector-studio|institutional-studio-dashboard|"/account"|personal-archive' --glob '*.{ts,tsx}'` → `docs/v2/pr4-baseline-grep.txt` (optional artifact) |
| G-4 | Staging has P0 migrations if testing archive/lifecycle (AC-M*) |
| G-5 | Branch: `pr/phase1-routes` from current `main` |

**Out of scope (do not add):** Field routes, collector artwork URL moves, public profile renames, API path changes, `app/studio/layout.tsx` auth guard, DB/auth/middleware rewrites.

---

## 1. Exact implementation phases

| Phase | Name | Goal | Exit criterion |
|-------|------|------|----------------|
| **0** | Preflight | Branch, baseline, matrix IDs loaded | Branch pushed; checklist §5.0 green |
| **1** | Scaffold | Create empty canonical route dirs only (no deletes) | Dirs exist; no behaviour change |
| **2** | Route moves + App Router stubs | P-01–P-05: move content; legacy `page.tsx` → `permanentRedirect` | All five legacy URLs redirect; canonical URLs render |
| **3** | Account subtree | R-12, R-13, R-14: restore/setup under `/studio/account` + legacy stubs | `/account/restore` → canonical; setup unchanged behaviour |
| **4** | `next.config.ts` | R-01–R-11 chain updates (config redirects) | One-hop or spec-compliant chain from §2.2 |
| **5** | Core libs | RT-7, RT-8, RT-11, RT-12: onboarding, post-auth, nav, sign-out | `homePathForRole` + section navigators use canonical bases |
| **6** | Chrome + CTAs | RT-9, RT-10, RT-13: Header, Footer, shells, heroes, matrix §3.6–3.9 | Grep shows no stale **internal** dashboard/account/archive links |
| **7** | Email + API URLs | E-01, E-02 only | New emails use canonical paths; R-12 covers old restore links |
| **8** | Page-level guards | A-12–A-19, dashboard login `next`, role redirects | Cross-role redirects target canonical homes |
| **9** | Validation | §5 + §6–§9 checklists | AC-R1–R4, AC-N1–N4 ready for PR5/PR6 |
| **10** | PR5 handoff | Document only — auth layout guard | See §9 PR5 boundary |

**Commit discipline:** One phase = one commit (or two if Phase 2 split per route family). Each Phase 2 sub-step must be **move + stub** atomically.

---

## 2. Files touched per phase

### Phase 0 — Preflight

| Action | Files |
|--------|-------|
| Optional baseline | `docs/v2/pr4-baseline-grep.txt` (generated, not hand-edited) |

### Phase 1 — Scaffold (create only)

| Create | Purpose |
|--------|---------|
| `app/studio/creative/` | P-01 target |
| `app/studio/collector/` | P-02 target |
| `app/studio/organisation/` | P-03 target |
| `app/studio/account/` | P-04 target (+ `restore/`, `setup/` later) |
| `app/studio/archive/` | P-05 target |

**Do not** add `app/studio/layout.tsx` in PR4.

### Phase 2 — Route moves + App Router stubs (atomic per row)

#### 2A — Creative (P-01, R-01) — **first** (unblocks `/studio` namespace)

| Step | Action | Files |
|------|--------|-------|
| 2A.1 | **Move** dashboard implementation | `app/studio/page.tsx` → `app/studio/creative/page.tsx` (same default export; fix relative imports if any) |
| 2A.2 | **Stub** legacy route | `app/studio/page.tsx` → `permanentRedirect('/studio/creative')` only |
| 2A.3 | Update in-page login gate `next` | `app/studio/creative/page.tsx` (was N-04): `encodeURIComponent('/studio/creative')` |
| 2A.4 | Update cross-role redirects in creative page | A-12 targets in `app/studio/creative/page.tsx` |

#### 2B — Personal Archive (P-05, R-05)

| Step | Action | Files |
|------|--------|-------|
| 2B.1 | **Move** | `app/personal-archive/page.tsx` → `app/studio/archive/page.tsx` |
| 2B.2 | **Stub** | `app/personal-archive/page.tsx` → redirect `/studio/archive` |
| 2B.3 | Login `next` default | `components/archive/PersonalArchiveShell.tsx` (B-03, N-08) |

#### 2C — Account (P-04, R-04)

| Step | Action | Files |
|------|--------|-------|
| 2C.1 | **Move** | `app/account/page.tsx` → `app/studio/account/page.tsx` |
| 2C.2 | **Stub** | `app/account/page.tsx` → redirect `/studio/account` |
| 2C.3 | Login `next` | `app/studio/account/page.tsx` (N-07) |
| 2C.4 | Workspace hrefs | `app/studio/account/page.tsx` (W-07) |

#### 2D — Collector dashboard (P-02, R-02)

| Step | Action | Files |
|------|--------|-------|
| 2D.1 | **Move** | `app/collector-studio/page.tsx` → `app/studio/collector/page.tsx` |
| 2D.2 | **Stub** | `app/collector-studio/page.tsx` → redirect `/studio/collector` (**exact**; keep `[slug]`, `artwork/`, `claim-ownership/`, `continue-provenance/` siblings untouched) |
| 2D.3 | Login `next` | `app/studio/collector/page.tsx` (N-05) |
| 2D.4 | Cross-role guards | A-13 in moved page |

**Leave in place (no move):**  
`app/collector-studio/[slug]/page.tsx`, `app/collector-studio/artwork/[registry_id]/page.tsx`, `app/collector-studio/claim-ownership/page.tsx`, `app/collector-studio/continue-provenance/page.tsx`

#### 2E — Organisation dashboard (P-03, R-03)

| Step | Action | Files |
|------|--------|-------|
| 2E.1 | **Move** | `app/institutional-studio-dashboard/page.tsx` → `app/studio/organisation/page.tsx` |
| 2E.2 | **Stub** | `app/institutional-studio-dashboard/page.tsx` → redirect `/studio/organisation` |
| 2E.3 | Login `next` | `app/studio/organisation/page.tsx` (N-06) |
| 2E.4 | Cross-role guards | A-14 in moved page |

### Phase 3 — Account subtree (R-12, R-13)

| Step | Action | Files |
|------|--------|-------|
| 3.1 | **Move** restore | `app/account/restore/page.tsx` → `app/studio/account/restore/page.tsx` |
| 3.2 | **Stub** restore | `app/account/restore/page.tsx` → redirect `/studio/account/restore` (preserve query string via Next redirect) |
| 3.3 | **Move** or stub setup | `app/account/setup/page.tsx` — if still used: move to `app/studio/account/setup/page.tsx` + stub at legacy, **or** config-only R-13 to `/onboarding` |
| 3.4 | **Generator** | `app/api/account/delete/request/route.ts` (E-01) |

### Phase 4 — `next.config.ts` (after all App Router stubs exist)

| File | Redirect IDs |
|------|----------------|
| `next.config.ts` | R-06, R-07, R-08–R-11 unchanged destinations; optional R-12/R-13 if not using App Router stubs |

**Config update table (destinations only):**

| ID | `destination` must become |
|----|-------------------------|
| R-06 | `/studio/creative` |
| R-07 | `/studio/organisation` |
| R-08–R-11 | No change |
| R-12 | `/studio/account/restore` (if using config duplicate; prefer App stub) |

**Do not add** a redirect rule matching `/collector-studio/:path*` (only R-02 exact path via stub).

### Phase 5 — Core libs

| File | Matrix IDs |
|------|------------|
| `lib/onboarding.ts` | A-01, A-02, A-03 |
| `lib/post-auth-redirect.ts` | A-04 |
| `lib/studio-nav/creative-nav.ts` | V-01 |
| `lib/studio-nav/collector-nav.ts` | V-02 |
| `lib/studio-nav/organisation-nav.ts` | V-03 |
| `lib/studio-nav/personal-archive.ts` | V-04 |
| `components/Studio/StudioShell.tsx` | S-01, S-02, S-03 |

### Phase 6 — Chrome + CTAs (grep-driven)

| File | Matrix IDs |
|------|------------|
| `components/Header.tsx` | H-01–H-06, N-01 |
| `components/LandingPage/Footer.tsx` | F-01, N-02 |
| `components/DashboardNavLink.tsx` | F-02, N-03 |
| `components/get-started/GalleryPricingModal.tsx` | F-05, N-06 |
| `components/Studio/WorkspaceShell.tsx` | W-01, W-02 |
| `components/Studio/ArtistWorkspaceHero.tsx` | W-04 |
| `components/Studio/CollectorWorkspaceHero.tsx` | W-05 |
| `components/gallery/GalleryInstitutionalHero.tsx` | W-06 |
| `components/artist/ArtworkRecordReviewView.tsx` | W-09 |
| `components/collector/ClaimOwnershipFlow.tsx` | W-10, N-09 |
| `components/collector/ContinueProvenanceFlow.tsx` | W-11, N-10 |
| `components/provenance/AcceptProvenanceClient.tsx` | A-18 |
| `app/disputes/[id]/page.tsx` | A-17 |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | C-01, C-02 |
| `app/login/LoginClient.tsx` | A-05 |
| `app/signup/complete/page.tsx` | A-06 |
| `app/onboarding/OnboardingClient.tsx` | A-07, A-08, A-09 |
| `app/internal/replay-debugger/page.tsx` | A-19 |
| `components/Studio/StudioActivityFeed.tsx` | W-14 |
| `components/Studio/StudioArtworkClient.tsx` | W-15, B-02, N-11 |
| `app/collector-studio/[slug]/page.tsx` | W-12, B-01 (dashboard link only; slug URL unchanged) |

**Explicitly do not change (public-profile checklist):**  
`app/artwork/[registry_id]/page.tsx`, `components/Registry/PublicRegistryRecordView.tsx` (G-01), `app/account` public slug builder (C-03), `next.config.ts` R-09/R-10.

### Phase 7 — Email + API

| File | Matrix IDs |
|------|------------|
| `app/api/account/delete/request/route.ts` | E-01 |
| `app/api/invite/complete-verification/route.ts` | E-02 |

### Phase 8 — Residual page guards

| File | Notes |
|------|-------|
| Moved dashboard pages | Verify A-12–A-14 use canonical targets only |
| `app/studio/creative/page.tsx` | Session gate `next` = `/studio/creative` |

### Phase 9 — PR5 handoff (no code in PR4)

| Deferred | Spec |
|----------|------|
| `app/studio/layout.tsx` | AG-1–3, AC-R5–R7 centralised |
| Dedupe per-page session gates | After layout guard lands |

---

## 3. Redirect rollout order

**Principle:** App Router stubs first (zero downtime), then `next.config` chain updates, then string updates in code/emails.

| Order | Layer | IDs | When |
|-------|-------|-----|------|
| 1 | App Router `permanentRedirect` stub at **legacy** `page.tsx` | R-01–R-05, R-12 | Same commit as each canonical **move** (Phase 2–3) |
| 2 | Verify stubs locally | — | `curl -I` or browser: legacy URL → 308/307 to canonical |
| 3 | `next.config.ts` destination updates | R-06, R-07 | Phase 4 — only after R-01/R-03 targets exist |
| 4 | Leave R-08–R-11 unchanged | R-08–R-11 | No edit unless typo |
| 5 | In-app link + `?next=` strings | N-*, S-*, V-*, H-*, F-*, W-* | Phase 5–6 |
| 6 | Email URL generators | E-01, E-02 | Phase 7 (new sends only; R-12 handles old restore emails) |

**Forbidden sequence:** Delete `app/studio/page.tsx` → add redirect in config later.  
**Required sequence:** `creative/page.tsx` live → `studio/page.tsx` stub redirect.

---

## 4. Route move order (dependency)

```
2A Creative (P-01)     ── must be first (/studio/page.tsx conflict)
    ├── 2B Archive (P-05)
    ├── 2C Account (P-04)
    ├── 2D Collector dashboard (P-02)
    └── 2E Organisation (P-03)
3 Account subtree (restore/setup)
4 next.config chains
5–8 Libs + chrome + email
```

| Priority | Route family | Reason |
|----------|--------------|--------|
| 1 | Creative | Occupies `app/studio/page.tsx`; R-11 `/studio/artwork` must remain sibling under `app/studio/` |
| 2 | Archive, Account | No collector prefix collision |
| 3 | Collector dashboard | Stub only `page.tsx`; sub-routes stay |
| 4 | Organisation | Largest file; independent |
| 5 | Account restore | Depends on `app/studio/account/` existing |

---

## 5. Validation checklist

### 5.0 Pre-merge build

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint` (if used in CI)
- [ ] No new routes beyond: `/studio/creative`, `/studio/collector`, `/studio/organisation`, `/studio/account`, `/studio/archive`, `/studio/account/restore` (+ optional `/studio/account/setup`)

### 5.1 Redirect matrix (AC-R2)

| From | To | One hop via stub or config |
|------|-----|---------------------------|
| `/studio` | `/studio/creative` | [ ] |
| `/dashboard` | `/studio/creative` | [ ] |
| `/collector-studio` | `/studio/collector` | [ ] |
| `/institutional-studio-dashboard` | `/studio/organisation` | [ ] |
| `/gallery-dashboard` | `/studio/organisation` | [ ] |
| `/account` | `/studio/account` | [ ] |
| `/personal-archive` | `/studio/archive` | [ ] |
| `/account/restore?token=x` | `/studio/account/restore?token=x` | [ ] |

### 5.2 Canonical render (AC-R1)

- [ ] Signed-in Creative: `/studio/creative` — all sections
- [ ] Signed-in Collector: `/studio/collector`
- [ ] Signed-in Organisation: `/studio/organisation`
- [ ] Account: `/studio/account` in shell
- [ ] Archive: `/studio/archive` in shell; nav highlights Personal Archive

### 5.3 Unchanged paths (must not redirect)

- [ ] `/collector-studio/my-slug` (public)
- [ ] `/collector-studio/artwork/{id}`
- [ ] `/collector-studio/claim-ownership`
- [ ] `/collector-studio/continue-provenance`
- [ ] `/institutional-studio/{slug}`
- [ ] `/artist/{id}`
- [ ] `/studio/artwork/{id}` → still → `/collector-studio/artwork/{id}` (R-11)

### 5.4 Post-auth (AC-R3, AC-R4)

- [ ] `homePathForRole('artist')` → `/studio/creative`
- [ ] `homePathForRole('collector')` → `/studio/collector`
- [ ] `homePathForRole('gallery')` → `/studio/organisation`
- [ ] Login with `?next=/collector-studio` → ends on `/studio/collector` after redirect
- [ ] Sign-out `?next=` per role (S-01–S-03) returns to canonical home after re-login

### 5.5 Navigation (AC-N1–N4)

- [ ] Section click from `/studio/account` → correct dashboard + section (sessionStorage unchanged)
- [ ] Personal Archive nav → `/studio/archive`
- [ ] Footer Account active on `/studio/account`
- [ ] Registry link still `/registry`

### 5.6 Registry preservation (AC-P4)

- [ ] Public `/registry`, `/artwork/{id}` unchanged
- [ ] No RPC/RLS file changes in PR4

---

## 6. Auth return-path checklist

| ID | Path / param | Expected after PR4 | Verify |
|----|--------------|-------------------|--------|
| A-04 | `resolvePostAuthRedirectPath` fallback | `/studio/creative` | [ ] |
| A-05 | Login no user | `/studio/creative` | [ ] |
| A-06 | Signup complete | `homePathForRole` canonical | [ ] |
| A-07 | Onboarding generic complete | canonical | [ ] |
| A-08 | Onboarding collector | `/studio/collector` | [ ] |
| A-09 | Onboarding gallery | `/studio/organisation` | [ ] |
| A-10 | Incomplete onboarding | `/onboarding` (**unchanged**) | [ ] |
| A-11 | Auth callback default | `/onboarding` (**unchanged**) | [ ] |
| A-20 | `sanitizeAuthReturnPath` | Accepts legacy paths; redirects post-login | [ ] |
| N-01–N-08 | `?next=` entries | Prefer canonical in **new** code; legacy still works via stub | [ ] |
| N-09–N-11 | Collector workflow `next` | **Unchanged paths** | [ ] |
| N-12–N-15 | Onboarding, auth record, provenance, cert | **Unchanged** | [ ] |
| F-02 | `DashboardNavLink` | Uses `homePathForRole` when session exists | [ ] |

**PR5 note:** Centralised `/studio/*` login gate not in PR4; page-level gates remain until `app/studio/layout.tsx`.

---

## 7. Email-link checklist

| ID | Email / API | Old URL in wild | PR4 action | Verify |
|----|-------------|-----------------|------------|--------|
| E-01 | Deletion scheduled restore CTA | `/account/restore?token=` | Generator → `/studio/account/restore?token=`; R-12 stub for old | [ ] New request email |
| E-02 | Gallery verified notify | `/institutional-studio-dashboard` | Generator → `/studio/organisation` | [ ] |
| E-03 | Artist/gallery invite signup | `/signup?invite_token=` | **No change** | [ ] |
| E-04 | Artwork auth invite | `/authenticate-record?token=` | **No change** | [ ] |
| E-05 | Provenance accept | `/provenance/accept?token=` | **No change** | [ ] |
| E-06 | Data export download | `/api/account/export/:id` | **No change** | [ ] |

---

## 8. Public-profile checklist (must remain stable)

| URL pattern | PR4 action | Verify |
|-------------|------------|--------|
| `/collector-studio/[slug]` | **No move, no redirect** | [ ] Public page loads |
| `/collector-studio/artwork/[registry_id]` | **No move** | [ ] |
| `/collector-studio/claim-ownership` | **No move** | [ ] |
| `/collector-studio/continue-provenance` | **No move** | [ ] |
| `/institutional-studio/[slug]` | **No move** | [ ] |
| `/artist/[artist_id]` | **No move** | [ ] |
| `/gallery/[slug]` → `/institutional-studio/[slug]` | R-09 **unchanged** | [ ] |
| `/collector/[slug]` → `/collector-studio/[slug]` | R-10 **unchanged** | [ ] |
| Registry owner link → `/collector-studio/{slug}` | G-01 **unchanged** | [ ] |
| Account “my public collection” href → `/collector-studio/{slug}` | C-03 **unchanged** | [ ] |
| Header `isAppShell` on public collector slug | H-04: must **not** treat slug as app dashboard | [ ] |

**Allowed change on public pages:** Links **to signed-in dashboard** only (e.g. B-01: “Studio” → `/studio/collector`), not the public slug URL itself.

---

## 9. Rollback procedure

| Scenario | Action |
|----------|--------|
| **Before merge** | Revert PR branch commits in reverse phase order (8 → 1). Restore moved files to legacy paths; remove stubs. |
| **After merge, production incident** | Revert merge commit on `main`; redeploy previous build. |
| **Partial failure (one route family)** | Revert only that phase’s commit; ensure legacy path has **either** full page **or** stub—never 404. |
| **Config-only rollback** | Revert `next.config.ts` hunk; keep App Router stubs if pages already moved. |
| **Email already sent with new URL** | Do not rollback E-01/E-02 generators without comms; stubs must keep old paths working (R-12). |

**Recovery verification after rollback:** Legacy URLs serve full dashboards again; canonical URLs may 404 until forward fix reapplied.

---

## 10. Reviewer checklist

### Scope

- [ ] Only five canonical studio routes + `/studio/account/restore` (and optional setup) added
- [ ] No `app/studio/layout.tsx` auth guard (PR5)
- [ ] No collector sub-route moves
- [ ] No API route path changes
- [ ] No terminology / StudioShell / nav structure refactors beyond path strings

### Move-then-redirect

- [ ] Every moved route has **stub** at legacy path in same commit
- [ ] No commit message says “remove legacy route” without stub replacement
- [ ] `app/collector-studio/page.tsx` exists and redirects (not deleted)

### Redirect safety

- [ ] No `next.config` rule `source: '/collector-studio/:path*'` or similar
- [ ] R-11 `/studio/artwork/:id` still present
- [ ] R-02 is exact `/collector-studio` only

### Code quality

- [ ] `homePathForRole` and nav helpers aligned
- [ ] Header `isAppShell` does not match public `/collector-studio/[slug]` incorrectly
- [ ] Grep diff reviewed for accidental `/studio"` without `/creative` where dashboard intended

### Docs

- [ ] Changes trace to matrix IDs (R-*, P-*, A-*, etc.)
- [ ] No deviation from frozen matrix without unlock note in PR description

---

## 11. PR description template (copy for GitHub)

```markdown
## Phase 1 PR4 — Canonical `/studio/*` routes

Implements [phase-1-route-migration-matrix.md](./phase-1-route-migration-matrix.md) (FROZEN).
Move-then-redirect: legacy `page.tsx` stubs in same commit as canonical moves.

### Routes
- `/studio/creative`, `/studio/collector`, `/studio/organisation`, `/studio/account`, `/studio/archive`
- Legacy permanent redirects per matrix R-01–R-05, R-12

### Not in this PR
- `app/studio/layout.tsx` auth guard (PR5)
- Collector workflow/public slug URL changes

### QA
- [ ] Redirect matrix §5.1
- [ ] Unchanged paths §5.3
- [ ] Auth return-path §6
- [ ] Email §7
- [ ] Public profiles §8
```

---

## 12. Spec crosswalk

| Spec task | Execution phase |
|-----------|-----------------|
| RT-1 | Phase 2A |
| RT-2 | Phase 2D |
| RT-3 | Phase 2E |
| RT-4 | Phase 2C |
| RT-5 | Phase 2B |
| RT-6 | Phases 2–4 |
| RT-7 | Phase 5 |
| RT-8 | Phase 5 |
| RT-9 | Phase 6 |
| RT-10 | Phase 6 |
| RT-11 | Phase 5 |
| RT-12 | Phase 5 |
| RT-13 | Phase 6 |
| AG-1–3 | Phase 10 (PR5) |

---

## Unlock

Deviations from this package require [Route Migration Matrix](./phase-1-route-migration-matrix.md) unlock and Phase 1 Spec §2.3 amendment.
