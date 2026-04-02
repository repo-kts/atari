-- Add canonical date column for modules that currently store only integer year.
-- This is a non-breaking expansion migration; legacy int year columns remain.

ALTER TABLE "kvk_budget_utilization"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "financial_information"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "soil_data_information"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "beneficiaries_details"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "ppv_fra_plant_varieties"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "targets"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

ALTER TABLE "module_images"
ADD COLUMN IF NOT EXISTS "reporting_year_date" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "kvk_budget_utilization_reporting_year_date_idx"
ON "kvk_budget_utilization" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "kvk_budget_utilization_kvkId_reporting_year_date_idx"
ON "kvk_budget_utilization" ("kvkId", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "financial_information_reporting_year_date_idx"
ON "financial_information" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "financial_information_kvkId_reporting_year_date_idx"
ON "financial_information" ("kvkId", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "soil_data_information_reporting_year_date_idx"
ON "soil_data_information" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "soil_data_information_kvkId_reporting_year_date_idx"
ON "soil_data_information" ("kvkId", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "beneficiaries_details_reporting_year_date_idx"
ON "beneficiaries_details" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "beneficiaries_details_kvkId_reporting_year_date_idx"
ON "beneficiaries_details" ("kvkId", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "ppv_fra_plant_varieties_reporting_year_date_idx"
ON "ppv_fra_plant_varieties" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "ppv_fra_plant_varieties_kvkId_reporting_year_date_idx"
ON "ppv_fra_plant_varieties" ("kvkId", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "targets_reporting_year_date_idx"
ON "targets" ("reporting_year_date");

CREATE INDEX IF NOT EXISTS "targets_kvk_id_reporting_year_date_idx"
ON "targets" ("kvk_id", "reporting_year_date");

CREATE INDEX IF NOT EXISTS "module_images_reporting_year_date_image_date_idx"
ON "module_images" ("reporting_year_date", "image_date");

CREATE INDEX IF NOT EXISTS "module_images_kvk_id_reporting_year_date_idx"
ON "module_images" ("kvk_id", "reporting_year_date");

UPDATE "kvk_budget_utilization"
SET "reporting_year_date" = make_date("year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "year" BETWEEN 1900 AND 3000;

UPDATE "financial_information"
SET "reporting_year_date" = make_date("year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "year" BETWEEN 1900 AND 3000;

UPDATE "soil_data_information"
SET "reporting_year_date" = make_date("year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "year" BETWEEN 1900 AND 3000;

UPDATE "beneficiaries_details"
SET "reporting_year_date" = make_date("year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "year" BETWEEN 1900 AND 3000;

UPDATE "ppv_fra_plant_varieties"
SET "reporting_year_date" = make_date("reporting_year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "reporting_year" BETWEEN 1900 AND 3000;

UPDATE "targets"
SET "reporting_year_date" = make_date("reporting_year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "reporting_year" BETWEEN 1900 AND 3000;

UPDATE "module_images"
SET "reporting_year_date" = make_date("reporting_year", 1, 1)::timestamp
WHERE "reporting_year_date" IS NULL
  AND "reporting_year" BETWEEN 1900 AND 3000;
