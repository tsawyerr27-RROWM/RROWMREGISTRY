# Phase 1 Release Candidate — Sign-off Record

**RC branch:** `pr/phase1-acceptance`  
**Base:** `main` @ `bc18df3` (includes `checkpoint-phase1-routes`, `checkpoint-phase1-auth`)  
**Date:** 2026-06-04  

---

## 1. Automated gate results (local / CI)

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** | |
| Production build | `npm run build` | **PASS** | Canonical `/studio/*` routes in build output |
| Static acceptance | `npx tsx scripts/phase-1-static-acceptance.ts` | **PASS** | P-05, P-06, R-stubs, AC-R3, E-01/E-02, page dedupe |
| Redirect smoke | `./scripts/phase-1-redirect-smoke.sh` | **STAGING** | Run on staging URL after deploy; local `/studio` is 200 without session (layout guard) |
| System validation | `npm run validate:system` | **PENDING** | Requires `DATABASE_URL` + validation user IDs on staging |
| Historical replay | `npm run validate:replay` | **PENDING** | Requires `DATABASE_URL` + `REPLAY_ARTWORK_IDS` |
| ESLint | `npm run lint` | **WARN** | Repo-wide legacy issues; not introduced by Phase 1 |

Artifacts:

- `docs/v2/baselines/static-acceptance-latest.json` (copy from CI)
- `docs/v2/baselines/redirect-smoke-20260604.txt` (partial local run)

---

## 2. Phase 1 PR completion

| PR | Scope | Status on `main` |
|----|-------|------------------|
| PR0 | Migrations (pre-req) | Ops — verify on env |
| PR-Pre | Activity feed / i18n | Merged |
| PR1 | `lib/studio-nav` | Merged |
| PR2 | `StudioShell` | Merged |
| PR3 | Terminology | Merged |
| PR4 | Canonical routes + redirects | Merged — tag `checkpoint-phase1-routes` |
| PR5 | Layout auth guard + dedupe | Merged — tag `checkpoint-phase1-auth` |
| PR6 | Acceptance gate (this doc + scripts) | In progress |

---

## 3. Acceptance criteria summary

| Group | Local static / build | Staging manual |
|-------|----------------------|----------------|
| AC-S1–S7 StudioShell | Code structure OK | Required |
| AC-T1–T4 Terminology | Grep / locale keys | Required |
| AC-R1–R7 Routes | Static + redirect smoke | Required |
| AC-N1–N4 Navigation | — | Required |
| AC-P1–P4 Registry | — | RP + validate:system |
| AC-M1–M3 Migrations | — | SQL + API smoke |

---

## 4. Staging blockers before production

1. Apply five migrations (spec §2.6.1) and PostgREST reload.
2. Run `validate:system` and archive JSON under `docs/v2/baselines/`.
3. Complete §4 checklists in [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md).
4. Run redirect smoke against staging base URL.
5. RP-1–RP-8 minimum before prod; full RP-1–14 recommended.

---

## 5. Sign-off

| Role | Name | Date | RC approved |
|------|------|------|-------------|
| Engineering | | | ☐ |
| QA | | | ☐ |
| Product | | | ☐ |

**Tag `checkpoint-phase1-rc` when staging gates pass.**
