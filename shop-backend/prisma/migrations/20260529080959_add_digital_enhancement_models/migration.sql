/*
  Warnings:

  - You are about to drop the column `email` on the `StudentVerification` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `StudentVerification` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `StudentVerification` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `StudentVerification` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `StudentVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StudentVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationMethod` to the `StudentVerification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "DigitalPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "downloadsRemaining" INTEGER NOT NULL DEFAULT 3,
    "totalDownloads" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT,
    CONSTRAINT "DigitalPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DigitalPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DigitalPurchase_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DownloadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "digitalPurchaseId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    CONSTRAINT "DownloadLog_digitalPurchaseId_fkey" FOREIGN KEY ("digitalPurchaseId") REFERENCES "DigitalPurchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCardDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giftCardId" TEXT NOT NULL,
    "purchaserId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "personalMessage" TEXT,
    "emailSentAt" DATETIME,
    "emailOpenedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftCardDelivery_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GiftCardDelivery_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "universityEmail" TEXT,
    "universityName" TEXT,
    "studentIdNumber" TEXT,
    "idDocumentUrl" TEXT,
    "idDocumentVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "discountCode" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 15,
    "verifiedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudentVerification" ("createdAt", "discountCode", "id") SELECT "createdAt", "discountCode", "id" FROM "StudentVerification";
DROP TABLE "StudentVerification";
ALTER TABLE "new_StudentVerification" RENAME TO "StudentVerification";
CREATE UNIQUE INDEX "StudentVerification_userId_key" ON "StudentVerification"("userId");
CREATE INDEX "StudentVerification_userId_idx" ON "StudentVerification"("userId");
CREATE INDEX "StudentVerification_universityEmail_idx" ON "StudentVerification"("universityEmail");
CREATE INDEX "StudentVerification_status_idx" ON "StudentVerification"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DigitalPurchase_licenseKey_key" ON "DigitalPurchase"("licenseKey");

-- CreateIndex
CREATE INDEX "DigitalPurchase_userId_productId_idx" ON "DigitalPurchase"("userId", "productId");

-- CreateIndex
CREATE INDEX "DigitalPurchase_licenseKey_idx" ON "DigitalPurchase"("licenseKey");

-- CreateIndex
CREATE INDEX "DigitalPurchase_orderId_idx" ON "DigitalPurchase"("orderId");

-- CreateIndex
CREATE INDEX "GiftCardDelivery_giftCardId_idx" ON "GiftCardDelivery"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardDelivery_recipientEmail_idx" ON "GiftCardDelivery"("recipientEmail");
