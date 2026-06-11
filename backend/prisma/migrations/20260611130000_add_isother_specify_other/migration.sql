-- #237 (foundation slice): "Other" option support.
-- isOther flags a master row as the "Other" option; *Other columns hold the
-- free-text value entered on the form record when that option is selected.

ALTER TABLE "account_type_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "job_type_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_bank_account" ADD COLUMN "account_type_other" TEXT;
ALTER TABLE "kvk_staff" ADD COLUMN "job_type_other" TEXT;
