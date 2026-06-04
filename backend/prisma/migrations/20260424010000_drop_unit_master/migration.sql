-- Revert UnitMaster: use hardcoded unit dropdown + plain TEXT column on kvk_oft.
-- The previous migration (20260424000000_oft_schema_overhaul) introduced a
-- unit_master table + unit_id FK on kvk_oft. Stakeholder feedback: not needed,
-- match the simpler unit-string pattern used by ProductionProjectForms.

-- Drop FK + column on kvk_oft
ALTER TABLE "kvk_oft" DROP CONSTRAINT IF EXISTS "kvk_oft_unit_id_fkey";
DROP INDEX IF EXISTS "kvk_oft_unit_id_idx";
ALTER TABLE "kvk_oft" DROP COLUMN IF EXISTS "unit_id";

-- Add plain unit TEXT column (nullable)
ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "unit" TEXT;

-- Drop unit_master table (no other references)
DROP TABLE IF EXISTS "unit_master";
