/*
  Warnings:

  - You are about to drop the column `comments` on the `CommunityPost` table. All the data in the column will be lost.
  - You are about to drop the column `carbonFootprint` on the `Product` table. All the data in the column will be lost.
  - Added the required column `userId` to the `WishlistBoard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FlashbackProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "flashStart" DATETIME NOT NULL,
    "flashEnd" DATETIME NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlashbackProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "avatar" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomPlacement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT 'from-violet-600 to-indigo-600',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "type" TEXT NOT NULL DEFAULT 'banner',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "author" TEXT NOT NULL,
    "avatar" TEXT,
    "content" TEXT NOT NULL,
    "images" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "taggedProductIds" TEXT,
    "type" TEXT NOT NULL DEFAULT 'review',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CommunityPost" ("author", "avatar", "content", "createdAt", "id", "images", "likes", "taggedProductIds", "type", "updatedAt") SELECT "author", "avatar", "content", "createdAt", "id", "images", "likes", "taggedProductIds", "type", "updatedAt" FROM "CommunityPost";
DROP TABLE "CommunityPost";
ALTER TABLE "new_CommunityPost" RENAME TO "CommunityPost";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "comparePrice" REAL,
    "categoryId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "images" TEXT,
    "features" TEXT,
    "techStack" TEXT,
    "deliveryTime" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "isFlashDeal" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT,
    "arModelUrl" TEXT,
    "dimensions" TEXT,
    "qrCode" TEXT,
    "serialNumber" TEXT,
    "isAuthentic" BOOLEAN NOT NULL DEFAULT false,
    "manufacturedAt" DATETIME,
    "batchNumber" TEXT,
    "origin" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "complexity" TEXT NOT NULL DEFAULT 'medium',
    "complexityGuide" TEXT,
    "demoUrl" TEXT,
    "previewImages" TEXT,
    "interactiveDemoUrl" TEXT,
    "videoDemoUrl" TEXT,
    "rushDeliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "rushDeliveryPrice" REAL,
    "standardDeliveryDays" INTEGER NOT NULL DEFAULT 14,
    "rushDeliveryDays" INTEGER NOT NULL DEFAULT 3,
    "maxMonthlyOrders" INTEGER NOT NULL DEFAULT 10,
    "currentMonthOrders" INTEGER NOT NULL DEFAULT 0,
    "techStackOptions" TEXT,
    "emiAvailable" BOOLEAN NOT NULL DEFAULT false,
    "emiMinAmount" REAL NOT NULL DEFAULT 5000,
    "whiteLabelAvailable" BOOLEAN NOT NULL DEFAULT false,
    "whiteLabelPrice" REAL,
    "variants" TEXT,
    "specifications" TEXT,
    "howToUse" TEXT,
    "materials" TEXT,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("arModelUrl", "batchNumber", "categoryId", "comparePrice", "complexity", "complexityGuide", "createdAt", "currentMonthOrders", "deliveryTime", "demoUrl", "description", "dimensions", "discount", "emiAvailable", "emiMinAmount", "features", "howToUse", "id", "imageUrl", "images", "interactiveDemoUrl", "isActive", "isAuthentic", "isFeatured", "isFlashDeal", "isMock", "isNew", "isOnSale", "isTrending", "manufacturedAt", "materials", "maxMonthlyOrders", "name", "order", "origin", "previewImages", "price", "qrCode", "rating", "reviewCount", "rushDeliveryAvailable", "rushDeliveryDays", "rushDeliveryPrice", "sellerId", "serialNumber", "slug", "specifications", "standardDeliveryDays", "tags", "techStack", "techStackOptions", "updatedAt", "variants", "videoDemoUrl", "whiteLabelAvailable", "whiteLabelPrice") SELECT "arModelUrl", "batchNumber", "categoryId", "comparePrice", "complexity", "complexityGuide", "createdAt", "currentMonthOrders", "deliveryTime", "demoUrl", "description", "dimensions", "discount", "emiAvailable", "emiMinAmount", "features", "howToUse", "id", "imageUrl", "images", "interactiveDemoUrl", "isActive", "isAuthentic", "isFeatured", "isFlashDeal", "isMock", "isNew", "isOnSale", "isTrending", "manufacturedAt", "materials", "maxMonthlyOrders", "name", "order", "origin", "previewImages", "price", "qrCode", "rating", "reviewCount", "rushDeliveryAvailable", "rushDeliveryDays", "rushDeliveryPrice", "sellerId", "serialNumber", "slug", "specifications", "standardDeliveryDays", "tags", "techStack", "techStackOptions", "updatedAt", "variants", "videoDemoUrl", "whiteLabelAvailable", "whiteLabelPrice" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_WishlistBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WishlistBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WishlistBoard" ("color", "createdAt", "description", "icon", "id", "isPublic", "name", "productIds", "updatedAt") SELECT "color", "createdAt", "description", "icon", "id", "isPublic", "name", "productIds", "updatedAt" FROM "WishlistBoard";
DROP TABLE "WishlistBoard";
ALTER TABLE "new_WishlistBoard" RENAME TO "WishlistBoard";
CREATE INDEX "WishlistBoard_userId_idx" ON "WishlistBoard"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FlashbackProduct_productId_key" ON "FlashbackProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityLike_postId_userId_key" ON "CommunityLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "CustomPlacement_zone_idx" ON "CustomPlacement"("zone");

-- CreateIndex
CREATE INDEX "CustomPlacement_isActive_idx" ON "CustomPlacement"("isActive");
