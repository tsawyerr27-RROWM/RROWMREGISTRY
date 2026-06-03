# Account lifecycle deployment checklist

## Environment variables

- `CRON_SECRET` — bearer token for `/api/cron/process-deletions` and `/api/cron/process-exports`
- `SUPABASE_SERVICE_ROLE_KEY` — required for lifecycle RPCs and auth admin ban/delete
- `RESEND_API_KEY` — transactional emails (deletion, restore, export ready)
- `NEXT_PUBLIC_APP_URL` — absolute links in emails

## Database

1. Run migration `20260531120000_account_lifecycle.sql` on staging, then production
2. Verify `actor_profiles.account_status` backfilled to `active`
3. Confirm `provenance_transfers.from_user_id` allows NULL (SET NULL on user delete)

## Vercel

1. Deploy with `vercel.json` crons (03:00 deletions, 04:00 export expiry)
2. Set `CRON_SECRET` in project env; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`

## Pre-launch verification

- [ ] Request data export from My Account → Privacy & data
- [ ] Deactivate account → confirm login blocked → reactivate
- [ ] Full 4-step deletion flow → email received → restore via `/account/restore?token=…`
- [ ] Admin console → Account lifecycle → restore / extend / force delete
- [ ] Audit CSV export downloads from admin panel
- [ ] Cron dry-run: `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/process-deletions`
- [ ] Registry integrity: ownership chain intact after scheduled deletion (test user)
- [ ] Legacy `POST /api/account/delete` returns 410

## Legal

- [x] Update privacy policy to reference in-app export and 30-day deletion window
- [x] Document lawful retention basis for anonymised registry records

## Rollback

- Disable crons in Vercel dashboard
- Re-enable legacy delete only if critical — not recommended once users have pending deletions
