/*
  Warnings:

  - You are about to drop the column `productIndex` on the `DuelVote` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `product1Id` on the `ProductDuel` table. All the data in the column will be lost.
  - You are about to drop the column `product2Id` on the `ProductDuel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[query]` on the table `SearchSuggestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sellerId]` on the table `SellerAnalytics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `choice` to the `DuelVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `InsuranceClaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Preorder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PriceProtectionClaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endsAt` to the `ProductDuel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productAId` to the `ProductDuel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productBId` to the `ProductDuel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endsAt` to the `TrialOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RewardTransaction_type_idx";

-- DropIndex
DROP INDEX "RewardTransaction_userId_createdAt_idx";

-- DropIndex
DROP INDEX "RewardTransaction_userId_idx";

-- AlterTable
ALTER TABLE "BingoCard" ADD COLUMN "grid" TEXT;
ALTER TABLE "BingoCard" ADD COLUMN "marked" TEXT;

-- AlterTable
ALTER TABLE "CharityPartner" ADD COLUMN "website" TEXT;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN "expiryDate" DATETIME;
ALTER TABLE "Coupon" ADD COLUMN "maxDiscount" REAL;

-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN "respondentEmail" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN "respondentName" TEXT;

-- AlterTable
ALTER TABLE "GiftCardDelivery" ADD COLUMN "claimedAt" DATETIME;

-- AlterTable
ALTER TABLE "HealthProfile" ADD COLUMN "allergies" TEXT;
ALTER TABLE "HealthProfile" ADD COLUMN "dietaryRestrictions" TEXT;
ALTER TABLE "HealthProfile" ADD COLUMN "healthGoals" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "PriceAlert" ADD COLUMN "notifiedAt" DATETIME;

-- AlterTable
ALTER TABLE "PriceMatch" ADD COLUMN "appealedAt" DATETIME;
ALTER TABLE "PriceMatch" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "data" TEXT;
ALTER TABLE "Resume" ADD COLUMN "pdfUrl" TEXT;

-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN "vehicleTypes" TEXT;

-- AlterTable
ALTER TABLE "ShippingMethod" ADD COLUMN "freeAbove" REAL;
ALTER TABLE "ShippingMethod" ADD COLUMN "icon" TEXT;
ALTER TABLE "ShippingMethod" ADD COLUMN "maxWeight" REAL;
ALTER TABLE "ShippingMethod" ADD COLUMN "regions" TEXT;

-- AlterTable
ALTER TABLE "StoreVisit" ADD COLUMN "source" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "amount" REAL;
ALTER TABLE "Subscription" ADD COLUMN "billingPeriod" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "frequency" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "name" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "nextBillingDate" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "price" REAL;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN "monthlyPrice" REAL;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "yearlyPrice" REAL;

-- AlterTable
ALTER TABLE "ThankYouVideo" ADD COLUMN "duration" INTEGER;
ALTER TABLE "ThankYouVideo" ADD COLUMN "sellerId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- AlterTable
ALTER TABLE "UserBiometricProfile" ADD COLUMN "lastMeasured" DATETIME;
ALTER TABLE "UserBiometricProfile" ADD COLUMN "shoeSize" REAL;
ALTER TABLE "UserBiometricProfile" ADD COLUMN "sizeHistory" TEXT;

-- AlterTable
ALTER TABLE "VehicleTracker" ADD COLUMN "nextServiceDue" DATETIME;
ALTER TABLE "VehicleTracker" ADD COLUMN "vehicleType" TEXT;

-- AlterTable
ALTER TABLE "VirtualMallSession" ADD COLUMN "lastStoreId" TEXT;

-- CreateTable
CREATE TABLE "PriceDropRefund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "refundAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'filed',
    "filedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductLiquidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "estimatedValue" REAL NOT NULL,
    "photos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'listed',
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platforms" TEXT,
    "finalPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LiveShoppingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "streamUrl" TEXT,
    "holographicUrl" TEXT,
    "hostId" TEXT NOT NULL,
    "products" JSONB,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "viewers" INTEGER NOT NULL DEFAULT 0,
    "neuralBiddings" JSONB,
    "emotionalData" JSONB,
    "quantumFeatures" BOOLEAN NOT NULL DEFAULT false,
    "dnaMatching" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LiveShoppingSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LiveShoppingInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "data" JSONB,
    "neuralConfidence" REAL,
    "emotionalState" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveShoppingInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveShoppingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiveShoppingInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NeuralProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "baselinePatterns" JSONB,
    "intentRecognition" JSONB,
    "emotionalSignatures" JSONB,
    "biometricBaseline" JSONB,
    "calibrationData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastCalibration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NeuralProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DigitalTwin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bodyMeasurements" JSONB,
    "styleProfile" JSONB,
    "wardrobe" JSONB,
    "lifestyleData" JSONB,
    "evolutionData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DigitalTwin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DNAProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "geneticMarkers" JSONB,
    "stylePredisposition" JSONB,
    "healthFactors" JSONB,
    "personalityTraits" JSONB,
    "optimalProducts" JSONB,
    "lifestyleRecommendations" JSONB,
    "sampleType" TEXT,
    "analysisStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL,
    CONSTRAINT "DNAProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BioHackSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "bioData" JSONB,
    "recommendations" JSONB,
    "optimizationScore" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "BioHackSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuantumPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "timeline" TEXT NOT NULL,
    "outcomes" JSONB NOT NULL,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "collapsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuantumPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuantumTeleportation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "targetLocation" JSONB NOT NULL,
    "energyRequired" INTEGER NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quantumState" JSONB,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuantumTeleportation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HolographicProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "modelUrl" TEXT NOT NULL,
    "scale" REAL NOT NULL DEFAULT 1.0,
    "position" JSONB NOT NULL,
    "rotation" JSONB NOT NULL,
    "animations" JSONB,
    "materials" JSONB,
    "interactiveZones" JSONB,
    "renderQuality" TEXT NOT NULL DEFAULT 'high',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ARSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "trackingMode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "interactions" JSONB,
    "analyticsData" JSONB,
    CONSTRAINT "ARSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StyleEvolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timelineData" JSONB,
    "futurePredictions" JSONB,
    "parallelStyles" JSONB,
    "dnaBasedStyles" JSONB,
    "socialImpact" JSONB,
    "evolutionScore" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StyleEvolution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrendPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trendName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "timeline" TEXT NOT NULL,
    "investmentData" JSONB,
    "earlyAdopterStatus" BOOLEAN NOT NULL DEFAULT false,
    "nftData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "predictedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "materializedAt" DATETIME,
    CONSTRAINT "TrendPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialCapital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "influenceScore" REAL NOT NULL DEFAULT 0,
    "socialCurrency" INTEGER NOT NULL DEFAULT 0,
    "perks" JSONB,
    "investments" JSONB,
    "leaderboardRank" INTEGER,
    "lastCalculated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialCapital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StyleTribe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dnaSignature" JSONB,
    "members" JSONB,
    "collectivePower" INTEGER NOT NULL DEFAULT 0,
    "rituals" JSONB,
    "evolutionLevel" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrendCouncil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "councilTier" TEXT NOT NULL,
    "votingPower" INTEGER NOT NULL DEFAULT 1,
    "proposals" JSONB,
    "predictions" JSONB,
    "rewards" JSONB,
    "eliteStatus" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrendCouncil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShoppingGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gameData" JSONB,
    "rewards" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "progress" JSONB,
    "rewards" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ShoppingGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VirtualShowroom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "lighting" JSONB,
    "camera" JSONB,
    "products" JSONB,
    "visitorCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MetaverseWorld" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "worldType" TEXT NOT NULL,
    "configuration" JSONB,
    "avatarSystem" JSONB,
    "socialFeatures" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visitorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PersonalShopper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "aiPersonality" JSONB,
    "learningData" JSONB,
    "predictions" JSONB,
    "budgetOptimizer" JSONB,
    "styleEvolution" JSONB,
    "lifePlanning" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalShopper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeTravelSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timeEra" TEXT NOT NULL,
    "targetDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "scenario" TEXT,
    "estimatedDuration" INTEGER NOT NULL DEFAULT 300,
    "timelineData" JSONB,
    "accessedDeals" JSONB,
    "futureProducts" JSONB,
    "alternateSelves" JSONB,
    "products" JSONB,
    "timeline" JSONB,
    "quantumState" JSONB,
    "predictions" JSONB,
    "interactions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "TimeTravelSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealityCustomization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "physicsEngine" JSONB,
    "gravitySettings" JSONB,
    "timeManipulation" JSONB,
    "dimensionPortals" JSONB,
    "consciousnessOverlay" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastModified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RealityCustomization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LuxuryProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "price" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "availability" TEXT NOT NULL DEFAULT 'exclusive',
    "properties" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QuantumCollectible" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantumState" JSONB,
    "celebrityLink" TEXT,
    "properties" JSONB,
    "currentValue" BIGINT NOT NULL,
    "rarity" TEXT NOT NULL,
    "ownerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuantumCollectible_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NeuralSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strength" REAL NOT NULL,
    "data" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NeuralSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductCompatibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "compatibilityScore" REAL NOT NULL,
    "factors" JSONB,
    "recommendations" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductCompatibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TruthAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "verdict" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "redFlags" JSONB,
    "greenFlags" JSONB,
    "neuralData" JSONB NOT NULL,
    "behavioralData" JSONB NOT NULL,
    "socialContext" JSONB NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TruthAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceGuaranteeClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "productId" TEXT NOT NULL,
    "oldPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "configuration" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PhotoLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT,
    "sellerId" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "releasedAt" DATETIME,
    "refundedAt" DATETIME,
    "disputeReason" TEXT,
    "disputedAt" DATETIME,
    "holdUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EscrowTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "escrowId" TEXT NOT NULL,
    "orderId" TEXT,
    "buyerId" TEXT,
    "sellerId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "buyerId" TEXT,
    "productId" TEXT,
    "sellerId" TEXT,
    "videoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledTime" DATETIME,
    "completedAt" DATETIME,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductRental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "durationUnit" TEXT NOT NULL DEFAULT 'days',
    "deposit" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "rentalPrice" REAL,
    "tryThenBuy" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CarbonFootprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "productId" TEXT,
    "footprint" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PackagingReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemsReturned" INTEGER NOT NULL DEFAULT 0,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "trackingNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "coordinates" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedArrival" DATETIME,
    "currentLocation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupShoppingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "productId" TEXT,
    "inviteCode" TEXT NOT NULL,
    "code" TEXT,
    "participants" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PvpGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "actualPrice" REAL,
    "winnerId" TEXT,
    "endsAt" DATETIME NOT NULL,
    "prizePool" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PvpGame_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PvpGame_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PvpGuess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guess" REAL NOT NULL,
    "accuracy" REAL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PvpGuess_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "PvpGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PvpGuess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "anonymousMode" BOOLEAN NOT NULL DEFAULT false,
    "dataVaultEnabled" BOOLEAN NOT NULL DEFAULT false,
    "priceDiscriminationCheck" BOOLEAN NOT NULL DEFAULT true,
    "disableTracking" BOOLEAN NOT NULL DEFAULT false,
    "autoDeleteHistory" BOOLEAN NOT NULL DEFAULT false,
    "deleteAfterDays" INTEGER NOT NULL DEFAULT 30,
    "localDataOnly" BOOLEAN NOT NULL DEFAULT false,
    "shareWithSellers" BOOLEAN NOT NULL DEFAULT true,
    "shareForRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutoStockLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "predictionId" TEXT,
    "aiAccuracy" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AutoReorder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 5,
    "nextOrder" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PricePrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentPrice" REAL NOT NULL,
    "predictedPrice" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "trend" TEXT NOT NULL,
    "predictedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PriceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "priceShown" REAL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CartAbandonment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cartId" TEXT,
    "cartData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'abandoned',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "abandonedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoolDownTimer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MicroInvestment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "percentage" REAL NOT NULL DEFAULT 5,
    "totalInvested" REAL NOT NULL DEFAULT 0,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "investmentType" TEXT NOT NULL DEFAULT 'index-fund',
    "returns" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoundUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderTotal" REAL NOT NULL,
    "roundUpTo" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "invested" BOOLEAN NOT NULL DEFAULT false,
    "investedIn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NeedWantTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT,
    "tag" TEXT NOT NULL,
    "type" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserBudgetSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "monthlyBudget" REAL,
    "monthlyCap" REAL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LocalImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "orderAmount" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TreasureHunt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clue" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL DEFAULT 'points',
    "rewardValue" INTEGER NOT NULL DEFAULT 100,
    "isFound" BOOLEAN NOT NULL DEFAULT false,
    "foundAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" DATETIME,
    "lastSync" DATETIME,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CalendarIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" DATETIME,
    "lastSync" DATETIME,
    "events" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FitnessProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "activeMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastWorkout" TEXT,
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmartFridgeIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "items" TEXT,
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmartHomeIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "devices" TEXT,
    "automationRules" TEXT,
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WhatsAppIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specializations" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "baseFee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RepairRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "applianceType" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedCost" REAL,
    "photos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "causeId" TEXT,
    "amount" REAL NOT NULL,
    "roundUpSource" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MedicineTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "batchNumber" TEXT,
    "manufacturer" TEXT,
    "daysUntilExpiry" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'good',
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PetProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "breed" TEXT,
    "age" INTEGER,
    "weight" REAL,
    "specialNeeds" TEXT,
    "monthlyFoodConsumption" REAL,
    "monthlyTreatConsumption" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WarrantyExtension" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "warrantyId" TEXT NOT NULL,
    "extensionMonths" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CustomBundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "discountAmount" REAL NOT NULL,
    "finalPrice" REAL NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 10,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SavedGiftBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SavedOutfit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "totalPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SavedRoomDesign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StarterKit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "kitType" TEXT NOT NULL,
    "inputs" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VIPMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'silver',
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConciergeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserCoupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BulkBuyRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "targetPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BulkBuyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "offeredPrice" REAL NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArTryOn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "arData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NearbyAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "location" TEXT,
    "distance" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "avatar" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedulerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "notes" TEXT,
    "attendeeName" TEXT,
    "attendeeEmail" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "scheduledAt" DATETIME,
    "calendarEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Appointment" ("createdAt", "id", "notes", "schedulerId", "slot", "status", "userId") SELECT "createdAt", "id", "notes", "schedulerId", "slot", "status", "userId" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE TABLE "new_Auction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT,
    "description" TEXT,
    "startPrice" REAL NOT NULL,
    "reservePrice" REAL,
    "currentPrice" REAL NOT NULL,
    "currentBid" REAL NOT NULL,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minBidIncrement" REAL NOT NULL DEFAULT 50,
    "minIncrement" REAL NOT NULL DEFAULT 50,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "endsAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "winnerId" TEXT,
    "winnerName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Auction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Auction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Auction_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Auction" ("bidCount", "createdAt", "currentBid", "currentPrice", "endTime", "endsAt", "id", "isActive", "minBidIncrement", "minIncrement", "productId", "reservePrice", "sellerId", "startPrice", "startTime", "status", "updatedAt", "winnerId", "winnerName") SELECT "bidCount", "createdAt", "currentBid", "currentPrice", "endTime", "endsAt", "id", "isActive", "minBidIncrement", "minIncrement", "productId", "reservePrice", "sellerId", "startPrice", "startTime", "status", "updatedAt", "winnerId", "winnerName" FROM "Auction";
DROP TABLE "Auction";
ALTER TABLE "new_Auction" RENAME TO "Auction";
CREATE TABLE "new_AutoBid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxBid" REAL NOT NULL,
    "maxAmount" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AutoBid" ("auctionId", "createdAt", "id", "maxBid", "userId") SELECT "auctionId", "createdAt", "id", "maxBid", "userId" FROM "AutoBid";
DROP TABLE "AutoBid";
ALTER TABLE "new_AutoBid" RENAME TO "AutoBid";
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "options" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("cartId", "createdAt", "id", "options", "productId", "quantity", "updatedAt") SELECT "cartId", "createdAt", "id", "options", "productId", "quantity", "updatedAt" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'curated',
    "productIds" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Collection" ("createdAt", "description", "id", "imageUrl", "isFeatured", "order", "productIds", "title", "type", "updatedAt") SELECT "createdAt", "description", "id", "imageUrl", "isFeatured", "order", "productIds", "title", "type", "updatedAt" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'short',
    "duration" INTEGER,
    "price" REAL,
    "videoUrl" TEXT,
    "tags" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "instructor" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Course" ("createdAt", "description", "duration", "id", "instructor", "isPublished", "price", "tags", "title", "type", "updatedAt", "videoUrl", "views") SELECT "createdAt", "description", "duration", "id", "instructor", "isPublished", "price", "tags", "title", "type", "updatedAt", "videoUrl", "views" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_CustomerPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CustomerPhoto" ("caption", "createdAt", "id", "imageUrl", "isFeatured", "likes", "productId", "userId", "userName") SELECT "caption", "createdAt", "id", "imageUrl", "isFeatured", "likes", "productId", "userId", "userName" FROM "CustomerPhoto";
DROP TABLE "CustomerPhoto";
ALTER TABLE "new_CustomerPhoto" RENAME TO "CustomerPhoto";
CREATE TABLE "new_DeliveryBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "orderId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeliveryBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "DeliverySlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryBooking" ("createdAt", "id", "instructions", "orderId", "slotId") SELECT "createdAt", "id", "instructions", "orderId", "slotId" FROM "DeliveryBooking";
DROP TABLE "DeliveryBooking";
ALTER TABLE "new_DeliveryBooking" RENAME TO "DeliveryBooking";
CREATE UNIQUE INDEX "DeliveryBooking_orderId_key" ON "DeliveryBooking"("orderId");
CREATE TABLE "new_DeliveryProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "description" TEXT,
    "deliveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredBy" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "duration" INTEGER
);
INSERT INTO "new_DeliveryProof" ("deliveredAt", "deliveredBy", "description", "id", "imageUrl", "orderId") SELECT "deliveredAt", "deliveredBy", "description", "id", "imageUrl", "orderId" FROM "DeliveryProof";
DROP TABLE "DeliveryProof";
ALTER TABLE "new_DeliveryProof" RENAME TO "DeliveryProof";
CREATE UNIQUE INDEX "DeliveryProof_orderId_key" ON "DeliveryProof"("orderId");
CREATE TABLE "new_DigitalProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "pages" INTEGER,
    "duplicateUrl" TEXT,
    "downloadUrl" TEXT,
    "previewImages" TEXT,
    "topics" TEXT,
    "lessons" TEXT,
    "students" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "command" TEXT,
    "schema" TEXT,
    "language" TEXT,
    "previewUrl" TEXT,
    "format" TEXT,
    "tags" TEXT,
    "database" TEXT,
    "code" TEXT,
    "techStack" TEXT,
    "componentCount" INTEGER,
    "os" TEXT,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DigitalProduct" ("category", "createdAt", "description", "duplicateUrl", "id", "isActive", "name", "pages", "previewImages", "price", "rating", "reviews", "sales", "updatedAt") SELECT "category", "createdAt", "description", "duplicateUrl", "id", "isActive", "name", "pages", "previewImages", "price", "rating", "reviews", "sales", "updatedAt" FROM "DigitalProduct";
DROP TABLE "DigitalProduct";
ALTER TABLE "new_DigitalProduct" RENAME TO "DigitalProduct";
CREATE TABLE "new_DocumentTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "renewUrl" TEXT,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reminderDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DocumentTracker" ("createdAt", "documentName", "expiryDate", "id", "userId") SELECT "createdAt", "documentName", "expiryDate", "id", "userId" FROM "DocumentTracker";
DROP TABLE "DocumentTracker";
ALTER TABLE "new_DocumentTracker" RENAME TO "DocumentTracker";
CREATE TABLE "new_DuelVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "duelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DuelVote_duelId_fkey" FOREIGN KEY ("duelId") REFERENCES "ProductDuel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DuelVote" ("createdAt", "duelId", "id", "userId") SELECT "createdAt", "duelId", "id", "userId" FROM "DuelVote";
DROP TABLE "DuelVote";
ALTER TABLE "new_DuelVote" RENAME TO "DuelVote";
CREATE UNIQUE INDEX "DuelVote_duelId_userId_key" ON "DuelVote"("duelId", "userId");
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "gradientFrom" TEXT NOT NULL DEFAULT '#f97316',
    "gradientVia" TEXT,
    "gradientTo" TEXT NOT NULL DEFAULT '#dc2626',
    "badgeText" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#fbbf24',
    "ctaText" TEXT NOT NULL DEFAULT 'Shop Now',
    "ctaLink" TEXT,
    "discountText" TEXT,
    "productId" TEXT,
    "startPrice" INTEGER,
    "currentBid" INTEGER,
    "minBidIncrement" INTEGER DEFAULT 100,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "description", "id", "isActive", "title", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_type_idx" ON "Event"("type");
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");
CREATE INDEX "Event_endTime_idx" ON "Event"("endTime");
CREATE TABLE "new_GiftCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "code" TEXT NOT NULL,
    "amount" REAL,
    "balance" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedBy" TEXT,
    "message" TEXT,
    "design" TEXT NOT NULL DEFAULT 'classic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GiftCard" ("amount", "balance", "code", "createdAt", "design", "expiryDate", "id", "isActive", "isRedeemed", "message", "redeemedBy", "updatedAt", "userId") SELECT "amount", "balance", "code", "createdAt", "design", "expiryDate", "id", "isActive", "isRedeemed", "message", "redeemedBy", "updatedAt", "userId" FROM "GiftCard";
DROP TABLE "GiftCard";
ALTER TABLE "new_GiftCard" RENAME TO "GiftCard";
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");
CREATE TABLE "new_HelpArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HelpArticle" ("category", "content", "createdAt", "helpfulCount", "id", "isPublished", "order", "slug", "title", "updatedAt", "viewCount") SELECT "category", "content", "createdAt", "helpfulCount", "id", "isPublished", "order", "slug", "title", "updatedAt", "viewCount" FROM "HelpArticle";
DROP TABLE "HelpArticle";
ALTER TABLE "new_HelpArticle" RENAME TO "HelpArticle";
CREATE UNIQUE INDEX "HelpArticle_slug_key" ON "HelpArticle"("slug");
CREATE TABLE "new_InsuranceClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "issue" TEXT,
    "damageType" TEXT,
    "photos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" REAL NOT NULL,
    "claimAmount" REAL,
    "purchaseDate" DATETIME,
    "warrantyEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InsuranceClaim" ("amount", "createdAt", "id", "orderId", "status", "updatedAt") SELECT "amount", "createdAt", "id", "orderId", "status", "updatedAt" FROM "InsuranceClaim";
DROP TABLE "InsuranceClaim";
ALTER TABLE "new_InsuranceClaim" RENAME TO "InsuranceClaim";
CREATE TABLE "new_NFTCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "ownerId" TEXT,
    "tokenId" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL DEFAULT 'ethereum',
    "contractAddress" TEXT NOT NULL,
    "metadataUrl" TEXT,
    "metadata" TEXT,
    "isLimitedEdition" BOOLEAN NOT NULL DEFAULT false,
    "editionNumber" INTEGER,
    "totalEditions" INTEGER,
    "mintedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NFTCertificate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NFTCertificate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NFTCertificate" ("blockchain", "contractAddress", "id", "metadataUrl", "mintedAt", "productId", "tokenId") SELECT "blockchain", "contractAddress", "id", "metadataUrl", "mintedAt", "productId", "tokenId" FROM "NFTCertificate";
DROP TABLE "NFTCertificate";
ALTER TABLE "new_NFTCertificate" RENAME TO "NFTCertificate";
CREATE UNIQUE INDEX "NFTCertificate_tokenId_key" ON "NFTCertificate"("tokenId");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "total" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "notes" TEXT,
    "shippingAddress" TEXT,
    "trackingNumber" TEXT,
    "trackingSteps" TEXT,
    "hasDeliveryVideo" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "splitPayment" BOOLEAN NOT NULL DEFAULT false,
    "walletAmount" REAL NOT NULL DEFAULT 0,
    "cardAmount" REAL NOT NULL DEFAULT 0,
    "priceLocked" BOOLEAN NOT NULL DEFAULT false,
    "priceLockId" TEXT,
    "partialPayment" BOOLEAN NOT NULL DEFAULT false,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "deliverySlotId" TEXT,
    "deliveryInstructions" TEXT,
    "demoCallUrl" TEXT,
    "demoCallScheduledAt" DATETIME,
    "projectMilestone" TEXT NOT NULL DEFAULT 'requirement_gathering',
    "rushDelivery" BOOLEAN NOT NULL DEFAULT false,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "maxRevisions" INTEGER NOT NULL DEFAULT 3,
    "deliverableUrl" TEXT,
    "deliveryProofImage" TEXT,
    "deliveredAt" DATETIME,
    "notifiedMilestones" TEXT,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amountPaid", "cardAmount", "couponCode", "createdAt", "customerEmail", "customerName", "customerPhone", "deliverableUrl", "deliveredAt", "deliveryInstructions", "deliveryProofImage", "deliverySlotId", "demoCallScheduledAt", "demoCallUrl", "discount", "id", "maxRevisions", "notes", "notifiedMilestones", "partialPayment", "paymentId", "paymentMethod", "priceLockId", "priceLocked", "projectMilestone", "revisionCount", "rushDelivery", "shippingAddress", "splitPayment", "status", "total", "trackingNumber", "trackingSteps", "updatedAt", "userId", "walletAmount") SELECT "amountPaid", "cardAmount", "couponCode", "createdAt", "customerEmail", "customerName", "customerPhone", "deliverableUrl", "deliveredAt", "deliveryInstructions", "deliveryProofImage", "deliverySlotId", "demoCallScheduledAt", "demoCallUrl", "discount", "id", "maxRevisions", "notes", "notifiedMilestones", "partialPayment", "paymentId", "paymentMethod", "priceLockId", "priceLocked", "projectMilestone", "revisionCount", "rushDelivery", "shippingAddress", "splitPayment", "status", "total", "trackingNumber", "trackingSteps", "updatedAt", "userId", "walletAmount" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "imageUrl", "orderId", "price", "productId", "productName", "quantity") SELECT "id", "imageUrl", "orderId", "price", "productId", "productName", "quantity" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Preorder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "estimatedDate" DATETIME NOT NULL,
    "depositAmount" REAL NOT NULL,
    "fullPrice" REAL NOT NULL,
    "bonusIncluded" TEXT,
    "preorderedCount" INTEGER NOT NULL DEFAULT 0,
    "maxPreorders" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Preorder" ("bonusIncluded", "createdAt", "depositAmount", "estimatedDate", "fullPrice", "id", "imageUrl", "maxPreorders", "preorderedCount", "productId", "productName", "status", "updatedAt") SELECT "bonusIncluded", "createdAt", "depositAmount", "estimatedDate", "fullPrice", "id", "imageUrl", "maxPreorders", "preorderedCount", "productId", "productName", "status", "updatedAt" FROM "Preorder";
DROP TABLE "Preorder";
ALTER TABLE "new_Preorder" RENAME TO "Preorder";
CREATE TABLE "new_PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PriceHistory" ("id", "price", "productId", "recordedAt") SELECT "id", "price", "productId", "recordedAt" FROM "PriceHistory";
DROP TABLE "PriceHistory";
ALTER TABLE "new_PriceHistory" RENAME TO "PriceHistory";
CREATE TABLE "new_PriceLock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lockedPrice" REAL NOT NULL,
    "lockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "depositAmount" REAL NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'active',
    "releasedAt" DATETIME,
    "convertedAt" DATETIME
);
INSERT INTO "new_PriceLock" ("createdAt", "expiresAt", "id", "isUsed", "lockedAt", "lockedPrice", "orderId", "productId", "userId") SELECT "createdAt", "expiresAt", "id", "isUsed", "lockedAt", "lockedPrice", "orderId", "productId", "userId" FROM "PriceLock";
DROP TABLE "PriceLock";
ALTER TABLE "new_PriceLock" RENAME TO "PriceLock";
CREATE TABLE "new_PriceProtectionClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "oldPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "refundAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PriceProtectionClaim" ("createdAt", "id", "newPrice", "oldPrice", "orderId", "productId", "refundAmount", "status", "updatedAt") SELECT "createdAt", "id", "newPrice", "oldPrice", "orderId", "productId", "refundAmount", "status", "updatedAt" FROM "PriceProtectionClaim";
DROP TABLE "PriceProtectionClaim";
ALTER TABLE "new_PriceProtectionClaim" RENAME TO "PriceProtectionClaim";
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
    "flashExpiresAt" DATETIME,
    "isVIPOnly" BOOLEAN NOT NULL DEFAULT false,
    "isLuxury" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL,
    "expiryDate" DATETIME,
    "ingredients" TEXT,
    "stock" INTEGER,
    "color" TEXT,
    "size" TEXT,
    "ecoScore" REAL,
    "carbonFootprint" REAL,
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
    "packagingType" TEXT,
    "isRecyclable" BOOLEAN NOT NULL DEFAULT false,
    "isEcoFriendly" BOOLEAN NOT NULL DEFAULT false,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "wishlistCount" INTEGER NOT NULL DEFAULT 0,
    "warrantyMonths" INTEGER,
    "returnDays" INTEGER,
    "brand" TEXT,
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("arModelUrl", "batchNumber", "categoryId", "comparePrice", "complexity", "complexityGuide", "createdAt", "currentMonthOrders", "deliveryTime", "demoUrl", "description", "dimensions", "discount", "emiAvailable", "emiMinAmount", "features", "howToUse", "id", "imageUrl", "images", "interactiveDemoUrl", "isActive", "isAuthentic", "isFeatured", "isFlashDeal", "isMock", "isNew", "isOnSale", "isTrending", "manufacturedAt", "materials", "maxMonthlyOrders", "name", "order", "origin", "previewImages", "price", "qrCode", "rating", "reviewCount", "rushDeliveryAvailable", "rushDeliveryDays", "rushDeliveryPrice", "sellerId", "serialNumber", "slug", "specifications", "standardDeliveryDays", "tags", "techStack", "techStackOptions", "updatedAt", "variants", "videoDemoUrl", "whiteLabelAvailable", "whiteLabelPrice") SELECT "arModelUrl", "batchNumber", "categoryId", "comparePrice", "complexity", "complexityGuide", "createdAt", "currentMonthOrders", "deliveryTime", "demoUrl", "description", "dimensions", "discount", "emiAvailable", "emiMinAmount", "features", "howToUse", "id", "imageUrl", "images", "interactiveDemoUrl", "isActive", "isAuthentic", "isFeatured", "isFlashDeal", "isMock", "isNew", "isOnSale", "isTrending", "manufacturedAt", "materials", "maxMonthlyOrders", "name", "order", "origin", "previewImages", "price", "qrCode", "rating", "reviewCount", "rushDeliveryAvailable", "rushDeliveryDays", "rushDeliveryPrice", "sellerId", "serialNumber", "slug", "specifications", "standardDeliveryDays", "tags", "techStack", "techStackOptions", "updatedAt", "variants", "videoDemoUrl", "whiteLabelAvailable", "whiteLabelPrice" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_qrCode_key" ON "Product"("qrCode");
CREATE TABLE "new_ProductDuel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productAId" TEXT NOT NULL,
    "productBId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "endsAt" DATETIME NOT NULL,
    "winner" TEXT,
    "finalVotesA" INTEGER NOT NULL DEFAULT 0,
    "finalVotesB" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductDuel_productAId_fkey" FOREIGN KEY ("productAId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductDuel_productBId_fkey" FOREIGN KEY ("productBId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductDuel" ("createdAt", "id", "status", "title", "updatedAt") SELECT "createdAt", "id", "status", "title", "updatedAt" FROM "ProductDuel";
DROP TABLE "ProductDuel";
ALTER TABLE "new_ProductDuel" RENAME TO "ProductDuel";
CREATE TABLE "new_ProductRecall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "action" TEXT,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundEligible" BOOLEAN NOT NULL DEFAULT false,
    "replacementEligible" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ProductRecall" ("createdAt", "id", "productId", "reason", "status") SELECT "createdAt", "id", "productId", "reason", "status" FROM "ProductRecall";
DROP TABLE "ProductRecall";
ALTER TABLE "new_ProductRecall" RENAME TO "ProductRecall";
CREATE TABLE "new_ProductView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductView" ("id", "productId", "userId", "viewedAt") SELECT "id", "productId", "userId", "viewedAt" FROM "ProductView";
DROP TABLE "ProductView";
ALTER TABLE "new_ProductView" RENAME TO "ProductView";
CREATE TABLE "new_ReturnRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "refundAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReturnRequest" ("createdAt", "description", "id", "orderId", "productId", "productName", "reason", "refundAmount", "status", "updatedAt") SELECT "createdAt", "description", "id", "orderId", "productId", "productName", "reason", "refundAmount", "status", "updatedAt" FROM "ReturnRequest";
DROP TABLE "ReturnRequest";
ALTER TABLE "new_ReturnRequest" RENAME TO "ReturnRequest";
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "author" TEXT NOT NULL,
    "title" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "avatar" TEXT,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("author", "avatar", "comment", "createdAt", "flagReason", "id", "isFlagged", "isVerified", "productId", "rating", "userId") SELECT "author", "avatar", "comment", "createdAt", "flagReason", "id", "isFlagged", "isVerified", "productId", "rating", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "avatar" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "bio" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "responseTime" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT,
    "icon" TEXT,
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
    "story" TEXT,
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Seller" ("autoPayoutEnabled", "avgResponseTime", "badges", "bankAccountName", "bankAccountNumber", "bankRoutingNumber", "commissionRate", "conversionRate", "coverImage", "createdAt", "customDomain", "description", "followerCount", "id", "isAcceptingOrders", "isFeatured", "isOnboarded", "isVerified", "joinedAt", "logo", "minPayoutAmount", "monthlyRevenue", "name", "onboardingProgress", "onboardingStatus", "payoutBalance", "paypalEmail", "productCount", "rating", "responseTime", "reviewCount", "slug", "socialLinks", "storePolicies", "storeTheme", "stripeConnectId", "topServices", "totalEarnings", "totalSales", "updatedAt", "userId", "verificationBadge", "viewCount") SELECT "autoPayoutEnabled", "avgResponseTime", "badges", "bankAccountName", "bankAccountNumber", "bankRoutingNumber", "commissionRate", "conversionRate", "coverImage", "createdAt", "customDomain", "description", "followerCount", "id", "isAcceptingOrders", "isFeatured", "isOnboarded", "isVerified", "joinedAt", "logo", "minPayoutAmount", "monthlyRevenue", "name", "onboardingProgress", "onboardingStatus", "payoutBalance", "paypalEmail", "productCount", "rating", "responseTime", "reviewCount", "slug", "socialLinks", "storePolicies", "storeTheme", "stripeConnectId", "topServices", "totalEarnings", "totalSales", "updatedAt", "userId", "verificationBadge", "viewCount" FROM "Seller";
DROP TABLE "Seller";
ALTER TABLE "new_Seller" RENAME TO "Seller";
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");
CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");
CREATE INDEX "Seller_userId_idx" ON "Seller"("userId");
CREATE INDEX "Seller_onboardingStatus_idx" ON "Seller"("onboardingStatus");
CREATE INDEX "Seller_isOnboarded_idx" ON "Seller"("isOnboarded");
CREATE TABLE "new_SellerOnboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "step" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
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
    "estimatedRevenue" REAL NOT NULL DEFAULT 0,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "documents" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerOnboarding_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SellerOnboarding" ("address", "bankInfoCompleted", "businessInfoCompleted", "businessName", "businessType", "city", "country", "createdAt", "documentsSubmitted", "id", "notes", "personalInfoCompleted", "phone", "rejectionReason", "reviewedAt", "reviewedBy", "sellerId", "state", "storeSetupCompleted", "submittedAt", "taxId", "updatedAt", "website", "zipCode") SELECT "address", "bankInfoCompleted", "businessInfoCompleted", "businessName", "businessType", "city", "country", "createdAt", "documentsSubmitted", "id", "notes", "personalInfoCompleted", "phone", "rejectionReason", "reviewedAt", "reviewedBy", "sellerId", "state", "storeSetupCompleted", "submittedAt", "taxId", "updatedAt", "website", "zipCode" FROM "SellerOnboarding";
DROP TABLE "SellerOnboarding";
ALTER TABLE "new_SellerOnboarding" RENAME TO "SellerOnboarding";
CREATE UNIQUE INDEX "SellerOnboarding_sellerId_key" ON "SellerOnboarding"("sellerId");
CREATE INDEX "SellerOnboarding_sellerId_idx" ON "SellerOnboarding"("sellerId");
CREATE TABLE "new_TrialOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "duration" INTEGER NOT NULL DEFAULT 7,
    "trialStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEnd" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "deposit" REAL NOT NULL,
    "trialPrice" REAL,
    "finalPrice" REAL,
    "returnMethod" TEXT,
    "startsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TrialOrder" ("createdAt", "deposit", "finalPrice", "id", "productId", "returnMethod", "status", "trialEnd", "trialStart", "updatedAt", "userId") SELECT "createdAt", "deposit", "finalPrice", "id", "productId", "returnMethod", "status", "trialEnd", "trialStart", "updatedAt", "userId" FROM "TrialOrder";
DROP TABLE "TrialOrder";
ALTER TABLE "new_TrialOrder" RENAME TO "TrialOrder";
CREATE TABLE "new_UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailyCheckInDate" DATETIME,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "fontSize" TEXT NOT NULL DEFAULT 'normal',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "noiseAdaptation" TEXT,
    "seniorMode" BOOLEAN NOT NULL DEFAULT false,
    "voiceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "simpleCheckout" BOOLEAN NOT NULL DEFAULT false,
    "visualImpairedMode" BOOLEAN NOT NULL DEFAULT false,
    "voiceNavigation" BOOLEAN NOT NULL DEFAULT false,
    "screenReaderOptimized" BOOLEAN NOT NULL DEFAULT false,
    "hapticFeedback" BOOLEAN NOT NULL DEFAULT false,
    "showSocialProof" BOOLEAN NOT NULL DEFAULT true,
    "showReviews" BOOLEAN NOT NULL DEFAULT true,
    "showPopularity" BOOLEAN NOT NULL DEFAULT true,
    "showNotifications" BOOLEAN NOT NULL DEFAULT true,
    "interests" TEXT,
    "shopStyle" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserPreference" ("currentStreak", "dailyCheckInDate", "emailEnabled", "fontSize", "hapticFeedback", "highContrast", "id", "interests", "noiseAdaptation", "onboardingComplete", "pushEnabled", "reduceMotion", "referralCode", "screenReaderOptimized", "seniorMode", "shopStyle", "simpleCheckout", "smsEnabled", "streakCount", "updatedAt", "userId", "visualImpairedMode", "voiceEnabled", "voiceNavigation") SELECT "currentStreak", "dailyCheckInDate", "emailEnabled", "fontSize", "hapticFeedback", "highContrast", "id", "interests", "noiseAdaptation", "onboardingComplete", "pushEnabled", "reduceMotion", "referralCode", "screenReaderOptimized", "seniorMode", "shopStyle", "simpleCheckout", "smsEnabled", "streakCount", "updatedAt", "userId", "visualImpairedMode", "voiceEnabled", "voiceNavigation" FROM "UserPreference";
DROP TABLE "UserPreference";
ALTER TABLE "new_UserPreference" RENAME TO "UserPreference";
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE UNIQUE INDEX "UserPreference_referralCode_key" ON "UserPreference"("referralCode");
CREATE TABLE "new_VoiceShoppingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "command" TEXT,
    "action" TEXT,
    "result" TEXT,
    "understood" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_VoiceShoppingLog" ("command", "createdAt", "id", "result", "transcript", "userId") SELECT "command", "createdAt", "id", "result", "transcript", "userId" FROM "VoiceShoppingLog";
DROP TABLE "VoiceShoppingLog";
ALTER TABLE "new_VoiceShoppingLog" RENAME TO "VoiceShoppingLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LiveShoppingSession_hostId_idx" ON "LiveShoppingSession"("hostId");

-- CreateIndex
CREATE INDEX "LiveShoppingSession_status_idx" ON "LiveShoppingSession"("status");

-- CreateIndex
CREATE INDEX "LiveShoppingSession_startTime_idx" ON "LiveShoppingSession"("startTime");

-- CreateIndex
CREATE INDEX "LiveShoppingInteraction_sessionId_idx" ON "LiveShoppingInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "LiveShoppingInteraction_userId_idx" ON "LiveShoppingInteraction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NeuralProfile_userId_key" ON "NeuralProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalTwin_userId_key" ON "DigitalTwin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DNAProfile_userId_key" ON "DNAProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StyleEvolution_userId_key" ON "StyleEvolution"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialCapital_userId_key" ON "SocialCapital"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrendCouncil_userId_key" ON "TrendCouncil"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalShopper_userId_key" ON "PersonalShopper"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RealityCustomization_userId_key" ON "RealityCustomization"("userId");

-- CreateIndex
CREATE INDEX "NeuralSignal_userId_timestamp_idx" ON "NeuralSignal"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "NeuralSignal_type_idx" ON "NeuralSignal"("type");

-- CreateIndex
CREATE INDEX "ProductCompatibility_userId_productId_idx" ON "ProductCompatibility"("userId", "productId");

-- CreateIndex
CREATE INDEX "TruthAnalysis_reviewId_idx" ON "TruthAnalysis"("reviewId");

-- CreateIndex
CREATE INDEX "TruthAnalysis_productId_idx" ON "TruthAnalysis"("productId");

-- CreateIndex
CREATE INDEX "TruthAnalysis_userId_idx" ON "TruthAnalysis"("userId");

-- CreateIndex
CREATE INDEX "ReviewVote_reviewId_idx" ON "ReviewVote"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewVote_userId_idx" ON "ReviewVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserConfiguration_userId_key" ON "UserConfiguration"("userId");

-- CreateIndex
CREATE INDEX "PhotoLike_photoId_idx" ON "PhotoLike"("photoId");

-- CreateIndex
CREATE INDEX "PhotoLike_userId_idx" ON "PhotoLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_orderId_key" ON "EscrowTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeCase_escrowId_key" ON "DisputeCase"("escrowId");

-- CreateIndex
CREATE UNIQUE INDEX "CarbonFootprint_userId_key" ON "CarbonFootprint"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupShoppingSession_inviteCode_key" ON "GroupShoppingSession"("inviteCode");

-- CreateIndex
CREATE INDEX "PvpGame_hostId_idx" ON "PvpGame"("hostId");

-- CreateIndex
CREATE INDEX "PvpGuess_userId_idx" ON "PvpGuess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PvpGuess_gameId_userId_key" ON "PvpGuess"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AutoReorder_productId_key" ON "AutoReorder"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MicroInvestment_userId_key" ON "MicroInvestment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBudgetSetting_userId_key" ON "UserBudgetSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankIntegration_userId_key" ON "BankIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarIntegration_userId_key" ON "CalendarIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessProfile_userId_key" ON "FitnessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartFridgeIntegration_userId_key" ON "SmartFridgeIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartHomeIntegration_userId_key" ON "SmartHomeIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppIntegration_userId_key" ON "WhatsAppIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VIPMembership_userId_key" ON "VIPMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchSuggestion_query_key" ON "SearchSuggestion"("query");

-- CreateIndex
CREATE UNIQUE INDEX "SellerAnalytics_sellerId_key" ON "SellerAnalytics"("sellerId");
