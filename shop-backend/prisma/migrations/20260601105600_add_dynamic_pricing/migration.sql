-- CreateTable
CREATE TABLE "CompetitorPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "competitor" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "url" TEXT,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompetitorPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "targetCompetitor" TEXT,
    "adjustment" REAL NOT NULL,
    "minPrice" REAL,
    "maxPrice" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastAppliedAt" DATETIME,
    "lastAppliedPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PricingRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceChangeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "oldPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "triggeredBy" TEXT,
    "ruleId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceChangeLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CompetitorPrice_productId_idx" ON "CompetitorPrice"("productId");

-- CreateIndex
CREATE INDEX "CompetitorPrice_competitor_idx" ON "CompetitorPrice"("competitor");

-- CreateIndex
CREATE INDEX "CompetitorPrice_scrapedAt_idx" ON "CompetitorPrice"("scrapedAt");

-- CreateIndex
CREATE INDEX "PricingRule_productId_idx" ON "PricingRule"("productId");

-- CreateIndex
CREATE INDEX "PricingRule_isActive_idx" ON "PricingRule"("isActive");

-- CreateIndex
CREATE INDEX "PriceChangeLog_productId_idx" ON "PriceChangeLog"("productId");

-- CreateIndex
CREATE INDEX "PriceChangeLog_createdAt_idx" ON "PriceChangeLog"("createdAt");

-- CreateIndex
CREATE INDEX "PriceChangeLog_reason_idx" ON "PriceChangeLog"("reason");
