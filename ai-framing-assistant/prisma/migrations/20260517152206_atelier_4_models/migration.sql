-- CreateTable
CREATE TABLE "ProjectScorecard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "businessMaturity" INTEGER,
    "dataQuality" INTEGER,
    "workflowMaturity" INTEGER,
    "governanceMaturity" INTEGER,
    "riskControl" INTEGER,
    "complexityScore" INTEGER,
    "technicalFeasibility" INTEGER,
    "organizationalFeasibility" INTEGER,
    "regulatoryReadiness" INTEGER,
    "siIndependence" INTEGER,
    "aiReadiness" INTEGER,
    "autoFlags" TEXT,
    "justifications" TEXT,
    "overallScore" INTEGER,
    "overallLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectScorecard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriorityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "level" TEXT,
    "justification" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriorityAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier4Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "globalMaturity" TEXT,
    "globalFeasibility" TEXT,
    "globalRisk" TEXT,
    "recommendedDecision" TEXT,
    "decisionRationale" TEXT,
    "topRecommendations" TEXT,
    "strongPoints" TEXT,
    "weakPoints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier4Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier4Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "scoringComplete" BOOLEAN NOT NULL DEFAULT false,
    "weakPointsAddressed" BOOLEAN NOT NULL DEFAULT false,
    "priorityDefined" BOOLEAN NOT NULL DEFAULT false,
    "decisionRecommended" BOOLEAN NOT NULL DEFAULT false,
    "synthesisWritten" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier4Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectScorecard_projectId_key" ON "ProjectScorecard"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityAssessment_projectId_key" ON "PriorityAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier4Synthesis_projectId_key" ON "Atelier4Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier4Gate_projectId_key" ON "Atelier4Gate"("projectId");
