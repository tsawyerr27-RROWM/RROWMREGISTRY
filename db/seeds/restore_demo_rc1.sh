#!/usr/bin/env bash
# RROWM RC1 — restore demo seed into a clean Supabase DB (staging / beta)
# WARNING: truncates demo public tables before replay. Does not touch schema.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ -z "${DATABASE_URL:-}" ]] && [[ -f .env.local ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d "'\"")"
  export DATABASE_URL
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: set DATABASE_URL" >&2
  exit 1
fi

WIPE_SQL="$(dirname "$0")/demo_wipe_rc1.sql"
PUBLIC_SEED="$(dirname "$0")/demo_seed_rc1.sql"
AUTH_SEED="$(dirname "$0")/demo_auth_users_rc1.sql"

if [[ ! -f "$PUBLIC_SEED" ]]; then
  echo "ERROR: missing $PUBLIC_SEED" >&2
  exit 1
fi

echo "==> Wipe demo public data"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$WIPE_SQL"

if [[ -f "$AUTH_SEED" ]]; then
  echo "==> Restore auth demo users"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
SET session_replication_role = replica;
\\i $AUTH_SEED
SET session_replication_role = DEFAULT;
COMMIT;
SQL
fi

echo "==> Restore public demo seed"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
SET session_replication_role = replica;
\\i $PUBLIC_SEED
SET session_replication_role = DEFAULT;
COMMIT;
SQL

echo "==> Done"
