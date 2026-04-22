-- Add optional identifier code to KvkEquipment so duplicated names can be distinguished.
ALTER TABLE "kvk_equipment"
    ADD COLUMN IF NOT EXISTS "identifier_code" TEXT;
