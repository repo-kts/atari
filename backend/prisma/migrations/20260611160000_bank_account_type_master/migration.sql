-- Self-contained + idempotent. Provisions the job-type + bank-account-type
-- masters and their FK columns (in case earlier migrations weren't applied),
-- seeds the types, backfills the FK from the legacy enums, THEN drops the dead
-- enum columns/types. Safe to run multiple times.
-- Run over the DIRECT (non-pooler) URL to avoid Neon pooler P1017 drops.

-- 1. Master tables
CREATE TABLE IF NOT EXISTS "job_type_master" (
    "job_type_id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "job_type_master_name_key" ON "job_type_master"("name");

CREATE TABLE IF NOT EXISTS "bank_account_type_master" (
    "bank_account_type_id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "bank_account_type_master_name_key" ON "bank_account_type_master"("name");

-- 2. FK + specify columns on the data tables (additive; may already exist)
ALTER TABLE "kvk_staff" ADD COLUMN IF NOT EXISTS "job_type_master_id" INTEGER;
ALTER TABLE "kvk_staff" ADD COLUMN IF NOT EXISTS "job_type_other" TEXT;
ALTER TABLE "kvk_bank_account" ADD COLUMN IF NOT EXISTS "bank_account_type_master_id" INTEGER;
ALTER TABLE "kvk_bank_account" ADD COLUMN IF NOT EXISTS "account_type_other" TEXT;

-- 3. Seed bank account types
INSERT INTO "bank_account_type_master" ("name", "is_other", "updated_at") VALUES
    ('Saving', false, CURRENT_TIMESTAMP),
    ('Current', false, CURRENT_TIMESTAMP),
    ('Revolving Fund', false, CURRENT_TIMESTAMP),
    ('KVK', false, CURRENT_TIMESTAMP),
    ('Other', true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- 4. Seed the job types needed to preserve existing staff (add more via CRUD)
INSERT INTO "job_type_master" ("name", "is_other", "updated_at") VALUES
    ('Permanent', false, CURRENT_TIMESTAMP),
    ('Temporary', false, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- 5. Foreign keys (drop-then-add so it's re-runnable)
ALTER TABLE "kvk_staff" DROP CONSTRAINT IF EXISTS "kvk_staff_job_type_master_id_fkey";
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_job_type_master_id_fkey"
    FOREIGN KEY ("job_type_master_id") REFERENCES "job_type_master"("job_type_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "kvk_staff_job_type_master_id_idx" ON "kvk_staff"("job_type_master_id");

-- KvkBankAccount: drop the wrong district-master link, add the bank-type link.
ALTER TABLE "kvk_bank_account" DROP CONSTRAINT IF EXISTS "kvk_bank_account_account_type_master_id_fkey";
DROP INDEX IF EXISTS "kvk_bank_account_account_type_master_id_idx";
ALTER TABLE "kvk_bank_account" DROP COLUMN IF EXISTS "account_type_master_id";
CREATE INDEX IF NOT EXISTS "kvk_bank_account_bank_account_type_master_id_idx" ON "kvk_bank_account"("bank_account_type_master_id");
ALTER TABLE "kvk_bank_account" DROP CONSTRAINT IF EXISTS "kvk_bank_account_bank_account_type_master_id_fkey";
ALTER TABLE "kvk_bank_account" ADD CONSTRAINT "kvk_bank_account_bank_account_type_master_id_fkey"
    FOREIGN KEY ("bank_account_type_master_id") REFERENCES "bank_account_type_master"("bank_account_type_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Backfill bank account FK from legacy account_type enum (only if col exists).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kvk_bank_account' AND column_name='account_type') THEN
        UPDATE "kvk_bank_account" b SET "bank_account_type_master_id" = m."bank_account_type_id"
        FROM "bank_account_type_master" m
        WHERE b."bank_account_type_master_id" IS NULL
          AND m."name" = CASE b."account_type"::text WHEN 'REVOLVING_FUND' THEN 'Revolving Fund' WHEN 'OTHER' THEN 'Other' WHEN 'KVK' THEN 'KVK' END;
    END IF;
END $$;

-- 7. Backfill staff FK from legacy job_type enum (only if col exists).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kvk_staff' AND column_name='job_type') THEN
        UPDATE "kvk_staff" s SET "job_type_master_id" = m."job_type_id"
        FROM "job_type_master" m
        WHERE s."job_type_master_id" IS NULL
          AND m."name" = CASE s."job_type"::text WHEN 'PERMANENT' THEN 'Permanent' WHEN 'TEMPORARY' THEN 'Temporary' END;
    END IF;
END $$;

-- 8. Drop the dead enum columns + types (FK now carries the value).
ALTER TABLE "kvk_bank_account" DROP COLUMN IF EXISTS "account_type";
ALTER TABLE "kvk_staff" DROP COLUMN IF EXISTS "job_type";
DROP TYPE IF EXISTS "AccountType";
DROP TYPE IF EXISTS "JobType";
