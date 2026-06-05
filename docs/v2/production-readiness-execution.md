# Production Readiness Execution — Deployment Runbook

**Status:** ACTIVE  
**Authority:** [environment-variable-inventory.md](./environment-variable-inventory.md), [phase-1-rc-signoff.md](./phase-1-rc-signoff.md), [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md)  
**Prerequisites on `main`:** `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc`  
**Target tag (after this runbook):** `checkpoint-phase1-production`  
**Constraints:** No code, route, architecture, or schema changes in this execution — configuration and validation only.

**Production host (current Vercel):** `https://rrowm-registry.vercel.app`  
**Custom domain (when wired):** set `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` to the canonical public origin (e.g. `https://rrowm.io`).

---

## Pre-flight (before Vercel)

Complete on the **Supabase project** that matches `NEXT_PUBLIC_SUPABASE_URL` (values from `.env.local` or Supabase dashboard):

| Step | Action | Blocks |
|------|--------|--------|
| P0-1 | Apply migrations `20260531120000`, `20260531140000`, `20260531150000`, `20260531160000`, `20260531160100` on **production** DB | RP-9, RP-13, AC-M1–M3 |
| P0-2 | PostgREST schema reload (`NOTIFY pgrst, 'reload schema'` or migration `20260531160100`) | RP-9 API, RPC visibility |
| P0-3 | Supabase Auth → URL configuration: Site URL + redirect URLs for production host(s) | Login / OAuth callback |
| P0-4 | Resend: domain `email.rrowm.io` verified; API key ready | All transactional mail |
| P0-5 | Copy secrets from Supabase (Settings → API) and Resend — **never commit** | Vercel entry |

**Known gap (document, do not block env work):** `register_artwork_atomic` may be absent from PostgREST on this project → RP-1 UI register fails until parallel DDL/RPC track lands. RC smoke already recorded this as **BLOCKED**; production tag may proceed with RP-1 **waived** only if product signs off (see §5).

---

## SECTION A — Vercel variables

Configure in **Vercel → Project `rrowm-registry` → Settings → Environment Variables**.

**Do not add to Vercel:** `DATABASE_URL`, `VALIDATION_*`, `REPLAY_ARTWORK_IDS`, `STAGING_URL`, `SUPABASE_ACCESS_TOKEN`, `CONTACT_EMAIL_FROM`, `GALLERY_INVITE_EMAIL_FROM` (ops/local only per inventory §5).

**Environment column guidance**

| Vercel target | Use |
|---------------|-----|
| **Production** | Live deploy (`vercel deploy --prod` or production branch) |
| **Preview** | PR previews — mirror Production for Supabase/Resend if previews should work; otherwise minimal |
| **Development** | `vercel dev` only — optional mirror of `.env.local` |

For Phase 1 production cutover: set **Critical** and **Required** on **Production** at minimum. Copy the same values to **Preview** if PR previews must hit real Supabase.

---

### Critical (Production 500 without these)

| Variable | Environment | Required? | Secret? | Expected value source | Risk if missing |
|----------|-------------|-----------|---------|----------------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview† | **Yes** | No (public) | Supabase → Project Settings → API → Project URL | **500** on `/registry`, middleware, SSR, most APIs; `createSupabaseServerClient()` throws |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview† | **Yes** | No (public; still treat as sensitive) | Supabase → API → `anon` `public` key | Same as URL; auth/session broken |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview† | **Yes** | **Yes** | Supabase → API → `service_role` key (server only) | Admin APIs, certificates, lifecycle, provenance service reads fail or 500 |

†Preview: required only if preview deployments must function against real backend.

---

### Required (launch features / security)

| Variable | Environment | Required? | Secret? | Expected value source | Risk if missing |
|----------|-------------|-----------|---------|----------------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | Production | **Yes** (canonical prod) | No | Production origin: `https://rrowm-registry.vercel.app` or custom domain | Emails/links fall back to `https://rrowm.io` via `getSiteUrl()` — wrong host in mail |
| `NEXT_PUBLIC_SITE_URL` | Production | **Yes** (QR + metadata) | No | Same origin as `NEXT_PUBLIC_APP_URL` (set both to same value) | Certificate QR URLs may be `undefined/registry/...` (no fallback in certificate page) |
| `RESEND_API_KEY` | Production | **Yes** | **Yes** | Resend → API Keys | Invites, lifecycle, contact delivery fail silently or error |
| `CRON_SECRET` | Production | **Yes** | **Yes** | Generate: `openssl rand -hex 32` | **Critical security:** cron routes accept **any** caller in production |
| `ADMIN_USERNAME` | Production | **Yes** (if `/admin` used) | No | Ops-chosen username | Admin login **503** “not configured” |
| `ADMIN_PASSWORD` | Production | **Yes** (if `/admin` used) | **Yes** | Ops-chosen strong password | Same as username |

**Preview / Development (recommended mirrors)**

| Variable | Environment | Required? | Secret? | Expected value source | Risk if missing |
|----------|-------------|-----------|---------|----------------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | Preview | Optional | No | Preview URL or staging host | Wrong links in preview emails |
| `NEXT_PUBLIC_SITE_URL` | Preview | Optional | No | Same as preview host | Broken QR in preview |
| `RESEND_API_KEY` | Preview | Optional | **Yes** | Same or separate Resend key | Preview email tests fail |
| `CRON_SECRET` | Preview | Optional | **Yes** | Distinct from prod recommended | Open cron on preview if NODE_ENV=production on preview builds |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Preview | Optional | **Yes** (password) | Non-prod credentials | Cannot test admin on preview |

**Development (`vercel dev`):** prefer local `.env.local` instead of Vercel Development env unless team standardizes on Vercel pull.

---

### Optional

| Variable | Environment | Required? | Secret? | Expected value source | Risk if missing |
|----------|-------------|-----------|---------|----------------------|-----------------|
| `CONTACT_EMAIL_TO` | Production | No | No | Ops inbox e.g. `hello@rrowm.io` | Contact form **200** but message only **logged** |
| `RESEND_FROM_INVITATIONS` | Production | No | No | Verified mailbox on `email.rrowm.io` | Uses default `no-reply@email.rrowm.io` |
| `RESEND_FROM_REGISTRY` | Production | No | No | Same domain | Same default |
| `INVITE_TOKEN_EXPIRY_DAYS` | Production | No | No | Default **30** if unset | Default 30-day invite TTL |
| `NEXT_PUBLIC_ENABLE_TEST_MODE` | **Never Production** | No | No | **Do not set** on Production | If `true`: test admin APIs exposed |

---

### Vercel CLI (optional, same values)

```bash
# Example — repeat per variable; select Production when prompted
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

After all `NEXT_PUBLIC_*` changes: **must redeploy** (build embeds public vars).

---

## SECTION B — Deployment checklist

Execute in this order. Do not skip redeploy after public env vars.

### B.1 Add variables

- [ ] **P0** Supabase migrations + PostgREST reload on production DB (Pre-flight)
- [ ] Enter all **Critical** variables on Vercel **Production**
- [ ] Enter all **Required** variables on Vercel **Production**
- [ ] Confirm `NEXT_PUBLIC_ENABLE_TEST_MODE` is **not** set on Production
- [ ] Optional: `CONTACT_EMAIL_TO`, `RESEND_FROM_*`, `INVITE_TOKEN_EXPIRY_DAYS`
- [ ] (Optional) Mirror Critical/Required to **Preview** if needed

### B.2 Redeploy

```bash
cd /path/to/rrowm-registry
git checkout main
git pull
npx vercel deploy --prod
```

- [ ] Build succeeds (no missing env at build for `NEXT_PUBLIC_*`)
- [ ] Note deployment URL (production alias)

Verify env reached runtime:

```bash
vercel env pull .env.vercel.production --environment=production
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=' .env.vercel.production
# Expect non-empty values (do not commit this file)
```

### B.3 Verify routes (HTTP — unauthenticated unless noted)

Replace `BASE` with production URL.

```bash
BASE="https://rrowm-registry.vercel.app"
curl -sI "${BASE}/login" | head -1          # expect HTTP 200
curl -sI "${BASE}/registry" | head -1       # expect HTTP 200 (not 500)
curl -sI "${BASE}/studio" | head -5         # expect 200 or Location → /studio/creative
curl -sI "${BASE}/artwork" | head -1        # expect 200 or valid public page
```

- [ ] `/login` → **200**
- [ ] `/registry` → **200** (was **500** without Supabase env)
- [ ] `/studio` → **200** or single redirect to `/studio/creative` (see redirect smoke)
- [ ] Legacy stubs one hop: `/account` → `/studio/account`, `/personal-archive` → `/studio/archive`

Full redirect matrix:

```bash
STAGING_URL="${BASE}" ./scripts/phase-1-redirect-smoke.sh "${BASE}"
```

Archive log: `docs/v2/baselines/redirect-smoke-prod-$(date +%Y%m%d).txt`

### B.4 Verify APIs

```bash
BASE="https://rrowm-registry.vercel.app"

# Must not be 500 (401/403 acceptable unauthenticated)
curl -sI "${BASE}/api/account/status" | head -1

# Personal archive (requires migration + auth for 200 body; not PGRST205)
# Signed-in: browser or session cookie
curl -s "${BASE}/api/personal-archive/list" -H "Cookie: <session>" | head -c 200

# Legacy delete retired
curl -sI -X POST "${BASE}/api/account/delete" | head -1   # expect 410
```

| Endpoint | Expectation |
|----------|-------------|
| `GET /api/account/status` | Not **500** |
| `GET /api/personal-archive/list` (authenticated) | **200** JSON, not PGRST205 |
| `POST /api/account/delete` | **410** |
| `GET /registry` (page) | **200** |

- [ ] APIs above checked
- [ ] Browser: sign in → `/studio/{role}` loads (AC-R4, AC-R5)

### B.5 Verify emails

Prerequisites: `RESEND_API_KEY`, site URL vars, Resend domain verified.

| Test | Steps | Pass |
|------|-------|------|
| Contact | Submit `/contact` with valid payload | **200**; email to `CONTACT_EMAIL_TO` or log line in Vercel logs |
| Invite (RP-8 path) | Organisation studio → send test invite | Email received; link host matches `NEXT_PUBLIC_APP_URL` |
| Lifecycle | Account → request export (RP-13) | Export-ready email or in-app state (no Resend error in logs) |

- [ ] At least one transactional send succeeded in Resend dashboard
- [ ] Link domains in email match production `NEXT_PUBLIC_APP_URL`

### B.6 Verify cron protection

Generate `CRON_SECRET` if not already set on Vercel.

```bash
BASE="https://rrowm-registry.vercel.app"
CRON_SECRET="<from-vercel>"

# Without auth — must be 401 in production
curl -sI -X POST "${BASE}/api/cron/process-deletions" | head -1

# With auth — must not be 401 (200 or empty job result)
curl -sI -X POST "${BASE}/api/cron/process-deletions" \
  -H "Authorization: Bearer ${CRON_SECRET}" | head -1

curl -sI -X POST "${BASE}/api/cron/process-exports" \
  -H "Authorization: Bearer ${CRON_SECRET}" | head -1
```

- [ ] Unauthenticated cron → **401**
- [ ] Authenticated cron → **not 401**
- [ ] Vercel dashboard → Crons enabled (`vercel.json`: 03:00 deletions, 04:00 exports)

### B.7 Verify admin access

- [ ] `ADMIN_USERNAME` / `ADMIN_PASSWORD` set on Production
- [ ] Browser: `/admin` → login → console loads
- [ ] `POST /api/admin/login` with valid body → session cookie
- [ ] Invalid credentials → **401**
- [ ] Admin action requiring service role (e.g. lifecycle panel) succeeds

---

## SECTION C — Production validation

Run from repo root on a machine with secrets (laptop/CI). **Do not** store `DATABASE_URL` in Vercel.

### C.1 Build gates (local or CI)

```bash
npx tsc --noEmit
npm run build
npm run validate:phase1-static | tee docs/v2/baselines/static-acceptance-$(date +%Y%m%d).json
```

Pass criteria: `pass: true` in static acceptance JSON.

### C.2 Redirect smoke (production HTTP)

```bash
export BASE="https://rrowm-registry.vercel.app"
./scripts/phase-1-redirect-smoke.sh "${BASE}" | tee docs/v2/baselines/redirect-smoke-prod-$(date +%Y%m%d).txt
```

Pass criteria: all lines `PASS`; no `FAIL`; archive `/studio/archive` no redirect loop.

### C.3 Supabase RPC smoke (no DATABASE_URL)

Uses `.env.local` or exported Supabase vars:

```bash
npx tsx scripts/phase-1-rp-supabase-smoke.ts | tee docs/v2/baselines/rp-supabase-smoke-prod-$(date +%Y%m%d).json
```

Pass criteria: RP-3,4,6,7,9–13 **PASS** per script output (RP-1 may **BLOCKED** if RPC missing).

### C.4 `validate:system`

Requires direct Postgres URI + three validation user UUIDs from **production** (or staging-equivalent) Supabase `auth.users`.

```bash
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
export VALIDATION_ARTIST_USER_ID="<uuid>"
export VALIDATION_GALLERY_USER_ID="<uuid>"
export VALIDATION_SECOND_OWNER_USER_ID="<uuid>"

npm run validate:system | tee docs/v2/baselines/validate-system-prod-$(date +%Y%m%d).json
```

Pass criteria: JSON `pass: true`. Optional non-persistent flows:

```bash
VALIDATION_ROLLBACK=1 npm run validate:system | tee docs/v2/baselines/validate-system-rollback-$(date +%Y%m%d).json
```

### C.5 `validate:replay`

```bash
export DATABASE_URL="postgresql://..."   # same project as production validation
export REPLAY_ARTWORK_IDS="$(paste -sd, docs/v2/baselines/replay-registry-ids.txt)"

npm run validate:replay | tee docs/v2/baselines/validate-replay-prod-$(date +%Y%m%d).json
```

Pass criteria: replay completes without failure exit code; archive output under `docs/v2/baselines/`.

### C.6 RP-1 through RP-14

Record in `docs/v2/phase-1-rc-signoff.md` (production column) or a copy `phase-1-production-signoff.md`.

| ID | Type | Command / procedure | Pass |
|----|------|---------------------|------|
| **RP-1** | Manual (+ RPC) | Creative studio → Register artwork | UI succeeds **or** documented **WAIVED** if `register_artwork_atomic` absent (RPC smoke BLOCKED) |
| **RP-2** | Manual | Organisation → register institution artwork | PASS |
| **RP-3** | Auto | `phase-1-rp-supabase-smoke.ts` | PASS |
| **RP-4** | Manual + Auto | Issue certificate authorized user; RPC in smoke | PASS |
| **RP-5** | Manual | Collector ownership claim flow | PASS |
| **RP-6** | Auto | `accept_provenance_transfer` in smoke | PASS |
| **RP-7** | Auto | `artist_confirm_representation_on_file` in smoke | PASS |
| **RP-8** | Manual | Gallery invite accept (token + session) | PASS |
| **RP-9** | Auto + Manual | Smoke + `/api/personal-archive/*` add/remove/list | PASS |
| **RP-10** | Manual | `/registry` verified filter loads | PASS |
| **RP-11** | Manual | `/registry/[registry_id]` or `/artwork/[id]` for ID from `replay-registry-ids.txt` | PASS |
| **RP-12** | Auto | `get_certificate_public_status_batch` in smoke | PASS |
| **RP-13** | Manual | `/studio/account` → export request / deactivate smoke; APIs not 500 | PASS |
| **RP-14** | Manual | Creative studio → Ownership sale signal when applicable | PASS |

**Production subset (acceptance gate §4.7):** minimum smoke before tag — RP-2, RP-4, RP-9, RP-10, plus redirect spot-check; full table required for `checkpoint-phase1-production` unless RP-1 waiver signed.

### C.7 Staging HTTP smoke (optional)

```bash
STAGING_URL="https://rrowm-registry.vercel.app" npx tsx scripts/phase-1-staging-http-smoke.ts
```

### C.8 Manual QA (acceptance gate §4)

Copy checklist from [phase-1-acceptance-gate.md](./phase-1-acceptance-gate.md) §4.1–4.2; execute on production with real sessions (Creative, Organisation, Collector). Sign §6 RC table.

---

## SECTION D — Release criteria: `checkpoint-phase1-production`

Tag **only** when **all** conditions below are true.

### D.1 Configuration

| # | Condition |
|---|-----------|
| 1 | Vercel **Production** has every **Critical** and **Required** variable from Section A |
| 2 | `NEXT_PUBLIC_ENABLE_TEST_MODE` is **not** `true` on Production |
| 3 | `CRON_SECRET` set; unauthenticated cron returns **401** (Section B.6) |
| 4 | Supabase Auth redirect URLs include production host |
| 5 | Resend domain verified; at least one successful production send (Section B.5) |

### D.2 Database (no new migrations in this execution)

| # | Condition |
|---|-----------|
| 6 | AC-M1: all five migrations applied on **production** Supabase |
| 7 | PostgREST reload completed (AC-M2: personal archive not PGRST205) |

### D.3 Automated evidence archived

| # | Condition |
|---|-----------|
| 8 | `npm run validate:phase1-static` → **PASS** (baseline in `docs/v2/baselines/`) |
| 9 | `validate:system` → JSON **`pass: true`** against production `DATABASE_URL` |
| 10 | `validate:replay` → **PASS** with `REPLAY_ARTWORK_IDS` from `replay-registry-ids.txt` |
| 11 | `./scripts/phase-1-redirect-smoke.sh` on production `BASE` → **PASS** |
| 12 | `phase-1-rp-supabase-smoke.ts` → RP-3,4,6,7,9–13 **PASS** |

### D.4 HTTP / registry

| # | Condition |
|---|-----------|
| 13 | `/registry` and `/login` return **200** on production (not 500) |
| 14 | `/api/account/status` not **500** |
| 15 | RP-2, RP-4, RP-9, RP-10 **PASS** on production (gate §4.7) |
| 16 | RP-1 **PASS** on production **OR** written waiver in sign-off (known RPC gap) |
| 17 | RP-5, RP-8, RP-11–14 **PASS** or explicitly deferred with Product sign-off |

### D.5 Process

| # | Condition |
|---|-----------|
| 18 | `checkpoint-phase1-routes`, `checkpoint-phase1-auth`, `checkpoint-phase1-rc` exist on ancestry |
| 19 | [phase-1-rc-signoff.md](./phase-1-rc-signoff.md) updated: Production deploy **yes**, QA/Product rows signed |
| 20 | Rollback plan acknowledged: revert Vercel deployment + disable crons; DB not reverted |

### D.6 Tag command

```bash
git checkout main
git pull
git tag -a checkpoint-phase1-production -m "Phase 1 Studio Foundation: production env configured and validated"
git push origin checkpoint-phase1-production
```

---

## Quick reference — today’s execution order

1. Pre-flight Supabase (migrations, Auth URLs, Resend)  
2. Section A → Vercel Production env  
3. Section B → redeploy → routes → APIs → email → cron → admin  
4. Section C → static → redirect → RPC smoke → validate:system → validate:replay → RP matrix → manual QA  
5. Section D → tag `checkpoint-phase1-production`  

**Unblock first:** Critical trio (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`) + redeploy → confirms `/registry` **200**.
