// Smoke test — generates all 7 deliverables for each seeded project and
// reports size + first heading. Validates the deliverables engine on the
// real seed data.

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { buildProjectSnapshot } from "../src/lib/db/snapshot";
import { computeEngineReport } from "../src/lib/engines";
import { generateAllDeliverables } from "../src/lib/engines/deliverables";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filePath });
const prisma = new PrismaClient({ adapter, log: ["error"] });
(globalThis as unknown as { prisma?: unknown }).prisma = prisma;

const PROJECT_IDS = ["demo-mailbox", "demo-pmi", "demo-lad-mdph"];

async function main() {
  for (const pid of PROJECT_IDS) {
    const snap = await buildProjectSnapshot(pid);
    if (!snap) {
      console.log(`✗ ${pid} : snapshot manquant`);
      continue;
    }
    const report = computeEngineReport(snap);
    const all = generateAllDeliverables(snap, report);

    console.log(`\n# ${snap.name}`);
    for (const d of all) {
      const firstLine = d.content.split("\n", 2)[0];
      const sizeKB = (d.content.length / 1024).toFixed(1);
      console.log(`  ${d.type.padEnd(15)} ${firstLine.padEnd(40)} ${sizeKB} KB`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
