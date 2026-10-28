-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
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
    "createdById" TEXT,
    "convertedContactId" TEXT,
    CONSTRAINT "Lead_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_convertedContactId_fkey" FOREIGN KEY ("convertedContactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("adId", "assignedAgentId", "assignedById", "budgetMax", "budgetMin", "campaign", "consent", "convertedContactId", "country", "countryCode", "createdAt", "currency", "email", "firstResponseAt", "formId", "fullName", "id", "lostReason", "mortgageOrCash", "nationality", "nextActionDate", "phone", "preferredLanguage", "propertyInterest", "purpose", "score", "source", "stage", "temperature", "timeline", "updatedAt", "utmCampaign", "utmMedium", "utmSource") SELECT "adId", "assignedAgentId", "assignedById", "budgetMax", "budgetMin", "campaign", "consent", "convertedContactId", "country", "countryCode", "createdAt", "currency", "email", "firstResponseAt", "formId", "fullName", "id", "lostReason", "mortgageOrCash", "nationality", "nextActionDate", "phone", "preferredLanguage", "propertyInterest", "purpose", "score", "source", "stage", "temperature", "timeline", "updatedAt", "utmCampaign", "utmMedium", "utmSource" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_convertedContactId_key" ON "Lead"("convertedContactId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
