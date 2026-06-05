# Environment variable inventory

**Status:** ACTIVE (read-only audit, `main` as of Phase 1 RC)  
**Scope:** Every `process.env.*` reference in application code and ops scripts, plus local-only keys found in `.env.local` that have no code reference.

---

## How to read this document

| Column | Meaning |
|--------|---------|
| **Where** | `Vercel` = set in Vercel project env (Production / Preview as needed). `Local` = `.env.local` or shell. `Ops` = CI / laptop only — do not put on Vercel unless you intend to expose secrets. |
| **Exposure** | `Public` = `NEXT_PUBLIC_*` (embedded in client bundle at build time). `Server` = never sent to browser. |
| **Required** | What breaks if unset in that environment. |

---

## 1. Vercel production — critical (app will 500 without these)

| Variable | Exposure | Required | Purpose | Primary consumers |
|----------|----------|----------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | **Yes** | Supabase project URL | `middleware.ts`, `lib/supabase-server.ts`, `lib/supabase.ts`, `lib/supabase-service-role.ts`, `app/auth/callback/route.ts`, admin/internal APIs |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | **Yes** | Supabase anon key (RLS-scoped) | Same as URL + session refresh |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | **Yes** | Bypass RLS for server jobs (lifecycle, certificates, admin, provenance reads) | `lib/supabase-service-role.ts`, `lib/issue-certificate.ts`, `lib/get-public-provenance.ts`, `lib/api-admin-auth.ts`, cron-adjacent services, multiple `app/api/admin/*` routes |

**Note:** `createSupabaseServerClient()` throws if public Supabase vars are missing — typical symptom is **500** on `/registry`, studio APIs, and middleware-backed routes. Observed on Vercel when only `VERCEL_*` vars were present after `vercel env pull`.

---

## 2. Vercel production — required for launch features

| Variable | Exposure | Required | Purpose | Default / fallback |
|----------|----------|----------|---------|-------------------|
| `NEXT_PUBLIC_APP_URL` | Public | **Recommended** | Canonical absolute base URL (emails, shares) | `getSiteUrl()` → then `NEXT_PUBLIC_SITE_URL` → **`https://rrowm.io`** |
| `NEXT_PUBLIC_SITE_URL` | Public | **Recommended** | Legacy alias for public base URL | Same precedence as above; also used directly on certificate QR (`app/certificate/[registry_id]/page.tsx`) **without** `getSiteUrl()` fallback — set at least one of APP_URL or SITE_URL in prod |
| `RESEND_API_KEY` | Server | **Yes** (if email sends) | Resend API | Empty key → send failures; read via `lib/resend-env.ts` |
| `CRON_SECRET` | Server | **Yes** (production) | Bearer for Vercel Cron → `/api/cron/process-deletions`, `/api/cron/process-exports` | If unset in **production**, `authorizeCron` accepts **any** request (auth bypass). Non-prod allows open cron when unset |
| `ADMIN_USERNAME` | Server | **Yes** (if using `/admin`) | Admin console login | Missing → `503` “Admin access is not configured” |
| `ADMIN_PASSWORD` | Server | **Yes** (if using `/admin`) | Admin console login | Paired with `ADMIN_USERNAME` |

See also: [account-lifecycle-deployment.md](../account-lifecycle-deployment.md).

---

## 3. Vercel production — optional / tuning

| Variable | Exposure | Default | Purpose |
|----------|----------|---------|---------|
| `CONTACT_EMAIL_TO` | Server | — | Inbox for `/api/contact` via Resend; if unset, form still returns 200 but only **logs** (`[contact] Message received`) |
| `RESEND_FROM_INVITATIONS` | Server | `EMAIL_FROM` in `lib/email-config.ts` | Override **mailbox** on `email.rrowm.io` for invitation mail |
| `RESEND_FROM_REGISTRY` | Server | `EMAIL_FROM` | Override mailbox for registry notifications / transactional |
| `INVITE_TOKEN_EXPIRY_DAYS` | Server | **30** | Gallery invite link TTL (`lib/invite-token.ts`) |
| `NEXT_PUBLIC_ENABLE_TEST_MODE` | Public | off (`!== "true"`) | Enables `/api/admin/test/*` reset/create-user (`lib/test-mode.ts`) — **must not be `true` in production** |

---

## 4. Local development (`.env.local`)

Typical minimal local set (matches keys often present locally):

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same project as target DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never commit |
| `RESEND_API_KEY` | Optional for testing email |
| `NEXT_PUBLIC_SITE_URL` | Often `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Prefer one canonical public URL var |

**Not referenced in code** (safe to remove from `.env.local` unless used externally):

| Variable | Status |
|----------|--------|
| `CONTACT_EMAIL_FROM` | **Unused** — no `process.env` reference |
| `GALLERY_INVITE_EMAIL_FROM` | **Unused** — From headers use `RESEND_FROM_*` or hardcoded `EMAIL_FROM` |

---

## 5. Ops / CI / validation only (do not deploy to Vercel app runtime)

### Database connectivity

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Direct Postgres URI for `npm run validate:system`, `npm run validate:replay`, `db:apply-personal-archive` (SQL path) |
| `VALIDATION_DATABASE_URL` | Alias for `DATABASE_URL` in validation scripts |

### `npm run validate:system` — required

| Variable | Purpose |
|----------|---------|
| `VALIDATION_ARTIST_USER_ID` | `auth.users` uuid — Scenario A |
| `VALIDATION_GALLERY_USER_ID` | Gallery member uuid |
| `VALIDATION_SECOND_OWNER_USER_ID` | Scenario B second owner |

### `npm run validate:system` — optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `VALIDATION_DECLARED_VALUE` | `1000` | Test artwork value |
| `VALIDATION_CURRENCY` | `USD` | |
| `VALIDATION_VALUE_TYPE` | `initial` | |
| `VALIDATION_VISIBILITY_LEVEL` | `private` | |
| `VALIDATION_ARTWORK_YEAR` | `2026` | |
| `VALIDATION_ARTWORK_MEDIUM` | `medium` | |
| `VALIDATION_ARTWORK_DIMENSIONS` | `10x10` | |
| `VALIDATION_ARTWORK_DESCRIPTION` | `validation` | |
| `VALIDATION_ARTWORK_TITLE` | auto-generated | |
| `VALIDATION_CONCURRENCY_DECLARED_VALUE` | declared + 1 | Concurrent value_events test |
| `VALIDATION_CHAIN_ARTWORK_ID` | — | Skip artwork creation; test ownership chain only |
| `VALIDATION_NON_OWNER_USER_ID` | — | RLS: ownership_events insert denial |
| `VALIDATION_GALLERY_STAFF_USER_ID` | — | RLS: gallery profile UPDATE denial for staff |
| `VALIDATION_ROLLBACK` | off | `1` = transactional rollback after run |
| `VALIDATION_SKIP_FLOWS` | off | `1` = catalog + integrity only |
| `VALIDATION_STRICT_RLS` | off | `1` = FAIL if RLS cannot be exercised |
| `VALIDATION_STRICT_REPRODUCIBILITY` | off | `1` = FAIL if RPC missing from repo migrations |

Documented in: `lib/system-validation-runner.ts` header, `scripts/run-system-validation.ts`, `docs/v2/phase-1-acceptance-gate.md`.

### `npm run validate:replay`

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` or `VALIDATION_DATABASE_URL` | Yes | Postgres |
| `REPLAY_ARTWORK_IDS` | Yes | Comma-separated artwork UUIDs |

### Phase 1 smoke scripts

| Variable | Script | Purpose |
|----------|--------|---------|
| `STAGING_URL` | `scripts/phase-1-staging-http-smoke.ts` | Staging base URL |
| `NEXT_PUBLIC_SITE_URL` | same (fallback) | |
| *(CLI arg)* `[base_url]` | `scripts/phase-1-redirect-smoke.sh` | Default `http://127.0.0.1:3000` |
| `.env.local` (loaded manually) | `scripts/phase-1-rp-supabase-smoke.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` only |

### Supabase CLI (not app env)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_ACCESS_TOKEN` | `supabase login` / CI (standard CLI; not read by Next app) |

---

## 6. Runtime / platform (not configured in project settings)

| Name | Set by | Role in repo |
|------|--------|--------------|
| `NODE_ENV` | Next.js | `development` → extra logging; `production` → secure cookies, cron auth strictness, suppress some RPC error detail |
| `VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_*` | Vercel injects | Build/deploy metadata only (see `.env.vercel.production` after `vercel env pull`) |
| `TURBO_*`, `NX_DAEMON` | Vercel/Turborepo | Build tooling |

---

## 7. Hardcoded configuration (not environment variables)

| Constant | Location | Value |
|----------|----------|-------|
| `EMAIL_FROM` | `lib/email-config.ts` | `RROWM Registry <no-reply@email.rrowm.io>` |
| Public site fallback | `lib/site-url.ts` | `https://rrowm.io` when neither `NEXT_PUBLIC_APP_URL` nor `NEXT_PUBLIC_SITE_URL` is set |

Resend **domain** must be verified for `email.rrowm.io`; env vars only change mailbox/local-part on that domain.

---

## 8. External platform configuration (not env vars in this repo)

| Platform | What to configure |
|----------|-------------------|
| **Supabase** | Auth redirect URLs for production host; apply migrations on the project matching `NEXT_PUBLIC_SUPABASE_URL`; PostgREST schema reload after RPC migrations |
| **Resend** | Domain `email.rrowm.io`; API key in `RESEND_API_KEY` |
| **Vercel** | Production env vars in §1–§3; redeploy after changing `NEXT_PUBLIC_*`; `vercel.json` crons require `CRON_SECRET` |

---

## 9. Consumer map (by feature)

| Feature | Variables |
|---------|-----------|
| Auth / middleware / SSR Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service-role server paths | `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` |
| Transactional email | `RESEND_API_KEY`, optional `RESEND_FROM_*`, `getSiteUrl()` vars |
| Contact form | `CONTACT_EMAIL_TO`, `RESEND_API_KEY` |
| Admin API + session | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, Supabase trio |
| Account lifecycle + crons | `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL` |
| Gallery invites | `INVITE_TOKEN_EXPIRY_DAYS`, Resend + site URL vars |
| Certificates / QR | `NEXT_PUBLIC_SITE_URL` (direct), service role for issue path |
| Test admin APIs | `NEXT_PUBLIC_ENABLE_TEST_MODE=true` only in non-prod QA |

---

## 10. Snapshot (audit date)

| Source | Application vars present |
|--------|--------------------------|
| `.env.local` (keys only) | `CONTACT_EMAIL_FROM`, `GALLERY_INVITE_EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — missing `DATABASE_URL`, `CRON_SECRET`, admin vars |
| Vercel production pull (`.env.vercel.production`) | **No** Supabase/Resend/app secrets — only `VERCEL_*` / Turbo |

**Production unblock checklist:** set §1 + §2 on Vercel Production → redeploy → confirm `/registry` and `/api/account/status` return 200.

---

## 11. Alphabetical index (code-referenced)

**Application & scripts**

- `ADMIN_PASSWORD`
- `ADMIN_USERNAME`
- `CONTACT_EMAIL_TO`
- `CRON_SECRET`
- `DATABASE_URL`
- `INVITE_TOKEN_EXPIRY_DAYS`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ENABLE_TEST_MODE`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `REPLAY_ARTWORK_IDS`
- `RESEND_API_KEY`
- `RESEND_FROM_INVITATIONS`
- `RESEND_FROM_REGISTRY`
- `STAGING_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VALIDATION_ARTIST_USER_ID`
- `VALIDATION_ARTWORK_DESCRIPTION`
- `VALIDATION_ARTWORK_DIMENSIONS`
- `VALIDATION_ARTWORK_MEDIUM`
- `VALIDATION_ARTWORK_TITLE`
- `VALIDATION_ARTWORK_YEAR`
- `VALIDATION_CHAIN_ARTWORK_ID`
- `VALIDATION_CONCURRENCY_DECLARED_VALUE`
- `VALIDATION_CURRENCY`
- `VALIDATION_DATABASE_URL`
- `VALIDATION_DECLARED_VALUE`
- `VALIDATION_GALLERY_STAFF_USER_ID`
- `VALIDATION_GALLERY_USER_ID`
- `VALIDATION_NON_OWNER_USER_ID`
- `VALIDATION_ROLLBACK`
- `VALIDATION_SECOND_OWNER_USER_ID`
- `VALIDATION_SKIP_FLOWS`
- `VALIDATION_STRICT_REPRODUCIBILITY`
- `VALIDATION_STRICT_RLS`
- `VALIDATION_VALUE_TYPE`
- `VALIDATION_VISIBILITY_LEVEL`

**Runtime only (do not set manually for app logic)**

- `NODE_ENV`

**Local `.env.local` only — not in codebase**

- `CONTACT_EMAIL_FROM`
- `GALLERY_INVITE_EMAIL_FROM`

**CLI / platform (outside Next `process.env` scan)**

- `SUPABASE_ACCESS_TOKEN`
