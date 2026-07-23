-- "In Compliance" is now an Action Taken enum value, not a separate column.
-- Drop the deprecated column so the Prisma schema matches the DB. IF EXISTS
-- keeps this a no-op on branches that were built without the column.
ALTER TABLE "sac_meeting"
DROP COLUMN IF EXISTS "in_compliance";
