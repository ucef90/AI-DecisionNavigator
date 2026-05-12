// Smoke test — runs the engines against the seeded demo projects and prints
// the decision + total. Validates SPEC.MD §389-400 expectations:
//   demo-mailbox  → GO_IA or POC_IA
//   demo-pmi      → NO_GO or STUDY
//   demo-lad-mdph → POC_IA or STUDY

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { buildProjectSnapshot } from "../src/lib/db/snapshot";
import { computeEngineReport } from "../src/lib/engines";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = url.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filePath });
const prisma = new PrismaClient({ adapter, log: ["error"] });

// We must re-create the prisma singleton used by buildProjectSnapshot. The
// snapshot module imports prisma from "@/lib/prisma", and tsx resolves that
// through tsconfig paths — so it'll work as long as we don't import this
// module before initialising. The cleanest path is to inline a minimal
// snapshot here, but reusing buildProjectSnapshot keeps a single code path.
//
// Trick: monkey-patch the global to share our prisma instance with
// @/lib/prisma's singleton.
(globalThis as unknown as { prisma?: unknown }).prisma = prisma;

type Expectation = {
  id: string;
  label: string;
  expected: string[];
};

const EXPECTATIONS: Expectation[] = [
  { id: "demo-mailbox", label: "Boîtes mails", expected: ["GO_IA", "POC_IA"] },
  { id: "demo-pmi", label: "Interprétariat PMI", expected: ["NO_GO", "STUDY"] },
  { id: "demo-lad-mdph", label: "LAD MDPH", expected: ["POC_IA", "STUDY"] },
];

async function main() {
  let allOk = true;
  for (const exp of EXPECTATIONS) {
    const snapshot = await buildProjectSnapshot(exp.id);
    if (!snapshot) {
      console.log(`✗ ${exp.label}: snapshot manquant (lancer 'npm run seed' d'abord)`);
      allOk = false;
      continue;
    }
    const report = computeEngineReport(snapshot);
    const ok = exp.expected.includes(report.decision.decision);
    const mark = ok ? "✓" : "✗";
    console.log(
      `${mark} ${exp.label.padEnd(22)} → ${report.decision.decision.padEnd(11)} (score ${report.scoring.total}/18, attendu ${exp.expected.join("|")})`,
    );
    console.log(`    ${report.decision.headline}`);
    if (report.decision.overridden) {
      console.log(`    [overridden depuis ${report.decision.decisionFromTotal}]`);
    }
    const blockers = report.decision.blockers;
    if (blockers.length > 0) {
      console.log(`    Bloquants: ${blockers.map((b) => b.title).join(", ")}`);
    }
    console.log();
    if (!ok) allOk = false;
  }
  console.log(allOk ? "→ Tous les cas SPEC sont conformes." : "→ Au moins un cas SPEC dévie. Tuner les règles.");
  process.exit(allOk ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
