-- CreateTable
CREATE TABLE "BusinessQualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "directionConcerned" TEXT,
    "businessOwner" TEXT,
    "workshopDate" DATETIME,
    "workshopParticipants" TEXT,
    "triggerEvent" TEXT,
    "priorityReason" TEXT,
    "regulatoryPressure" BOOLEAN NOT NULL DEFAULT false,
    "operationalOverload" BOOLEAN NOT NULL DEFAULT false,
    "serviceDegradation" BOOLEAN NOT NULL DEFAULT false,
    "strategicAlignment" TEXT,
    "driverVolumeIncrease" BOOLEAN NOT NULL DEFAULT false,
    "driverResourceShortage" BOOLEAN NOT NULL DEFAULT false,
    "driverFrequentErrors" BOOLEAN NOT NULL DEFAULT false,
    "driverPoorUserExperience" BOOLEAN NOT NULL DEFAULT false,
    "driverManualWorkflow" BOOLEAN NOT NULL DEFAULT false,
    "driverLowTraceability" BOOLEAN NOT NULL DEFAULT false,
    "driverHighDelays" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessQualification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectScope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "inScope" TEXT,
    "outOfScope" TEXT,
    "assumptionsForScope" TEXT,
    "scopeValidatedBy" TEXT,
    "scopeValidatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectScope_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessActor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT,
    "volume" INTEGER,
    "involvement" TEXT,
    "currentPain" TEXT,
    "expectedGain" TEXT,
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessActor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "actor" TEXT,
    "tools" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'MANUAL',
    "stepType" TEXT NOT NULL DEFAULT 'TREATMENT',
    "durationMin" INTEGER,
    "notes" TEXT,
    "targetMode" TEXT,
    "targetNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProcessStep_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Irritant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "impactedActor" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "frequency" TEXT,
    "processStepId" TEXT,
    "estimatedTimeWastedMinPerDay" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Irritant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "axis" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "direction" TEXT NOT NULL DEFAULT 'NEGATIVE',
    "metric" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessImpact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessObjective" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "targetKpiId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessObjective_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KpiBaseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "currentValue" TEXT,
    "targetValue" TEXT,
    "source" TEXT,
    "measureStatus" TEXT NOT NULL DEFAULT 'NOT_MEASURED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KpiBaseline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectAssumption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "assumptionType" TEXT NOT NULL DEFAULT 'BUSINESS',
    "riskIfWrong" TEXT NOT NULL DEFAULT 'MEDIUM',
    "validationPlan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectAssumption_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Uncertainty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerToAsk" TEXT,
    "dueBy" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Uncertainty_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessConstraint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "constraintType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessConstraint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImprovementOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "estimatedGain" TEXT,
    "effort" TEXT NOT NULL DEFAULT 'MEDIUM',
    "relatedIrritantId" TEXT,
    "relatedStepId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImprovementOpportunity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserVerbatim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "speakerRole" TEXT,
    "speakerName" TEXT,
    "collectedAt" DATETIME,
    "source" TEXT NOT NULL DEFAULT 'INTERVIEW',
    "sentiment" TEXT NOT NULL DEFAULT 'NEGATIVE',
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserVerbatim_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkshopReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "workshopDate" DATETIME,
    "participants" TEXT,
    "objectives" TEXT,
    "topicsCovered" TEXT,
    "keyFindings" TEXT,
    "identifiedRisks" TEXT,
    "decisionsMade" TEXT,
    "actionsToTake" TEXT,
    "openTopics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkshopReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier1Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "reformulatedWithoutTech" BOOLEAN NOT NULL DEFAULT false,
    "atLeastThreeIrritants" BOOLEAN NOT NULL DEFAULT false,
    "workflowAsIsMapped" BOOLEAN NOT NULL DEFAULT false,
    "baselineKpiMeasured" BOOLEAN NOT NULL DEFAULT false,
    "scopeValidatedBySponsor" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier1Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "initialRequest" TEXT,
    "reformulatedNeed" TEXT,
    "painPoints" TEXT,
    "expectedValue" TEXT,
    "usersImpacted" TEXT,
    "currentKpis" TEXT,
    "expectedOutcome" TEXT,
    "problemStatement" TEXT,
    "currentImpactSummary" TEXT,
    "expectedResultSummary" TEXT,
    "declaredMaturityLevel" TEXT,
    "solutionBiasDetected" BOOLEAN NOT NULL DEFAULT false,
    "solutionBiasNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessNeed_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessNeed" ("createdAt", "currentKpis", "expectedOutcome", "expectedValue", "id", "initialRequest", "painPoints", "projectId", "reformulatedNeed", "updatedAt", "usersImpacted") SELECT "createdAt", "currentKpis", "expectedOutcome", "expectedValue", "id", "initialRequest", "painPoints", "projectId", "reformulatedNeed", "updatedAt", "usersImpacted" FROM "BusinessNeed";
DROP TABLE "BusinessNeed";
ALTER TABLE "new_BusinessNeed" RENAME TO "BusinessNeed";
CREATE UNIQUE INDEX "BusinessNeed_projectId_key" ON "BusinessNeed"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessQualification_projectId_key" ON "BusinessQualification"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectScope_projectId_key" ON "ProjectScope"("projectId");

-- CreateIndex
CREATE INDEX "BusinessActor_projectId_idx" ON "BusinessActor"("projectId");

-- CreateIndex
CREATE INDEX "ProcessStep_projectId_order_idx" ON "ProcessStep"("projectId", "order");

-- CreateIndex
CREATE INDEX "Irritant_projectId_idx" ON "Irritant"("projectId");

-- CreateIndex
CREATE INDEX "BusinessImpact_projectId_axis_idx" ON "BusinessImpact"("projectId", "axis");

-- CreateIndex
CREATE INDEX "BusinessObjective_projectId_idx" ON "BusinessObjective"("projectId");

-- CreateIndex
CREATE INDEX "KpiBaseline_projectId_idx" ON "KpiBaseline"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAssumption_projectId_idx" ON "ProjectAssumption"("projectId");

-- CreateIndex
CREATE INDEX "Uncertainty_projectId_idx" ON "Uncertainty"("projectId");

-- CreateIndex
CREATE INDEX "BusinessConstraint_projectId_idx" ON "BusinessConstraint"("projectId");

-- CreateIndex
CREATE INDEX "ImprovementOpportunity_projectId_idx" ON "ImprovementOpportunity"("projectId");

-- CreateIndex
CREATE INDEX "UserVerbatim_projectId_idx" ON "UserVerbatim"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopReport_projectId_key" ON "WorkshopReport"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier1Gate_projectId_key" ON "Atelier1Gate"("projectId");
