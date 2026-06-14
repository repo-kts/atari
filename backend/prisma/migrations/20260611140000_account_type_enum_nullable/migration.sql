-- #237: account_type enum made optional; new records use account_type_master_id.
ALTER TABLE "kvk_bank_account" ALTER COLUMN "account_type" DROP NOT NULL;
