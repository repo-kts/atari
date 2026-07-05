ALTER TABLE "kvk_vehicle_detail"
    ADD COLUMN IF NOT EXISTS "asset_funding_source_other" TEXT;

ALTER TABLE "kvk_equipment_detail"
    ADD COLUMN IF NOT EXISTS "asset_funding_source_other" TEXT;
