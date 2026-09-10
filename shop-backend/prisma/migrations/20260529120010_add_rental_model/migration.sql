-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rentalProductId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "durationType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "securityDeposit" REAL NOT NULL,
    "depositReturned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
