-- Equipment merge: add EquipmentTypeMaster + EquipmentMaster, drop kvk_farm_implement,
-- drop KvkEquipment.type enum, add equipment_type_id + equipment_master_id + company_brand_model.
-- Also drops the legacy kvk_equipment.equipment_name and source_of_funding-related cruft (if any).

-- =========================================================================
-- EquipmentTypeMaster (parent)
-- =========================================================================
CREATE TABLE IF NOT EXISTS "equipment_type_master" (
    "equipment_type_id" SERIAL NOT NULL,
    "name"              TEXT NOT NULL,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "equipment_type_master_pkey" PRIMARY KEY ("equipment_type_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "equipment_type_master_name_key"
    ON "equipment_type_master"("name");

INSERT INTO "equipment_type_master" ("name", "updated_at")
VALUES
    ('Tractor',   CURRENT_TIMESTAMP),
    ('Sprayer',   CURRENT_TIMESTAMP),
    ('Trailer',   CURRENT_TIMESTAMP),
    ('Harvester', CURRENT_TIMESTAMP),
    ('Thresher',  CURRENT_TIMESTAMP),
    ('Tiller',    CURRENT_TIMESTAMP),
    ('Generator', CURRENT_TIMESTAMP),
    ('Other',     CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- =========================================================================
-- EquipmentMaster (child of EquipmentTypeMaster)
-- =========================================================================
CREATE TABLE IF NOT EXISTS "equipment_master" (
    "equipment_master_id" SERIAL NOT NULL,
    "equipment_type_id"   INTEGER NOT NULL,
    "name"                TEXT NOT NULL,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "equipment_master_pkey" PRIMARY KEY ("equipment_master_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "equipment_master_type_name_key"
    ON "equipment_master"("equipment_type_id", "name");

CREATE INDEX IF NOT EXISTS "equipment_master_equipment_type_id_idx"
    ON "equipment_master"("equipment_type_id");

ALTER TABLE "equipment_master"
    ADD CONSTRAINT "equipment_master_equipment_type_id_fkey"
    FOREIGN KEY ("equipment_type_id")
    REFERENCES "equipment_type_master"("equipment_type_id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- kvk_equipment: add new FK columns + company_brand_model; drop legacy type + equipment_name
-- =========================================================================
ALTER TABLE "kvk_equipment"
    ADD COLUMN IF NOT EXISTS "equipment_type_id"   INTEGER,
    ADD COLUMN IF NOT EXISTS "equipment_master_id" INTEGER,
    ADD COLUMN IF NOT EXISTS "company_brand_model" TEXT;

-- Drop the `type` enum column (was EquipmentType enum)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_equipment'
          AND column_name = 'type'
    ) THEN
        ALTER TABLE "kvk_equipment" DROP COLUMN "type";
    END IF;
END $$;

-- Drop the EquipmentType enum type if still exists (after column drop)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'EquipmentType'
    ) THEN
        DROP TYPE "EquipmentType";
    END IF;
END $$;

-- Make equipment_name nullable (legacy rows keep their names; new rows use EquipmentMaster)
ALTER TABLE "kvk_equipment" ALTER COLUMN "equipment_name" DROP NOT NULL;

-- FK constraints
ALTER TABLE "kvk_equipment"
    ADD CONSTRAINT "kvk_equipment_equipment_type_id_fkey"
    FOREIGN KEY ("equipment_type_id")
    REFERENCES "equipment_type_master"("equipment_type_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "kvk_equipment"
    ADD CONSTRAINT "kvk_equipment_equipment_master_id_fkey"
    FOREIGN KEY ("equipment_master_id")
    REFERENCES "equipment_master"("equipment_master_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_equipment_equipment_type_id_idx"
    ON "kvk_equipment"("equipment_type_id");

CREATE INDEX IF NOT EXISTS "kvk_equipment_equipment_master_id_idx"
    ON "kvk_equipment"("equipment_master_id");

-- =========================================================================
-- Drop kvk_farm_implement table entirely (option A: drop data)
-- =========================================================================
DROP TABLE IF EXISTS "kvk_farm_implement";

-- Drop ImplementPresentStatus enum if unused by anything else
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'ImplementPresentStatus'
    ) THEN
        DROP TYPE "ImplementPresentStatus";
    END IF;
EXCEPTION WHEN dependent_objects_still_exist THEN
    -- enum still referenced somewhere else; leave it
    NULL;
END $$;
