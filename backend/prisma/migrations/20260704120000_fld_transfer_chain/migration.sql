ALTER TABLE "kvk_fld_introduction"
ADD COLUMN IF NOT EXISTS "transferred_from_fld_id" INTEGER;

CREATE INDEX IF NOT EXISTS "kvk_fld_introduction_transferred_from_fld_id_idx"
ON "kvk_fld_introduction"("transferred_from_fld_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'kvk_fld_introduction_transferred_from_fld_id_fkey'
    ) THEN
        ALTER TABLE "kvk_fld_introduction"
        ADD CONSTRAINT "kvk_fld_introduction_transferred_from_fld_id_fkey"
        FOREIGN KEY ("transferred_from_fld_id")
        REFERENCES "kvk_fld_introduction"("kvk_fld_id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END $$;
