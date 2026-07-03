ALTER TABLE "cfl_cfld_technical_parameter"
ADD COLUMN IF NOT EXISTS "transferred_from_cfld_tech_id" INTEGER;

CREATE INDEX IF NOT EXISTS "cfl_cfld_technical_parameter_transferred_from_cfld_tech_id_idx"
ON "cfl_cfld_technical_parameter"("transferred_from_cfld_tech_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'cfl_cfld_technical_parameter_transferred_from_cfld_tech_id_fkey'
    ) THEN
        ALTER TABLE "cfl_cfld_technical_parameter"
        ADD CONSTRAINT "cfl_cfld_technical_parameter_transferred_from_cfld_tech_id_fkey"
        FOREIGN KEY ("transferred_from_cfld_tech_id")
        REFERENCES "cfl_cfld_technical_parameter"("cfl_cfld_tech_id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END $$;
