CREATE TABLE "land_item_master" (
    "land_item_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_other" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "land_item_master_pkey" PRIMARY KEY ("land_item_id")
);

CREATE UNIQUE INDEX "land_item_master_name_key" ON "land_item_master"("name");

INSERT INTO "land_item_master" ("name", "is_other")
VALUES
    ('Administrative building', false),
    ('Farmers hostel', false),
    ('Demonstration units', false),
    ('Staff quarters', false),
    ('Rain water harvesting structure', false),
    ('Soil water testing labs', false),
    ('Minimal processing facilities', false),
    ('Carp hatchery', false),
    ('Boundary Wall', false),
    ('Demo', false),
    ('Others', true)
ON CONFLICT ("name") DO UPDATE SET "is_other" = EXCLUDED."is_other";

ALTER TABLE "kvk_land_details"
    ADD COLUMN "land_item_master_id" INTEGER,
    ADD COLUMN "specify_item_name" TEXT,
    ADD COLUMN "description" TEXT;

UPDATE "kvk_land_details" kld
SET "land_item_master_id" = lim."land_item_id"
FROM "land_item_master" lim
WHERE lower(trim(kld."item")) = lower(trim(lim."name"));

UPDATE "kvk_land_details" kld
SET
    "land_item_master_id" = lim."land_item_id",
    "specify_item_name" = NULLIF(kld."item", '')
FROM "land_item_master" lim
WHERE kld."land_item_master_id" IS NULL
  AND lim."name" = 'Others'
  AND NULLIF(kld."item", '') IS NOT NULL;

CREATE INDEX "kvk_land_details_land_item_master_id_idx" ON "kvk_land_details"("land_item_master_id");

ALTER TABLE "kvk_land_details"
    ADD CONSTRAINT "kvk_land_details_land_item_master_id_fkey"
    FOREIGN KEY ("land_item_master_id") REFERENCES "land_item_master"("land_item_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
