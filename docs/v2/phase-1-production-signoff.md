# Phase 1 Production Certification — Sign-off

**Document status:** ACTIVE (sign-off artifact)  
**Effective:** 31 May 2026  
**Production URL:** https://rrowm-registry.vercel.app  
**Certified commit:** `main` @ `d5e6c4e`  
**Authority:** [Phase 1 Specification](./phase-1-studio-foundation-spec.md) (LOCKED), [Phase 1 Validation Waiver](./phase-1-validation-waiver.md) (ACTIVE), [Phase 1 RC Signoff](./phase-1-rc-signoff.md)  
**Related:** [production-readiness-execution.md](./production-readiness-execution.md), [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md)

---

## 1. Production certification statement

Phase 1 **Studio Foundation** is **production-certified** for live operation on the current Vercel + Supabase stack as of **31 May 2026**.

Operator validation confirms:

| Validation item | Result |
|-----------------|--------|
| Production Studio | **PASS** |
| Production Registry | **PASS** |
| Creative Registration | **PASS** |
| Supabase Connectivity | **PASS** |
| RP-1 Manual Validation | **PASS** |
| Browser-extension issue | **Excluded** from failure analysis |
| Validation waiver | **Accepted** |

**Statement:**

> RROWM Phase 1 Studio Foundation is authorized for production use. Core participant surfaces (Studio, public Registry) and Creative artwork registration operate correctly on production infrastructure. Automated database validation gates are formally waived per [phase-1-validation-waiver.md](./phase-1-validation-waiver.md); harness remediation remains scheduled follow-up work, not a production operations blocker.

---

## 2. Scope delivered in Phase 1

Per [phase-1-studio-foundation-spec.md](./phase-1-studio-foundation-spec.md) §1.2 — delivered on `main` and validated on production:

| Workstream | Deliverable | Production status |
|------------|-------------|-------------------|
| **StudioShell extraction** | Unified shell for Creative, Organisation, and Collector workspaces | **PASS** — Production Studio validated |
| **Terminology layer** | Product copy: Creative / Organisation / Collector (DB roles unchanged) | **Delivered** — `checkpoint-phase1-terminology` |
| **Route restructuring** | Canonical `/studio/*` with 301 redirects from legacy paths | **PASS** — `checkpoint-phase1-routes` |
| **Navigation architecture** | Central nav registry per role; Personal Archive + footer links | **PASS** — included in Studio validation |
| **Auth guard** | Namespace layout guard on `/studio/*` | **PASS** — `checkpoint-phase1-auth` |
| **Registry preservation** | Ledger RPCs and public Registry unchanged in behaviour | **PASS** — Registry + Creative Registration validated |
| **Migration dependencies** | P0 migrations (lifecycle, hardening, personal archive) on target env | **Applied** — Supabase connectivity + RPC smoke |

**Explicitly not in Phase 1 scope:** Field Explorer, Field Opportunities, Practice objects, Sector taxonomy, Projects, Briefs, Programmes, `/api/registry/*` namespace migration, ledger schema changes.

**Registry preservation rule satisfied:** No alteration to ownership, value, or verification ledger semantics; UI continues to call existing RPCs.

---

## 3. Checkpoint history

| Tag | Phase | Commit (approx.) | Meaning |
|-----|-------|------------------|---------|
| `checkpoint-phase1-terminology` | PR2–PR3 | Pre-routes | Product language freeze applied |
| `checkpoint-phase1-routes` | PR4 | Route migration merge | Canonical `/studio/*`; redirect matrix |
| `checkpoint-phase1-auth` | PR5 | Auth layout guard | AG-1–3 namespace protection |
| `checkpoint-phase1-rc` | PR6 | `b55dac3` area | Code-complete RC; static acceptance + staging smoke |
| **`checkpoint-phase1-production`** | Certification | **`d5e6c4e`** | **Production-certified** with validation waivers |

**Ancestry:** `terminology` → `routes` → `auth` → `rc` → **`production`**

**Baselines (supporting):** `docs/v2/baselines/static-acceptance-20260604.json`, `redirect-smoke-staging-vercel-20260604.txt`, `rp-supabase-smoke-20260604.json`

---

## 4. Known waived items

Waivers are documented in [phase-1-validation-waiver.md](./phase-1-validation-waiver.md). They apply **only** to automated certification gates—not to production user flows.

| Item | Waiver | Root cause (summary) | Production impact |
|------|--------|----------------------|-------------------|
| `npm run validate:system` | **Accepted** | JWT `set_config` transaction-local + node-pg autocommit; rollback-mode FK probe aborts txn | **None** — real Supabase session JWT in prod |
| `npm run validate:replay` | **Accepted** | Validator expects `certificates.created_at`; production uses `issued_at` | **None** — ops tooling only |
| `validate:system` / `validate:replay` PASS baselines | **Deferred** | Harness remediation R-1–R-4 (waiver §7) | Follow-up engineering debt |
| Production redirect smoke archive | **Optional** | Staging redirect smoke PASS archived; prod log not required for certification | Low — staging evidence exists |
| RP-2, RP-5, RP-8, RP-14 manual production sessions | **Deferred** | Not attested in operator validation; RPC touchpoints PASS | Document in future QA cycle |
| `register_artwork_atomic` in repo migrations | **Parallel track** | RPC live on prod DB; not in `supabase/migrations/` (R-6) | Fresh-env reproducibility only |

**Waiver lift criteria:** R-1 through R-4 satisfied; waiver status → **SUPERSEDED**; acceptance gate §2 applies in full.

---

## 5. Sign-off

| Role | Name | Date | Production certified | Waiver accepted |
|------|------|------|----------------------|-----------------|
| Engineering | Timi BTZ | 2026-05-31 | ☑ | ☑ |
| QA | Timi BTZ (operator attestation) | 2026-05-31 | ☑ | ☑ |
| Product | Timi BTZ | 2026-05-31 | ☑ | ☑ |

**Attestation detail (QA / operator):**

- Production Studio **PASS** — canonical `/studio/*`, role shells, layout auth guard
- Production Registry **PASS** — public explorer and record pages
- Creative Registration **PASS** — end-to-end browser session
- Supabase Connectivity **PASS** — env configured; `/registry` returns 200
- RP-1 Manual Validation **PASS** — `register_artwork_atomic` succeeds in production UI
- Browser-extension console noise **excluded** from failure analysis
- [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) **accepted** for `validate:system` and `validate:replay`

---

## 6. Tag authorization statement

### Authorized tag

**`checkpoint-phase1-production`**

### Status

**Applied** on `main` @ `d5e6c4e` (31 May 2026). Pushed to `origin`.

```
Phase 1 Studio Foundation: production-certified with validation waivers
(see docs/v2/phase-1-validation-waiver.md)
```

### Authorization

This sign-off **authorizes** the `checkpoint-phase1-production` tag as the formal Phase 1 production certification checkpoint. The tag marks the commit at which:

1. Production Studio, Registry, and Creative Registration are operator-validated **PASS**.
2. Validation waiver package is merged and governance-registered ([DOCUMENT_GOVERNANCE.md](./DOCUMENT_GOVERNANCE.md) item 8).
3. Phase 1 Studio Foundation may operate on production without awaiting harness remediation.

**Does not authorize:** Phase 2 scope, waiver lift, or modification of locked Phase 1 Specification acceptance criteria.

### Re-tag policy

Do **not** move or force-update `checkpoint-phase1-production` without a new sign-off artifact. Harness remediation commits after `d5e6c4e` do not invalidate this certification unless a production regression is documented.

---

## References

| Document | Role |
|----------|------|
| [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) | Automated gate waivers and remediation |
| [phase-1-rc-signoff.md](./phase-1-rc-signoff.md) | RC + production gate execution record |
| [phase-1-closure-report.md](./phase-1-closure-report.md) | Blocker reassessment |
| [production-readiness-execution.md](./production-readiness-execution.md) | Deploy runbook and §D criteria |
| [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md) | Original PR6 gates |
