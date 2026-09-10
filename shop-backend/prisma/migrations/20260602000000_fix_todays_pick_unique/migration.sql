-- Fix TodaysPick unique constraint to allow multiple picks per day

-- Drop the old unique index on date only
DROP INDEX IF EXISTS "TodaysPick_date_key";

-- Create new unique index on date + productId combination
CREATE UNIQUE INDEX "TodaysPick_date_productId_key" ON "TodaysPick"("date", "productId");
