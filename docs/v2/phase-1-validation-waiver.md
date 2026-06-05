# Phase 1 Production Certification — Validation Waiver

**Document status:** ACTIVE (sign-off artifact)  
**Effective:** 31 May 2026  
**Authority:** [Phase 1 Acceptance Gate](./phase-1-acceptance-gate.md) §2, [Phase 1 Closure Report](./phase-1-closure-report.md), [Production Readiness Execution](./production-readiness-execution.md)  
**Scope:** Waives automated `validate:system` and `validate:replay` as **Phase 1 production certification blockers** only. Does not unlock Phase 2 scope or modify locked acceptance criteria in the Phase 1 Specification.

**Checkpoints on ancestry:** `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`

---

## 1. Executive summary

Phase 1 **Studio Foundation** is **production-certified** for live operation based on operator validation on the current Vercel + Supabase stack. Studio, public Registry, Creative artwork registration, Supabase connectivity, canonical route migration, and namespace auth guard all **PASS** on production.

Automated database gates **`npm run validate:system`** and **`npm run validate:replay`** do **not** pass in the current harness configuration. Investigation confirms both failures are **validation-tooling defects** (JWT session simulation, transaction handling, schema drift in the replay validator)—**not** production authorization or registration regressions.

This document **formally waives** `validate:system` and `validate:replay` as requirements for **Phase 1 production certification** and **`checkpoint-phase1-production`**, subject to the risk assessment and follow-up remediation in §7.

**Production is authorized to operate Phase 1.** Automated DB gates remain **required follow-up** before waivers are lifted.

---

## 2. Production evidence

| Area | Result | Notes |
|------|--------|-------|
| **Studio (production)** | **PASS** | Canonical `/studio/*`, shells, layout auth guard |
| **Registry (production)** | **PASS** | Public explorer and record pages |
| **Creative registration (RP-1 manual)** | **PASS** | `register_artwork_atomic` via browser session |
| **Supabase connectivity** | **PASS** | App env configured; `/registry` 200 |
| **Route migration (PR4)** | **PASS** | Tag `checkpoint-phase1-routes`; redirect smoke archived (staging) |
| **Auth guard (PR5)** | **PASS** | Tag `checkpoint-phase1-auth`; static acceptance PASS |
| **RC code gate (PR6)** | **PASS** | Tag `checkpoint-phase1-rc`; `validate:phase1-static` archived |
| **Browser extension noise** | **Excluded** | False failures removed from manual QA analysis |

**Supporting artifacts:** `docs/v2/baselines/static-acceptance-20260604.json`, `redirect-smoke-staging-vercel-20260604.txt`, `rp-supabase-smoke-20260604.json` (partial; RP-1 manual supersedes automated row).

**Database prerequisites applied (operator):** Artist `gallery_id` linked to representation gallery; gallery `verified = true` for validation-user pairing (supports gallery-verify paths; not required for manual Creative self-register PASS).

---

## 3. `validate:system` waiver

### Waiver statement

> **`validate:system` is WAIVED for Phase 1 production certification and `checkpoint-phase1-production`.**  
> Failure does not indicate a production defect. Manual Creative registration **PASS** on production is the authoritative registry-preservation evidence for RP-1.

### Gate status

| Check | Result |
|-------|--------|
| RPC existence (`check_required_rpcs`) | **PASS** on production DB |
| Schema dependencies | **PASS** |
| Hardening (when flows do not abort txn) | **PASS** |
| `artwork_lifecycle` full flow | **FAIL** (harness) |
| `pass: true` baseline archived | **No** |

### Modes investigated

| Mode | Outcome |
|------|---------|
| Default (`VALIDATION_ROLLBACK` unset) | `artwork_lifecycle` → `exception: Not authorized` |
| `VALIDATION_ROLLBACK=1` | Process exits: `current transaction is aborted, commands ignored until end of transaction block` |

---

## 4. `validate:replay` waiver

### Waiver statement

> **`validate:replay` is WAIVED for Phase 1 production certification and `checkpoint-phase1-production`.**  
> Failure is due to validator/schema drift. Replay CLI is not executed in production user flows.

### Gate status

| Check | Result |
|-------|--------|
| `DATABASE_URL` + `REPLAY_ARTWORK_IDS` configured | Yes (operator) |
| Replay completes | **FAIL** — `created_at` column expected on `public.certificates`; absent on production schema |
| `pass: true` baseline archived | **No** |

**Sample IDs:** `docs/v2/baselines/replay-registry-ids.txt`

---

## 5. Root-cause analysis summaries

### 5.1 `validate:system` — default mode

| Item | Detail |
|------|--------|
| **First failing RPC** | `public.add_value_event(...)` |
| **Error** | `Not authorized` |
| **Mechanism** | `add_value_event` requires `artworks.artist_id = auth.uid()`. Runner sets JWT via `set_config('request.jwt.claim.sub', $user, **true**)` (transaction-local). Node-pg **autocommit per query** discards JWT before the RPC runs → `auth.uid()` is **null**. |
| **Why register still passes** | `register_artwork_atomic` uses parameter `p_artist_id`, not `auth.uid()`. |
| **Production impact** | **None** — Supabase client supplies a real session JWT on every RPC. |
| **Location** | `lib/system-validation-runner.ts` (`setJwtSub`, `runArtworkLifecycleFlow` ~1409); `scripts/run-system-validation.ts` (no wrapping transaction in default mode). |

### 5.2 `validate:system` — rollback mode

| Item | Detail |
|------|--------|
| **BEGIN issued** | `scripts/run-system-validation.ts` line 45 when `VALIDATION_ROLLBACK=1` |
| **First exception (root)** | `insert or update on table "artworks" violates foreign key constraint "artworks_artist_id_fkey"` — SQLSTATE **`23503`** |
| **RPC** | `register_artwork_atomic` with intentional bad artist `00000000-0000-0000-0000-000000000097` in `runRegisterAtomicFailureProbe` |
| **Secondary symptom** | `current transaction is aborted...` — SQLSTATE **`25P02`** on next query after caught failure (no `SAVEPOINT` / no txn recovery) |
| **`artwork_lifecycle` reached?** | **No** — transaction poisoned before lifecycle |
| **Production impact** | **None** — atomicity probe not run in production. |
| **Location** | `runRegisterAtomicFailureProbe` ~417–445; invoked from `runSystemValidation` ~2003 before lifecycle. |

### 5.3 `validate:replay`

| Item | Detail |
|------|--------|
| **Failure** | SQL error: column `created_at` does not exist (on `public.certificates` per validator query) |
| **Mechanism** | `lib/historical-replay-validator.ts` selects `certificates.created_at` and orders by `coalesce(issued_at, created_at)`; production schema uses **`issued_at`** without **`created_at`** on certificates. |
| **Production impact** | **None** — replay validator is CI/ops tooling only. |
| **Class** | Validation harness / schema drift |

---

## 6. Risk assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Undetected DB/RPC regression in prod | **Low** | Manual Studio/Registry/register PASS; RPC smoke (RP-3,4,6,7,9–13) historically PASS; ongoing monitoring |
| False confidence from waived automated gates | **Medium** | Documented waivers; harness remediation tracked; baselines to be archived post-fix |
| Legacy integrity drift on old artworks | **Medium** (ops) | Separate from waiver; `system_integrity_report` may flag ownership/verification mismatches on seed data—does not invalidate prod UX validation |
| Fresh-environment reproducibility (`register_artwork_atomic` not in repo migrations) | **Medium** (engineering) | Parallel baseline DDL track; not a Phase 1 Studio blocker |
| Re-play / audit tooling unavailable until replay fix | **Low** | No user-facing feature depends on `validate:replay` at runtime |

**Overall:** Waiving automated gates for **production certification** is **acceptable** given manual production evidence and localized harness root causes. **Unacceptable** as a permanent substitute for fixing the validation runner—remediation required before lifting waivers.

---

## 7. Follow-up remediation requirements

| ID | Owner | Requirement | Exit criterion |
|----|-------|-------------|----------------|
| R-1 | Engineering | Fix JWT propagation in `validate:system` (transaction wrap and/or session-scoped `set_config`, or single-statement RPC batches) | `artwork_lifecycle` completes without `Not authorized` in default mode |
| R-2 | Engineering | Fix rollback-mode transaction handling: `SAVEPOINT` around `runRegisterAtomicFailureProbe` or run probe outside `BEGIN` | `VALIDATION_ROLLBACK=1 npm run validate:system` emits full JSON report |
| R-3 | Engineering | Align `historical-replay-validator` with live `certificates` schema (`issued_at` vs `created_at`) | `npm run validate:replay` completes with `replay_pass: true` on `replay-registry-ids.txt` |
| R-4 | Engineering | Archive baselines: `validate-system-YYYYMMDD.json`, `validate-replay-YYYYMMDD.json` under `docs/v2/baselines/` | Artifacts show `pass: true` / `replay_pass: true` |
| R-5 | Product/QA | Update `phase-1-rc-signoff.md` production column with waiver reference | Sign-off rows completed |
| R-6 | Engineering (parallel) | Add `register_artwork_atomic` to repo migrations for reproducible fresh DBs | `rpc_defined_in_repo.register_artwork_atomic: true` |

**Waiver lift:** When R-1 through R-4 are satisfied, amend this document status to **SUPERSEDED** and remove waiver from sign-off.

---

## 8. Recommendation for `checkpoint-phase1-production`

### Recommendation

**Approve `checkpoint-phase1-production`** on `main` at the current production-certified commit, **with this waiver package attached**, when:

1. Product and QA sign §9 below (or equivalent ticket sign-off).
2. Remaining ops items from [production-readiness-execution.md](./production-readiness-execution.md) are confirmed or separately waived (cron 401, email evidence, prod redirect smoke archive—if not already done).

**Do not** treat waived `validate:system` / `validate:replay` as evidence of production failure.

**Do** treat harness remediation (§7) as **Phase 1.1 ops debt** before lifting waivers.

### Tag command (after sign-off)

```bash
git tag -a checkpoint-phase1-production -m "Phase 1 Studio Foundation: production-certified with validation waivers (see docs/v2/phase-1-validation-waiver.md)"
git push origin checkpoint-phase1-production
```

---

## 9. Sign-off

| Role | Name | Date | Production certified | Waiver approved |
|------|------|------|----------------------|-----------------|
| Engineering | | | ☐ | ☐ |
| QA | | | ☐ | ☐ |
| Product | | | ☐ | ☐ |

**Certification statement (when signed):**

> Phase 1 Studio Foundation is **production-certified** as of __________. Automated `validate:system` and `validate:replay` are **waived** per [phase-1-validation-waiver.md](./phase-1-validation-waiver.md). Production validation: Studio **PASS**, Registry **PASS**, Creative registration **PASS**. **`checkpoint-phase1-production`** is authorized.

---

## References

| Document | Role |
|----------|------|
| [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md) | Original gate requiring `validate:system` / `validate:replay` |
| [phase-1-closure-report.md](./phase-1-closure-report.md) | Blocker reassessment after production validation |
| [environment-variable-inventory.md](./environment-variable-inventory.md) | Ops env truth |
| [production-readiness-execution.md](./production-readiness-execution.md) | Deploy and tag checklist |
