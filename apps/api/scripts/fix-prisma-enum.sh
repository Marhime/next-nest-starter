#!/usr/bin/env bash
set -euo pipefail

# fix-prisma-enum.sh
# Safe helper to add an enum value to the main database and the Prisma shadow database
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
#   export SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/shadow_db"
#   ./apps/api/scripts/fix-prisma-enum.sh ListingType RENT

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <EnumTypeName> <ValueToAdd>"
  echo "Example: $0 ListingType RENT"
  exit 2
fi

ENUM_NAME="$1"
VALUE_TO_ADD="$2"

: "${DATABASE_URL:?Need to set DATABASE_URL in env}"
: "${SHADOW_DATABASE_URL:?Need to set SHADOW_DATABASE_URL in env}"

SQL=$(cat <<'EOF'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = lower('${ENUM_NAME}') AND e.enumlabel = '${VALUE_TO_ADD}'
  ) THEN
    EXECUTE format('ALTER TYPE "%I" ADD VALUE %L', '${ENUM_NAME}', '${VALUE_TO_ADD}');
  END IF;
END
$$;
EOF
)

echo "Adding enum value '${VALUE_TO_ADD}' to main DB..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "$SQL"

echo "Adding enum value '${VALUE_TO_ADD}' to shadow DB..."
psql "$SHADOW_DATABASE_URL" -v ON_ERROR_STOP=1 -c "$SQL"

echo "Done. Now run in apps/api: npx prisma migrate dev"
