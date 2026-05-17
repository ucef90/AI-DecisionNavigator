-- CreateTable
CREATE TABLE "StrategicVision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "visionStatement" TEXT,
    "strategicObjectives" TEXT,
    "businessValue" TEXT,
    "transformationGoals" TEXT,
    "successCriteria" TEXT,
    "businessValueScore" INTEGER,
    "transformationScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrategicVision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'PHASE_0_POC',
    "position" INTEGER NOT NULL DEFAULT 0,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "complexity" INTEGER NOT NULL DEFAULT 3,
    "effortMonths" INTEGER,
    "dependencies" TEXT,
    "itemType" TEXT NOT NULL DEFAULT 'STRATEGIC',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "ownerRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoadmapItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IndustrializationStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "readinessLevel" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "startTarget" DATETIME,
    "endTarget" DATETIME,
    "exitCriteria" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IndustrializationStep_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier7Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "globalProjectScore" INTEGER,
    "globalMaturity" TEXT,
    "finalDecision" TEXT,
    "decisionRationale" TEXT,
    "strongPoints" TEXT,
    "weakPoints" TEXT,
    "mainRisks" TEXT,
    "roadmapSummary" TEXT,
    "industrializationStrategy" TEXT,
    "governanceStrategy" TEXT,
    "pilotageStrategy" TEXT,
    "sponsorDecision" TEXT,
    "sponsorName" TEXT,
    "sponsorDecisionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier7Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier7Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "visionDefined" BOOLEAN NOT NULL DEFAULT false,
    "roadmapBuilt" BOOLEAN NOT NULL DEFAULT false,
    "industrializationPlanned" BOOLEAN NOT NULL DEFAULT false,
    "finalDecisionMade" BOOLEAN NOT NULL DEFAULT false,
    "sponsorSignOff" BOOLEAN NOT NULL DEFAULT false,
    "deliverableExported" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier7Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StrategicVision_projectId_key" ON "StrategicVision"("projectId");

-- CreateIndex
CREATE INDEX "RoadmapItem_projectId_phase_idx" ON "RoadmapItem"("projectId", "phase");

-- CreateIndex
CREATE INDEX "IndustrializationStep_projectId_stage_idx" ON "IndustrializationStep"("projectId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier7Synthesis_projectId_key" ON "Atelier7Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier7Gate_projectId_key" ON "Atelier7Gate"("projectId");
