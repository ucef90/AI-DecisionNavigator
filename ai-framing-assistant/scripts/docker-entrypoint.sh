#!/usr/bin/env bash
# AI Decision Navigator — container entrypoint.
#
# Responsibilities at startup:
#   1. Wait for Postgres to accept connections (the compose healthcheck
#      should handle this too, but we keep a safety loop).
#   2. Apply the schema with `prisma db push` (idempotent — no destructive
#      changes on subsequent boots).
#   3. Optionally seed the 3 demo SPEC projects (controlled by env flag).
#   4. Start the Next.js standalone server.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] DATABASE_URL is not set." >&2
  exit 1
fi

# 1. Wait for Postgres.
HOST_PORT=$(echo "${DATABASE_URL}" | sed -E 's|^.*@([^/]+).*$|\1|')
HOST="${HOST_PORT%%:*}"
PORT="${HOST_PORT##*:}"
if [ "${PORT}" = "${HOST}" ]; then
  PORT=5432
fi
echo "[entrypoint] waiting for ${HOST}:${PORT} ..."
ATTEMPTS=0
until (echo > "/dev/tcp/${HOST}/${PORT}") >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "${ATTEMPTS}" -gt 60 ]; then
    echo "[entrypoint] Postgres did not come up after 60s." >&2
    exit 1
  fi
  sleep 1
done
echo "[entrypoint] Postgres is reachable."

# 2. Apply schema.
echo "[entrypoint] applying schema via prisma db push ..."
npx prisma db push --skip-generate --accept-data-loss

# 3. Optional seed.
if [ "${SEED_DEMO:-false}" = "true" ]; then
  echo "[entrypoint] seeding demo projects ..."
  ./node_modules/.bin/tsx prisma/seed.ts || echo "[entrypoint] seed failed (continuing)."
fi

# 4. Start Next.js standalone server.
echo "[entrypoint] starting Next.js server on :${PORT:-3000} ..."
exec node server.js
