-- PostgREST keeps a schema cache. After DDL (new columns), the API may return
-- "Could not find the '…' column … in the schema cache" until the cache reloads.
-- This notify is the standard fix (Supabase / PostgREST).
notify pgrst, 'reload schema';
