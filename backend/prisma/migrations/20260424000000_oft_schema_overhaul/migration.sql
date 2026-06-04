-- OFT schema overhaul (issue #136):
--   * Add unit_master + seed
--   * Rename kvk_oft.reporting_year -> expected_completion_date (column repurpose)
--   * Repurpose kvk_oft.area_ha_number -> quantity, add unit_id FK
--   * Add kvk_oft.source_of_funding_id FK -> funding_source_master

-- =========================================================================
-- 1. unit_master
-- =========================================================================
CREATE TABLE IF NOT EXISTS "unit_master" (
    "unit_id"    SERIAL NOT NULL,
    "name"       TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unit_master_pkey" PRIMARY KEY ("unit_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "unit_master_name_key" ON "unit_master"("name");

INSERT INTO "unit_master" ("name", "updated_at") VALUES
    ('ha',             CURRENT_TIMESTAMP),
    ('Number',         CURRENT_TIMESTAMP),
    ('Acre',           CURRENT_TIMESTAMP),
    ('Kg',             CURRENT_TIMESTAMP),
    ('Quintal',        CURRENT_TIMESTAMP),
    ('Ton',            CURRENT_TIMESTAMP),
    ('Litre',          CURRENT_TIMESTAMP),
    ('Hectare-meter',  CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- =========================================================================
-- 2. kvk_oft.reporting_year -> expected_completion_date
-- =========================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_oft'
          AND column_name = 'reporting_year'
    ) THEN
        ALTER TABLE "kvk_oft" RENAME COLUMN "reporting_year" TO "expected_completion_date";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_oft'
          AND column_name = 'expected_completion_date'
    ) THEN
        ALTER TABLE "kvk_oft" ADD COLUMN "expected_completion_date" TIMESTAMP(3);
    END IF;
END $$;

DROP INDEX IF EXISTS "kvk_oft_reportingYear_idx";
DROP INDEX IF EXISTS "kvk_oft_reporting_year_idx";
CREATE INDEX IF NOT EXISTS "kvk_oft_expected_completion_date_idx"
    ON "kvk_oft"("expected_completion_date");

-- =========================================================================
-- 3. kvk_oft.area_ha_number -> quantity ; add unit_id
-- =========================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_oft'
          AND column_name = 'area_ha_number'
    ) THEN
        ALTER TABLE "kvk_oft" RENAME COLUMN "area_ha_number" TO "quantity";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_oft'
          AND column_name = 'quantity'
    ) THEN
        ALTER TABLE "kvk_oft" ADD COLUMN "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;
END $$;

ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "unit_id" INTEGER;

ALTER TABLE "kvk_oft" DROP CONSTRAINT IF EXISTS "kvk_oft_unit_id_fkey";
ALTER TABLE "kvk_oft"
    ADD CONSTRAINT "kvk_oft_unit_id_fkey"
    FOREIGN KEY ("unit_id")
    REFERENCES "unit_master"("unit_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_oft_unit_id_idx" ON "kvk_oft"("unit_id");

-- =========================================================================
-- 4. kvk_oft.source_of_funding_id  ->  funding_source_master
-- =========================================================================
ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "source_of_funding_id" INTEGER;

ALTER TABLE "kvk_oft" DROP CONSTRAINT IF EXISTS "kvk_oft_source_of_funding_id_fkey";
ALTER TABLE "kvk_oft"
    ADD CONSTRAINT "kvk_oft_source_of_funding_id_fkey"
    FOREIGN KEY ("source_of_funding_id")
    REFERENCES "funding_source_master"("funding_source_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_oft_source_of_funding_id_idx"
    ON "kvk_oft"("source_of_funding_id");
