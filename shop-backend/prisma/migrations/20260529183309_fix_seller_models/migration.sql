/*
  Warnings:

  - You are about to drop the column `documents` on the `SellerOnboarding` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `SellerOnboarding` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `SellerOnboarding` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SellerOnboarding` table. All the data in the column will be lost.
  - You are about to drop the column `step` on the `SellerOnboarding` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `SellerOnboarding` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SellerDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "SellerDocument_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SellerSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "storeDescription" TEXT,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "defaultShippingDays" INTEGER NOT NULL DEFAULT 3,
    "freeShippingThreshold" REAL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "orderAlerts" BOOLEAN NOT NULL DEFAULT true,
    "payoutAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerSettings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SellerReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerReview_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SellerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SellerMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isFromSeller" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerMessage_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SellerMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "responseTime" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verificationBadge" TEXT NOT NULL DEFAULT 'none',
    "badges" TEXT,
    "commissionRate" REAL NOT NULL DEFAULT 10,
    "payoutBalance" REAL NOT NULL DEFAULT 0,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    "monthlyRevenue" TEXT,
    "topServices" TEXT,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "storeTheme" TEXT NOT NULL DEFAULT 'default',
    "customDomain" TEXT,
    "socialLinks" TEXT,
    "isAcceptingOrders" BOOLEAN NOT NULL DEFAULT true,
    "avgResponseTime" INTEGER,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "onboardingProgress" INTEGER NOT NULL DEFAULT 0,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'incomplete',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankRoutingNumber" TEXT,
    "paypalEmail" TEXT,
    "stripeConnectId" TEXT,
    "minPayoutAmount" REAL NOT NULL DEFAULT 50,
    "autoPayoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "storePolicies" TEXT,
    CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Seller" ("avgResponseTime", "badges", "commissionRate", "conversionRate", "coverImage", "createdAt", "customDomain", "description", "followerCount", "id", "isAcceptingOrders", "isFeatured", "isVerified", "joinedAt", "logo", "monthlyRevenue", "name", "payoutBalance", "productCount", "rating", "responseTime", "reviewCount", "slug", "socialLinks", "storeTheme", "topServices", "totalEarnings", "totalSales", "updatedAt", "verificationBadge") SELECT "avgResponseTime", "badges", "commissionRate", "conversionRate", "coverImage", "createdAt", "customDomain", "description", "followerCount", "id", "isAcceptingOrders", "isFeatured", "isVerified", "joinedAt", "logo", "monthlyRevenue", "name", "payoutBalance", "productCount", "rating", "responseTime", "reviewCount", "slug", "socialLinks", "storeTheme", "topServices", "totalEarnings", "totalSales", "updatedAt", "verificationBadge" FROM "Seller";
DROP TABLE "Seller";
ALTER TABLE "new_Seller" RENAME TO "Seller";
CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");
CREATE INDEX "Seller_userId_idx" ON "Seller"("userId");
CREATE INDEX "Seller_onboardingStatus_idx" ON "Seller"("onboardingStatus");
CREATE INDEX "Seller_isOnboarded_idx" ON "Seller"("isOnboarded");
CREATE TABLE "new_SellerAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "avgOrderValue" REAL NOT NULL DEFAULT 0,
    "topProducts" TEXT,
    "monthlyData" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerAnalytics_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerAnalytics" ("avgOrderValue", "id", "monthlyData", "sellerId", "topProducts", "totalRevenue", "totalSales", "updatedAt") SELECT "avgOrderValue", "id", "monthlyData", "sellerId", "topProducts", "totalRevenue", "totalSales", "updatedAt" FROM "SellerAnalytics";
DROP TABLE "SellerAnalytics";
ALTER TABLE "new_SellerAnalytics" RENAME TO "SellerAnalytics";
CREATE INDEX "SellerAnalytics_sellerId_idx" ON "SellerAnalytics"("sellerId");
CREATE TABLE "new_SellerOnboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "businessName" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BD',
    "personalInfoCompleted" BOOLEAN NOT NULL DEFAULT false,
    "businessInfoCompleted" BOOLEAN NOT NULL DEFAULT false,
    "documentsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "bankInfoCompleted" BOOLEAN NOT NULL DEFAULT false,
    "storeSetupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerOnboarding_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerOnboarding" ("businessName", "createdAt", "id", "phone", "updatedAt") SELECT "businessName", "createdAt", "id", "phone", "updatedAt" FROM "SellerOnboarding";
DROP TABLE "SellerOnboarding";
ALTER TABLE "new_SellerOnboarding" RENAME TO "SellerOnboarding";
CREATE UNIQUE INDEX "SellerOnboarding_sellerId_key" ON "SellerOnboarding"("sellerId");
CREATE INDEX "SellerOnboarding_sellerId_idx" ON "SellerOnboarding"("sellerId");
CREATE TABLE "new_SellerPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "method" TEXT NOT NULL,
    "accountInfo" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "SellerPayout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerPayout" ("accountInfo", "amount", "id", "method", "notes", "processedAt", "requestedAt", "sellerId", "status") SELECT "accountInfo", "amount", "id", "method", "notes", "processedAt", "requestedAt", "sellerId", "status" FROM "SellerPayout";
DROP TABLE "SellerPayout";
ALTER TABLE "new_SellerPayout" RENAME TO "SellerPayout";
CREATE INDEX "SellerPayout_sellerId_idx" ON "SellerPayout"("sellerId");
CREATE TABLE "new_SellerPromotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "productIds" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerPromotion_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerPromotion" ("createdAt", "description", "discount", "endAt", "id", "isActive", "productIds", "sellerId", "startAt", "title", "type") SELECT "createdAt", "description", "discount", "endAt", "id", "isActive", "productIds", "sellerId", "startAt", "title", "type" FROM "SellerPromotion";
DROP TABLE "SellerPromotion";
ALTER TABLE "new_SellerPromotion" RENAME TO "SellerPromotion";
CREATE INDEX "SellerPromotion_sellerId_idx" ON "SellerPromotion"("sellerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SellerDocument_sellerId_idx" ON "SellerDocument"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerSettings_sellerId_key" ON "SellerSettings"("sellerId");

-- CreateIndex
CREATE INDEX "SellerSettings_sellerId_idx" ON "SellerSettings"("sellerId");

-- CreateIndex
CREATE INDEX "SellerReview_sellerId_idx" ON "SellerReview"("sellerId");

-- CreateIndex
CREATE INDEX "SellerReview_userId_idx" ON "SellerReview"("userId");

-- CreateIndex
CREATE INDEX "SellerMessage_sellerId_idx" ON "SellerMessage"("sellerId");

-- CreateIndex
CREATE INDEX "SellerMessage_userId_idx" ON "SellerMessage"("userId");
