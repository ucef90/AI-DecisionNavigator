-- CreateTable
CREATE TABLE "CartographyAnnotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'NOTE',
    "criticality" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartographyAnnotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier5Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "systemOverview" TEXT,
    "criticalNodes" TEXT,
    "missingComponents" TEXT,
    "governanceObservations" TEXT,
    "governanceHotspots" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier5Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier5Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sixLayersReviewed" BOOLEAN NOT NULL DEFAULT false,
    "criticalNodesAnnotated" BOOLEAN NOT NULL DEFAULT false,
    "governanceMapDefined" BOOLEAN NOT NULL DEFAULT false,
    "riskMapDefined" BOOLEAN NOT NULL DEFAULT false,
    "synthesisWritten" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier5Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CartographyAnnotation_projectId_layer_idx" ON "CartographyAnnotation"("projectId", "layer");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier5Synthesis_projectId_key" ON "Atelier5Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier5Gate_projectId_key" ON "Atelier5Gate"("projectId");
