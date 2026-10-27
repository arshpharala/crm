-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "teamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "countryCode" TEXT,
    "country" TEXT,
    "nationality" TEXT,
    "preferredLanguage" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "campaign" TEXT,
    "adId" TEXT,
    "formId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "propertyInterest" TEXT,
    "budgetMin" REAL,
    "budgetMax" REAL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "purpose" TEXT,
    "timeline" TEXT,
    "mortgageOrCash" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "temperature" TEXT NOT NULL DEFAULT 'WARM',
    "score" INTEGER NOT NULL DEFAULT 0,
    "lostReason" TEXT,
    "nextActionDate" DATETIME,
    "firstResponseAt" DATETIME,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "assignedAgentId" TEXT,
    "assignedById" TEXT,
    "convertedContactId" TEXT,
    CONSTRAINT "Lead_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_convertedContactId_fkey" FOREIGN KEY ("convertedContactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "timezone" TEXT,
    "preferredLanguage" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "budgetMin" REAL,
    "budgetMax" REAL,
    "propertyPreferences" TEXT,
    "mortgageStatus" TEXT,
    "referralSource" TEXT,
    "lifetimeValue" REAL NOT NULL DEFAULT 0,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "contactDetails" TEXT,
    "relationshipManagerId" TEXT,
    "registrationStatus" TEXT,
    "commissionTerms" TEXT,
    "rating" INTEGER,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "masterCommunity" TEXT,
    "location" TEXT,
    "status" TEXT,
    "launchDate" DATETIME,
    "expectedCompletion" DATETIME,
    "unitTypes" TEXT,
    "startingPrice" REAL,
    "paymentPlan" TEXT,
    "amenities" TEXT,
    "commissionRate" REAL,
    CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emirate" TEXT,
    "area" TEXT,
    "community" TEXT,
    "building" TEXT,
    "projectId" TEXT,
    "unitNumber" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "maidRoom" BOOLEAN NOT NULL DEFAULT false,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "parking" INTEGER,
    "floor" TEXT,
    "view" TEXT,
    "builtUpArea" REAL,
    "saleableArea" REAL,
    "plotArea" REAL,
    "price" REAL NOT NULL,
    "pricePerSqft" REAL,
    "furnishing" TEXT,
    "completionStatus" TEXT,
    "handoverEstimate" DATETIME,
    "paymentPlan" TEXT,
    "serviceCharges" REAL,
    "ownershipStatus" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "listingAgentId" TEXT,
    "images" TEXT,
    "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "lastVerifiedAt" DATETIME,
    "internalNotes" TEXT,
    CONSTRAINT "Property_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Property_listingAgentId_fkey" FOREIGN KEY ("listingAgentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'QUALIFICATION',
    "value" REAL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "contactId" TEXT NOT NULL,
    "propertyId" TEXT,
    "agentId" TEXT,
    "commissionRate" REAL,
    "commissionAmount" REAL,
    "closedAt" DATETIME,
    "lostReason" TEXT,
    CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "snoozedReason" TEXT,
    "assigneeId" TEXT,
    "leadId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "authorId" TEXT,
    "leadId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,
    CONSTRAINT "Activity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Activity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedContactId_key" ON "Lead"("convertedContactId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_reference_key" ON "Property"("reference");
