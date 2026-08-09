# RROWM Registry — Security & Correctness Fix Plan

Source: adversarial audit (registry-bug-hunter), Aug 2026.
Ten confirmed findings. Sequenced by exploitability and blast radius, not by file.

Legend: 🔴 stop-ship · 🟠 high · 🟡 medium · ⚪ low
Each item: what, files, fix approach, how we verify, deploy note.

---

## PHASE 0 — Stop-ship (deploy the moment each is green)

### 0.1 🔴 Forgeable admin session  [#1]
Any non-empty `rrowm_admin_session` cookie grants a service-role client:
verify-artwork, issue-certificate, account delete/restore, audit export, /internal.
- Files: `lib/api-admin-auth.ts:25`, `app/api/admin/login/route.ts`,
  `app/api/admin/check/route.ts:8`, `app/api/admin/pending-count/route.ts:8`, `proxy.ts:59`.
- Fix: make the cookie a signed, verifiable token. Stateless HMAC (no new table):
  token = `base64url(payload).base64url(HMAC_SHA256(payload, ADMIN_SESSION_SECRET))`,
  payload = `{ sub:"admin", iat, exp }`. Add `lib/admin-session.ts` with
  `signAdminToken()` / `verifyAdminToken()` (Node `crypto`, `timingSafeEqual`).
  Login issues signed token; `requireAdminApi`, `/check`, `/pending-count`, and the
  `proxy.ts` gate all call `verifyAdminToken` instead of presence-checking.
- New env: `ADMIN_SESSION_SECRET` (Vercel, all environments). Note in README.
- Verify: forged/edited/expired cookie → 401 on `/api/admin/pending-count`;
  real login still reaches admin routes; `proxy.ts` still redirects `/internal` when unsigned.
- Gotcha: `proxy.ts` runs in Edge middleware — use Web Crypto (`crypto.subtle`), not
  `node:crypto`, in the shared verifier, or split an Edge-safe verify path.

### 0.2 🟠 Deal-completion injection via free-text note  [#2]
`/api/provenance-transfer/accept` regex-extracts `deal_id=` from the user-writable
`note`; loads that deal with the service client; no check that the transfer's parties
are deal participants or that `deal.artwork_id === transfer.artwork_id`.
Lets an attacker complete a victim's deal and archive their artwork.
- Files: `app/api/provenance-transfer/accept/route.ts:150`,
  `app/api/provenance-transfer/initiate/route.ts:83`,
  `lib/registry-steward-invite-send.ts:331`, ownership-loop handlers.
- Fix: stop trusting `note`. Add a machine-written column
  (`provenance_transfers.linked_deal_id uuid`) set only server-side at initiate.
  On accept, before `onDealCompleted`: assert `deal.artwork_id === transfer.artwork_id`
  AND `transfer.from_user_id` is a participant of the deal. Strip `deal_id=` tokens
  from any user-supplied note/context on write.
- Migration: add nullable column + backfill from existing notes (one-off, reviewed).
- Verify: crafted note with a foreign deal_id → rejected; legitimate linked deal still
  completes; artwork ownership loop unchanged for the happy path.

### 0.3 🟠 Null-unsafe Supabase browser client (site-wide white screen)  [#3]
`getSupabaseBrowserClient` returns `null as any`; global Header calls `.auth` on it.
Missing/renamed env on any deploy = every page blank. 13 callers share the pattern.
- Files: `lib/supabase.ts:37`, `hooks/useSupabaseBrowserLazy.ts:18`, + 13 callers
  (Header, ArtworkModal, EnquiryModal, OwnershipVerificationControls, OwnershipClaimModal,
  Studio activity/deals, DealCounterpartyPicker, StudioSaleTransferModal,
  CertificateOverviewModal, useAccountActivityFeed, replay-debugger).
- Fix: `getSupabaseBrowserClient` throws on misconfig (fail-fast, visible) instead of
  `null as any`; drop the `ref.current!` laundering in the hook. Wrap Header's
  auth-subscribe effect in a try/catch that degrades to signed-out rather than crashing.
- Verify: with env present, no behaviour change; temporarily blank a var in dev →
  header degrades, page still renders shell (not white screen).

Deploy checkpoint: ship 0.1–0.3 together or back-to-back. These are the only three
exploitable-today / outage-today items.

---

## PHASE 1 — Correctness the users can see (one PR)

### 1.1 🟡 Closing-soon count ignores verified-gallery filter  [#5]
`countClosingSoonOpportunities` omits the `galleries!inner(verified)` join that
`countLiveOpportunities` and the explorer both apply → badge can exceed visible list.
- File: `lib/field-counts.ts:88`. Add `"id, galleries!inner(verified)"` +
  `.eq("galleries.verified", true)`.
- Verify: closing-soon ≤ live opportunities on `/field`.

### 1.2 🟡 Opportunities `total` counts rows the JS then filters out  [#6]
window="all" uses SQL `count` (unverified galleries included); rows filtered to verified
in JS → pagination advertises empty pages.
- File: `lib/fetch-field-opportunities-list.ts:176`. Use `cards.length`, or push the
  verified filter into SQL and keep the exact count. Prefer SQL filter for consistency.
- Verify: last page of `/field/opportunities` is never empty.

### 1.3 🟡 Search terms with parentheses break `.or()` / 500 the explorer  [#8]
`(` `)` not stripped from hand-built PostgREST filter; "Untitled (Study)" → empty
results in lists, 500 in opportunities.
- Files: `lib/field-search-contract.ts:112` (canonical), inline copies in
  `fetch-artist-artwork-list.ts:53`, `fetch-verified-artwork-list.ts:39`,
  `fetch-field-opportunities-list.ts:111`.
- Fix: strip `[(),]` in `normalizeFieldSearchTerm`; replace the two inline
  `replace(/,/g," ")` copies with the shared normaliser (kills a duplicated-truth too).
- Verify: search `Untitled (Study)` → 200 + sane results on records and opportunities.

### 1.4 🟡 Dead email arm in pending-transfer resolver  [#7]
Fallback query `.or("recipient_user_id.eq.<uid>")` never matches email-addressed
pending rows the JS filter also tries to match → some pending transfers invisible.
- Files: `lib/ownership-resolver.ts:125`, same shape `lib/acquisition-ownership-loop.ts:376`.
- Fix: resolve caller email first, query
  `.or("recipient_user_id.eq.<uid>,recipient_email.eq.<email>")`.
- Verify: an email-addressed pending transfer shows via the fallback path (force RPC empty).

---

## PHASE 2 — Hardening & hygiene (one PR)

### 2.1 🟡 Admin login: no rate limit, timing-unsafe compare  [#4]
- File: `app/api/admin/login/route.ts:35`. Add IP rate-limit (reuse the guard used by
  other mutations) + `crypto.timingSafeEqual` for user/pass.
- Verify: N wrong attempts → 429; correct login still works.

### 2.2 ⚪ Certificate re-anchors on every call  [#9]
Anchor insert runs even when RPC returns `created === false` (idempotent) → duplicate
anchor rows, up to 40/hr/user.
- File: `lib/issue-certificate.ts:71`. Wrap anchoring in `if (created)`.
- Verify: re-issuing same cert adds no new `record_anchors` row.

### 2.3 ⚪ Cron auth duplicated + fails open off-production  [#10]
`authorizeCron` copied verbatim in two routes; non-constant-time; fails open when
`CRON_SECRET` unset outside prod.
- Files: `app/api/cron/process-deletions/route.ts:11`, `process-exports/route.ts:4`.
- Fix: extract one helper, `timingSafeEqual`, require the secret in all envs (or fail closed).
- Verify: missing/incorrect secret → 401 in dev and prod.

---

## Cross-cutting verification (run before each phase merges)
- `npx tsc --noEmit` clean (typecheck against full deps; sandbox postinstall needs `--ignore-scripts`).
- Manual smoke on the touched surfaces via the running dev server.
- For Phase 0: re-run the registry-bug-hunter agent scoped to the changed files to
  confirm the archetype is closed, not merely moved.

## Env / config changes introduced
- `ADMIN_SESSION_SECRET` — new, required, all Vercel environments (0.1).
- Confirm `NEXT_PUBLIC_SITE_URL=https://rrowm.io` in prod (from earlier metadataBase work).
- Confirm `vercel.json` region `lhr1` matches the Supabase project region before deploy.

## Migrations introduced
- `provenance_transfers.linked_deal_id uuid` + backfill (0.2). Review backfill on a branch first.

## Suggested commit / PR boundaries
1. PR-A (Phase 0.1) — admin session signing.
2. PR-B (Phase 0.2) — deal-linkage column + accept-route authz.
3. PR-C (Phase 0.3) — browser client fail-fast.
4. PR-D (Phase 1) — Field correctness batch (1.1–1.4).
5. PR-E (Phase 2) — hardening batch (2.1–2.3).
Plus the already-done, uncommitted work (gutter fix, gutter consolidation, favicon/OG,
field perf + 72h bug, title de-dup) as its own PR ahead of these.
