# Supabase migrations

Apply SQL in `migrations/` to your Supabase project (SQL Editor → paste → run), or use the Supabase CLI:

```bash
supabase db push
```

After adding `actor_profiles`, the app will:

- Redirect **gallery** roles from `/dashboard` → `/gallery-dashboard`
- Let users complete **Account setup** at `/account/setup?type=artist|gallery`
