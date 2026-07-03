#!/usr/bin/env bash
# RROWM RC1 — export demo dataset (public + optional auth)
# Requires: pg_dump, psql, DATABASE_URL in environment or .env.local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ -z "${DATABASE_URL:-}" ]] && [[ -f .env.local ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d "'\"")"
  export DATABASE_URL
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: set DATABASE_URL or add it to .env.local" >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump not found. Install PostgreSQL client tools (e.g. brew install libpq)." >&2
  exit 1
fi

mkdir -p db/seeds

echo "==> Preflight: public tables"
psql "$DATABASE_URL" -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;
"

echo "==> Preflight: row counts (exact)"
psql "$DATABASE_URL" -c "
SELECT 'galleries' AS t, count(*) FROM public.galleries UNION ALL
SELECT 'artworks', count(*) FROM public.artworks UNION ALL
SELECT 'deals', count(*) FROM public.deals UNION ALL
SELECT 'notifications', count(*) FROM public.notifications UNION ALL
SELECT 'telemetry_events', count(*) FROM public.telemetry_events;
"

PUBLIC_TABLES=(
  galleries actor_profiles artists collector_profiles gallery_users
  artworks field_programmes field_briefs deals
  value_events ownership_events sale_intents
  verification_events certificates provenance_events record_anchors
  provenance_transfers ownership_claims
  artwork_representation_relationships artwork_confirmation_events
  representation_amendment_requests gallery_artist_invites
  artwork_authentication_invites registry_steward_invites
  artwork_archives archive_events
  deal_revisions deal_messages deal_execution_records rights_licenses
  representation_relationships field_opportunity_applications
  notifications activity_events collector_vault_items
)

TABLE_ARGS=()
for t in "${PUBLIC_TABLES[@]}"; do
  TABLE_ARGS+=(--table="public.${t}")
done

echo "==> Exporting public demo seed"
pg_dump \
  --dbname="$DATABASE_URL" \
  --schema=public \
  --data-only \
  --inserts \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --encoding=UTF8 \
  "${TABLE_ARGS[@]}" \
  > db/seeds/demo_seed_rc1.sql

if [[ "${EXPORT_AUTH:-1}" == "1" ]]; then
  echo "==> Exporting auth demo users"
  pg_dump \
    --dbname="$DATABASE_URL" \
    --schema=auth \
    --data-only \
    --inserts \
    --column-inserts \
    --no-owner \
    --no-privileges \
    --table=auth.users \
    --table=auth.identities \
    > db/seeds/demo_auth_users_rc1.sql
fi

echo "==> Post-export validation"
if grep -qE 'INSERT INTO (auth\.|storage\.|telemetry_events|runtime_errors|system_errors)' db/seeds/demo_seed_rc1.sql; then
  echo "ERROR: excluded tables found in public seed" >&2
  exit 1
fi

echo "OK: db/seeds/demo_seed_rc1.sql ($(wc -c < db/seeds/demo_seed_rc1.sql) bytes)"
if [[ -f db/seeds/demo_auth_users_rc1.sql ]]; then
  echo "OK: db/seeds/demo_auth_users_rc1.sql ($(wc -c < db/seeds/demo_auth_users_rc1.sql) bytes)"
fi
