#!/usr/bin/env node
// Build-time schema transformer — SQLite → PostgreSQL.
//
// The Prisma schema is the source of truth and is authored against SQLite
// for zero-setup dev. When the Docker image is built, this script rewrites
// the `datasource` block so the generated client is Postgres-aware:
//
//   provider = "sqlite"
//   →
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
//
// The transformation is idempotent: re-running it on an already-converted
// schema does nothing.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = resolve(__dirname, "..", "prisma", "schema.prisma");

const raw = readFileSync(SCHEMA, "utf8");

if (raw.includes('provider = "postgresql"')) {
  console.log("[prepare-postgres] schema.prisma is already PostgreSQL — nothing to do.");
  process.exit(0);
}

// Replace the datasource block in one pass. The current dev block looks like:
//
//   datasource db {
//     provider = "sqlite"
//   }
//
// We replace it with a Postgres datasource that reads DATABASE_URL from env.

const datasourceRe = /datasource\s+db\s*\{[\s\S]*?\}/m;
const replacement = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

if (!datasourceRe.test(raw)) {
  console.error("[prepare-postgres] could not find the datasource block in schema.prisma.");
  process.exit(1);
}

const next = raw.replace(datasourceRe, replacement);
writeFileSync(SCHEMA, next, "utf8");
console.log("[prepare-postgres] schema.prisma switched to PostgreSQL.");
