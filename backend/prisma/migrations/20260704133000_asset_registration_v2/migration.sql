CREATE TABLE IF NOT EXISTS "vehicle_type_master" (
    "vehicle_type_id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "kvk_vehicle"
    ADD COLUMN IF NOT EXISTS "vehicle_type_id" INTEGER;

CREATE INDEX IF NOT EXISTS "kvk_vehicle_vehicle_type_id_idx"
    ON "kvk_vehicle"("vehicle_type_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'kvk_vehicle_vehicle_type_id_fkey'
    ) THEN
        ALTER TABLE "kvk_vehicle"
            ADD CONSTRAINT "kvk_vehicle_vehicle_type_id_fkey"
            FOREIGN KEY ("vehicle_type_id")
            REFERENCES "vehicle_type_master"("vehicle_type_id")
            ON DELETE SET NULL
            ON UPDATE CASCADE;
    END IF;
END $$;

INSERT INTO "vehicle_type_master" ("name", "is_other", "created_at", "updated_at")
VALUES
    ('Tractor', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Jeep', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MotorCycle', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Cycle', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Bus', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Others(Please Specify)', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "is_other" = EXCLUDED."is_other",
    "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "equipment_type_master" ("name", "is_other", "created_at", "updated_at")
VALUES
    ('Farm Implements/Machinery', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Lab Equipment', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Post Harvest Machinery/ Processing Unit', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('IT', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Electronics', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Furnitres', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Others', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "is_other" = EXCLUDED."is_other",
    "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "asset_funding_source_master" ("name", "is_other", "created_at", "updated_at")
VALUES
    ('central government/Ministry', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('State government/Department', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ICAR', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Host Organisation', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Private Organisation', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('International Organisation', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('NGO', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CSR', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Self Funded', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Other(Please Specify)', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "is_other" = EXCLUDED."is_other",
    "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "vehicle_present_status_master" ("status_code", "status_label", "hide_in_next_year", "is_active", "created_at", "updated_at")
VALUES
    ('SOLD', 'Sold', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CONDEMNED', 'Condemend', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WORKING', 'Working', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("status_code") DO UPDATE
SET "status_label" = EXCLUDED."status_label",
    "hide_in_next_year" = EXCLUDED."hide_in_next_year",
    "is_active" = EXCLUDED."is_active",
    "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "equipment_present_status_master" ("status_code", "status_label", "hide_in_next_year", "is_active", "created_at", "updated_at")
VALUES
    ('SOLD', 'Sold', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CONDEMNED', 'Condemend', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('WORKING', 'Working', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("status_code") DO UPDATE
SET "status_label" = EXCLUDED."status_label",
    "hide_in_next_year" = EXCLUDED."hide_in_next_year",
    "is_active" = EXCLUDED."is_active",
    "updated_at" = CURRENT_TIMESTAMP;
