// Prisma client singleton — dual-adapter (SQLite / PostgreSQL).
//
// The adapter is chosen from `DATABASE_URL`'s scheme:
//   - "file:..."     → @prisma/adapter-better-sqlite3 (dev local, zero-setup)
//   - "postgresql://" or "postgres://" → @prisma/adapter-pg (Docker / prod)
//
// The generated Prisma client uses driver-adapters mode, so we just wire
// the right adapter and the rest of the app is unchanged.
//
// IMPORTANT: in Docker build the schema's provider has been swapped to
// "postgresql" by `scripts/prepare-postgres.mjs` BEFORE `prisma generate`,
// so the generated client expects Postgres dialect. In dev (SQLite), the
// schema stays `provider = "sqlite"`.

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const isPostgres =
    url.startsWith("postgresql://") || url.startsWith("postgres://");

  const adapter = isPostgres
    ? new PrismaPg({ connectionString: url })
    : new PrismaBetterSqlite3({ url: url.replace(/^file:/, "") });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
