-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "icon" TEXT,
    "link" TEXT,
    "metadata" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT,
    "expiresAt" DATETIME,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Notification" ("createdAt", "icon", "id", "isRead", "link", "message", "title", "type") SELECT "createdAt", "icon", "id", "isRead", "link", "message", "title", "type" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_userId_type_idx" ON "Notification"("userId", "type");
CREATE TABLE "new_NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "priceDrops" BOOLEAN NOT NULL DEFAULT true,
    "backInStock" BOOLEAN NOT NULL DEFAULT true,
    "newArrivals" BOOLEAN NOT NULL DEFAULT true,
    "orderMilestones" BOOLEAN NOT NULL DEFAULT true,
    "dealExpiry" BOOLEAN NOT NULL DEFAULT true,
    "reviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "birthdayOffers" BOOLEAN NOT NULL DEFAULT true,
    "lowStock" BOOLEAN NOT NULL DEFAULT true,
    "newProducts" BOOLEAN NOT NULL DEFAULT true,
    "auctionUpdates" BOOLEAN NOT NULL DEFAULT true,
    "rewardUpdates" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "channels" TEXT NOT NULL DEFAULT 'push',
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NotificationPreference" ("backInStock", "birthdayOffers", "channels", "dealExpiry", "id", "lowStock", "newArrivals", "orderMilestones", "priceDrops", "reviewReminders", "updatedAt", "userId") SELECT "backInStock", "birthdayOffers", "channels", "dealExpiry", "id", "lowStock", "newArrivals", "orderMilestones", "priceDrops", "reviewReminders", "updatedAt", "userId" FROM "NotificationPreference";
DROP TABLE "NotificationPreference";
ALTER TABLE "new_NotificationPreference" RENAME TO "NotificationPreference";
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
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
    "interests" TEXT,
    "shopStyle" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserPreference" ("currentStreak", "dailyCheckInDate", "emailEnabled", "fontSize", "hapticFeedback", "highContrast", "id", "noiseAdaptation", "pushEnabled", "reduceMotion", "referralCode", "screenReaderOptimized", "seniorMode", "simpleCheckout", "smsEnabled", "streakCount", "updatedAt", "userId", "visualImpairedMode", "voiceEnabled", "voiceNavigation") SELECT "currentStreak", "dailyCheckInDate", "emailEnabled", "fontSize", "hapticFeedback", "highContrast", "id", "noiseAdaptation", "pushEnabled", "reduceMotion", "referralCode", "screenReaderOptimized", "seniorMode", "simpleCheckout", "smsEnabled", "streakCount", "updatedAt", "userId", "visualImpairedMode", "voiceEnabled", "voiceNavigation" FROM "UserPreference";
DROP TABLE "UserPreference";
ALTER TABLE "new_UserPreference" RENAME TO "UserPreference";
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE UNIQUE INDEX "UserPreference_referralCode_key" ON "UserPreference"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
