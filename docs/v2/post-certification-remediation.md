# Phase 1 Post-Certification Remediation Track

**Document status:** ACTIVE  
**Effective:** 31 May 2026  
**Authority:** [Phase 1 Validation Waiver](./phase-1-validation-waiver.md) §7, [Phase 1 Production Signoff](./phase-1-production-signoff.md), [Phase 1 Acceptance Gate](./phase-1-acceptance-gate.md) §2  
**Checkpoint:** `checkpoint-phase1-production` @ `d5e6c4e` — production operation **authorized**; items below are **not** production blockers.

---

## Purpose

This document captures all remaining **engineering and validation-harness work** after Phase 1 production certification. None of these items block live Studio, Registry, or Creative registration on production.

Work is grouped into five workstreams. Each item maps to waiver remediation IDs (R-1–R-6) where applicable. Completion of **waiver lift** items (Workstreams A, B, E) restores full acceptance gate §2 automated gates.

**Production truth:** Manual operator validation and browser-session RPC calls remain authoritative until green baselines are archived.

---

## Workstream A — Validation Harness

**Goal:** `npm run validate:system` completes with `pass: true` on production-linked `DATABASE_URL` without false `Not authorized` or transaction-abort exits.

### A.1 JWT transaction persistence (R-1)

| Field | Detail |
|-------|--------|
| **Problem** | `setJwtSub` uses `set_config('request.jwt.claim.sub', $user, **true**)` (transaction-local). Node-pg autocommit per query drops JWT before `add_value_event` → `auth.uid()` null → `Not authorized`. |
| **First failure** | `public.add_value_event(...)` in `artwork_lifecycle` |
| **Why register passes** | `register_artwork_atomic` uses `p_artist_id`, not `auth.uid()`. |
| **Production impact** | **None** — Supabase client supplies real session JWT. |
| **Location** | `lib/system-validation-runner.ts` (`setJwtSub`, `runArtworkLifecycleFlow`); `scripts/run-system-validation.ts` (default mode: no wrapping transaction). |
| **Remediation options** | (1) Wrap lifecycle in explicit `BEGIN`/`COMMIT` on one client; (2) use session-scoped `set_config(..., false)` with cleanup; (3) batch JWT + RPC in single SQL statement. |
| **Exit criterion** | `artwork_lifecycle` completes without `Not authorized` in default mode (`VALIDATION_ROLLBACK` unset). |

### A.2 SAVEPOINT handling for rollback validation (R-2)

| Field | Detail |
|-------|--------|
| **Problem** | `VALIDATION_ROLLBACK=1` opens `BEGIN` at `scripts/run-system-validation.ts:45`. `runRegisterAtomicFailureProbe` intentionally triggers FK `23503` on bad artist id; caught but transaction **aborted** → `25P02` on next query; process exits before JSON report. |
| **Symptom** | `current transaction is aborted, commands ignored until end of transaction block` |
| **`artwork_lifecycle` reached?** | **No** — txn poisoned before lifecycle. |
| **Production impact** | **None** — probe not run in production. |
| **Location** | `runRegisterAtomicFailureProbe` ~417–445; invoked before lifecycle in `runSystemValidation` ~2003. |
| **Remediation options** | (1) `SAVEPOINT` before probe + `ROLLBACK TO SAVEPOINT` on expected failure; (2) run atomicity probe outside `BEGIN`; (3) use separate client for destructive probe. |
| **Exit criterion** | `VALIDATION_ROLLBACK=1 npm run validate:system` emits full JSON report (no `25P02` abort). |

### A.3 Validation runner transaction design

| Field | Detail |
|-------|--------|
| **Problem** | Default and rollback modes have inconsistent transaction boundaries; concurrency tests skipped in rollback mode; RLS hardening probes may be skipped when session role bypasses RLS. |
| **Scope** | Unify design: document when JWT must be transaction-local vs session-scoped; when probes may abort shared txn; how `VALIDATION_SKIP_FLOWS` interacts with integrity-only runs. |
| **Related** | `VALIDATION_STRICT_RLS`, `VALIDATION_STRICT_REPRODUCIBILITY`, `VALIDATION_SKIP_FLOWS` flags in runner header. |
| **Exit criterion** | Runner README / header documents txn model; default + rollback modes both produce comparable JSON schema; no silent skip without logged reason. |

### A.4 RP smoke probe alignment (parallel)

| Field | Detail |
|-------|--------|
| **Problem** | `scripts/phase-1-rp-supabase-smoke.ts` calls `register_artwork_atomic` with `{ p_payload: {} }`; production UI uses named params (`p_artist_id`, etc.). Automated RP-1 **FAIL** is false negative. |
| **Remediation** | Align smoke script with live RPC signature; re-archive `rp-supabase-smoke-YYYYMMDD.json`. |
| **Exit criterion** | RP-1 row **PASS** in automated smoke against production-linked project. |

---

## Workstream B — Replay Validator

**Goal:** `npm run validate:replay` completes with `replay_pass: true` on `docs/v2/baselines/replay-registry-ids.txt`.

### B.1 Schema alignment (R-3)

| Field | Detail |
|-------|--------|
| **Problem** | `lib/historical-replay-validator.ts` selects `certificates.created_at` and orders by `coalesce(issued_at, created_at)`. Production `public.certificates` has **`issued_at`** only — no `created_at` column. |
| **Error class** | Validation harness / schema drift |
| **Production impact** | **None** — replay CLI is ops tooling only. |
| **Location** | `lib/historical-replay-validator.ts` ~109–123. |

### B.2 `created_at` / `issued_at` reconciliation

| Field | Detail |
|-------|--------|
| **Decision required** | (1) Validator uses `issued_at` only for certificates; or (2) migration adds `created_at` to certificates for audit symmetry. **Prefer (1)** — matches live prod schema; no ledger behaviour change. |
| **Other tables** | `ownership_events`, `value_events`, `verification_events` use `created_at` — confirm column names unchanged on prod before replay run. |
| **Exit criterion** | Replay query set matches live `information_schema.columns` for all touched tables. |

### B.3 Replay baseline regeneration (R-4, partial)

| Field | Detail |
|-------|--------|
| **Command** | `REPLAY_ARTWORK_IDS=$(paste -sd, docs/v2/baselines/replay-registry-ids.txt) npm run validate:replay \| tee docs/v2/baselines/validate-replay-YYYYMMDD.json` |
| **Prerequisites** | `DATABASE_URL`; B.1–B.2 complete |
| **Exit criterion** | Archived baseline shows `replay_pass: true` |

---

## Workstream C — Registry Data Integrity

**Goal:** Understand and resolve `system_integrity_report` mismatches on legacy seed artworks without conflating harness defects with production regressions.

**Class:** Ops / data hygiene — **not** a Phase 1 production blocker (waiver risk assessment §6).

### C.1 Ownership mismatch investigation

| Field | Detail |
|-------|--------|
| **Evidence** | `docs/v2/baselines/validate-system-20260604.json` — `integrity.ownership_mismatches` (4 issues) |
| **Sample registry IDs** | `RROWM-001000`, `RROWM-001002`, `RROWM-001004`, `RROWM-MN5V2O4L-53860EF0` |
| **Pattern** | `cached_current_owner_id` vs `computed_current_owner_id` divergence (null ↔ artist uuid) |
| **Investigation** | Compare `artworks.current_owner_id` / read model cache vs `get_current_owner` / ownership_events chain per artwork; identify seed scripts, manual edits, or stale cache columns. |
| **Exit criterion** | Documented root cause per artwork; fix via data patch or cache refresh RPC; integrity section empty or accepted exceptions logged. |

### C.2 Verification mismatch investigation

| Field | Detail |
|-------|--------|
| **Evidence** | Same baseline — `integrity.verification_mismatches` (4 issues) |
| **Sample registry IDs** | `RROWM-001000`, `RROWM-001002`, `RROWM-001003`, `RROWM-001004` |
| **Pattern** | `stored_status: unverified` vs `expected_status: verified` |
| **Investigation** | Compare `artworks.verification_status` (or equivalent stored field) vs `compute_artwork_verification_status` output; check certificate + verification_events history. |
| **Exit criterion** | Stored status aligned with computed status, or legacy rows marked as accepted drift with product sign-off. |

### C.3 Historical data reconciliation

| Field | Detail |
|-------|--------|
| **Scope** | After C.1–C.2 root cause: optional one-time SQL reconciliation on non-production first; production patch only with backup + operator approval. |
| **Constraint** | No change to RPC semantics or RLS — data/cache fixes only (Phase 1 registry preservation rule). |
| **Exit criterion** | `validate:system` integrity section passes on production-linked DB, or waivers documented per-artwork in baseline notes. |

---

## Workstream D — Database Reproducibility

**Goal:** Fresh Supabase project bootstrap from `supabase/migrations/` can run RP-1 and full `validate:system` lifecycle without manual SQL Editor steps.

**Class:** Engineering debt — blocks **new environments**, not current production.

### D.1 `register_artwork_atomic` migration provenance (R-6)

| Field | Detail |
|-------|--------|
| **Problem** | RPC exists on production DB and is called from `app/studio/creative/page.tsx`; **not** present in `supabase/migrations/`. |
| **Impact** | `VALIDATION_STRICT_REPRODUCIBILITY=1` fails; fresh DB RP-1 blocked; `rpc_defined_in_repo.register_artwork_atomic: false`. |
| **Remediation** | Export canonical prod definition → new migration; PostgREST reload; verify named-param signature matches UI. |
| **Exit criterion** | `register_artwork_atomic` in repo migrations; RP-1 automated smoke **PASS** on fresh migrate. |

### D.2 `add_value_event` migration provenance

| Field | Detail |
|-------|--------|
| **Problem** | Required by `REQUIRED_RPC_NAMES` and lifecycle flow; confirm whether definition lives only in baseline DDL / manual apply vs repo migrations. |
| **Remediation** | Audit `pg_proc` on prod vs migration history; add migration if absent; document auth.uid() contract for harness after A.1 fix. |
| **Exit criterion** | RPC traceable to versioned migration; `check_required_rpcs` passes on fresh DB. |

### D.3 Baseline DDL reconciliation

| Field | Detail |
|-------|--------|
| **Context** | Feasibility review and blueprint reference parallel **baseline DDL track** for pre-Phase-1 RPCs. |
| **Remediation** | Inventory gap between blueprint P0 list (`20260531120000`–`20260531160100` applied) and full RPC surface; merge into migrations or document `supabase/manual/` apply order for greenfield. |
| **Exit criterion** | `phase-1-feasibility-review.md` §migration table satisfied on empty project; `VALIDATION_STRICT_REPRODUCIBILITY` optional gate passes. |

---

## Workstream E — Future Validation Reinstatement

**Goal:** Lift [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) and restore acceptance gate §2 in full.

### E.1 Conditions for removing waivers

All of the following must be true:

| # | Condition | Workstream |
|---|-----------|------------|
| 1 | R-1 complete — default-mode `artwork_lifecycle` passes | A.1 |
| 2 | R-2 complete — rollback mode emits full report | A.2 |
| 3 | R-3 complete — replay validator schema-aligned | B.1–B.2 |
| 4 | R-4 complete — green baselines archived | B.3, A (system baseline) |
| 5 | Product + engineering sign waiver **SUPERSEDED** | Governance |
| 6 | `phase-1-validation-waiver.md` status amended to **SUPERSEDED** | Governance |
| 7 | Interpretation rule §6 in [DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) no longer applies to automated gates | Governance |

**Not required for waiver lift (but recommended):** C (integrity), D (reproducibility), A.4 (RP smoke). These remain Phase 1.1+ ops/engineering debt.

**R-5 status:** Complete — [phase-1-rc-signoff.md](./phase-1-rc-signoff.md) and [phase-1-production-signoff.md](./phase-1-production-signoff.md) updated.

### E.2 Required green baselines

Archive under `docs/v2/baselines/` with dated filenames:

| Artifact | Required fields | Command |
|----------|-----------------|--------|
| `validate-system-YYYYMMDD.json` | `pass: true`; `artwork_lifecycle` flow pass; integrity failures resolved or documented | `npm run validate:system` |
| `validate-replay-YYYYMMDD.json` | `replay_pass: true` | `npm run validate:replay` |
| `rp-supabase-smoke-YYYYMMDD.json` (recommended) | RP-1 **PASS** | `npx tsx scripts/phase-1-rp-supabase-smoke.ts` |

**Environment:** `DATABASE_URL`, `VALIDATION_ARTIST_USER_ID`, `VALIDATION_GALLERY_USER_ID`, `VALIDATION_SECOND_OWNER_USER_ID`, `REPLAY_ARTWORK_IDS` — see [environment-variable-inventory.md](./environment-variable-inventory.md).

### E.3 Reinstatement checklist

- [ ] A.1 JWT persistence fixed and verified
- [ ] A.2 SAVEPOINT / rollback txn fixed and verified
- [ ] B.1–B.2 Replay validator aligned to prod schema
- [ ] Green `validate-system` baseline committed
- [ ] Green `validate-replay` baseline committed
- [ ] Waiver document status → **SUPERSEDED**
- [ ] Acceptance gate §2 automated gates enforced again for future releases

---

## Prioritized remediation roadmap

Ordered by **waiver lift dependency** then **risk reduction**. Estimates are engineering-focused (single developer, familiar with codebase).

### Phase 1 — Waiver lift (P0) — target: 2–4 days

| Priority | ID | Item | Owner | Effort | Depends on |
|----------|-----|------|-------|--------|------------|
| **P0.1** | R-1 | JWT transaction persistence (A.1) | Engineering | S–M (4–8 h) | — |
| **P0.2** | R-2 | SAVEPOINT for rollback probe (A.2) | Engineering | S (2–4 h) | — |
| **P0.3** | R-3 | Replay `issued_at` alignment (B.1–B.2) | Engineering | S (1–3 h) | — |
| **P0.4** | R-4 | Archive green system + replay baselines (B.3, E.2) | Engineering | S (1 h) | P0.1–P0.3 |
| **P0.5** | — | Waiver SUPERSEDED + governance update (E.1) | Product + Engineering | S (< 1 h) | P0.4 |

**Milestone:** Acceptance gate §2 automated gates **reinstated**.

### Phase 2 — Harness hardening (P1) — target: 1–2 days

| Priority | ID | Item | Owner | Effort | Depends on |
|----------|-----|------|-------|--------|------------|
| **P1.1** | — | Transaction design doc + runner consistency (A.3) | Engineering | S–M | P0.1–P0.2 |
| **P1.2** | — | RP smoke signature fix (A.4) | Engineering | S | Optional: D.1 |
| **P1.3** | — | `VALIDATION_STRICT_REPRODUCIBILITY` CI hook (optional) | Engineering | S | D.1 |

### Phase 3 — Data integrity (P2) — target: 2–5 days

| Priority | ID | Item | Owner | Effort | Depends on |
|----------|-----|------|-------|--------|------------|
| **P2.1** | — | Ownership mismatch investigation (C.1) | Engineering + Ops | M | P0.1 (lifecycle runs) |
| **P2.2** | — | Verification mismatch investigation (C.2) | Engineering + Ops | M | P0.1 |
| **P2.3** | — | Historical reconciliation or accepted drift log (C.3) | Engineering + Product | M–L | P2.1–P2.2 |

**Milestone:** `validate:system` integrity section clean on production-linked DB.

### Phase 4 — Reproducibility (P3) — parallel / background

| Priority | ID | Item | Owner | Effort | Depends on |
|----------|-----|------|-------|--------|------------|
| **P3.1** | R-6 | `register_artwork_atomic` migration (D.1) | Engineering | M–L | — |
| **P3.2** | — | `add_value_event` migration audit (D.2) | Engineering | M | — |
| **P3.3** | — | Baseline DDL reconciliation (D.3) | Engineering | L | P3.1–P3.2 |

**Milestone:** Greenfield Supabase project passes RP-1–RP-14 automated smoke without manual DDL.

---

## Summary matrix

| Workstream | Blocks production? | Blocks waiver lift? | Waiver IDs |
|------------|-------------------|---------------------|------------|
| A. Validation Harness | No | **Yes** (A.1, A.2) | R-1, R-2 |
| B. Replay Validator | No | **Yes** | R-3, R-4 |
| C. Registry Data Integrity | No | No (recommended) | — |
| D. Database Reproducibility | No | No | R-6 |
| E. Validation Reinstatement | No | **Yes** (orchestration) | R-4, R-5 ✓ |

---

## References

| Document | Role |
|----------|------|
| [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) | Active waivers and R-1–R-6 |
| [phase-1-production-signoff.md](./phase-1-production-signoff.md) | Production certification record |
| [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md) | Gate §2 to reinstate |
| [phase-1-feasibility-review.md](./phase-1-feasibility-review.md) | Migration / baseline DDL context |
| [environment-variable-inventory.md](./environment-variable-inventory.md) | Validation env vars |
| `lib/system-validation-runner.ts` | Harness implementation |
| `lib/historical-replay-validator.ts` | Replay implementation |
| `docs/v2/baselines/validate-system-20260604.json` | Investigation baseline (fail) |
| `docs/v2/baselines/validate-system-rollback-20260604.json` | Rollback investigation (abort) |
