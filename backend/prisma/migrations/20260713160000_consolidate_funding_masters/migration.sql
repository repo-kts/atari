-- Consolidate three funding masters (Funding Agency, Funding Source, Asset Funding Source)
-- into a single surviving master table, keeping the "asset_funding_source_master" data/ids
-- as the base and renaming it to "funding_source_master".
--
-- Legacy tables (old "funding_source_master" and "funding_agency") are kept under a
-- "_legacy" name until all their rows are merged in and all referencing FKs are remapped,
-- then dropped at the end. All existing rows/ids in the surviving table are untouched.

-- 1. Move the two legacy tables out of the way so the survivor can take the final name.
--    Also free up the old "funding_source_master"'s sequence/index names, since the
--    survivor (asset_funding_source_master) is about to be renamed to claim them.
ALTER TABLE "funding_source_master" RENAME TO "funding_source_master_legacy";
ALTER TABLE "funding_source_master_legacy" RENAME CONSTRAINT "funding_source_master_pkey" TO "funding_source_master_legacy_pkey";
ALTER SEQUENCE "funding_source_master_funding_source_id_seq" RENAME TO "funding_source_master_legacy_funding_source_id_seq";
ALTER INDEX "funding_source_master_name_key" RENAME TO "funding_source_master_legacy_name_key";
ALTER TABLE "funding_agency" RENAME TO "funding_agency_legacy";

-- 2. Promote the survivor (asset_funding_source_master) to be the consolidated master.
ALTER TABLE "asset_funding_source_master" RENAME TO "funding_source_master";
ALTER TABLE "funding_source_master" RENAME COLUMN "asset_funding_source_id" TO "funding_source_id";
ALTER TABLE "funding_source_master" RENAME CONSTRAINT "asset_funding_source_master_pkey" TO "funding_source_master_pkey";
ALTER SEQUENCE IF EXISTS "asset_funding_source_master_asset_funding_source_id_seq" RENAME TO "funding_source_master_funding_source_id_seq";
ALTER INDEX IF EXISTS "asset_funding_source_master_name_key" RENAME TO "funding_source_master_name_key";

-- 3. Merge rows from the legacy tables into the survivor, de-duplicating by name
--    (case-insensitive, trimmed) so overlapping entries (e.g. "ICAR") aren't repeated.
INSERT INTO "funding_source_master" (name, is_other, created_at, updated_at)
SELECT l.name, bool_or(l.is_other), now(), now()
FROM "funding_source_master_legacy" l
WHERE NOT EXISTS (
    SELECT 1 FROM "funding_source_master" f WHERE lower(trim(f.name)) = lower(trim(l.name))
)
GROUP BY l.name;

INSERT INTO "funding_source_master" (name, is_other, created_at, updated_at)
SELECT l.agency_name, bool_or(l.is_other), now(), now()
FROM "funding_agency_legacy" l
WHERE NOT EXISTS (
    SELECT 1 FROM "funding_source_master" f WHERE lower(trim(f.name)) = lower(trim(l.agency_name))
)
GROUP BY l.agency_name;

-- 4. Remap every FK that pointed at a legacy table to the matching (by name) row
--    in the now-consolidated "funding_source_master", then repoint the constraint.

-- 4a. training_achievement."fundingSourceId" (was -> funding_source_master_legacy)
ALTER TABLE "training_achievement" DROP CONSTRAINT "training_achievement_fundingSourceId_fkey";
UPDATE "training_achievement" t
SET "fundingSourceId" = f."funding_source_id"
FROM "funding_source_master_legacy" l
JOIN "funding_source_master" f ON lower(trim(f.name)) = lower(trim(l.name))
WHERE t."fundingSourceId" = l."funding_source_id";
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_fundingSourceId_fkey" FOREIGN KEY ("fundingSourceId") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4b. kvk_oft.source_of_funding_id (was -> funding_source_master_legacy)
ALTER TABLE "kvk_oft" DROP CONSTRAINT "kvk_oft_source_of_funding_id_fkey";
UPDATE "kvk_oft" t
SET "source_of_funding_id" = f."funding_source_id"
FROM "funding_source_master_legacy" l
JOIN "funding_source_master" f ON lower(trim(f.name)) = lower(trim(l.name))
WHERE t."source_of_funding_id" = l."funding_source_id";
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_source_of_funding_id_fkey" FOREIGN KEY ("source_of_funding_id") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4c. project_budget.funding_agency_id (was -> funding_agency_legacy) -> renamed to source_of_funding_id
ALTER TABLE "project_budget" DROP CONSTRAINT "project_budget_funding_agency_id_fkey";
ALTER TABLE "project_budget" RENAME COLUMN "funding_agency_id" TO "source_of_funding_id";
UPDATE "project_budget" t
SET "source_of_funding_id" = f."funding_source_id"
FROM "funding_agency_legacy" l
JOIN "funding_source_master" f ON lower(trim(f.name)) = lower(trim(l.agency_name))
WHERE t."source_of_funding_id" = l."funding_agency_id";
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_source_of_funding_id_fkey" FOREIGN KEY ("source_of_funding_id") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_budget" ADD COLUMN "funding_agency_name" TEXT;
DROP INDEX IF EXISTS "project_budget_funding_agency_id_idx";
CREATE INDEX "project_budget_source_of_funding_id_idx" ON "project_budget"("source_of_funding_id");

-- 4d. financial_project.funding_agency_id (was -> funding_agency_legacy) -> renamed to funding_source_id
ALTER TABLE "financial_project" DROP CONSTRAINT "financial_project_funding_agency_id_fkey";
ALTER TABLE "financial_project" RENAME COLUMN "funding_agency_id" TO "funding_source_id";
UPDATE "financial_project" t
SET "funding_source_id" = f."funding_source_id"
FROM "funding_agency_legacy" l
JOIN "funding_source_master" f ON lower(trim(f.name)) = lower(trim(l.agency_name))
WHERE t."funding_source_id" = l."funding_agency_id";
ALTER TABLE "financial_project" ADD CONSTRAINT "financial_project_funding_source_id_fkey" FOREIGN KEY ("funding_source_id") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;
DROP INDEX IF EXISTS "financial_project_funding_agency_id_idx";
CREATE INDEX "financial_project_funding_source_id_idx" ON "financial_project"("funding_source_id");

-- Note: kvk_equipment / kvk_equipment_detail / kvk_vehicle_detail already reference
-- asset_funding_source_master by internal OID, so their FK constraints survive the
-- rename in step 2 untouched -- no action needed for those three tables.

-- 5. All data has been merged and every FK repointed -- drop the legacy tables.
DROP TABLE "funding_source_master_legacy";
DROP TABLE "funding_agency_legacy";
