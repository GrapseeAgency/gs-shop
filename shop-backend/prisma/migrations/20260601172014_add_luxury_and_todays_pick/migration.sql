-- AlterTable
ALTER TABLE "Product" ADD COLUMN "luxuryExpiresAt" DATETIME;

-- CreateTable
CREATE TABLE "TodaysPick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodaysPick_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TodaysPick_date_isActive_idx" ON "TodaysPick"("date", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TodaysPick_date_key" ON "TodaysPick"("date");
