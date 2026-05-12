# syntax=docker/dockerfile:1.7
#
# AI Decision Navigator — production image.
#
# Multi-stage:
#   1. deps    — install npm dependencies (cached layer)
#   2. builder — switch schema to Postgres, generate client, next build
#   3. runner  — minimal runtime image using Next.js standalone output
#
# Result: ~250 MB image, no build tooling, ready to run behind a reverse
# proxy on port 3000. The runtime expects DATABASE_URL to be set to a
# Postgres URL (see docker-compose.yml or DEPLOY.md).

# -------------------------------------------------------------
# 1. deps
# -------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# better-sqlite3 native build needs python3 + make + g++ — we still install
# the package in the deps stage because Prisma references the SQLite adapter
# in lib/prisma.ts (the runtime branch on DATABASE_URL won't actually
# instantiate it in Postgres mode).
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# -------------------------------------------------------------
# 2. builder
# -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Switch the schema provider to PostgreSQL before generating the client.
# This is idempotent (no-op if already postgres) and keeps the local dev
# experience (SQLite) untouched in source.
RUN node scripts/prepare-postgres.mjs

# Generate the Prisma client (Postgres dialect now).
RUN npx prisma generate

# Build Next.js — outputs `.next/standalone/` thanks to next.config.ts.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -------------------------------------------------------------
# 3. runner
# -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat bash

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy minimal runtime
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma artefacts needed at runtime: the schema + generated client + the
# tsx binary so the seed script can run via the entrypoint.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg ./node_modules/pg
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-pool ./node_modules/pg-pool
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-types ./node_modules/pg-types
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pg-connection-string ./node_modules/pg-connection-string
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pgpass ./node_modules/pgpass
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/tsx ./node_modules/.bin/tsx

# Entrypoint: runs `prisma db push` + optional seed + starts the server.
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
