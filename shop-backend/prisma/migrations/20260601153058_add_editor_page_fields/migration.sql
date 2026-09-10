/*
  Warnings:

  - Added the required column `name` to the `FlashSale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `FlashbackProduct` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discount" INTEGER,
    "discountValue" INTEGER NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "type" TEXT NOT NULL DEFAULT 'percentage',
    "description" TEXT,
    "minOrder" REAL,
    "minOrderAmount" REAL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "expiresAt" DATETIME,
    "expiryDate" DATETIME,
    "maxDiscount" REAL,
    "appliesTo" TEXT NOT NULL DEFAULT 'all',
    "appliesToIds" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Coupon" ("code", "createdAt", "description", "discount", "discountType", "discountValue", "endDate", "expiresAt", "expiryDate", "id", "isActive", "maxDiscount", "maxUses", "minOrder", "minOrderAmount", "startDate", "type", "usedCount") SELECT "code", "createdAt", "description", "discount", "discountType", "discountValue", "endDate", "expiresAt", "expiryDate", "id", "isActive", "maxDiscount", "maxUses", "minOrder", "minOrderAmount", "startDate", "type", "usedCount" FROM "Coupon";
DROP TABLE "Coupon";
ALTER TABLE "new_Coupon" RENAME TO "Coupon";
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE TABLE "new_FlashSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "productIds" TEXT,
    "salePrice" REAL NOT NULL,
    "discountPercent" INTEGER,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "maxQuantity" INTEGER,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlashSale" ("createdAt", "endTime", "id", "isActive", "maxQuantity", "productId", "salePrice", "soldCount", "startTime", "updatedAt") SELECT "createdAt", "endTime", "id", "isActive", "maxQuantity", "productId", "salePrice", "soldCount", "startTime", "updatedAt" FROM "FlashSale";
DROP TABLE "FlashSale";
ALTER TABLE "new_FlashSale" RENAME TO "FlashSale";
CREATE TABLE "new_FlashbackProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "flashStart" DATETIME NOT NULL,
    "flashEnd" DATETIME NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashbackProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlashbackProduct" ("createdAt", "discount", "flashEnd", "flashStart", "id", "isActive", "productId", "updatedAt") SELECT "createdAt", "discount", "flashEnd", "flashStart", "id", "isActive", "productId", "updatedAt" FROM "FlashbackProduct";
DROP TABLE "FlashbackProduct";
ALTER TABLE "new_FlashbackProduct" RENAME TO "FlashbackProduct";
CREATE UNIQUE INDEX "FlashbackProduct_productId_key" ON "FlashbackProduct"("productId");
CREATE TABLE "new_GiftCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "code" TEXT NOT NULL,
    "amount" REAL,
    "balance" REAL NOT NULL,
    "initialBalance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedBy" TEXT,
    "message" TEXT,
    "design" TEXT NOT NULL DEFAULT 'classic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "senderName" TEXT,
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GiftCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GiftCard" ("amount", "balance", "code", "createdAt", "design", "expiryDate", "id", "isActive", "isRedeemed", "message", "redeemedBy", "status", "updatedAt", "userId") SELECT "amount", "balance", "code", "createdAt", "design", "expiryDate", "id", "isActive", "isRedeemed", "message", "redeemedBy", "status", "updatedAt", "userId" FROM "GiftCard";
DROP TABLE "GiftCard";
ALTER TABLE "new_GiftCard" RENAME TO "GiftCard";
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
