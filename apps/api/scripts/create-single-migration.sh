#!/usr/bin/env bash
set -euo pipefail

# create-single-migration.sh
# Dangerous: wipes public schema and removes existing migration history in `prisma/migrations`.
# Intended for local development only when you want a single clean migration file.
# REQUIRE: set FORCE=yes in environment to run this script.
# Usage:
#   cd apps/api
#   FORCE=yes DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
#     npx --yes ../../apps/api/scripts/create-single-migration.sh

if [ "${FORCE:-}" != "yes" ] && [ "${FORCE:-}" != "YES" ]; then
  echo "This script is destructive. To run it, set FORCE=yes and re-run." >&2
  echo "Example: FORCE=yes ./apps/api/scripts/create-single-migration.sh" >&2
  exit 2
fi

: "${DATABASE_URL:?DATABASE_URL must be set in the environment}" 

echo "[create-single-migration] Running in apps/api with DATABASE_URL=${DATABASE_URL}" 

echo "[create-single-migration] Removing existing migration folders under prisma/migrations (if any)"
rm -rf prisma/migrations/*

echo "[create-single-migration] Wiping public schema (DROP SCHEMA public CASCADE; CREATE SCHEMA public;)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' || {
  echo "Failed to wipe schema. Ensure psql is available and DATABASE_URL is correct." >&2
  exit 3
}

echo "[create-single-migration] Generating single migration 'init' and applying it"
if npx prisma migrate dev --name init; then
  echo "[create-single-migration] Migration applied successfully. Generating Prisma client..."
  npx prisma generate
  echo "[create-single-migration] Done. You now have a single migration in prisma/migrations/" 
  exit 0
else
  echo "[create-single-migration] Migration failed. If you see an error P3006 (unsafe use of new enum value)," >&2
  echo "  then the DB engine requires the enum value to be committed before use. You have two options:" >&2
  echo "  1) Run the helper to add enum values to DB and shadow DB: ./scripts/fix-prisma-enum.sh ListingType RENT" >&2
  echo "  2) Create a two-step migration: first a migration that only adds enum values, apply it; then create the rest." >&2
  echo "See README or ask me to prepare the split migration files for you." >&2
  exit 4
fi
