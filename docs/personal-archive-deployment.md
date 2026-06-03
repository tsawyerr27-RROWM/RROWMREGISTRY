# Personal Archive deployment

## Symptom

- `Could not find the table 'public.artwork_archives' in the schema cache` (PostgREST **PGRST205**), or
- The app shows: *Personal Archive is not available on this environment yet…*

The migration has **not** been applied to the Supabase project your app uses (`NEXT_PUBLIC_SUPABASE_URL`), or PostgREST has not reloaded after DDL.

## Quick check

```bash
# From repo root (uses .env.local)
source .env.local
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/artwork_archives?select=id&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
```

HTTP **200** (even `[]`) = table is visible. HTTP **404** with `PGRST205` = migration still required.

## Fix A — SQL Editor (fastest)

1. Open [Supabase Dashboard → SQL](https://supabase.com/dashboard/project/_/sql) for the **same** project as `NEXT_PUBLIC_SUPABASE_URL`.
2. Paste and run the full contents of **`supabase/manual/apply_personal_archive.sql`** (idempotent).
3. Wait ~30s or run: `notify pgrst, 'reload schema';`
4. Re-run the curl check above, then retry archive on an artwork page or `/personal-archive`.

## Fix B — CLI script (direct Postgres)

1. Dashboard → **Project Settings → Database** → copy the **URI** connection string (postgres role).
2. Add to `.env.local` temporarily as `DATABASE_URL` (do not commit), or export in the shell:

```bash
DATABASE_URL="postgresql://postgres...." npx tsx scripts/apply-personal-archive-migration.ts
```

The script applies `supabase/manual/apply_personal_archive.sql` and probes PostgREST.

## Fix C — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Verify in SQL Editor

```sql
select to_regclass('public.artwork_archives') as artwork_archives;
select public.get_artwork_archive_count(id) from public.artworks limit 1;
```

Both should succeed without error.

## App behaviour before migration

Until the migration is applied, archive controls show zero counts and return **503** when you try to archive — they will not crash the page.
