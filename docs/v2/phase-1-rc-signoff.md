# Phase 1 Release Candidate — Sign-off Record

**RC commit:** `main` @ `b55dac3` + staging gate artifacts (2026-06-04)  
**Checkpoints:** `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, **`checkpoint-phase1-rc`**  
**Staging URL:** https://rrowm-registry.vercel.app  

---

## 1. Gate execution summary

| Step | Status | Evidence |
|------|--------|----------|
| Merge `pr/phase1-acceptance` | **DONE** | `main` @ `b55dac3` |
| Deploy staging | **DONE** | `npx vercel deploy --prod` → https://rrowm-registry.vercel.app |
| `validate:system` | **BLOCKED** | No `DATABASE_URL` in env — see `docs/v2/baselines/validate-system-20260604.json` |
| `validate:replay` | **BLOCKED** | No `DATABASE_URL` — see `docs/v2/baselines/validate-replay-20260604.json` |
| RP-1–RP-14 | **PARTIAL** | Supabase API smoke: `docs/v2/baselines/rp-supabase-smoke-20260604.json` |
| Redirect matrix (staging) | **PASS** | `docs/v2/baselines/redirect-smoke-staging-vercel-20260604.txt` |
| Static acceptance | **PASS** | `docs/v2/baselines/static-acceptance-20260604.json` |

### Staging deploy blocker (Vercel app HTTP)

Vercel **production** environment pull contains **no Supabase keys** (`vercel env pull` → only `VERCEL_*`). Result:

- `/login` → 200
- `/registry`, `/api/account/status` → **500** until `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, and related secrets are added in Vercel project settings and redeployed.

**Remote Supabase project** (from `.env.local`) passes schema/RPC smoke for RP-9–13 and most RPC touchpoints.

---

## 2. RP-1–RP-14 registry smoke

| ID | Result | Notes |
|----|--------|-------|
| RP-1 | **BLOCKED** | `register_artwork_atomic` not in PostgREST schema (feasibility: baseline DDL parallel track) |
| RP-2 | **MANUAL** | Organisation register — UI + gallery session on configured Vercel |
| RP-3 | **PASS** | `gallery_verify_artwork` RPC callable |
| RP-4 | **PASS** | `issue_certificate_for_verified_artwork` RPC callable |
| RP-5 | **MANUAL** | Collector claim — UI session |
| RP-6 | **PASS** | `accept_provenance_transfer` RPC callable |
| RP-7 | **PASS** | `artist_confirm_representation_on_file` RPC callable |
| RP-8 | **MANUAL** | Invite accept — token + session |
| RP-9 | **PASS** | `artwork_archives` visible (migrations applied) |
| RP-10 | **PASS** | `artwork_read_model` (12 rows) |
| RP-11 | **PASS** | Sample `registry_id` present |
| RP-12 | **PASS** | `get_certificate_public_status_batch` |
| RP-13 | **PASS** | `account_audit_log` visible |
| RP-14 | **MANUAL** | Ownership sale signal — Creative studio UI |

---

## 3. Automated commands (re-run)

```bash
npm run validate:phase1-static
STAGING_URL=https://rrowm-registry.vercel.app ./scripts/phase-1-redirect-smoke.sh "$STAGING_URL"
npx tsx scripts/phase-1-rp-supabase-smoke.ts

# After DATABASE_URL + validation user IDs configured:
npm run validate:system | tee docs/v2/baselines/validate-system-$(date +%Y%m%d).json
REPLAY_ARTWORK_IDS=$(paste -sd, docs/v2/baselines/replay-registry-ids.txt) npm run validate:replay | tee docs/v2/baselines/validate-replay-$(date +%Y%m%d).json
```

---

## 4. RC sign-off

| Role | Name | Date | RC approved |
|------|------|------|-------------|
| Engineering | Automated gate run | 2026-06-04 | Code RC **yes**; prod deploy **pending Vercel env** |
| QA | | | |
| Product | | | |

**Tag `checkpoint-phase1-rc`:** Phase 1 Studio Foundation code-complete; full `validate:system` / replay / Vercel HTTP RP require ops follow-up above.
