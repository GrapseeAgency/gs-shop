-- Add security tables for Phase V
-- Run this migration to add the missing security tables

-- Security logging table
CREATE TABLE IF NOT EXISTS "security_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "requestId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "metadata" JSON,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip" TEXT,
  "userAgent" TEXT
);

-- Create indexes for security_logs
CREATE INDEX IF NOT EXISTS "idx_security_logs_requestId" ON "security_logs"("requestId");
CREATE INDEX IF NOT EXISTS "idx_security_logs_type" ON "security_logs"("type");
CREATE INDEX IF NOT EXISTS "idx_security_logs_severity" ON "security_logs"("severity");
CREATE INDEX IF NOT EXISTS "idx_security_logs_timestamp" ON "security_logs"("timestamp");

-- Blacklisted emails table
CREATE TABLE IF NOT EXISTS "blacklisted_emails" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "reason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_blacklisted_emails_email" ON "blacklisted_emails"("email");

-- Blacklisted IPs table
CREATE TABLE IF NOT EXISTS "blacklisted_ips" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ip" TEXT NOT NULL UNIQUE,
  "reason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_blacklisted_ips_ip" ON "blacklisted_ips"("ip");

-- Blacklisted devices table
CREATE TABLE IF NOT EXISTS "blacklisted_devices" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fingerprint" TEXT NOT NULL UNIQUE,
  "reason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_blacklisted_devices_fingerprint" ON "blacklisted_devices"("fingerprint");

-- Wallet table
CREATE TABLE IF NOT EXISTS "wallets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userEmail" TEXT NOT NULL UNIQUE,
  "balance" REAL NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'active',
  "restrictions" JSON,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wallets_userEmail" ON "wallets"("userEmail");

-- Inventory log table
CREATE TABLE IF NOT EXISTS "inventory_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSON
);

CREATE INDEX IF NOT EXISTS "idx_inventory_logs_productId" ON "inventory_logs"("productId");
CREATE INDEX IF NOT EXISTS "idx_inventory_logs_timestamp" ON "inventory_logs"("timestamp");

-- Chargeback table
CREATE TABLE IF NOT EXISTS "chargebacks" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerEmail" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_chargebacks_customerEmail" ON "chargebacks"("customerEmail");
CREATE INDEX IF NOT EXISTS "idx_chargebacks_orderId" ON "chargebacks"("orderId");

-- Add missing fields to Product table if they don't exist
ALTER TABLE "Product" ADD COLUMN "reserved" INTEGER DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "version" INTEGER DEFAULT 1;
