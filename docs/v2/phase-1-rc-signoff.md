# Phase 1 Release Candidate — Sign-off Record

**RC commit:** `main` @ `b55dac3` + staging gate artifacts (2026-06-04)  
**Production commit:** `main` @ `d5e6c4e` — waiver package + **`checkpoint-phase1-production`** (2026-05-31)  
**Checkpoints:** `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`, **`checkpoint-phase1-production`**  
**Production URL:** https://rrowm-registry.vercel.app  
**Staging URL:** https://rrowm-registry.vercel.app  

**Waiver authority:** [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) (ACTIVE) — `validate:system` and `validate:replay` **waived** for production certification.

---

## 1. Gate execution summary (RC / staging)

| Step | Status | Evidence |
|------|--------|----------|
| Merge `pr/phase1-acceptance` | **DONE** | `main` @ `b55dac3` |
| Deploy staging | **DONE** | `npx vercel deploy --prod` → https://rrowm-registry.vercel.app |
| `validate:system` | **WAIVED** | Harness defect — see waiver §3, §5.1–5.2; baseline `validate-system-20260604.json` (`pass: false`) |
| `validate:replay` | **WAIVED** | Schema drift — see waiver §4, §5.3; baseline `validate-replay-20260604.json` |
| RP-1–RP-14 | **PARTIAL** (RC) | Supabase API smoke: `docs/v2/baselines/rp-supabase-smoke-20260604.json` |
| Redirect matrix (staging) | **PASS** | `docs/v2/baselines/redirect-smoke-staging-vercel-20260604.txt` |
| Static acceptance | **PASS** | `docs/v2/baselines/static-acceptance-20260604.json` |

### RC staging note (historical)

At RC time, Vercel production env pull showed missing Supabase keys; `/registry` returned 500 until env was configured. **Resolved for production** — operator attestation: Supabase connected, `/registry` 200.

---

## 2. Production validation attestation

Operator validation on production (Vercel + Supabase). Authoritative record: [phase-1-production-signoff.md](./phase-1-production-signoff.md).

| Item | Result |
|------|--------|
| **Production Studio** | **PASS** |
| **Production Registry** | **PASS** |
| **Creative Registration** | **PASS** |
| **Supabase Connectivity** | **PASS** |
| **RP-1 Manual Validation** | **PASS** — `register_artwork_atomic` via browser session; supersedes automated RP-1 FAIL in `rp-supabase-smoke-20260604.json` |
| **Browser-extension issue** | **Excluded** from failure analysis — false positives removed from manual QA |
| **Validation waiver** | **Accepted** — [phase-1-validation-waiver.md](./phase-1-validation-waiver.md) §3–4 (`validate:system`, `validate:replay`) |

---

## 3. Production gate summary

| Step | Status | Evidence |
|------|--------|----------|
| Vercel + Supabase env | **PASS** | Operator attestation; [environment-variable-inventory.md](./environment-variable-inventory.md) |
| Production Studio | **PASS** | Canonical `/studio/*`, shells, layout auth guard |
| Production Registry | **PASS** | Public explorer and record pages |
| Creative Registration | **PASS** | Manual RP-1 — see attestation §2 |
| Supabase Connectivity | **PASS** | App env configured; `/registry` 200 |
| Route migration (PR4) | **PASS** | `checkpoint-phase1-routes` |
| Auth guard (PR5) | **PASS** | `checkpoint-phase1-auth`; static acceptance archived |
| RC code gate (PR6) | **PASS** | `checkpoint-phase1-rc` |
| `validate:system` | **WAIVED** | Validation waiver accepted — waiver §3 |
| `validate:replay` | **WAIVED** | Validation waiver accepted — waiver §4 |
| Production redirect smoke (archived) | **PENDING** | Staging PASS archived; prod log optional per waiver §8 |
| Harness remediation (R-1–R-4) | **OPEN** | Waiver §7 — required before waiver lift |

---

## 4. RP-1–RP-14 registry smoke

| ID | RC (automated) | Production | Notes |
|----|----------------|------------|-------|
| RP-1 | **BLOCKED** | **PASS** | Automated smoke used wrong RPC signature; manual Creative register on prod **PASS** |
| RP-2 | **MANUAL** | **MANUAL** | Organisation register — UI + gallery session |
| RP-3 | **PASS** | **PASS** | `gallery_verify_artwork` RPC callable |
| RP-4 | **PASS** | **PASS** | `issue_certificate_for_verified_artwork` RPC callable |
| RP-5 | **MANUAL** | **MANUAL** | Collector claim — UI session |
| RP-6 | **PASS** | **PASS** | `accept_provenance_transfer` RPC callable |
| RP-7 | **PASS** | **PASS** | `artist_confirm_representation_on_file` RPC callable |
| RP-8 | **MANUAL** | **MANUAL** | Invite accept — token + session |
| RP-9 | **PASS** | **PASS** | `artwork_archives` visible (migrations applied) |
| RP-10 | **PASS** | **PASS** | `artwork_read_model` |
| RP-11 | **PASS** | **PASS** | Sample `registry_id` present |
| RP-12 | **PASS** | **PASS** | `get_certificate_public_status_batch` |
| RP-13 | **PASS** | **PASS** | `account_audit_log` visible |
| RP-14 | **MANUAL** | **MANUAL** | Ownership sale signal — Creative studio UI |

---

## 5. Automated commands (re-run)

```bash
npm run validate:phase1-static
STAGING_URL=https://rrowm-registry.vercel.app ./scripts/phase-1-redirect-smoke.sh "$STAGING_URL"
npx tsx scripts/phase-1-rp-supabase-smoke.ts

# Harness remediation (R-1–R-4) — not production blockers while waiver ACTIVE:
npm run validate:system | tee docs/v2/baselines/validate-system-$(date +%Y%m%d).json
REPLAY_ARTWORK_IDS=$(paste -sd, docs/v2/baselines/replay-registry-ids.txt) npm run validate:replay | tee docs/v2/baselines/validate-replay-$(date +%Y%m%d).json
```

---

## 6. RC sign-off (code-complete)

| Role | Name | Date | RC approved |
|------|------|------|-------------|
| Engineering | Automated gate run | 2026-06-04 | Code RC **yes**; prod deploy **pending Vercel env** (since resolved) |
| QA | | | |
| Product | | | |

**Tag `checkpoint-phase1-rc`:** Phase 1 Studio Foundation code-complete; production certification completed separately with validation waivers.

---

## 7. Production sign-off

See [phase-1-production-signoff.md](./phase-1-production-signoff.md) for the formal certification record.

| Role | Name | Date | Production certified | Waiver approved | Checkpoint |
|------|------|------|----------------------|-----------------|------------|
| Engineering | Timi BTZ | 2026-05-31 | ☑ | ☑ | `checkpoint-phase1-production` @ `d5e6c4e` |
| QA | Timi BTZ (operator attestation) | 2026-05-31 | ☑ | ☑ | §2 attestation — Studio, Registry, Creative Registration, RP-1 **PASS** |
| Product | Timi BTZ | 2026-05-31 | ☑ | ☑ | Validation waiver **accepted** |

**Certification statement:**

> Phase 1 Studio Foundation is **production-certified** as of **31 May 2026**. Production Studio **PASS**, Production Registry **PASS**, Creative Registration **PASS**, Supabase Connectivity **PASS**, RP-1 Manual Validation **PASS**. Browser-extension issue **excluded** from failure analysis. Validation waiver **accepted** per [phase-1-validation-waiver.md](./phase-1-validation-waiver.md). Checkpoints: `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`, **`checkpoint-phase1-production`**.

**Follow-up (non-blocking):** Waiver §7 R-1–R-4 harness remediation; optional prod redirect smoke archive; RP-2, RP-5, RP-8, RP-14 manual production sessions.
