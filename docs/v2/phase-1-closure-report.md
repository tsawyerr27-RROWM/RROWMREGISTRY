# Phase 1 Closure Report — Studio Foundation

**Date:** 31 May 2026 (review); **updated** after production validation (operator attestation)  
**Status:** **Production-ready (operator)** — formal closure and `checkpoint-phase1-production` **pending** automated baselines and sign-off  
**Authority:** [Product Blueprint v1.1](./product-blueprint-v1.1.md), [Phase 1 Specification](./phase-1-studio-foundation-spec.md) (LOCKED §3–4), [Acceptance Gate](./phase-1-acceptance-gate.md), [RC Signoff](./phase-1-rc-signoff.md)  
**Checkpoints present:** `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`  
**Checkpoints absent:** `checkpoint-phase1-production`

---

## Executive summary

Phase 1 **engineering delivery** is **complete on `main`** (`checkpoint-phase1-routes`, `-auth`, `-rc`). **Production** is **operator-validated**: Supabase connected; Studio, Registry, and **manual Creative registration (RP-1)** reported **PASS**; browser-extension noise excluded from failure analysis.

**Formal Phase 1 closure** and **`checkpoint-phase1-production`** remain **open** because:

1. **`validate:system` and `validate:replay`** — no archived `pass: true` baselines in `docs/v2/baselines/`.
2. **Automated RP-1 smoke** — still FAIL on wrong probe signature (`p_payload`); superseded by **manual RP-1 PASS**.
3. **Full RP-2–RP-14 matrix** — not fully attested in repo artifacts (unless covered inside broad “Studio/Registry PASS” — must be logged for gate §4.7).
4. **RC sign-off** — QA/Product rows and production column still unfilled in `phase-1-rc-signoff.md`.
5. **Ops evidence** — cron 401, email send, production redirect smoke archive (per `production-readiness-execution.md` §D) not confirmed in inputs.

---

## Production validation update (operator attestation)

| Input | Status | Closure effect |
|-------|--------|----------------|
| Manual Creative registration (RP-1) | **PASS** | Resolves P-01, V-05 (manual path); D.4 #16 satisfied |
| Production Studio validation | **PASS** | Resolves AC-R1–R7 / studio chrome at operator level (archive in sign-off recommended) |
| Production Registry validation | **PASS** | Resolves AC-P4, RP-10; supports RP-11 |
| Supabase connectivity | **Confirmed** | O-01 remains resolved |
| Browser extension issue | **Excluded** | AC-P3 / false failures cleared for manual QA |
| Automated `rp-supabase-smoke` RP-1 | **FAIL** (stale baseline) | **Waived** for closure when manual RP-1 PASS recorded |
| `register_artwork_atomic` not in repo migrations | **Open** (reproducibility) | Does not block prod tag if manual RP-1 PASS; blocks fresh-DB reproducibility until parallel DDL |

Blueprint v1.1 scope for Phase 1 (unified Studio, terminology, routes, registry preservation testing) is **not** blocked by Field/Practice/Opportunity work — those are explicitly Phase 2+.

---

## What is already satisfied

| Area | Evidence | Notes |
|------|----------|-------|
| Code checkpoints | Tags `checkpoint-phase1-routes`, `-auth`, `-rc` | PR4–PR6 merged per governance |
| Static acceptance | `docs/v2/baselines/static-acceptance-20260604.json` | AC-R/P-05/PR5 static checks |
| Redirect matrix (staging) | `redirect-smoke-staging-vercel-20260604.txt` | Re-run on production URL recommended |
| RPC layer smoke (partial) | `rp-supabase-smoke-20260604.json` | RP-3,4,6,7,9–13 PASS; RP-1 FAIL |
| Production HTTP (current) | Operator report | `/registry` 200; Supabase connected |
| Production Studio | Operator **PASS** | Canonical `/studio/*`, shells, auth (manual) |
| Production Registry | Operator **PASS** | Public explorer/records (manual) |
| RP-1 Creative register | Operator **PASS** | `register_artwork_atomic` path on prod |
| Blueprint alignment | Spec §1.3 out-of-scope list | No Phase 1 scope creep required for closure |

---

## Remaining blockers

### Legend

| Severity | Meaning |
|----------|---------|
| **P0** | Spec/gate explicitly requires; blocks “Phase 1 complete” declaration |
| **P1** | Required for `checkpoint-phase1-production` per [production-readiness-execution.md](./production-readiness-execution.md) §D |
| **P2** | Recommended; waivable with documented Product/QA approval |

| Blocks `checkpoint-phase1-production`? | Meaning |
|----------------------------------------|---------|
| **Yes** | Tag must not ship until resolved or formally waived in sign-off |
| **Conditional** | Waivable only with written waiver (e.g. RP-1 RPC gap) |
| **No** | Does not block tag; still blocks full “Phase 1 complete” if P0 |

---

## 1. Product blockers

| ID | Blocker | Severity | Owner | Effort | Blocks prod tag? |
|----|---------|----------|-------|--------|------------------|
| P-01 | **RP-1 not passable** — Creative register artwork depends on `register_artwork_atomic`; RPC absent from PostgREST schema | P0 | Product + Engineering (parallel DDL track) | **M** (migration/RPC delivery, not Phase 1 app) | **Conditional** — gate §4.7 lists RP-1 prod smoke; runbook allows **waiver** if Product accepts degraded register path on prod |
| P-02 | **AC-P1 incomplete** — spec §3.5 requires RP-1–RP-14 pass on staging post-deploy; only automated subset + partial manual recorded | P0 | QA | **L** (2–4 h structured smoke) | **Yes** until matrix filled or waived |
| P-03 | **Manual registry journeys not signed** — RP-2, RP-5, RP-8, RP-14 (and RP-4/11 UI paths) deferred in RPC smoke to “manual staging QA” | P1 | QA | **L** (half-day role sessions) | **Yes** for full RP set; **Conditional** for minimal prod subset (RP-2,4,9,10) |
| P-04 | **Studio chrome / terminology not QA-signed** — acceptance gate §4.1–4.3, AC-S1–S7, AC-T1–T4, AC-N1–N4 unchecked in any sign-off artifact | P1 | QA | **M** (1 day device + i18n spot check) | **No** for tag if Engineering accepts risk; **Yes** for formal Phase 1 complete per gate §1.3 |
| P-05 | **RC sign-off incomplete** — QA and Product rows empty; “RC approved for production deploy” unchecked (acceptance gate §6) | P0 | Product + QA | **S** (< 1 h meeting + doc update) | **Yes** |
| P-06 | **Phase 2 scope not a blocker** — Blueprint Field/Practice/Opportunity explicitly out of scope | — | — | — | **No** |

**Product note:** Blueprint v1.1 “near-term V2” (rename routes, unify Studio chrome, zero ledger change) is **delivered in code**. Remaining product risk is **registry journey assurance** (RP matrix), not missing Studio features.

---

## 2. Technical blockers

| ID | Blocker | Severity | Owner | Effort | Blocks prod tag? |
|----|---------|----------|-------|--------|------------------|
| T-01 | **`register_artwork_atomic` missing** from schema cache — `rp-supabase-smoke` RP-1 FAIL | P0 | Engineering (DB/migrations parallel track) | **M–L** (baseline DDL + PostgREST reload) | **Conditional** (waiver) |
| T-02 | **Production migration attestation unarchived** — AC-M1 requires five migrations on prod; RPC smoke implies applied on linked Supabase project, but **no migration log** in baselines/sign-off | P1 | Engineering / Ops | **S** (SQL Editor checks + log entry) | **Yes** if prod DB unverified |
| T-03 | **AC-M2 / AC-M3 not re-verified on production HTTP** — personal archive API and account lifecycle (`/api/account/status`, export) after env fix | P1 | Engineering | **S** (30 min curl + one session) | **Yes** |
| T-04 | **AC-P3 not recorded** — “no new RPC console errors during smoke” (staging browser) | P2 | QA | **S** | **No** |
| T-05 | **Certificate QR host** — `NEXT_PUBLIC_SITE_URL` must match production origin; if only `NEXT_PUBLIC_APP_URL` set, QR URLs can be wrong (inventory) | P2 | Ops | **S** | **No** (unless cert QR in prod scope) |

**Technical note:** No Phase 1 **application architecture** gap remains per spec; open items are **environment + database RPC surface + verification evidence**.

---

## 3. Validation blockers

| ID | Blocker | Severity | Owner | Effort | Blocks prod tag? |
|----|---------|----------|-------|--------|------------------|
| V-01 | **`validate:system` never passed** — baseline `validate-system-20260604.json` shows `pass: false`, blocked on `DATABASE_URL` + `VALIDATION_*` user IDs | P0 | Engineering | **M** (secrets setup + 1 run, ~30–60 min) | **Yes** (production-readiness §D.3 #9) |
| V-02 | **`validate:replay` never passed** — `validate-replay-20260604.json` blocked; needs `DATABASE_URL` + `REPLAY_ARTWORK_IDS` from `replay-registry-ids.txt` | P0 | Engineering | **S–M** (1 run after V-01) | **Yes** (§D.3 #10) |
| V-03 | **Production redirect smoke not archived** — staging PASS exists; no `redirect-smoke-prod-*.txt` in baselines | P1 | Engineering | **S** (5 min script) | **Yes** (§D.3 #11) |
| V-04 | **Post-production RPC smoke not archived** — re-run `phase-1-rp-supabase-smoke.ts` against prod-linked project after deploy | P1 | Engineering | **S** | **Yes** (§D.3 #12) |
| V-05 | **RP-1 remains FAIL** in automated smoke until T-01 resolved | P0 | Engineering | tied to T-01 | **Conditional** |
| V-06 | **Acceptance matrix AC-S/T/R/N/P/M** — no PASS/FAIL grid filed for production (gate §3) | P1 | QA | **M** | **Yes** for formal complete; partial for minimal tag |

---

## 4. Operational blockers

| ID | Blocker | Severity | Owner | Effort | Blocks prod tag? |
|----|---------|----------|-------|--------|------------------|
| O-01 | ~~**Vercel application env missing**~~ | ~~P0~~ | Ops | — | **Resolved** (per current ops report: registry 200, Supabase OK) |
| O-02 | **Full Vercel Required set may be incomplete** — inventory: `CRON_SECRET`, `ADMIN_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`/`SITE_URL`, `CONTACT_EMAIL_TO` — not all verified in sign-off | P1 | Ops | **S** (checklist §B in production-readiness) | **Yes** for CRON (**security P0** if `CRON_SECRET` unset in prod); others P1 |
| O-03 | **Cron auth not evidenced** — unauthenticated `POST /api/cron/process-deletions` must be **401** in production | P1 (security **P0** if open) | Ops | **S** (2 curl commands) | **Yes** |
| O-04 | **Transactional email not evidenced** — Resend path for contact, invite, lifecycle not in RC baselines | P2 | Ops + QA | **S–M** | **No** for tag; **Yes** for lifecycle launch confidence |
| O-05 | **Supabase Auth redirect URLs** — production host must be in Auth URL config (external) | P1 | Ops | **S** | **Yes** if login/OAuth fails on prod host |
| O-06 | **`checkpoint-phase1-production` not created** | P1 | Engineering | **S** (git tag after §D) | **N/A** (outcome, not blocker) |
| O-07 | **`phase-1-rc-signoff.md` stale** — still documents Vercel 500 / env missing | P2 | Engineering | **S** (doc update) | **No** |
| O-08 | **`DATABASE_URL` for validation** — intentionally not on Vercel; ops machine/CI only | P1 | Engineering | **S** (one-time secret store) | **Yes** (feeds V-01, V-02) |

---

## Closure decision matrix

| Declaration | Allowed today? | Missing |
|-------------|----------------|---------|
| **Phase 1 code complete** | **Yes** | — |
| **Production user-facing (Studio + Registry + Creative register)** | **Yes** (operator attested) | Written sign-off + baseline archive |
| **Production deploy healthy (HTTP + Supabase)** | **Yes** | V-03, V-04 archived logs |
| **Release candidate (acceptance gate §1)** | **Partial** | §1.2 `validate:system`/`replay`; §1.3/§4 checklist in sign-off doc; §1.4 migration log |
| **Phase 1 formally complete (spec §3 staging + production)** | **No** | V-01, V-02, P-05, full RP matrix + AC grid in artifacts |
| **`checkpoint-phase1-production` tag** | **No** (strict §D) | See [Production Readiness Assessment](#production-readiness-assessment) below |

---

## Production Readiness Assessment

**Verdict:** **Production-ready for Phase 1 Studio Foundation use** on the live Vercel + Supabase stack. **`checkpoint-phase1-production` may not be created yet** under strict [production-readiness-execution.md](./production-readiness-execution.md) §D until listed gaps are closed or explicitly waived in sign-off.

### Resolved since prior closure report

| ID | Blocker | Resolution |
|----|---------|------------|
| O-01 | Vercel app env missing | **Resolved** — prod healthy |
| P-01 | RP-1 not passable | **Resolved** — manual Creative registration **PASS** on production |
| V-05 | RP-1 automated smoke FAIL | **Resolved (waived)** — probe signature mismatch; manual RP-1 supersedes |
| T-01 (prod path) | RPC missing on prod | **Resolved** for live prod — manual register works; repo migration gap remains for reproducibility only |
| — | Supabase connectivity | **Resolved** — confirmed |
| — | Studio / Registry on prod | **Resolved** — operator **PASS** |
| — | Browser extension false positives | **Resolved** — excluded from QA |

### Still open (blocks strict tag / formal closure)

| Priority | ID | Requirement |
|----------|-----|-------------|
| **P0** | V-01 | `npm run validate:system` → archived JSON with `"pass": true` |
| **P0** | V-02 | `npm run validate:replay` → archived PASS |
| **P0** | P-05 | QA + Product sign acceptance gate §6 / RC §4 |
| **P1** | V-03 | `redirect-smoke-prod-*.txt` on production URL |
| **P1** | V-04 | Post-deploy `rp-supabase-smoke-prod-*.json` (RP-3,4,6,7,9–13; note RP-1 row optional/waived) |
| **P1** | P-03 | RP-2, RP-4, RP-5, RP-8, RP-9, RP-11–RP-14 — **confirm PASS or waiver** in sign-off (not stated in operator inputs) |
| **P1** | P-04 / V-06 | Gate §4.1–4.3 + AC matrix filed (Studio PASS may subsume if copied into sign-off) |
| **P1** | T-02 | AC-M1 — five migrations applied on prod (attestation line in sign-off) |
| **P1** | O-02, O-03 | `CRON_SECRET` + unauthenticated cron **401** (if not already verified) |
| **P2** | O-04, T-03, T-04, T-05, O-07 | Email evidence, lifecycle API spot-check, console log, QR URL, stale RC doc |

### `checkpoint-phase1-production` — may it be created?

| Criterion (§D) | Met? |
|----------------|------|
| D.1 Configuration (env, cron, auth URLs, email) | **Unknown** — not in operator inputs |
| D.2 Migrations + PostgREST (AC-M1, AC-M2) | **Likely** (RP-9 smoke historically PASS) — **needs written attestation** |
| D.3 #8 static acceptance | **Yes** (20260604 baseline) |
| D.3 #9 `validate:system` | **No** |
| D.3 #10 `validate:replay` | **No** |
| D.3 #11 prod redirect smoke | **No** (staging only archived) |
| D.3 #12 RPC smoke RP-3–13 | **Likely** (20260604) — prod re-archive recommended |
| D.4 #13–14 HTTP registry/login/API | **Yes** (operator + prior evidence) |
| D.4 #15 prod subset RP-2,4,9,10 | **Partial** — RP-10/Registry **yes**; RP-2,4,9 **not stated** |
| D.4 #16 RP-1 | **Yes** — manual PASS |
| D.4 #17 RP-5,8,11–14 | **Unknown** |
| D.5 #18 ancestry tags | **Yes** |
| D.5 #19 sign-off updated | **No** |
| D.5 #20 rollback acknowledged | **Assume yes** if deploying |

**Answer: NO** — create tag after V-01, V-02, P-05, V-03, and confirmation/waiver of §D.1, D.4 #15–17, D.5 #19.

### Exact remaining requirements (minimal path to tag)

1. Export `DATABASE_URL` + validation user IDs → run `validate:system` and `validate:replay`; archive under `docs/v2/baselines/`.
2. Run `./scripts/phase-1-redirect-smoke.sh https://<production-host>`; archive log.
3. Re-run `npx tsx scripts/phase-1-rp-supabase-smoke.ts`; archive (RP-1 row waive with reference to manual PASS).
4. Complete `phase-1-rc-signoff.md`: production column, RP table (RP-1 **PASS** manual), QA/Product signatures.
5. Verify or waive: `CRON_SECRET`/cron 401, Resend send, RP-2/4/5/8/9/11–14, AC-M1 migration log.
6. `git tag -a checkpoint-phase1-production` on `main` after above.

### Recommended status line (today)

> Phase 1 Studio Foundation is **production-ready** (Studio, Registry, Creative register validated on production). **Formal checkpoint `checkpoint-phase1-production` pending** automated validation baselines and RC sign-off.

---

## Critical path to formal closure (ordered)

1. **Ops:** Confirm production env completeness + cron 401 + Auth URLs (O-02, O-03, O-05).  
2. **Engineering:** `DATABASE_URL` + `VALIDATION_*` → `validate:system` PASS baseline (V-01).  
3. **Engineering:** `validate:replay` PASS baseline (V-02).  
4. **Engineering:** Production redirect + RPC smoke baselines (V-03, V-04).  
5. **QA:** Execute gate §4 manual + RP-2,5,8,11,13,14 on production; file AC matrix (P-03, P-04, V-06).  
6. **Product:** Rule on RP-1 / `register_artwork_atomic` — fix T-01 or **waive** P-01 in sign-off.  
7. **Product + QA + Engineering:** Complete acceptance gate §6 + RC sign-off §4 (P-05).  
8. **Engineering:** Tag `checkpoint-phase1-production` when [production-readiness-execution.md](./production-readiness-execution.md) §D satisfied.

**Estimated calendar time (parallel work):** 2–4 business days with QA availability; **same day** for tag only if waiving RP-1 + manual RP subset and accepting minimal §D (not recommended for spec-strict closure).

---

## Recommended sign-off language (when ready)

> Phase 1 Studio Foundation is **formally complete** on production as of [date]: all acceptance criteria §3 pass on production, `validate:system` and `validate:replay` baselines archived, RP-1–RP-14 recorded (or documented waivers), QA/Product signed. Checkpoints: `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`, **`checkpoint-phase1-production`**.

Until tag + formal closure:

> Phase 1 is **production-ready** on live infrastructure; **checkpoint-phase1-production pending** `validate:system`, `validate:replay`, archived smoke logs, and QA/Product sign-off.

---

## References

| Document | Role |
|----------|------|
| [phase-1-rc-signoff.md](./phase-1-rc-signoff.md) | Last gate run (2026-06-04); env blocker superseded by ops report |
| [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md) | Definitive RC + AC list |
| [phase-1-studio-foundation-spec.md](./phase-1-studio-foundation-spec.md) §3–4 | “Done” definition |
| [production-readiness-execution.md](./production-readiness-execution.md) §D | `checkpoint-phase1-production` criteria |
| [environment-variable-inventory.md](./environment-variable-inventory.md) | Ops variable truth |
