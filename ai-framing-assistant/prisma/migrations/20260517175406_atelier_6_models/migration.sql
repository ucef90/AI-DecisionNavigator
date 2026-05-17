-- CreateTable
CREATE TABLE "GovernanceRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "responsibilityType" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GovernanceRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "description" TEXT,
    "responsibleRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SecurityControl_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "requirementCode" TEXT,
    "requirement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PARTIAL',
    "evidence" TEXT,
    "responsibleRole" TEXT,
    "dueBy" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonitoringKpi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "targetValue" TEXT,
    "alertThreshold" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "responsibleRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonitoringKpi_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncidentProcedure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "detectionMethod" TEXT,
    "escalationPath" TEXT,
    "correctiveActions" TEXT,
    "postIncidentReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IncidentProcedure_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier6Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "governanceScore" INTEGER,
    "governanceLevel" TEXT,
    "strongPoints" TEXT,
    "weakPoints" TEXT,
    "priorityActions" TEXT,
    "overallStatement" TEXT,
    "industrializationReadiness" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier6Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier6Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "governanceDefined" BOOLEAN NOT NULL DEFAULT false,
    "validationsMapped" BOOLEAN NOT NULL DEFAULT false,
    "risksControlled" BOOLEAN NOT NULL DEFAULT false,
    "securityDefined" BOOLEAN NOT NULL DEFAULT false,
    "complianceChecked" BOOLEAN NOT NULL DEFAULT false,
    "monitoringPlanned" BOOLEAN NOT NULL DEFAULT false,
    "incidentsPrepared" BOOLEAN NOT NULL DEFAULT false,
    "synthesisWritten" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier6Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GovernanceRole_projectId_scope_idx" ON "GovernanceRole"("projectId", "scope");

-- CreateIndex
CREATE INDEX "SecurityControl_projectId_domain_idx" ON "SecurityControl"("projectId", "domain");

-- CreateIndex
CREATE INDEX "ComplianceItem_projectId_framework_idx" ON "ComplianceItem"("projectId", "framework");

-- CreateIndex
CREATE INDEX "MonitoringKpi_projectId_category_idx" ON "MonitoringKpi"("projectId", "category");

-- CreateIndex
CREATE INDEX "IncidentProcedure_projectId_idx" ON "IncidentProcedure"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier6Synthesis_projectId_key" ON "Atelier6Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier6Gate_projectId_key" ON "Atelier6Gate"("projectId");
