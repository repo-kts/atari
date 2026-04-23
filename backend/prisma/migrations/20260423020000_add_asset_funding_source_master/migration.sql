-- Add AssetFundingSourceMaster and migrate vehicle/equipment source_of_funding (String) to FK.

CREATE TABLE IF NOT EXISTS "asset_funding_source_master" (
    "asset_funding_source_id" SERIAL NOT NULL,
    "name"                    TEXT NOT NULL,
    "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_funding_source_master_pkey" PRIMARY KEY ("asset_funding_source_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "asset_funding_source_master_name_key"
    ON "asset_funding_source_master"("name");

-- Seed initial entries
INSERT INTO "asset_funding_source_master" ("name", "updated_at")
VALUES
    ('ICAR',           CURRENT_TIMESTAMP),
    ('State Govt',     CURRENT_TIMESTAMP),
    ('KVK Own Fund',   CURRENT_TIMESTAMP),
    ('World Bank',     CURRENT_TIMESTAMP),
    ('ATARI',          CURRENT_TIMESTAMP),
    ('Revolving Fund', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- =========================================================================
-- kvk_equipment: source_of_funding (String, required) -> asset_funding_source_id (Int, nullable)
-- =========================================================================
ALTER TABLE "kvk_equipment"
    ADD COLUMN IF NOT EXISTS "asset_funding_source_id" INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_equipment'
          AND column_name = 'source_of_funding'
    ) THEN
        INSERT INTO "asset_funding_source_master" ("name", "updated_at")
        SELECT DISTINCT TRIM(e."source_of_funding"), CURRENT_TIMESTAMP
        FROM "kvk_equipment" e
        WHERE e."source_of_funding" IS NOT NULL AND TRIM(e."source_of_funding") <> ''
        ON CONFLICT ("name") DO NOTHING;

        UPDATE "kvk_equipment" e
        SET "asset_funding_source_id" = m."asset_funding_source_id"
        FROM "asset_funding_source_master" m
        WHERE e."asset_funding_source_id" IS NULL
          AND e."source_of_funding" IS NOT NULL
          AND TRIM(e."source_of_funding") = m."name";

        ALTER TABLE "kvk_equipment" DROP COLUMN "source_of_funding";
    END IF;
END $$;

ALTER TABLE "kvk_equipment"
    ADD CONSTRAINT "kvk_equipment_asset_funding_source_id_fkey"
    FOREIGN KEY ("asset_funding_source_id")
    REFERENCES "asset_funding_source_master"("asset_funding_source_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_equipment_asset_funding_source_id_idx"
    ON "kvk_equipment"("asset_funding_source_id");

-- =========================================================================
-- kvk_equipment_detail: source_of_funding (String?) -> asset_funding_source_id (Int?)
-- =========================================================================
ALTER TABLE "kvk_equipment_detail"
    ADD COLUMN IF NOT EXISTS "asset_funding_source_id" INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_equipment_detail'
          AND column_name = 'source_of_funding'
    ) THEN
        INSERT INTO "asset_funding_source_master" ("name", "updated_at")
        SELECT DISTINCT TRIM(d."source_of_funding"), CURRENT_TIMESTAMP
        FROM "kvk_equipment_detail" d
        WHERE d."source_of_funding" IS NOT NULL AND TRIM(d."source_of_funding") <> ''
        ON CONFLICT ("name") DO NOTHING;

        UPDATE "kvk_equipment_detail" d
        SET "asset_funding_source_id" = m."asset_funding_source_id"
        FROM "asset_funding_source_master" m
        WHERE d."asset_funding_source_id" IS NULL
          AND d."source_of_funding" IS NOT NULL
          AND TRIM(d."source_of_funding") = m."name";

        ALTER TABLE "kvk_equipment_detail" DROP COLUMN "source_of_funding";
    END IF;
END $$;

ALTER TABLE "kvk_equipment_detail"
    ADD CONSTRAINT "kvk_equipment_detail_asset_funding_source_id_fkey"
    FOREIGN KEY ("asset_funding_source_id")
    REFERENCES "asset_funding_source_master"("asset_funding_source_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_equipment_detail_asset_funding_source_id_idx"
    ON "kvk_equipment_detail"("asset_funding_source_id");

-- =========================================================================
-- kvk_vehicle_detail: source_of_funding (String?) -> asset_funding_source_id (Int?)
-- =========================================================================
ALTER TABLE "kvk_vehicle_detail"
    ADD COLUMN IF NOT EXISTS "asset_funding_source_id" INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_vehicle_detail'
          AND column_name = 'source_of_funding'
    ) THEN
        INSERT INTO "asset_funding_source_master" ("name", "updated_at")
        SELECT DISTINCT TRIM(d."source_of_funding"), CURRENT_TIMESTAMP
        FROM "kvk_vehicle_detail" d
        WHERE d."source_of_funding" IS NOT NULL AND TRIM(d."source_of_funding") <> ''
        ON CONFLICT ("name") DO NOTHING;

        UPDATE "kvk_vehicle_detail" d
        SET "asset_funding_source_id" = m."asset_funding_source_id"
        FROM "asset_funding_source_master" m
        WHERE d."asset_funding_source_id" IS NULL
          AND d."source_of_funding" IS NOT NULL
          AND TRIM(d."source_of_funding") = m."name";

        ALTER TABLE "kvk_vehicle_detail" DROP COLUMN "source_of_funding";
    END IF;
END $$;

ALTER TABLE "kvk_vehicle_detail"
    ADD CONSTRAINT "kvk_vehicle_detail_asset_funding_source_id_fkey"
    FOREIGN KEY ("asset_funding_source_id")
    REFERENCES "asset_funding_source_master"("asset_funding_source_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_vehicle_detail_asset_funding_source_id_idx"
    ON "kvk_vehicle_detail"("asset_funding_source_id");
