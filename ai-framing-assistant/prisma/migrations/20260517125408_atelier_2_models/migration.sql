-- CreateTable
CREATE TABLE "TaskQualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "processStepId" TEXT,
    "taskName" TEXT NOT NULL,
    "nature" TEXT NOT NULL DEFAULT 'OTHER',
    "verdict" TEXT NOT NULL DEFAULT 'HUMAN',
    "complexity" INTEGER NOT NULL DEFAULT 3,
    "rulesKnownAndFixed" BOOLEAN NOT NULL DEFAULT false,
    "workflowStable" BOOLEAN NOT NULL DEFAULT false,
    "fewExceptions" BOOLEAN NOT NULL DEFAULT false,
    "needsTextUnderstanding" BOOLEAN NOT NULL DEFAULT false,
    "needsClassification" BOOLEAN NOT NULL DEFAULT false,
    "needsContentGeneration" BOOLEAN NOT NULL DEFAULT false,
    "needsDocumentReading" BOOLEAN NOT NULL DEFAULT false,
    "needsDocSearch" BOOLEAN NOT NULL DEFAULT false,
    "needsContextualReasoning" BOOLEAN NOT NULL DEFAULT false,
    "needsHumanInterpretation" BOOLEAN NOT NULL DEFAULT false,
    "techCandidates" TEXT,
    "justification" TEXT,
    "position" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskQualification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplexityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "workflowComplexity" INTEGER,
    "documentComplexity" INTEGER,
    "decisionComplexity" INTEGER,
    "governanceComplexity" INTEGER,
    "workflowJustification" TEXT,
    "documentJustification" TEXT,
    "decisionJustification" TEXT,
    "governanceJustification" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplexityAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntelligenceNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "intelligenceType" TEXT NOT NULL,
    "necessity" TEXT NOT NULL DEFAULT 'REQUIRED',
    "justification" TEXT,
    "suggestedTech" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IntelligenceNeed_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnologyCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "tech" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "maturity" TEXT NOT NULL DEFAULT 'MATURE',
    "fitScore" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechnologyCandidate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HumanValidationPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonType" TEXT NOT NULL DEFAULT 'OTHER',
    "validatorRole" TEXT,
    "validationMode" TEXT NOT NULL DEFAULT 'BLOCKING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HumanValidationPoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "frequency" TEXT,
    "handlingProposal" TEXT NOT NULL DEFAULT 'HUMAN',
    "riskIfMishandled" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProcessException_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnicalDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechnicalDependency_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "technologies" TEXT,
    "rationale" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'RECOMMENDED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechRecommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetArchitectureNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "techCode" TEXT,
    "posX" INTEGER NOT NULL DEFAULT 0,
    "posY" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TargetArchitectureNode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetArchitectureEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TargetArchitectureEdge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TargetArchitectureEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "TargetArchitectureNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TargetArchitectureEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "TargetArchitectureNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier2Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "realNeed" TEXT,
    "complexityLevel" TEXT,
    "intelligenceSummary" TEXT,
    "governanceLevel" TEXT,
    "recommendedProfile" TEXT,
    "recommendedArchitecture" TEXT,
    "finalRecommendation" TEXT,
    "openPoints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier2Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier2Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "taskMatrixComplete" BOOLEAN NOT NULL DEFAULT false,
    "intelligenceNeedsScored" BOOLEAN NOT NULL DEFAULT false,
    "techCandidatesIdentified" BOOLEAN NOT NULL DEFAULT false,
    "humanValidationsMapped" BOOLEAN NOT NULL DEFAULT false,
    "targetArchSketched" BOOLEAN NOT NULL DEFAULT false,
    "synthesisWritten" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier2Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TaskQualification_projectId_idx" ON "TaskQualification"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplexityAssessment_projectId_key" ON "ComplexityAssessment"("projectId");

-- CreateIndex
CREATE INDEX "IntelligenceNeed_projectId_idx" ON "IntelligenceNeed"("projectId");

-- CreateIndex
CREATE INDEX "TechnologyCandidate_projectId_idx" ON "TechnologyCandidate"("projectId");

-- CreateIndex
CREATE INDEX "HumanValidationPoint_projectId_idx" ON "HumanValidationPoint"("projectId");

-- CreateIndex
CREATE INDEX "ProcessException_projectId_idx" ON "ProcessException"("projectId");

-- CreateIndex
CREATE INDEX "TechnicalDependency_projectId_idx" ON "TechnicalDependency"("projectId");

-- CreateIndex
CREATE INDEX "TechRecommendation_projectId_idx" ON "TechRecommendation"("projectId");

-- CreateIndex
CREATE INDEX "TargetArchitectureNode_projectId_idx" ON "TargetArchitectureNode"("projectId");

-- CreateIndex
CREATE INDEX "TargetArchitectureEdge_projectId_idx" ON "TargetArchitectureEdge"("projectId");

-- CreateIndex
CREATE INDEX "TargetArchitectureEdge_fromId_idx" ON "TargetArchitectureEdge"("fromId");

-- CreateIndex
CREATE INDEX "TargetArchitectureEdge_toId_idx" ON "TargetArchitectureEdge"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier2Synthesis_projectId_key" ON "Atelier2Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier2Gate_projectId_key" ON "Atelier2Gate"("projectId");
