-- #236: master-backed Account Type (existing table) + new Job Type master,
-- linked via nullable FKs (existing enum columns kept for back-compat).

-- New Job Type master
CREATE TABLE "job_type_master" (
    "job_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_type_master_pkey" PRIMARY KEY ("job_type_id")
);
CREATE UNIQUE INDEX "job_type_master_name_key" ON "job_type_master"("name");

-- Bank account -> account type master (nullable FK; account_type enum kept)
ALTER TABLE "kvk_bank_account" ADD COLUMN "account_type_master_id" INTEGER;
CREATE INDEX "kvk_bank_account_account_type_master_id_idx" ON "kvk_bank_account"("account_type_master_id");
ALTER TABLE "kvk_bank_account" ADD CONSTRAINT "kvk_bank_account_account_type_master_id_fkey"
    FOREIGN KEY ("account_type_master_id") REFERENCES "account_type_master"("account_type_id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Staff -> job type master (nullable FK; job_type enum kept)
ALTER TABLE "kvk_staff" ADD COLUMN "job_type_master_id" INTEGER;
CREATE INDEX "kvk_staff_job_type_master_id_idx" ON "kvk_staff"("job_type_master_id");
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_job_type_master_id_fkey"
    FOREIGN KEY ("job_type_master_id") REFERENCES "job_type_master"("job_type_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
