-- CreateTable
CREATE TABLE "DocumentAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "documentsExist" BOOLEAN NOT NULL DEFAULT false,
    "formats" TEXT,
    "structureLevel" TEXT,
    "exploitability" TEXT,
    "interpretationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "estimatedVolume" TEXT,
    "ocrNeeded" BOOLEAN NOT NULL DEFAULT false,
    "nlpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "ragNeeded" BOOLEAN NOT NULL DEFAULT false,
    "complexityLevel" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegulatoryAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rgpdApplicable" BOOLEAN NOT NULL DEFAULT true,
    "sensitiveDataConcerned" BOOLEAN NOT NULL DEFAULT false,
    "legalObligations" TEXT,
    "auditRequired" BOOLEAN NOT NULL DEFAULT false,
    "dpoConsulted" BOOLEAN NOT NULL DEFAULT false,
    "cnilConsultation" BOOLEAN NOT NULL DEFAULT false,
    "euAiActTier" TEXT NOT NULL DEFAULT 'NONE',
    "euAiActJustification" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegulatoryAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaturityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "needClarity" INTEGER,
    "workflowKnowledge" INTEGER,
    "dataMaturity" INTEGER,
    "governanceMaturity" INTEGER,
    "stakeholderAlignment" INTEGER,
    "realismLevel" INTEGER,
    "selfAssessmentNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaturityAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeasibilityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "technicallyFeasible" INTEGER,
    "organizationallyFeasible" INTEGER,
    "regulatorilyFeasible" INTEGER,
    "resourcesAvailable" INTEGER,
    "dataAvailable" INTEGER,
    "overallFeasibility" TEXT,
    "blockingFactors" TEXT,
    "enablers" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeasibilityAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier3Synthesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "realNeed" TEXT,
    "maturityLevel" TEXT,
    "complexityLevel" TEXT,
    "mainRisks" TEXT,
    "mainConstraints" TEXT,
    "feasibilityGlobal" TEXT,
    "governanceLevel" TEXT,
    "finalRecommendation" TEXT,
    "scoringPreparationNotes" TEXT,
    "cartographyPreparationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier3Synthesis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atelier3Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "coverageReviewComplete" BOOLEAN NOT NULL DEFAULT false,
    "documentaryComplete" BOOLEAN NOT NULL DEFAULT false,
    "regulatoryComplete" BOOLEAN NOT NULL DEFAULT false,
    "maturityScored" BOOLEAN NOT NULL DEFAULT false,
    "feasibilityScored" BOOLEAN NOT NULL DEFAULT false,
    "synthesisWritten" BOOLEAN NOT NULL DEFAULT false,
    "scoringPreparationReady" BOOLEAN NOT NULL DEFAULT false,
    "verdict" TEXT NOT NULL DEFAULT 'NOT_READY',
    "overrideNotes" TEXT,
    "decidedAt" DATETIME,
    "decidedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atelier3Gate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAnalysis_projectId_key" ON "DocumentAnalysis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryAnalysis_projectId_key" ON "RegulatoryAnalysis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "MaturityAssessment_projectId_key" ON "MaturityAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityAssessment_projectId_key" ON "FeasibilityAssessment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier3Synthesis_projectId_key" ON "Atelier3Synthesis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier3Gate_projectId_key" ON "Atelier3Gate"("projectId");
