-- Mirrors v2-prod migration 20260709015814_kvk_host_org_name_nullable
-- (commit 4f444a6, "fix(db): allow nullable legacy kvk host org").
--
-- The `hostOrg` field (mapped to kvk.host_org_name) was removed from the
-- Kvk Prisma model in a prior change (commit f43ba3e, "kvk hostorg delete
-- column") once Host organization display was fully derived from the
-- linked UniversityMaster row instead. That change updated every read/write
-- path in the app but never shipped a migration to relax/drop the
-- underlying column, so on databases whose history predates that
-- schema-file edit it was left behind as a NOT NULL column with no writer
-- — blocking any new kvk insert. IF EXISTS guards make this a no-op on
-- databases where the column was already made nullable or dropped.
ALTER TABLE "kvk" ADD COLUMN IF NOT EXISTS "host_org_name" TEXT;
ALTER TABLE "kvk" ALTER COLUMN "host_org_name" DROP NOT NULL;
