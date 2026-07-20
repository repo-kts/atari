-- BLA-39 removed Plant Material from the rainwater-harvesting form and reports.
-- Drop the legacy required column so new records no longer fail on insert.
ALTER TABLE "rainwater_harvesting"
DROP COLUMN IF EXISTS "plant_material";
