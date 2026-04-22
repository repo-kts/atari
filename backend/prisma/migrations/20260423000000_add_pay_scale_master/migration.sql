-- Add PayScaleMaster and migrate kvk_staff.pay_scale (String) to pay_scale_id (Int FK).

CREATE TABLE IF NOT EXISTS "pay_scale_master" (
    "pay_scale_id" SERIAL NOT NULL,
    "scale_name"   TEXT NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pay_scale_master_pkey" PRIMARY KEY ("pay_scale_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pay_scale_master_scale_name_key"
    ON "pay_scale_master"("scale_name");

-- Backfill initial pay-scale options
INSERT INTO "pay_scale_master" ("scale_name", "updated_at")
VALUES
    ('15600-39100', CURRENT_TIMESTAMP),
    ('9300-34800',  CURRENT_TIMESTAMP),
    ('5200-20200',  CURRENT_TIMESTAMP)
ON CONFLICT ("scale_name") DO NOTHING;

-- Add new FK column on kvk_staff
ALTER TABLE "kvk_staff"
    ADD COLUMN IF NOT EXISTS "pay_scale_id" INTEGER;

-- Backfill pay_scale_id from the existing string column, inserting any
-- unknown scale into the master first.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kvk_staff'
          AND column_name = 'pay_scale'
    ) THEN
        INSERT INTO "pay_scale_master" ("scale_name", "updated_at")
        SELECT DISTINCT TRIM(s."pay_scale"), CURRENT_TIMESTAMP
        FROM "kvk_staff" s
        WHERE s."pay_scale" IS NOT NULL AND TRIM(s."pay_scale") <> ''
        ON CONFLICT ("scale_name") DO NOTHING;

        UPDATE "kvk_staff" s
        SET "pay_scale_id" = m."pay_scale_id"
        FROM "pay_scale_master" m
        WHERE s."pay_scale_id" IS NULL
          AND s."pay_scale" IS NOT NULL
          AND TRIM(s."pay_scale") = m."scale_name";

        ALTER TABLE "kvk_staff" DROP COLUMN "pay_scale";
    END IF;
END $$;

-- FK constraint
ALTER TABLE "kvk_staff"
    ADD CONSTRAINT "kvk_staff_pay_scale_id_fkey"
    FOREIGN KEY ("pay_scale_id")
    REFERENCES "pay_scale_master"("pay_scale_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "kvk_staff_pay_scale_id_idx"
    ON "kvk_staff"("pay_scale_id");
