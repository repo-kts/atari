-- FLD parity with OFT (issue #136 follow-up):
--   * Rename kvk_fld_introduction.reporting_year -> expected_completion_date
--   * Rename kvk_fld_introduction.area_ha -> quantity
--   * Add kvk_fld_introduction.unit TEXT (nullable)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_fld_introduction'
          AND column_name = 'reporting_year'
    ) THEN
        ALTER TABLE "kvk_fld_introduction" RENAME COLUMN "reporting_year" TO "expected_completion_date";
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_fld_introduction'
          AND column_name = 'expected_completion_date'
    ) THEN
        ALTER TABLE "kvk_fld_introduction" ADD COLUMN "expected_completion_date" TIMESTAMP(3);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_fld_introduction'
          AND column_name = 'area_ha'
    ) THEN
        ALTER TABLE "kvk_fld_introduction" RENAME COLUMN "area_ha" TO "quantity";
    END IF;
END $$;

DROP INDEX IF EXISTS "kvk_fld_introduction_reportingYear_idx";
DROP INDEX IF EXISTS "kvk_fld_introduction_reporting_year_idx";
CREATE INDEX IF NOT EXISTS "kvk_fld_introduction_expected_completion_date_idx"
    ON "kvk_fld_introduction"("expected_completion_date");

ALTER TABLE "kvk_fld_introduction" ADD COLUMN IF NOT EXISTS "unit" TEXT;
