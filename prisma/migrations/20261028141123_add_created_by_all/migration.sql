-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
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
    "notes" TEXT,
    "createdById" TEXT,
    CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Company" ("commissionTerms", "contactDetails", "createdAt", "id", "logoUrl", "name", "notes", "rating", "registrationStatus", "relationshipManagerId", "updatedAt", "website") SELECT "commissionTerms", "contactDetails", "createdAt", "id", "logoUrl", "name", "notes", "rating", "registrationStatus", "relationshipManagerId", "updatedAt", "website" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Contact" (
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
    "notes" TEXT,
    "createdById" TEXT,
    CONSTRAINT "Contact_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contact" ("budgetMax", "budgetMin", "country", "createdAt", "currency", "email", "fullName", "id", "lifetimeValue", "mortgageStatus", "notes", "phone", "preferredLanguage", "propertyPreferences", "referralSource", "timezone", "updatedAt") SELECT "budgetMax", "budgetMin", "country", "createdAt", "currency", "email", "fullName", "id", "lifetimeValue", "mortgageStatus", "notes", "phone", "preferredLanguage", "propertyPreferences", "referralSource", "timezone", "updatedAt" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE TABLE "new_Deal" (
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
    "createdById" TEXT,
    CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Deal" ("agentId", "closedAt", "commissionAmount", "commissionRate", "contactId", "createdAt", "currency", "id", "lostReason", "propertyId", "stage", "title", "type", "updatedAt", "value") SELECT "agentId", "closedAt", "commissionAmount", "commissionRate", "contactId", "createdAt", "currency", "id", "lostReason", "propertyId", "stage", "title", "type", "updatedAt", "value" FROM "Deal";
DROP TABLE "Deal";
ALTER TABLE "new_Deal" RENAME TO "Deal";
CREATE TABLE "new_Project" (
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
    "createdById" TEXT,
    CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("amenities", "commissionRate", "createdAt", "developerId", "expectedCompletion", "id", "launchDate", "location", "masterCommunity", "name", "paymentPlan", "startingPrice", "status", "unitTypes", "updatedAt") SELECT "amenities", "commissionRate", "createdAt", "developerId", "expectedCompletion", "id", "launchDate", "location", "masterCommunity", "name", "paymentPlan", "startingPrice", "status", "unitTypes", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Property" (
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
    "createdById" TEXT,
    CONSTRAINT "Property_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Property_listingAgentId_fkey" FOREIGN KEY ("listingAgentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Property_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("area", "availability", "balcony", "bathrooms", "bedrooms", "building", "builtUpArea", "category", "community", "completionStatus", "createdAt", "emirate", "floor", "furnishing", "handoverEstimate", "id", "images", "internalNotes", "lastVerifiedAt", "listingAgentId", "maidRoom", "ownershipStatus", "parking", "paymentPlan", "plotArea", "price", "pricePerSqft", "projectId", "publicationStatus", "reference", "saleableArea", "serviceCharges", "title", "unitNumber", "updatedAt", "view") SELECT "area", "availability", "balcony", "bathrooms", "bedrooms", "building", "builtUpArea", "category", "community", "completionStatus", "createdAt", "emirate", "floor", "furnishing", "handoverEstimate", "id", "images", "internalNotes", "lastVerifiedAt", "listingAgentId", "maidRoom", "ownershipStatus", "parking", "paymentPlan", "plotArea", "price", "pricePerSqft", "projectId", "publicationStatus", "reference", "saleableArea", "serviceCharges", "title", "unitNumber", "updatedAt", "view" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_reference_key" ON "Property"("reference");
CREATE TABLE "new_Task" (
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
    "createdById" TEXT,
    "leadId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assigneeId", "contactId", "createdAt", "dealId", "description", "dueDate", "id", "leadId", "priority", "recurring", "snoozedReason", "status", "title", "updatedAt") SELECT "assigneeId", "contactId", "createdAt", "dealId", "description", "dueDate", "id", "leadId", "priority", "recurring", "snoozedReason", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
