-- Web Portal records gained a required portal name in the application schema.
-- The default safely backfills existing records while preserving the required
-- field for newly created records.
ALTER TABLE "web_portal"
ADD COLUMN "web_portal_name" TEXT NOT NULL DEFAULT '';
