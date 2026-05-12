-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PROJECT_MANAGER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "direction" TEXT,
    "sponsor" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "maturity" TEXT,
    "finalDecision" TEXT,
    "totalScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "managerId" TEXT,
    CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "initialRequest" TEXT,
    "reformulatedNeed" TEXT,
    "painPoints" TEXT,
    "expectedValue" TEXT,
    "usersImpacted" TEXT,
    "currentKpis" TEXT,
    "expectedOutcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessNeed_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "dataSources" TEXT,
    "dataTypes" TEXT,
    "history" TEXT,
    "quality" TEXT,
    "availability" TEXT,
    "silos" TEXT,
    "personalData" BOOLEAN NOT NULL DEFAULT false,
    "sensitivity" TEXT,
    "rgpdConstraints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "automationRelevant" BOOLEAN NOT NULL DEFAULT false,
    "ruleEngineRelevant" BOOLEAN NOT NULL DEFAULT false,
    "mlRelevant" BOOLEAN NOT NULL DEFAULT false,
    "llmRelevant" BOOLEAN NOT NULL DEFAULT false,
    "ragRelevant" BOOLEAN NOT NULL DEFAULT false,
    "agentRelevant" BOOLEAN NOT NULL DEFAULT false,
    "hybridRelevant" BOOLEAN NOT NULL DEFAULT false,
    "classicRelevant" BOOLEAN NOT NULL DEFAULT false,
    "recommendedApproach" TEXT,
    "justification" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArchitectureAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "applications" TEXT,
    "apis" TEXT,
    "workflowCurrent" TEXT,
    "workflowTarget" TEXT,
    "siIntegration" TEXT,
    "humanValidation" BOOLEAN NOT NULL DEFAULT true,
    "traceability" TEXT,
    "existingTools" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArchitectureAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rgpdRisk" INTEGER,
    "sensitiveDataRisk" INTEGER,
    "hallucinationRisk" INTEGER,
    "biasRisk" INTEGER,
    "classificationRisk" INTEGER,
    "autoDecisionRisk" INTEGER,
    "securityRisk" INTEGER,
    "vendorLockRisk" INTEGER,
    "adoptionRisk" INTEGER,
    "supervisionRisk" INTEGER,
    "overallRisk" TEXT,
    "mitigationPlan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RiskAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scoring" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "needClarity" INTEGER NOT NULL,
    "aiRelevance" INTEGER NOT NULL,
    "dataMaturity" INTEGER NOT NULL,
    "businessValue" INTEGER NOT NULL,
    "riskControl" INTEGER NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "justification" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scoring_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_finalDecision_idx" ON "Project"("finalDecision");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessNeed_projectId_key" ON "BusinessNeed"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DataAssessment_projectId_key" ON "DataAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_projectId_key" ON "AIAnalysis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchitectureAssessment_projectId_key" ON "ArchitectureAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_projectId_key" ON "RiskAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Scoring_projectId_key" ON "Scoring"("projectId");

-- CreateIndex
CREATE INDEX "Deliverable_projectId_type_idx" ON "Deliverable"("projectId", "type");
