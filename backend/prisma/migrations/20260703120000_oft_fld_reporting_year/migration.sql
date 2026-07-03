ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "reporting_year" TIMESTAMP(3);
ALTER TABLE "kvk_fld_introduction" ADD COLUMN IF NOT EXISTS "reporting_year" TIMESTAMP(3);

UPDATE "kvk_oft"
SET "reporting_year" = "oft_start_date"
WHERE "reporting_year" IS NULL
  AND "oft_start_date" IS NOT NULL;

UPDATE "kvk_fld_introduction"
SET "reporting_year" = "start_date"
WHERE "reporting_year" IS NULL
  AND "start_date" IS NOT NULL;

UPDATE "cfl_cfld_technical_parameter"
SET "reporting_year" = "month"
WHERE "reporting_year" IS NULL
  AND "month" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "kvk_oft_reporting_year_idx" ON "kvk_oft"("reporting_year");
CREATE INDEX IF NOT EXISTS "kvk_fld_introduction_reporting_year_idx" ON "kvk_fld_introduction"("reporting_year");
