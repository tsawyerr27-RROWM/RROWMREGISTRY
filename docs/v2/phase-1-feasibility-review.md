# Phase 1 Feasibility Review — V2 Studio Foundation

**Document status:** IMPLEMENTATION SOURCE OF TRUTH  
**Frozen:** 31 May 2026  
**Authority:** Phase 1 Implementation Specification (LOCKED); strategic scope bounded by Product Blueprint v1.1 (APPROVED)  
**Purpose:** Governs PR sequencing, execution risks, and dependency resolution for Phase 1 — does not expand scope  
**Verdict:** **Feasible**, with two hard preconditions and elevated risk in route/auth PRs. No architectural changes required beyond the approved spec.

---

## Executive summary

Phase 1 is implementable against the current codebase. The main work is mechanical but touches large monoliths (`app/studio/page.tsx` ~3,400 lines, `app/institutional-studio-dashboard/page.tsx` ~2,900 lines) and a wide path-grep surface (~25+ hardcoded studio/account/archive URLs). The largest execution risk is **not** StudioShell extraction itself — it is **landing in-flight WIP** (137 dirty files overlapping Phase 1 hotspots) and **coordinating route + auth changes** without breaking invite/login `next=` flows or collector sub-routes under `/collector-studio/*`.

**Hard blockers before QA (from spec §2.6):** P0 migrations applied + PostgREST reload on target env. Personal archive is known to fail on prod today if `20260531160000` is unapplied.

---

## 1. Hidden dependencies

These are not called out as first-class workstreams in the spec but will block or regress Phase 1 if missed.

### 1.1 Navigation & session state

| Dependency | Location | Phase 1 impact |
|------------|----------|----------------|
| Section memory via `sessionStorage` | `lib/studio-workspace-nav.ts`, `lib/collector-workspace-nav.ts`, `lib/gallery-workspace-nav.ts` | Keys can stay; **push targets** must change to `/studio/creative`, `/studio/collector`, `/studio/organisation` (spec SS-7, RT-11) |
| Cross-page section jumps | `components/account/AccountPageContent.tsx` → `navigateToStudioSection(router, "Records")` | Must land on new base URL + pending section |
| Shell layout sign-out / login `next` | All three `*WorkspaceShellLayout.tsx` files | Each hardcodes role-specific legacy paths |
| Footer Account link | `components/Studio/WorkspaceShell.tsx` (`href="/account"`) | Must become `/studio/account` |
| Hero inline account links | `ArtistWorkspaceHero`, `CollectorWorkspaceHero`, `GalleryInstitutionalHero` | Same |
| Activity feed deep links | `components/Studio/StudioActivityFeed.tsx` | Hardcoded `/studio` vs `/collector-studio` |
| Personal Archive nav href | `lib/personal-archive-nav.ts` → `/personal-archive` | Must become `/studio/archive` |
| Section label i18n (WIP) | `lib/workspace-nav-i18n.ts` | Already used by collector dashboard; must fold into `lib/studio-nav/` |

### 1.2 Auth & post-auth routing

| Dependency | Location | Impact |
|------------|----------|--------|
| Role home paths | `lib/onboarding.ts` → `homePathForRole()` | Central switch for onboarding completion, Header, post-auth |
| Post-auth fallback | `lib/post-auth-redirect.ts` — falls back to `"/studio"` | Must become role-aware canonical paths |
| Onboarding completion | `app/onboarding/OnboardingClient.tsx` — hardcoded `/studio`, `/collector-studio`, `/institutional-studio-dashboard` | Multiple explicit replaces beyond `homePathForRole` |
| Login defaults | `components/Header.tsx` (`LOGIN_NEXT=/studio`), `DashboardNavLink.tsx`, `LandingPage/Footer.tsx` | Artist-biased; collectors/galleries get wrong `next` until Header role logic updated |
| Return path sanitizer | `lib/auth-return-path.ts` | Allows any relative path — legacy bookmarks (`?next=/collector-studio`) remain valid **only if** redirects exist post-auth |
| Per-page auth guards | Each dashboard page: session → onboarding → role mismatch (e.g. `app/studio/page.tsx` L790–798) | Must not duplicate or contradict new `app/studio/layout.tsx` guard |
| Account page self-wrap | `app/account/page.tsx` — selects shell by role + own `/login?next=/account` | Moves to `/studio/account`; duplicates layout auth logic today |
| Archive shell auth | `components/archive/PersonalArchiveShell.tsx` — `next=/personal-archive` | Must update with route move |
| Disputes redirect | `app/disputes/[id]/page.tsx` → `redirect("/account")` | Server redirect; easy to miss in grep |

### 1.3 Shell consumers outside dashboard pages

| Consumer | Notes |
|----------|-------|
| `app/registry/layout.tsx` → `SignedInCatalogueShellLayout` | Phase 1 **keeps** this; wraps registry in role shell. StudioShell refactor must preserve `catalogueActive` prop contract |
| `app/account/page.tsx`, `app/personal-archive/page.tsx` | Both embed role layouts directly — must stay consistent with StudioShell wrappers |
| `SignedInCatalogueShellLayout` | Client-side role fetch; unsigned users pass through unchanged — do not break anonymous `/registry` |

### 1.4 Collector workflow sub-routes (not in canonical table)

These stay under **`/collector-studio/*`** per spec §2.3.4 (public profiles unchanged; workflows not listed):

- `/collector-studio/artwork/[registry_id]`
- `/collector-studio/claim-ownership`
- `/collector-studio/continue-provenance`

**Hidden coupling:** `next.config.ts` already redirects `/studio/artwork/:id` → `/collector-studio/artwork/:id`. After Phase 1, `/studio` becomes a namespace — that redirect remains valid but Header “studio active” detection using `pathname.startsWith("/collector-studio")` will highlight studio chrome on **public** collector profile pages for signed-in users.

### 1.5 Operational / QA dependencies

| Item | Risk |
|------|------|
| `npm run validate:system` / `validate:replay` | Exist in `package.json`; required gate (RP baseline) |
| `register_artwork_atomic` not in repo migrations | RP-1 fails on fresh DB; not Phase 1 code but blocks staging smoke |
| Personal archive migration | RP-9 blocked until `20260531160000` + `20260531160100` applied |
| Account lifecycle migration | RP-13 blocked until `20260531120000` |

### 1.6 In-flight WIP (critical merge dependency)

**137 uncommitted modified files** overlap Phase 1 directly:

- Shell layouts + activity feed (`WorkspaceSidebarActivityFeed`, `useAccountActivityFeed`)
- `appendPersonalArchiveNavItem` wired into all three dashboards
- Large `lib/locale-messages.ts` + new i18n modules (`activity-i18n`, `workspace-nav-i18n`, etc.)
- `app/studio/page.tsx`, collector/institutional dashboard pages

Phase 1 PRs will fight this WIP unless it is **landed or rebased first**. Treat as **PR‑Pre** (not in spec, but required for clean execution).

---

## 2. Route conflicts

### 2.1 Next.js App Router structure

Phase 1 requires simultaneously:

- `app/studio/layout.tsx` (auth guard — wraps all `/studio/*`)
- `app/studio/page.tsx` at `/studio` → redirect to `/studio/creative`
- `app/studio/creative/page.tsx` (content from current `app/studio/page.tsx`)

**Conflict:** `app/studio/page.tsx` today is the full creative dashboard (~3,400 lines), not a redirect stub. RT-1 is a **move + shrink**, not an additive file. Until move completes, you cannot add sibling routes without restructuring the directory.

**Mitigation (within spec):** Move creative content to `app/studio/creative/page.tsx`, replace root `app/studio/page.tsx` with server redirect (or `next.config` entry).

### 2.2 Existing `next.config.ts` redirects vs Phase 1 targets

| Existing redirect | Current destination | Phase 1 must become |
|-------------------|---------------------|----------------------|
| `/dashboard` | `/studio` | `/studio/creative` (chain or replace) |
| `/gallery-dashboard` | `/institutional-studio-dashboard` | `/studio/organisation` |
| `/studio/artwork/:registry_id` | `/collector-studio/artwork/:registry_id` | **Keep** — unrelated to `/studio/creative` |

**New redirects required (spec §4.4):**

| Legacy | Canonical |
|--------|-----------|
| `/studio` | `/studio/creative` |
| `/collector-studio` (exact) | `/studio/collector` |
| `/institutional-studio-dashboard` | `/studio/organisation` |
| `/account` | `/studio/account` |
| `/personal-archive` | `/studio/archive` |

### 2.3 Prefix collision risks

| Scenario | Severity | Notes |
|----------|----------|-------|
| Redirect `/collector-studio` catches public `/collector-studio/[slug]` | **High if misconfigured** | Next.js `source: "/collector-studio"` is exact-match only — safe. Do **not** use `/collector-studio/:path*` catch-all |
| `/studio` redirect vs `/studio/artwork/*` | **Low** | Existing redirect is `/studio/artwork/:registry_id` — more specific; evaluate order in `redirects()` array |
| Dual pages during transition | **Medium** | If new routes ship before legacy removed, duplicate content at two URLs until redirect PR lands |
| `app/account/page.tsx` vs `app/studio/account/page.tsx` | **Medium** | Same for personal-archive — only one should serve; other must redirect |

### 2.4 Paths explicitly unchanged (must not break)

- `/registry/*`, `/artwork/*`, `/verify/*`
- `/onboarding`, `/login`, `/signup`
- `/admin`, `/internal/*`
- Public profiles: `/artist/[slug]`, `/institutional-studio/[slug]`, `/collector-studio/[slug]`
- `/institutional-studio/onboarding` (separate from organisation dashboard)

### 2.5 Header active-state logic

`Header.tsx` treats `/studio`, `/collector-studio`, `/institutional-studio-dashboard`, `/account`, `/personal-archive` as “studio context.” After restructure, active detection must use `/studio/*` prefix **without** falsely matching public `/collector-studio/[slug]` — needs pathname segment check, not bare `startsWith("/collector-studio")`.

---

## 3. Authentication risks

| Risk | Description | Severity | Mitigation (within spec) |
|------|-------------|----------|--------------------------|
| **No server-side studio guard today** | `middleware.ts` only refreshes session + gates `/admin`/`/internal` | Medium | AG-1: `app/studio/layout.tsx` guard — choose server vs client deliberately to avoid hydration flash |
| **Triple guard duplication** | Layout guard + per-page `useEffect` auth + account/archive shells | Medium | After route move, remove redundant page-level session checks; keep role/onboarding logic in one place (AG-2, AG-3) |
| **Role mismatch centralization** | Three pages each redirect wrong roles differently | High | Extract shared `resolveStudioHomeForRole(role)` used by layout + pages during transition |
| **Artist-biased login `next`** | `LOGIN_NEXT=/studio` for all roles in Header/Footer | Medium | RT-10: role-aware or canonical post-auth via `homePathForRole` |
| **`sanitizeAuthReturnPath` accepts legacy paths** | `?next=/account` works but is not canonical | Low | Acceptable if permanent redirects exist; document one-hop redirect after login |
| **Onboarding bypass** | Incomplete onboarding must hit `/onboarding` from `/studio/*` | High | AG-3 must call `getOnboardingRedirectPath` — same as pages do today |
| **Signed-in catalogue shell** | `SignedInCatalogueShellLayout` loads role without redirect | Low | Correct for `/registry`; do not apply studio layout guard to `/registry` |
| **Sign-out `next` params** | Shell layouts encode legacy paths in sign-out/login links | Medium | RT-12 — update all three layouts |
| **Account lifecycle** | Deactivate/export APIs unaffected by routes; dispute page server redirect to `/account` | Low | Update redirect target to `/studio/account` in route PR |

---

## 4. Migration risks

Phase 1 ships **no new migrations**; it depends on five existing ones (spec §2.6.1):

| Migration | Blocks |
|-----------|--------|
| `20260531120000_account_lifecycle.sql` | RP-13, account page |
| `20260531140000_registry_integrity_hardening.sql` | RP-5, RP-6 |
| `20260531150000_registry_audit_followup.sql` | RP-4, RP-8 |
| `20260531160000_personal_archive.sql` | RP-9 |
| `20260531160100_personal_archive_postgrest_reload.sql` | RP-9 API (PGRST205) |

| Risk | Impact |
|------|--------|
| **Prod not migrated** | Personal archive shows “not available on this environment”; RP-9 fails; AC-M2 fails |
| **Migrations forward-only** | Rollback = revert app only; DB stays migrated — acceptable per spec §4.7 |
| **Deploy order violation** | App with `/studio/archive` before RPC exists → 503/PGRST errors |
| **Missing baseline DDL / `register_artwork_atomic`** | Fresh staging cannot run RP-1; parallel track, not Phase 1 code |
| **PostgREST cache stale** | RPCs exist in DB but API returns PGRST202 — requires reload migration or manual notify |

**Recommended gate:** Spec deploy ordering (§2.6.4) — migrations → PostgREST → smoke RP-1–9 → Phase 1 app → full smoke + redirect checks.

---

## 5. Merge conflict hotspots

Given **137 files** already modified on the working branch, these files are **Tier 1** (near-certain conflicts if Phase 1 starts in parallel):

| Tier | Files | Why |
|------|-------|-----|
| **T1 — Monoliths** | `app/studio/page.tsx`, `app/collector-studio/page.tsx`, `app/institutional-studio-dashboard/page.tsx` | Shell extraction + route move + WIP activity/archive nav |
| **T1 — Shells** | `ArtistWorkspaceShellLayout.tsx`, `CollectorWorkspaceShellLayout.tsx`, `GalleryWorkspaceShellLayout.tsx`, `WorkspaceShell.tsx` | StudioShell + footer links + activity feed |
| **T1 — i18n** | `lib/locale-messages.ts` (~7,000 lines) | Terminology + existing locale WIP |
| **T1 — Global nav** | `components/Header.tsx` | Studio href, active states, login next |
| **T1 — Account** | `app/account/page.tsx`, `components/account/AccountPageContent.tsx` | Route move + shell + navigateToStudioSection |
| **T2 — Nav helpers** | `lib/studio-workspace-nav.ts`, `lib/collector-workspace-nav.ts`, `lib/gallery-workspace-nav.ts`, `lib/personal-archive-nav.ts`, `lib/onboarding.ts`, `lib/post-auth-redirect.ts` | Route PR grep |
| **T2 — Onboarding/auth** | `app/onboarding/OnboardingClient.tsx`, `app/login/LoginClient.tsx`, `app/signup/SignupClient.tsx`, `components/DashboardNavLink.tsx` | Post-auth paths |
| **T2 — Config** | `next.config.ts`, `middleware.ts` (if extended) | Redirects / optional matcher |
| **T3 — Collateral** | `components/get-started/GetStartedView.tsx`, `components/Studio/StudioActivityFeed.tsx`, hero components, `app/disputes/[id]/page.tsx` | Terminology + deep links |

**Recommendation:** Land or split the current WIP (activity feed, personal archive nav, locale batch) **before** opening Phase 1 PR1. Otherwise StudioShell PR will be unreviewable.

---

## 6. Recommended PR breakdown

Aligned to spec dependency map (§5): **MIG → NAV/Term → SHELL → Routes + Auth → QA**.

### Implementation sequence

| Order | PR | Scope | Est. size | Complexity | Est. effort | Depends on |
|-------|-----|-------|-----------|------------|-------------|------------|
| **0** | **PR0 — P0 migrations (ops)** | Apply 5 migrations + PostgREST reload on staging/prod; verify SQL probes | **S** (~0 app LOC) | **Low** | 0.5–1 day | — |
| **Pre** | **PR‑Pre — Stabilize WIP** | Land 137-file batch (activity feed, archive nav, locale) or rebase onto main | **XL** | **Medium** | 1–2 days review | — |
| **1** | **PR1 — `lib/studio-nav`** | SS-2: consolidate `*-workspace-nav.ts`, merge `personal-archive-nav`, export builders; **no route URL changes yet** | **M** (~600–900 LOC) | **Medium** | 2–3 days | PR‑Pre |
| **2** | **PR2 — StudioShell extraction** | SS-1, SS-3–6: `StudioShell.tsx`, thin layout wrappers, dashboard pages drop inline `WorkspaceShell`/`useMemo` nav; **legacy URLs unchanged** | **L** (~1,500–2,500 LOC touched) | **High** | 4–6 days | PR1 |
| **3** | **PR3 — Terminology layer** | TM-1–6: `lib/studio-terminology.ts`, locale keys, Header/get-started/signup/account chrome only | **L** (mostly `locale-messages.ts`) | **Med–High** | 2–4 days | PR‑Pre; can overlap PR2 tail |
| **4** | **PR4 — Route restructure + redirects** | RT-1–13: move pages under `app/studio/*`, `next.config` redirects, update `homePathForRole`, grep pass, hero/footer links | **L** (~80–120 files touched) | **High** | 3–5 days | PR2 |
| **5** | **PR5 — Studio layout auth guard** | AG-1–3: `app/studio/layout.tsx`, dedupe page guards, role/onboarding redirects | **M** (~200–400 LOC) | **Med–High** | 2–3 days | PR4 |
| **6** | **PR6 — QA gate & baseline** | Run RP-1–14, `validate:system`, `validate:replay`, redirect matrix, capture baseline artifacts | **S** (docs + execution) | **Low** | 1–2 days staging | PR0, PR5 |

**Total engineering estimate:** ~15–24 days sequential; PR3 can run in parallel with late PR2 once nav module exists.

### PR sizing key

| Label | Typical diff | Review load |
|-------|--------------|-------------|
| **S** | < 200 LOC or ops-only | < 1 hour |
| **M** | 200–800 LOC | 2–4 hours |
| **L** | 800–2,500+ LOC | 4–8 hours |
| **XL** | WIP landing / multi-concern | Full-day review |

### Why this order

1. **PR0 first** — RP-9 and RP-13 cannot pass without DB; no point merging studio work against broken archive/lifecycle.
2. **PR1 before PR2** — Nav consolidation de-risks the monolith refactor (AC-S2).
3. **PR2 before PR4** — Shell stable at legacy URLs first; route move is then mostly file moves + grep (spec: SHELL → Routes).
4. **PR3 parallel-friendly** — Mostly locale; conflicts with PR2 if both touch same chrome strings — sequence PR3 after or tightly coordinate with PR2.
5. **PR5 after PR4** — Auth guard on `app/studio/layout.tsx` only applies once routes live under `/studio/*`; avoids guarding legacy paths twice.
6. **PR6 last** — Full acceptance criteria (AC-S1–AC-M3) validated once.

### Optional split (if review bandwidth limited)

- **PR4a:** Add new canonical routes (dual-serve) — *not in spec; only if team needs straddle*
- **PR4b:** Redirects + remove legacy page files — spec-compliant approach in one PR preferred

### What each PR must **not** do (scope guard)

- No Field routes, Practice, Sector, Projects, Briefs, Programmes
- No `SignedInCatalogueShellLayout` removal from `/registry`
- No DB role/table renames
- No ledger RPC/RLS changes

---

## 7. Feasibility verdict by workstream

| Workstream | Feasible? | Primary risk |
|------------|-----------|--------------|
| StudioShell extraction | **Yes** | Monolith size; regression in ownership/representation modals |
| Terminology layer | **Yes** | `locale-messages.ts` merge conflicts; incomplete DE/FR/JA |
| Route restructuring | **Yes** | Collector sub-routes + redirect ordering; grep completeness |
| Navigation architecture | **Yes** | Depends on PR1; sessionStorage path updates |
| Registry preservation QA | **Yes** | Blocked by PR0 + monolith refactor quality |
| Migration dependencies | **Yes (ops)** | Prod apply status unknown — treat as release gate |

---

## 8. Go / no-go checklist

Before starting PR1:

- [ ] P0 migrations applied on **staging** (minimum)
- [ ] Current 137-file WIP landed or rebased (PR‑Pre)
- [ ] Baseline RP registry IDs + `validate:system` output captured (spec §2.5.4)
- [ ] Redirect matrix reviewed for `/collector-studio/*` sub-routes
- [ ] Owner assigned for grep pass (`RT-13`) — expect 80+ references

Phase 1 is **go** once PR0 and PR‑Pre are complete. The spec is implementable without scope or architecture changes; execution success depends on **migration gating**, **WIP reconciliation**, and **keeping route + auth PRs atomic and well-tested**.